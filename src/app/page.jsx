"use client"

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import Link from 'next/link';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import AuroraBackground from "@/components/ui/aurorabackground";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CircleUser
} from "lucide-react"
import { ModeToggle } from "@/components/ui/mode-toggle";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { useSession } from "next-auth/react";
import { signOut } from 'next-auth/react'


export default function Home() {
  const { data: session } = useSession()

  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  const carouselItems = [
    {
      title: "Administra tus Expensas",
      description: "Mantén tus pagos al día con recordatorios automáticos y visualiza tus expensas en tiempo real. ¡Nunca más te preocupes por las fechas de vencimiento!"
    },
    {
      title: "Comunícate con tus Vecinos",
      description: "Comparte tus ideas y discute temas importantes en un foro comunitario moderado por IA. ¡Fomenta un ambiente respetuoso y constructivo en tu edificio!"
    },
    {
      title: "Reserva Espacios Fácilmente",
      description: "Gestiona la reserva de espacios comunes con un calendario interactivo. ¡Evita conflictos de reserva y disfruta de tus espacios comunes sin problemas!"
    },
    {
      title: "Participa en Decisiones Importantes",
      description: "Utiliza un sistema de votación electrónica para tomar decisiones colectivas. ¡Tu voz importa y ahora puedes expresarla con facilidad y seguridad!"
    },
    {
      title: "Accede al Directorio del Edificio",
      description: "Encuentra rápidamente la información de contacto que necesitas con un directorio centralizado. ¡Mantente conectado con tus vecinos y servicios de emergencia!"
    },
    {
      title: "Recibe Notificaciones Personalizadas",
      description: "Mantente informado sobre eventos, mantenimientos y otros avisos importantes. ¡Configura tus preferencias y nunca te pierdas una actualización!"
    },
    {
      title: "Gestiona tus Paquetes",
      description: "Recibe notificaciones de llegada y registra el retiro de tus paquetes. ¡Mejora la logística y seguridad de tus entregas con un sistema eficiente!"
    }
  ];


  return (
    <AuroraBackground>
      <section className="w-full h-1/6 absolute top-0">
        <article className="flex w-full justify-end p-3 gap-3">
          <ModeToggle></ModeToggle>
          {session && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full icono-perfil">
                  <CircleUser className="h-5 w-5" />
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Configuraciones</DropdownMenuItem>
                <DropdownMenuItem>Sporte</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>Cerrar Sesion</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </article>
      </section>
      <section className="w-full h-1/2 flex items-center justify-center mb-10">
        <Image
          src="/resiredlogo2.png"
          alt="Descripción de la imagen"
          width={500}
          height={500}
          layout="intrinsic"
        />
      </section>
      <section className="w-full h-1/2 flex flex-col items-center justify-center gap-6">
        <Carousel
          plugins={[plugin.current]}
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
          opts={{
            align: "start",
            loop: true,
            orientation: "horizontal"
          }}
          className="w-2/5 h-2/5 flex justify-end items-center"
        >
          <CarouselContent>
            {carouselItems.map((item, index) => (
              <CarouselItem key={index}>
                <div className="flex flex-col items-center justify-around text-center">
                  <h3 className="mb-2 text-8xl font-medium"><TextGenerateEffect words={item.title}></TextGenerateEffect></h3>
                  <p className="text-lg leading-tight text-muted-foreground">{item.description}</p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

        </Carousel>
        <div className="flex flex-col items-center gap-4 h-2/5 w-2/5 mt-4">
          <Link href={session ? (session.user.role === 'admin' ? '/admin/dashboard' : '/user/profile') : '/login'}>
            <Button className="text-lg font-semibold">
              {session ? 'Ir al Perfil' : 'Iniciar Sesion'}
            </Button>
          </Link>
        </div>
      </section>
    </AuroraBackground>
  );
}
