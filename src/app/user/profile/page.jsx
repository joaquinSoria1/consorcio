"use client"

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { signOut } from 'next-auth/react'
import Link from "next/link"
import {
    Bell,
    CircleUser,
    Home,
    LineChart,
    Menu,
    Package2,
    Users,
    Hotel,
    Loader2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Avvvatars from 'avvvatars-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/ui/mode-toggle";
import AuroraBackground from "@/components/ui/aurorabackground";
import IconSection from "./inicio"
import { AssistantModal } from '@/components/ui/assistant-ui/assistant-modal';
import axios from "axios";

export default function Dashboard() {
    const { data: session, status } = useSession()
    const [userData, setUserData] = useState(null);
    const username = session?.user?.username;
    const imagenPerfil = userData?.imagenPerfil?.data;
    const numeroDepartamento = session?.user?.numeroDepartamento;

    useEffect(() => {
        if (session && session.user && session.user.inquilinos && session.user.inquilinos.length > 0) {
            const userId = session.user.inquilinos[0];
            axios.get(`/api/auth/signup/user/${userId}`)
                .then(response => {
                    setUserData(response.data);
                })
                .catch(error => {
                    console.error("Error fetching user data:", error);
                });
        }
    }, [session]);

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" />
                    <p className="text-lg font-medium">Cargando...</p>
                </div>
            </div>
        )
    }

    console.log('Session', session, status);

    return (
        <AuroraBackground>
            <div className="grid h-screen w-full box-content">
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col">
                            <nav className="grid gap-2 text-lg font-medium">
                                <Link href="./perfil" className="flex items-center gap-2 font-semibold">
                                    <Package2 className="h-6 w-6" />
                                    <span className="">{username}</span>
                                </Link>
                                <Link
                                    href="./expensas"
                                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                                >
                                    <Home className="h-5 w-5" />
                                    Expensas
                                </Link>
                                <Link
                                    href="./reservaciones"
                                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                                >
                                    <Users className="h-5 w-5" />
                                    Reservaciones
                                </Link>
                                <Link
                                    href="./comunidad"
                                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                                >
                                    <LineChart className="h-5 w-5" />
                                    Comunidad
                                </Link>
                            </nav>
                            <div className="mt-auto">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>¡Anashe!</CardTitle>
                                        <CardDescription>
                                            Aqui encontraras ru informacion como usuario
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button size="sm" className="w-full">
                                            XOXO
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </SheetContent>
                    </Sheet>
                    <div className="w-full flex-1 flex items-center gap-2">
                        <Hotel className="h-5 w-5" />
                        <span className="font-semibold">Departamento {numeroDepartamento}</span>
                    </div>
                    <Button variant="outline" size="icon" className="ml-auto">
                        <Bell className="h-5 w-5" />
                        <span className="sr-only">Toggle notifications</span>
                    </Button>
                    <ModeToggle></ModeToggle>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="rounded-full icono-perfil">
                                {imagenPerfil ? (
                                    <Avatar>
                                        <AvatarImage src={`data:image/jpeg;base64,${Buffer.from(imagenPerfil).toString('base64')}`} />
                                        <AvatarFallback></AvatarFallback>
                                    </Avatar>
                                ) : (
                                    <Avvvatars value={username} size={40} style="character" />
                                )}
                                <span className="sr-only">Toggle user menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Configuraciones</DropdownMenuItem>
                            <DropdownMenuItem>Soporte</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>Cerrar Sesion</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>
                <IconSection
                    nombres={userData ? userData.nombres : ''}
                    apellidos={userData ? userData.apellidos : ''}
                ></IconSection>
            </div>
            <AssistantModal imagenPerfil={imagenPerfil}  username={username} />
        </AuroraBackground>
    )
}
