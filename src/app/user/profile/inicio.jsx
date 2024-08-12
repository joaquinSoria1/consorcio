import { HoverEffect } from "@/components/ui/card-hover-effect";
import {
    UserIcon,
    ReceiptIcon,
    CalendarIcon,
    Popcorn,
    MessageCircleHeart,
    MailIcon
} from "lucide-react";

export default function IconSection({nombres, apellidos}) {
    const cards = [
        {
            title: "Tu perfil",
            description: "Aquí puedes ver y actualizar tu información personal.",
            link: "/user/profile/perfil",
            icon: UserIcon,
        },
        {
            title: "Tus expensas",
            description: "Puedes ver tus expensas pendientes y realizar pagos.",
            link: "/user/profile/expensas",
            icon: ReceiptIcon,
        },
        {
            title: "Reservaciones",
            description: "Reserva el salón de eventos o la piscina.",
            link: "/user/profile/reservaciones",
            icon: CalendarIcon,
        },
    ];

    return (
        <div className="container py-24 lg:gap-8 lg:py-0">
            <div className="max-w-4xl mx-auto">
                <div className="text-center my-6 ">
                    <h1 className="text-4xl font-semibold">Bienvenido {nombres} {apellidos}</h1>
                    <p className="mt-2 text-muted-foreground">
                        Aquí puedes encontrar las principales funciones de la aplicación.
                    </p>
                </div>
                <div className="max-w-5xl mx-auto px-8">
                    <HoverEffect items={cards} />
                </div>
            </div>
        </div>
    );
}
