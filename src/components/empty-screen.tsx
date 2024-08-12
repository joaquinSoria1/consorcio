import { Button } from '@/components/ui/button';
import { IconArrowRight } from '@/components/ui/icons';

const exampleMessages = [
  {
    heading: 'Cual es el precio del bitcoin?',
    message: 'Cual es el precio del bitcoin?',
  },
  {
    heading: "¿Cuál es el precio de la acción de AAPL?",
    message: "¿Cuál es el precio de la acción de AAPL?",
  },
  {
    heading: "Me gustaría comprar 10 acciones de MSFT",
    message: "Me gustaría comprar 10 acciones de MSFT",
  },
];


export function EmptyScreen({
  submitMessage,
}: {
  submitMessage: (message: string) => void;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8 mb-4">
        <h1 className="mb-2 text-lg font-semibold">
          ¡Bienvenido al chat de Resired!
        </h1>
        <p className="leading-normal text-muted-foreground">Prueba un ejemplo:</p>
        <div className="mt-4 flex flex-col items-start space-y-2 mb-4">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={async () => {
                submitMessage(message.message);
              }}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
