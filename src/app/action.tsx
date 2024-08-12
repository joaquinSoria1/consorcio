'use server';

import { createAI, createStreamableUI, getMutableAIState } from 'ai/rsc';
import OpenAI from 'openai';
import {
  spinner,
  BotCard,
  BotMessage,
  SystemMessage,
  ExpenseInfo,
  ReservationInfo,
  ResidentsList,
  ExpenseInfoSkeleton,
  ReservationInfoSkeleton,
  ResidentsListSkeleton,
  PersonalInfo,
  ReservationConfirmation,
  PaymentDialog,
} from '@/components/building-management';
import {
  runAsyncFnWithoutBlocking,
  sleep,
  formatNumber,
  runOpenAICompletion,
} from '@/lib/utils';
import { z } from 'zod';
import { Session } from 'next-auth';
import { parse, isValid, format, setYear, startOfDay, set, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

async function fetchDepartmentInfo(departmentId: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/departamento/${departmentId}`);
  return response.json();
}


function parseDateTime(input: string): Date {
  const currentYear = new Date().getFullYear();

  // Preprocesamiento del input
  input = input.toLowerCase()
    .replace('primero', '1')
    .replace('mediodía', '12 del mediodía')
    .replace('medianoche', '12 de la noche')
    .replace(/\b(\d{1,2})\s*:\s*(\d{2})\s*h\b/gi, '$1:$2')
    .replace(/\b(\d{1,2})\s*h\b/gi, '$1:00')
    .replace(/\b(\d{1,2})\s*:\s*(\d{2})\s*(h)?\s*(de la)?\s*(tarde|mañana|noche)?\b/gi, (match, p1, p2, p3, p4, p5) => {
      let hour = parseInt(p1);
      if (p5 === 'tarde' || p5 === 'noche') {
        hour = hour === 12 ? 12 : hour + 12;
      } else if (p5 === 'mañana' && hour === 12) {
        hour = 0;
      }
      return `${hour.toString().padStart(2, '0')}:${p2}`;
    })
    .replace(/\b(\d{1,2})\s*(a\.?\s*m\.?|p\.?\s*m\.?)\b/gi, (match, p1, p2) => {
      let hour = parseInt(p1);
      if (p2.startsWith('p') && hour !== 12) hour += 12;
      if (p2.startsWith('a') && hour === 12) hour = 0;
      return `${hour.toString().padStart(2, '0')}:00`;
    })
    .replace(/\s+/g, ' ').trim();

  console.log("Preprocessed input:", input);

  const formats = [
    "d 'de' MMMM 'de' yyyy 'a las' HH:mm",
    "d 'de' MMMM 'de' yyyy 'a las' HH",
    "do 'de' MMMM 'de' yyyy 'a las' HH:mm",
    "do 'de' MMMM 'de' yyyy 'a las' HH",
    "d 'de' MMMM 'del' yyyy 'a las' HH:mm",
    "d 'de' MMMM 'del' yyyy 'a las' HH",
    "do 'de' MMMM 'del' yyyy 'a las' HH:mm",
    "do 'de' MMMM 'del' yyyy 'a las' HH",
    "d 'de' MMMM 'de' yyyy",
    "do 'de' MMMM 'de' yyyy",
    "d/M/yyyy 'a las' HH:mm",
    "d/M/yyyy HH:mm",
    "d/M/yyyy",
    "d 'de' MMMM 'a las' HH:mm",
    "d 'de' MMMM 'a las' HH",
    "do 'de' MMMM 'a las' HH:mm",
    "do 'de' MMMM 'a las' HH",
    "d 'de' MMMM",
    "do 'de' MMMM",
    "d MMMM",
    "d/M/yyyy",
    "d/M",
    "d/M HH:mm",
    "'para' d 'de' MMMM 'de' yyyy 'a las' HH:mm",
    "'para el' d 'de' MMMM 'de' yyyy 'a las' HH:mm",
    "'para' d 'de' MMMM 'a las' HH:mm",
    "'para el' d 'de' MMMM 'a las' HH:mm",
    "'para mañana a las' HH:mm",
    "'mañana a las' HH:mm",
  ];

  let parsedDate: Date | null = null;

  for (const formatString of formats) {
    try {
      const attemptedParse = parse(input, formatString, new Date(), { locale: es });
      if (isValid(attemptedParse)) {
        parsedDate = attemptedParse;
        break;
      }
    } catch (error) {
      console.log(`Error parsing with format ${formatString}:`, error);
    }
  }

  if (!parsedDate) {
    throw new Error('No se pudo parsear la fecha y hora');
  }

  if (parsedDate.getFullYear() === currentYear - 1) {
    parsedDate = setYear(parsedDate, currentYear);
  }

  if (input.includes('mañana')) {
    parsedDate = addDays(parsedDate, 1);
  }

  if (parsedDate < new Date()) {
    parsedDate = addDays(parsedDate, 1);
  }

  return parsedDate;
}

export async function payExpense(expenseId: string, amount: number) {
  const aiState = getMutableAIState<typeof AI>();

  const processing = createStreamableUI(
    <div className="inline-flex items-start gap-1 md:items-center">
      {spinner}
      <p className="mb-2">
        Procesando pago de ${amount} para la expensa {expenseId}...
      </p>
    </div>,
  );

  const systemMessage = createStreamableUI(null);

  await runAsyncFnWithoutBlocking(async () => {
    await sleep(2000);

    processing.done(
      <div>
        <p className="mb-2">
          Pago de ${formatNumber(amount)} para la expensa {expenseId} procesado exitosamente.
        </p>
      </div>,
    );

    systemMessage.done(
      <SystemMessage>
        Se ha registrado un pago de ${formatNumber(amount)} para la expensa {expenseId}.
      </SystemMessage>,
    );

    aiState.done([
      ...aiState.get(),
      {
        role: 'system',
        content: `[Se ha registrado un pago de $${amount} para la expensa ${expenseId}]`,
      },
    ]);
  });

  return {
    processingUI: processing.value,
    newMessage: {
      id: Date.now(),
      display: systemMessage.value,
    },
  };
}

export async function submitUserMessage(content: string, session: Session | null) {
  console.log("Submitting user message:", content);
  const aiState = getMutableAIState<typeof AI>();

  const userInfo = session?.user ? {
    id: session.user.id,
    numeroDepartamento: session.user.numeroDepartamento,
    expensas: session.user.expensas,
    reservas: session.user.reservas,
    inquilinos: session.user.inquilinos
  } : null;

  aiState.update([
    ...aiState.get(),
    {
      role: 'system',
      content: `Información del usuario: ${JSON.stringify(userInfo)}`,
    },
    {
      role: 'user',
      content,
    },
  ]);

  const reply = createStreamableUI(
    <BotMessage className="items-center">{spinner}</BotMessage>,
  );

  const completion = runOpenAICompletion(openai, {
    model: 'gpt-3.5-turbo',
    stream: true,
    messages: [
      {
        role: 'system',
        content: `\
      Eres un asistente virtual para la gestión de un edificio residencial. Tu tarea es ayudar a los residentes con consultas sobre sus expensas, reservaciones de áreas comunes y información sobre otros residentes del edificio.
      
      Puedes realizar las siguientes acciones:
      1. Mostrar información de expensas (monto, estado y fecha de vencimiento).
      2. Procesar pagos de expensas.
      3. Mostrar información de reservaciones (fecha y hora).
      4. Agendar nuevas reservaciones.
      5. Mostrar lista de residentes del edificio.
      6. Mostrar información personal del usuario.
      
      La información del departamento del usuario actual está disponible en userInfo. Esta contiene:
      - id: El ID del departamento actual.
      - numeroDepartamento: El número del departamento.
      - expensas: Un array de IDs de expensas del departamento.
      - reservas: Un array de reservaciones del departamento.
      - inquilinos: Un array con el ID del inquilino que vive en el departamento.

      Cuando el usuario solicite información personal, usa la función 'show_personal_info':
      - Si el usuario pide toda su información personal, usa: show_personal_info()
      - Si el usuario pide un dato específico, usa el parámetro 'field' con uno de estos valores:
        'nombres', 'apellidos', 'email', 'telefono', 'numeroDepartamento', 'estado'
        Por ejemplo, si el usuario pregunta "¿Cuál es mi email?", usa: show_personal_info({ field: 'email' })

      Ejemplos de uso:
      - Si el usuario dice "Muestra toda mi información personal", usa: show_personal_info()
      - Si el usuario pregunta "¿Cuál es mi número de departamento?", usa: show_personal_info({ field: 'numeroDepartamento' })
      - Si el usuario pregunta "¿Cuál es mi nombre?", usa: show_personal_info({ field: 'nombres' })
      
      Cuando el usuario mencione algo relacionado con pagar o hacer un pago, asume que se refiere a pagar expensas. Sigue estos pasos:
      
      1. Si el usuario dice "quiero pagar una expensa" o algo similar, pregúntale de qué mes quiere pagar o si desea pagar la expensa del mes actual.
      
      2. Dependiendo de la respuesta del usuario, usa la función 'process_payment' con los parámetros adecuados:
         - Si el usuario quiere pagar todas sus expensas pendientes, no especifiques mes ni año.
         - Si el usuario quiere pagar una expensa de un mes específico, usa el parámetro 'month' con el nombre del mes en español.
         - Si el usuario especifica un mes y un año, usa ambos parámetros 'month' y 'year'.
         - Si el usuario quiere pagar la expensa del mes actual, no especifiques ningún parámetro.
      
      3. La función 'process_payment' mostrará automáticamente solo las expensas con estado 'pendiente' para el período especificado.
      
      4. Después de mostrar las expensas pendientes, pregunta al usuario si desea confirmar el pago.
      
      Ejemplos de uso:
      - Si el usuario dice "Quiero pagar mis expensas", pregunta: "¿De qué mes desea pagar las expensas? ¿O prefiere pagar las del mes actual?"
      - Si responde "Del mes pasado", usa: process_payment({ month: 'junio' }) (asumiendo que estamos en julio)
      - Si dice "De marzo de 2023", usa: process_payment({ month: 'marzo', year: '2023' })
      - Si dice "Todas mis expensas pendientes", usa: process_payment()
      - Si dice "Las de este mes", usa: process_payment()
        Cuando el usuario mencione CUALQUIER cosa relacionada con pagar expensas, SIEMPRE debes usar la función 'process_payment'. Esto incluye frases como:
      - "Quiero pagar mis expensas"
      - "Necesito pagar la expensa"
      - "Cómo pago las expensas"
      - "Pagar la expensa de [mes]"
      - "Pagar las expensas de [mes]"
      - "Quiero pagar la de [mes]"
      - "Me gustaría pagar la expensa de [mes]"
      - Cualquier otra variación que implique pagar expensas

      Sigue estos pasos:

      1. Si el usuario menciona algo relacionado con pagar expensas, extrae la información del mes y año si se proporciona.

      2. Usa la función 'process_payment' con los parámetros adecuados:
        - Si el usuario especifica un mes, usa el parámetro 'month' con el nombre del mes en español.
        - Si el usuario especifica un año, usa el parámetro 'year'.
        - Si no se especifica mes ni año, no incluyas estos parámetros.

      Ejemplos de uso:
      - Si el usuario dice "Quiero pagar mis expensas de septiembre", usa: process_payment({ month: 'septiembre' })
      - Si dice "Necesito pagar la de marzo de 2023", usa: process_payment({ month: 'marzo', year: '2023' })
      - Si dice "Cómo pago las expensas", usa: process_payment()
      - Si dice "Quiero pagar la de este mes", usa: process_payment()

      IMPORTANTE: SIEMPRE debes usar la función 'process_payment' cuando se mencione CUALQUIER cosa relacionada con el pago de expensas, incluso si no estás seguro de los parámetros exactos. Es mejor llamar a la función sin parámetros que no llamarla en absoluto.
      
      Cuando necesites mostrar información específica o realizar una acción, utiliza las funciones correspondientes:
      - Para mostrar información de expensas: usa 'show_expense_info'
      - Para procesar un pago: usa 'process_payment'
      - Para mostrar información de reservaciones: usa 'show_reservation_info'
      - Para agendar una reservación: usa 'schedule_reservation'
      - Para mostrar la lista de residentes: usa 'show_residents_list'
      - Para mostrar información personal del usuario: usa 'show_personal_info'
      
      Los mensajes dentro de [] indican elementos de la interfaz de usuario o eventos del usuario.`,
      },
      ...aiState.get().map((info: any) => ({
        role: info.role,
        content: info.content,
        name: info.name,
      })),
    ],
    functions: [
      {
        name: 'show_expense_info',
        description: 'Muestra la información de expensas para el departamento del usuario.',
        parameters: z.object({
          month: z.string().optional().describe('Mes para el que se quieren ver las expensas (formato: YYYY-MM) o "ultimo" para el último mes'),
          status: z.enum(['pendiente', 'pagado']).optional().describe('Estado de las expensas a mostrar: "pendiente" o "pagado"'),
        }),
      },
      {
        name: 'process_payment',
        description: 'Procesa el pago de expensas pendientes para un departamento.',
        parameters: z.object({
          month: z.string().optional().describe('Mes para el que se quieren pagar las expensas (nombre del mes en español)'),
          year: z.string().optional().describe('Año para el que se quieren pagar las expensas'),
        }),
      },
      {
        name: 'show_reservation_info',
        description: 'Muestra la información de reservaciones para el departamento del usuario.',
        parameters: z.object({
          year: z.string().optional().describe('Año para el que se quieren ver las reservaciones'),
          month: z.string().optional().describe('Mes para el que se quieren ver las reservaciones (nombre del mes en español)'),
        }),
      },
      {
        name: 'schedule_reservation',
        description: 'Agenda una nueva reservación.',
        parameters: z.object({
          dateTime: z.string().describe('Fecha y hora de la reservación en formato libre, por ejemplo "primero de julio a las 12 de la noche"'),
        }),
      },
      {
        name: 'show_residents_list',
        description: 'Muestra la lista de residentes del edificio.',
        parameters: z.object({
          departmentId: z.string().describe('ID del departamento'),
        }),
      },
      {
        name: 'show_personal_info',
        description: 'Muestra la información personal del usuario actual o un dato específico.',
        parameters: z.object({
          field: z.enum(['nombres', 'apellidos', 'email', 'telefono', 'numeroDepartamento', 'estado']).optional()
            .describe('Campo específico de información personal a mostrar'),
        }),
      },
    ],
    temperature: 0,
  });

  completion.onTextContent((content: string, isFinal: boolean) => {
    console.log("Received assistant response:", content);
    reply.update(<BotMessage>{content}</BotMessage>);
    if (isFinal) {
      console.log("Final response received");
      reply.done();
      aiState.done([...aiState.get(), { role: 'assistant', content }]);
    }
  });

  completion.onFunctionCall('show_expense_info', async ({ month, status }) => {
    if (!session?.user) {
      reply.done(<BotMessage>Lo siento, necesitas estar autenticado para ver tus expensas.</BotMessage>);
      return;
    }

    reply.update(
      <BotCard>
        <ExpenseInfoSkeleton />
      </BotCard>,
    );

    try {
      const departmentInfo = await fetchDepartmentInfo(session.user.id);
      let expenses = departmentInfo.expensas;

      if (month) {
        if (month === 'ultimo') {
          const lastMonth = new Date();
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          expenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.fechavencimiento);
            return expenseDate.getMonth() === lastMonth.getMonth() && expenseDate.getFullYear() === lastMonth.getFullYear();
          });
        } else {
          const [year, monthNum] = month.split('-');
          expenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.fechavencimiento);
            return expenseDate.getFullYear() === parseInt(year) && expenseDate.getMonth() === parseInt(monthNum) - 1;
          });
        }
      }

      if (status) {
        expenses = expenses.filter(expense => expense.estado === status);
      }

      reply.done(
        <BotCard>
          {expenses.length > 0 ? (
            expenses.map((expense, index) => (
              <ExpenseInfo
                key={index}
                departamento={session.user.numeroDepartamento}
                monto={expense.monto}
                estado={expense.estado}
                fechavencimiento={expense.fechavencimiento}
              />
            ))
          ) : (
            <BotMessage>No se encontraron expensas {status ? `${status}s ` : ""}para el período especificado.</BotMessage>
          )}
        </BotCard>
      );

      aiState.done([
        ...aiState.get(),
        {
          role: 'function',
          name: 'show_expense_info',
          content: `[Información de expensas mostrada: ${status ? `${status.charAt(0).toUpperCase() + status.slice(1)}as` : "Todas"} ${month ? (month === 'ultimo' ? 'del último mes' : `del mes ${month}`) : ''}]`,
        },
      ]);
    } catch (error) {
      console.error("Error fetching expense info:", error);
      reply.done(<BotMessage>Lo siento, hubo un error al obtener la información de las expensas.</BotMessage>);
    }
  });

  completion.onFunctionCall('process_payment', async ({ month, year }) => {
    console.log(`process_payment llamada con month: ${month}, year: ${year}`);

    if (!session?.user) {
      reply.done(<BotMessage>Lo siento, necesitas estar autenticado para pagar expensas.</BotMessage>);
      return;
    }

    try {
      const departmentInfo = await fetchDepartmentInfo(session.user.id);
      let expensesToPay = departmentInfo.expensas.filter(expense => expense.estado === 'pendiente');

      console.log("Todas las expensas pendientes:", expensesToPay);

      if (month && year) {
        console.log(`Buscando expensas para: Mes ${month}, Año ${year}`);
        const targetDate = new Date(parseInt(year), getMonthIndex(month), 1);
        console.log("Fecha objetivo:", targetDate);
        expensesToPay = expensesToPay.filter(expense => {
          const expenseDate = new Date(expense.fechavencimiento);
          console.log("Fecha de la expensa:", expenseDate);
          console.log("¿Coincide?", expenseDate.getMonth() === targetDate.getMonth() && expenseDate.getFullYear() === targetDate.getFullYear());
          return expenseDate.getMonth() === targetDate.getMonth() && expenseDate.getFullYear() === targetDate.getFullYear();
        });
      } else if (month) {
        console.log(`Buscando expensas para: Mes ${month}, Año actual`);
        const currentYear = new Date().getFullYear();
        const targetDate = new Date(currentYear, getMonthIndex(month), 1);
        console.log("Fecha objetivo:", targetDate);
        expensesToPay = expensesToPay.filter(expense => {
          const expenseDate = new Date(expense.fechavencimiento);
          console.log("Fecha de la expensa:", expenseDate);
          console.log("¿Coincide?", expenseDate.getMonth() === targetDate.getMonth() && expenseDate.getFullYear() === currentYear);
          return expenseDate.getMonth() === targetDate.getMonth() && expenseDate.getFullYear() === currentYear;
        });
      } else {
        console.log("Buscando expensas para el mes actual");
        const now = new Date();
        expensesToPay = expensesToPay.filter(expense => {
          const expenseDate = new Date(expense.fechavencimiento);
          console.log("Fecha de la expensa:", expenseDate);
          console.log("¿Coincide?", expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear());
          return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
        });
      }

      console.log("Expensas a pagar después del filtro:", expensesToPay);

      if (expensesToPay.length === 0) {
        reply.done(<BotMessage>No hay expensas pendientes para pagar en el período especificado.</BotMessage>);
        return;
      }

      reply.done(
        <BotCard>
          <PaymentDialog
            expenses={expensesToPay}
            departmentId={session.user.id}
            numeroDepartamento={session.user.numeroDepartamento}
          />
        </BotCard>
      );

      aiState.done([
        ...aiState.get(),
        {
          role: 'function',
          name: 'process_payment',
          content: `[Diálogo de pago mostrado para ${expensesToPay.length} expensa(s) pendiente(s)]`,
        },
      ]);
    } catch (error) {
      console.error("Error fetching expense info:", error);
      reply.done(<BotMessage>Lo siento, hubo un error al obtener la información de las expensas.</BotMessage>);
    }
  });

  function getMonthIndex(month: string): number {
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return months.indexOf(month.toLowerCase());
  }

  completion.onFunctionCall('show_reservation_info', async ({ year, month }) => {
    if (!session?.user) {
      reply.done(<BotMessage>Lo siento, necesitas estar autenticado para ver tus reservaciones.</BotMessage>);
      return;
    }

    reply.update(
      <BotCard>
        <ReservationInfoSkeleton />
      </BotCard>,
    );

    try {
      const departmentInfo = await fetchDepartmentInfo(session.user.id);
      let reservations = departmentInfo.reservas;

      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();

      // Filtrar por año si se especifica
      if (year) {
        reservations = reservations.filter(reservation => {
          const reservationDate = new Date(reservation.fecha);
          return reservationDate.getFullYear() === parseInt(year);
        });
      }

      // Filtrar por mes si se especifica
      if (month) {
        const monthIndex = [
          'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
          'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ].indexOf(month.toLowerCase());

        if (monthIndex !== -1) {
          reservations = reservations.filter(reservation => {
            const reservationDate = new Date(reservation.fecha);
            return reservationDate.getMonth() === monthIndex &&
              (year ? true : reservationDate.getFullYear() === currentYear);
          });
        }
      }

      reply.done(
        <BotCard>
          {reservations.length > 0 ? (
            reservations.map((reservation, index) => (
              <ReservationInfo
                key={index}
                departamento={session.user.numeroDepartamento}
                fecha={reservation.fecha}
                hora={reservation.hora}
              />
            ))
          ) : (
            <BotMessage>No se encontraron reservaciones para el período especificado.</BotMessage>
          )}
        </BotCard>
      );

      aiState.done([
        ...aiState.get(),
        {
          role: 'function',
          name: 'show_reservation_info',
          content: `[Información de reservaciones mostrada: ${year ? `Año ${year}` : ''} ${month ? `Mes ${month}` : ''} ${!year && !month ? 'Todas' : ''}]`,
        },
      ]);
    } catch (error) {
      console.error("Error fetching reservation info:", error);
      reply.done(<BotMessage>Lo siento, hubo un error al obtener la información de las reservaciones.</BotMessage>);
    }
  });


  completion.onFunctionCall('schedule_reservation', async ({ dateTime }) => {
    if (!session?.user) {
      reply.done(<BotMessage>Lo siento, necesitas estar autenticado para hacer una reserva.</BotMessage>);
      return;
    }

    console.log("Received dateTime:", dateTime);

    try {
      const parsedDate = parseDateTime(dateTime);
      console.log("Parsed date:", parsedDate);

      const formattedDate = format(parsedDate, "d 'de' MMMM 'de' yyyy", { locale: es });
      const formattedTime = format(parsedDate, "HH:mm", { locale: es });

      reply.done(
        <BotCard>
          <ReservationConfirmation
            date={formattedDate}
            time={formattedTime}
            departamentoId={session.user.id}
            numeroDepartamento={session.user.numeroDepartamento}
          />
        </BotCard>
      );

    } catch (error) {
      console.error("Error parsing date:", error);
      reply.done(<BotMessage>Lo siento, no pude entender la fecha y hora que proporcionaste. Por favor, intenta especificar la fecha y hora de una manera más clara, por ejemplo: "3 de julio a las 2 de la tarde" o "3/7 a las 14:00".</BotMessage>);
    }
  });

  completion.onFunctionCall('show_residents_list', async ({ departmentId }) => {
    if (departmentId !== session?.user?.id) {
      reply.done(<BotMessage>Lo siento, solo puedes ver los residentes de tu propio departamento.</BotMessage>);
      return;
    }

    reply.update(
      <BotCard>
        <ResidentsListSkeleton />
      </BotCard>,
    );

    const departmentInfo = await fetchDepartmentInfo(departmentId);

    reply.done(
      <BotCard>
        <ResidentsList residents={departmentInfo.inquilinos} />
      </BotCard>,
    );

    aiState.done([
      ...aiState.get(),
      {
        role: 'function',
        name: 'show_residents_list',
        content: `[Lista de residentes mostrada para el departamento ${departmentId}]`,
      },
    ]);
  });

  completion.onFunctionCall('show_personal_info', async ({ field }) => {
    if (!session?.user) {
      reply.done(<BotMessage>Lo siento, no puedo acceder a tu información personal en este momento.</BotMessage>);
      return;
    }
  
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const userResponse = await fetch(`${baseUrl}/api/auth/signup/user/${session.user.inquilinos[0]}`);
      const userData = await userResponse.json();
  
      const deptoResponse = await fetch(`${baseUrl}/api/departamento/${session.user.id}`);
      const deptoData = await deptoResponse.json();
  
      if (field) {
        let value;
        switch (field) {
          case 'nombres':
            value = userData.nombres;
            break;
          case 'apellidos':
            value = userData.apellidos;
            break;
          case 'email':
            value = userData.email;
            break;
          case 'telefono':
            value = userData.telefono;
            break;
          case 'numeroDepartamento':
            value = deptoData.numeroDepartamento;
            break;
          case 'estado':
            value = deptoData.estado;
            break;
        }
        reply.done(<BotMessage>Tu {field} es: {value}</BotMessage>);
      } else {
        reply.done(
          <BotCard>
            <PersonalInfo
              nombres={userData.nombres}
              apellidos={userData.apellidos}
              email={userData.email}
              telefono={userData.telefono}
              numeroDepartamento={deptoData.numeroDepartamento}
              estado={deptoData.estado}
            />
          </BotCard>
        );
      }
  
      aiState.done([
        ...aiState.get(),
        {
          role: 'function',
          name: 'show_personal_info',
          content: field ? `[Información personal mostrada: ${field}]` : '[Toda la información personal mostrada]',
        },
      ]);
    } catch (error) {
      console.error("Error fetching personal info:", error);
      reply.done(<BotMessage>Lo siento, hubo un error al obtener tu información personal.</BotMessage>);
    }
  });

  return {
    id: Date.now(),
    display: reply.value,
  };
}

const initialAIState: {
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
  id?: string;
  name?: string;
}[] = [];

const initialUIState: {
  id: number;
  display: React.ReactNode;
}[] = [];

export const AI = createAI({
  actions: {
    submitUserMessage,
    payExpense,
  },
  initialUIState,
  initialAIState,
});