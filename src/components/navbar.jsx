"use client"

import * as React from 'react';
import Link from "next/link"


import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const components = [
    {
        title: "Administración de Expensas",
        href: "./expensas",
        description: "Sistema para gestionar y recordar expensas en tiempo real."
    },
    {
        title: "Sección de Comentarios",
        href: "./comentarios",
        description: "Foro comunitario con moderación AI y organización de comentarios en hilos."
    },
    {
        title: "Sistema de Reservas",
        href: "./reservas",
        description: "Calendario interactivo para reservar espacios con reglas de uso."
    },
    {
        title: "Votaciones en Línea",
        href: "./votaciones",
        description: "Sistema de votación electrónica con anonimato, seguridad y resultados en tiempo real."
    }
]


const ListItem = ({ title, href, description }) => (
    <li className='bg-black'>
        <Link href={href} className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                {description}
            </p>
        </Link>
    </li>
)

export default function Navbar() {
    return (
        <NavigationMenu>
            <NavigationMenuList className="gap-7">
                <NavigationMenuItem>
                    <NavigationMenuTrigger>Funciones</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr] grid-auto-rows: 1fr">
                            <li className="row-span-3">
                                <Link href={components[0].href} className="flex h-full w-full select-none flex-col justify-center items-center rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md">
                                    <div className="mb-2 mt-4 text-lg font-medium">
                                        {components[0].title}
                                    </div>
                                    <p className="text-sm leading-tight text-muted-foreground">
                                        {components[0].description}
                                    </p>
                                </Link>
                            </li>
                            {components.slice(1).map((component, index) => (
                                <ListItem key={index} title={component.title} href={component.href} description={component.description} />
                            ))}
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="/sobrenosotros" className={navigationMenuTriggerStyle()}>
                        Sobre Nosotros
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="/#" className={navigationMenuTriggerStyle()}>
                        Botton
                    </Link>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    )
}
