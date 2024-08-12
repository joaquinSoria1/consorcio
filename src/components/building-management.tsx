"use client"

import React, { useState } from 'react';
import { IconAI, IconUser } from '@/components/ui/icons';
import { FileText, Calendar, ContactRound } from 'lucide-react';
import { parseISO, format, parse } from 'date-fns';
import { es } from 'date-fns/locale';
// BotCard component
interface BotCardProps {
  children: React.ReactNode;
  showAvatar?: boolean;
}

export function BotCard({ children, showAvatar = true }: BotCardProps) {
  return (
    <div className="flex items-start space-x-4 rounded-lg bg-gray-50 p-4 shadow-sm">
      <div className="flex-grow">{children}</div>
    </div>
  );
}



// BotMessage component
interface BotMessageProps {
  children: React.ReactNode;
  className?: string;
}

export function BotMessage({ children, className = '' }: BotMessageProps) {
  return (
    <div className={`text-gray-700 ${className}`}>
      {children}
    </div>
  );
}

// SystemMessage component
interface SystemMessageProps {
  children: React.ReactNode;
}

export function SystemMessage({ children }: SystemMessageProps) {
  return (
    <div className="text-sm text-gray-500 italic">
      {children}
    </div>
  );
}

interface ExpenseInfoProps {
  departamento: string;
  monto: number;
  estado: 'pagado' | 'pendiente';
  fechavencimiento: string;
}

export function ExpenseInfo({ departamento, monto, estado, fechavencimiento }) {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-sm mx-auto">
      <h2 className="text-2xl font-bold text-center mb-4 text-green-600">Información de Expensa</h2>
      <div className="space-y-3">
        <InfoItem label="Departamento" value={departamento} />
        <InfoItem label="Monto" value={`$${monto.toFixed(2)}`} />
        <InfoItem label="Estado" value={estado} />
        <InfoItem label="Vencimiento" value={new Date(fechavencimiento).toLocaleDateString()} />
      </div>
    </div>
  );
}

interface ReservationInfoProps {
  departamento: string;
  fecha: string;
  hora: string;
}

export function ReservationInfo({ departamento, fecha, hora }) {
  let formattedDate = 'Fecha no válida';
  let formattedTime = 'Hora no válida';

  try {
    const dateObject = parseISO(fecha);
    formattedDate = format(dateObject, "d 'de' MMMM 'de' yyyy", { locale: es });
    formattedTime = format(dateObject, 'HH:mm', { locale: es });
  } catch (error) {
    console.error('Error al formatear la fecha:', error);
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-sm mx-auto">
      <h2 className="text-2xl font-bold text-center mb-4 text-blue-600">Información de Reserva</h2>
      <div className="space-y-3">
        <InfoItem label="Departamento" value={departamento} />
        <InfoItem label="Fecha" value={formattedDate} />
        <InfoItem label="Hora" value={formattedTime} />
      </div>
    </div>
  );
}


export function ReservationConfirmation({ date, time, departamentoId, numeroDepartamento }) {
  const [status, setStatus] = useState('pending');
  const [reservationInfo, setReservationInfo] = useState(null);

  const handleConfirm = async () => {
    setStatus('confirming');
    try {
      const dateTime = parse(`${date} ${time}`, "d 'de' MMMM 'de' yyyy HH:mm", new Date(), { locale: es });
      
      const isoDateTime = dateTime.toISOString();

      const response = await fetch('/api/reservaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fecha: isoDateTime,
          hora: isoDateTime,
          departamentoId: departamentoId,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear la reservación');
      }

      const reservationData = await response.json();
      setReservationInfo(reservationData);
      setStatus('confirmed');
    } catch (error) {
      console.error("Error scheduling reservation:", error);
      setStatus('error');
    }
  };

  const handleCancel = () => {
    setStatus('cancelled');
  };

  if (status === 'pending') {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-sm mx-auto">
        <h2 className="text-2xl font-bold text-center mb-4 text-blue-600">Confirmar Reservación</h2>
        <p className="mb-4">¿Quieres confirmar tu reserva para el {date} a las {time}?</p>
        <div className="flex justify-between">
          <button 
            onClick={handleConfirm}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Sí, confirmar
          </button>
          <button 
            onClick={handleCancel}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            No, cancelar
          </button>
        </div>
      </div>
    );
  }

  if (status === 'confirming') {
    return <BotMessage>Procesando tu reservación...</BotMessage>;
  }

  if (status === 'confirmed' && reservationInfo) {
    return (
      <>
        <ReservationInfo
          departamento={numeroDepartamento}
          fecha={reservationInfo.fecha}
          hora={reservationInfo.hora}
        />
        <SystemMessage>
          Reservación agendada exitosamente para el departamento {numeroDepartamento}.
        </SystemMessage>
      </>
    );
  }

  if (status === 'cancelled') {
    return <BotMessage>Reserva cancelada. ¿Puedo ayudarte con algo más?</BotMessage>;
  }

  if (status === 'error') {
    return <BotMessage>Lo siento, hubo un error al agendar tu reservación. Por favor, intenta de nuevo más tarde.</BotMessage>;
  }
}

// ResidentsList component
interface Resident {
  _id: string;
  nombres: string;
  apellidos: string;
}

interface ResidentsListProps {
  residents: Resident[];
}

export function ResidentsList({ residents }: ResidentsListProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Lista de Residentes</h3>
      <ul className="space-y-2">
        {residents.map((resident) => (
          <li key={resident._id}>
            {resident.nombres} {resident.apellidos}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ExpenseInfoSkeleton component
export function ExpenseInfoSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
    </div>
  );
}

// ReservationInfoSkeleton component
export function ReservationInfoSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
  );
}

// ResidentsListSkeleton component
export function ResidentsListSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
}

export const spinner = <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-900"></div>;

export function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="group relative flex items-start md:-ml-12">
      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow-sm bg-background">
        <IconUser />
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
        {children}
      </div>
    </div>
  );
}

export function PersonalInfo({ nombres, apellidos, email, telefono, numeroDepartamento, estado }) {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-sm mx-auto">
      <h2 className="text-2xl font-bold text-center mb-4 text-indigo-600">Información Personal</h2>
      <div className="space-y-3">
        <InfoItem label="Nombre" value={`${nombres} ${apellidos}`} />
        <InfoItem label="Email" value={email} />
        <InfoItem label="Teléfono" value={telefono} />
        <InfoItem label="Departamento" value={numeroDepartamento} />
        <InfoItem label="Estado" value={estado} />
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="font-medium text-gray-600">{label}:</span>
      <span className="text-gray-800">{value}</span>
    </div>
  );
}

interface Expense {
  _id: string;
  monto: number;
  fechavencimiento: string;
  estado: string;
}

interface PaymentDialogProps {
  expenses: Expense[];
  departmentId: string;
  numeroDepartamento: string;
}

export function PaymentDialog({ expenses, departmentId, numeroDepartamento }: PaymentDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'error'>('pending');

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      for (const expense of expenses) {
        const response = await fetch(`/api/expensa/${expense._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ estado: 'pagado' }),
        });

        if (!response.ok) {
          throw new Error(`Error al procesar el pago de la expensa ${expense._id}`);
        }
      }
      setPaymentStatus('success');
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      setPaymentStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentStatus === 'success') {
    return <BotMessage>Pago procesado exitosamente para todas las expensas seleccionadas.</BotMessage>;
  }

  if (paymentStatus === 'error') {
    return <BotMessage>Lo siento, hubo un error al procesar el pago. Por favor, intenta de nuevo más tarde.</BotMessage>;
  }

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.monto, 0);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-sm mx-auto">
      <h2 className="text-2xl font-bold text-center mb-4 text-green-600">Factura de Expensas</h2>
      <div className="space-y-3">
        <InfoItem label="Departamento" value={numeroDepartamento} />
        <InfoItem label="Cantidad de expensas" value={expenses.length.toString()} />
        <InfoItem label="Monto total" value={`$${totalAmount.toFixed(2)}`} />
        <InfoItem label="Estado" value="Pendiente" />
        <InfoItem 
          label="Fecha de vencimiento" 
          value={format(new Date(expenses[0].fechavencimiento), "d 'de' MMMM 'de' yyyy", { locale: es })} 
        />
      </div>
      <div className="mt-6">
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className={`w-full py-2 px-4 rounded ${
            isProcessing ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
          } text-white font-bold`}
        >
          {isProcessing ? 'Procesando...' : 'Confirmar Pago'}
        </button>
      </div>
    </div>
  );
}