"use client"

import { useEffect, useState, useCallback } from 'react'
import { File, ListFilter, PlusCircle, Pencil, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu"
import { Sheet, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import axios from 'axios'
import { CrearExpensas } from './expensas/sheet-expensas'
import { EditarExpensa } from './expensas/editarExpensa'

export default function Expensas() {
    const [isLoading, setIsLoading] = useState(true);
    const [groupedExpenses, setGroupedExpenses] = useState([]);
    const [showCrearExpensas, setShowCrearExpensas] = useState(false);
    const [editingExpenseId, setEditingExpenseId] = useState(null)

    const months = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre"
    ];

    const fetchExpenses = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/expensa');
            const expenses = response.data;
            const grouped = groupExpensesByMonthAndYear(expenses);
            setGroupedExpenses(grouped);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const groupExpensesByMonthAndYear = (expenses) => {
        const grouped = expenses.reduce((acc, expense) => {
            const date = new Date(expense.fechavencimiento);
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            const key = `${year}-${month}`;

            if (!acc[key]) {
                acc[key] = {
                    month,
                    year,
                    totalAmount: 0,
                };
            }

            acc[key].totalAmount += expense.monto;
            return acc;
        }, {});

        return Object.values(grouped);
    };

    const handleClick = () => {
        setShowCrearExpensas(true);
    }

    const handleCloseCrearExpensas = () => {
        setShowCrearExpensas(false);
        fetchExpenses();
    };


    return (
        <>
            <Tabs value="todos">
                <div className="flex items-center">
                    <TabsList>
                        <TabsTrigger value="todos" >Todos</TabsTrigger>
                        <TabsTrigger value="pagados" >Pagados</TabsTrigger>
                        <TabsTrigger value="pendientes" className="hidden sm:flex" >
                            Pendientes
                        </TabsTrigger>
                    </TabsList>
                    <div className="ml-auto flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 gap-1">
                                    <ListFilter className="h-3.5 w-3.5" />
                                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                        Filtrar
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Filtrar</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuCheckboxItem >
                                    A-Z
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem  >
                                    Z-A
                                </DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button size="sm" variant="outline" className="h-8 gap-1">
                            <File className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Exportar
                            </span>
                        </Button>
                        <Button size="sm" className="h-8 gap-1" onClick={handleClick}>
                            <PlusCircle className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Añadir Expensa
                            </span>
                        </Button>
                    </div>
                </div>
                {showCrearExpensas ? <CrearExpensas onClose={handleCloseCrearExpensas} ></CrearExpensas> :
                    <TabsContent value="todos">
                        <Card>
                            <CardHeader className="px-7">
                                <CardTitle>Expensas</CardTitle>
                                <CardDescription>Administra las expensas de los inquilinos</CardDescription>
                            </CardHeader>
                            {isLoading ? (
                                <CardContent className="space-y-4">
                                    <Skeleton className="w-full h-[150px] rounded-r-lg" />
                                    <Skeleton className="w-4/5 h-[50px] rounded-r-lg" />
                                    <Skeleton className="w-2/3 h-[50px] rounded-r-lg" />
                                </CardContent>
                            ) : groupedExpenses.length > 0 ? (
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Mes</TableHead>
                                                <TableHead className="hidden sm:table-cell">Año</TableHead>
                                                <TableHead className="hidden sm:table-cell">Monto Total</TableHead>
                                                <TableHead className="hidden md:table-cell text-right">Editar</TableHead>
                                                <TableHead className="text-right">Generar</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {groupedExpenses.map((group) => (
                                                <TableRow key={`${group.year}-${group.month}`}>
                                                    <TableCell>{months[group.month - 1]}</TableCell>
                                                    <TableCell className="hidden sm:table-cell">{group.year}</TableCell>
                                                    <TableCell className="hidden sm:table-cell">$ {Math.round(group.totalAmount)}</TableCell>
                                                    <TableCell className="hidden sm:table-cell text-right">
                                                        {editingExpenseId === `${group.year}-${group.month}` ? (
                                                            <EditarExpensa
                                                                expensa={group}
                                                                onUpdate={(updatedExpense) => {
                                                                    setGroupedExpenses(prevExpenses =>
                                                                        prevExpenses.map(exp =>
                                                                            exp.year === updatedExpense.year && exp.month === updatedExpense.month ? updatedExpense : exp
                                                                        )
                                                                    )
                                                                    setEditingExpenseId(null)
                                                                    fetchExpenses() 
                                                                }}
                                                                onCancel={() => setEditingExpenseId(null)}
                                                            />
                                                        ) : (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 gap-1"
                                                                onClick={() => setEditingExpenseId(`${group.year}-${group.month}`)}
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button>Generar</Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            ) : (<CardContent>
                                <div className="flex flex-col items-center gap-3 text-center">
                                    <h3 className="text-2xl font-bold tracking-tight">
                                        No hay Expensas en este momento
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Podras empezar a administrar a los Expensas en cuanto agregues algunos
                                    </p>
                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <Button size="sm" className="h-8 gap-1">
                                                <PlusCircle className="h-3.5 w-3.5" />
                                                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                                    Añadir Expensas
                                                </span>
                                            </Button>
                                        </SheetTrigger>
                                    </Sheet>
                                </div>
                            </CardContent>
                            )}
                        </Card>
                    </TabsContent>
                }
            </Tabs >
        </>
    )
}

