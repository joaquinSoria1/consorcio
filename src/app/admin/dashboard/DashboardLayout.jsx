"use client"

import Link from "next/link";
import { usePathname } from 'next/navigation';
import {
    Bell,
    CircleUser,
    Home,
    LineChart,
    Menu,
    Package2,
    Search,
    HandCoins,
    BookOpenCheck,
    Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function DashboardLayout({ children }) {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: session, status } = useSession();
    const pathname = usePathname();

    const username = session?.user?.username;

    const handleSearch = event => {
        setSearchTerm(event.target.value);
    };


    const navItems = [
        { href: "/admin/dashboard", icon: <Home className="h-5 w-5" />, label: "Inicio" },
        { href: "/admin/dashboard/departamentos", icon: <Package2 className="h-5 w-5" />, label: "Departamentos" },
        { href: "/admin/dashboard/residentes", icon: <Users className="h-5 w-5" />, label: "Residentes" },
        { href: "/admin/dashboard/expensas", icon: <HandCoins className="h-5 w-5" />, label: "Expensas" },
        { href: "/admin/dashboard/reservaciones", icon: <BookOpenCheck className="h-5 w-5" />, label: "Reservaciones" },
        { href: "/admin/dashboard/analisis", icon: <LineChart className="h-5 w-5" />, label: "Análisis" },
    ];

    return (
        <div className="grid min-h-screen w-full">
            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col">
                            <nav className="grid gap-2 text-lg font-medium">
                                {navItems.map((item, index) => (
                                    <Link
                                        key={index}
                                        href={item.href}
                                        className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 ${pathname === item.href ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                            <div className="mt-auto">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>¡Bienvenido {username}!</CardTitle>
                                        <CardDescription>
                                            Si necesitas ayuda, solo pregunta
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button size="sm" className="w-full">
                                            Besos y abrazos
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </SheetContent>
                    </Sheet>
                    <div className="w-full flex-1">
                        <form>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Buscar departamento o residente..."
                                    className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                            </div>
                        </form>
                    </div>
                    <ModeToggle />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="rounded-full icono-perfil">
                                <CircleUser className="h-5 w-5" />
                                <span className="sr-only">Toggle user menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Configuraciones</DropdownMenuItem>
                            <DropdownMenuItem>Soporte</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => signOut()}>Cerrar Sesión</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}