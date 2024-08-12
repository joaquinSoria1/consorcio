import * as Craft from "@/components/Craft"
import Balancer from "react-wrap-balancer";
import Link from "next/link";
import { Building, ArrowRight, Users, HandCoins, Calendar } from "lucide-react";

const featureText = [
  {
    icon: <Building className="h-6 w-6" />,
    title: "Gestión de Departamentos",
    href: "./dashboard/departamentos",
    description: "Administra y actualiza la información de los departamentos, incluyendo la creación y eliminación de unidades.",
    cta: "Administrar",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Residentes",
    href: "./dashboard/residentes",
    description: "Gestiona los perfiles de los residentes, sus datos de contacto y otra información relevante.",
    cta: "Ver Residentes",
  },
  {
    icon: <HandCoins className="h-6 w-6" />,
    title: "Expensas",
    href: "./dashboard/expensas",
    description: "Controla las expensas de los residentes, registra pagos y genera reportes financieros.",
    cta: "Expensas",
  },
  {
    icon: <Calendar className="h-6 w-6" />,
    title: "Reservas de Amenidades",
    href: "./dashboard/reservaciones",
    description: "Monitorea y gestiona las reservas para el SUM, la pileta y otras áreas comunes del edificio.",
    cta: "Reservas",
  },
];

const Feature = () => {
  return (
    <Craft.Section className="border-b h-full">
      <Craft.Container className="not-prose">
        <div className="flex flex-col gap-6">
          <h3 className="text-4xl">
            <Balancer>
              Bienvenido al Panel de Administración
            </Balancer>
          </h3>
          <h4 className="text-2xl font-light opacity-70">
            <Balancer>
              Gestiona eficientemente tu edificio desde un solo lugar
            </Balancer>
          </h4>

          <div className="mt-6 grid gap-6 md:mt-12 md:grid-cols-4">
            {featureText.map(({ icon, title, description, href, cta }, index) => (
              <Link
                href={`${href}`}
                className="flex flex-col justify-between gap-6 rounded-lg border p-6 transition-all hover:-mt-2 hover:mb-2"
                key={index}
              >
                <div className="grid gap-4">
                  {icon}
                  <h4 className="text-primary text-xl">
                    <Balancer>{title}</Balancer>
                  </h4>
                  <p className="text-base opacity-75">{description}</p>
                </div>
                {cta && (
                  <div className="flex h-fit items-center text-sm font-semibold">
                      <p>{cta}</p> <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </Craft.Container>
    </Craft.Section>
  );
};

export default Feature;
