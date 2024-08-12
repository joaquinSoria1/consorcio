"use client"

import {
    File,
    ListFilter,
} from "lucide-react"
import { Calendar, CreditCard, DollarSign, User, FileText, Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentDialog = ({ expensa, userData, onClose, onPayment }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');

    const handlePayment = async () => {
        if (!paymentMethod) {
            alert('Por favor, seleccione un método de pago');
            return;
        }
        setIsProcessing(true);
        try {
            await onPayment(expensa._id, paymentMethod);
        } catch (error) {
            console.error('Error al procesar el pago:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">Factura de Expensa</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="flex items-center gap-4 border-b pb-4">
                        <FileText className="h-6 w-6 text-blue-500" />
                        <div>
                            <p className="text-sm font-semibold text-gray-500">Número de Factura</p>
                            <p className="text-lg font-medium">{expensa._id}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <User className="h-5 w-5 text-gray-500" />
                        <div>
                            <p className="text-sm font-semibold text-gray-500">Residente</p>
                            <p className="text-base">{userData.nombres} {userData.apellidos}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <DollarSign className="h-5 w-5 text-green-500" />
                        <div>
                            <p className="text-sm font-semibold text-gray-500">Monto</p>
                            <p className="text-xl font-bold">${expensa.monto}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Calendar className="h-5 w-5 text-red-500" />
                        <div>
                            <p className="text-sm font-semibold text-gray-500">Fecha de Vencimiento</p>
                            <p className="text-base">{new Date(expensa.fechavencimiento).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Clock className="h-5 w-5 text-yellow-500" />
                        <div>
                            <p className="text-sm font-semibold text-gray-500">Estado</p>
                            <p className="text-base capitalize">{expensa.estado}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <CreditCard className="h-5 w-5 text-purple-500" />
                        <div className="flex-grow">
                            <p className="text-sm font-semibold text-gray-500 mb-1">Método de pago</p>
                            <Select onValueChange={setPaymentMethod}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione un método de pago" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="transferencia">Transferencia</SelectItem>
                                    <SelectItem value="debito">Tarjeta de débito</SelectItem>
                                    <SelectItem value="credito">Tarjeta de crédito</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <DialogFooter className="flex justify-between">
                    <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handlePayment}
                        disabled={isProcessing || !paymentMethod}
                        className="bg-blue-500 hover:bg-blue-600"
                    >
                        {isProcessing ? 'Procesando...' : 'Confirmar Pago'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default function Inicio({ userData, expensasData }) {
    const [expensas, setExpensas] = useState(expensasData || []);
    const [selectedExpensa, setSelectedExpensa] = useState(null);

    const handlePayClick = (expensa) => {
        setSelectedExpensa(expensa);
    };

    const handleCloseDialog = () => {
        setSelectedExpensa(null);
    };

    const handlePayment = async (expensaId, paymentMethod) => {
        try {
            console.log('Intentando pagar expensa con ID:', expensaId, 'Método:', paymentMethod);
            const response = await axios.put(`/api/expensa/${expensaId}`, { estado: 'pagado'});
            if (response.data.expensa) {
                setExpensas(prevExpensas =>
                    prevExpensas.map(expensa =>
                        expensa._id === expensaId ? response.data.expensa : expensa
                    )
                );
                handleCloseDialog();
            } else {
                console.error('Respuesta inesperada del servidor:', response.data);
            }
        } catch (error) {
            console.error('Error al procesar el pago:', error.response?.data || error.message);
        }
    };

    useEffect(() => {
        setExpensas(expensasData || []);
    }, [expensasData]);

    console.log('Expensas', expensas);

    return (
        <Tabs defaultValue="mes">
            <div className="flex items-center">
                <TabsList>
                    <TabsTrigger value="mes">Mes</TabsTrigger>
                    <TabsTrigger value="año">Año</TabsTrigger>
                </TabsList>
                <div className="ml-auto flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 gap-1 text-sm"
                            >
                                <ListFilter className="h-3.5 w-3.5" />
                                <span className="sr-only sm:not-sr-only">Filter</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem checked>
                                Fulfilled
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem>
                                Declined
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem>
                                Refunded
                            </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-7 gap-1 text-sm"
                    >
                        <File className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only">Export</span>
                    </Button>
                </div>
            </div>
            <TabsContent value="mes">
                <Card>
                    <CardHeader className="px-7">
                        <CardTitle>Expensas</CardTitle>
                        <CardDescription>
                            Revisa tus expensas mensuales aquí.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Residente</TableHead>
                                    <TableHead className="hidden sm:table-cell">
                                        Estado
                                    </TableHead>
                                    <TableHead className="hidden sm:table-cell">
                                        Fecha de vencimiento
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell">
                                        Monto
                                    </TableHead>
                                    <TableHead className="text-right">Pagar</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expensas && expensas.length > 0 ? (
                                    expensas.map((expensa) => (
                                        <TableRow key={expensa._id} className={expensa.estado === 'pendiente' ? 'bg-accent' : ''}>
                                            <TableCell>
                                                <div className="font-medium">{userData?.nombres} {userData?.apellidos}</div>
                                                <div className="hidden text-sm text-muted-foreground md:inline">
                                                    {userData?.email}
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                {expensa.estado}
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                {new Date(expensa.fechavencimiento).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                ${expensa.monto}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {expensa.estado === 'pendiente' && (
                                                    <Button onClick={() => handlePayClick(expensa)}>Pagar</Button>
                                                )}
                                                {expensa.estado === 'pagado' && (
                                                    <Badge variant="destructive">Pagado</Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">No hay expensas para mostrar</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
            {selectedExpensa && (
                <PaymentDialog
                    expensa={selectedExpensa}
                    userData={userData}
                    onClose={handleCloseDialog}
                    onPayment={handlePayment}
                />
            )}
        </Tabs>
    )
}