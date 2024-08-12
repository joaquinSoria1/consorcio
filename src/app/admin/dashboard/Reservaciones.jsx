"use client"

import { useEffect, useState } from 'react';
import {
  File,
  ListFilter,
  PlusCircle,
  Pencil,
  X,
} from "lucide-react"
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import axios from 'axios';

export default function Reservaciones({ searchTerm = '' }) {
  const [reservaciones, setReservaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState(null);

  async function fetchReservaciones(delay = 0) {
    setIsLoading(true);
    try {
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      const response = await axios.get('/api/reservaciones');
      setReservaciones(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const deleteReservacion = async (reservacionId) => {
    try {
      const res = await axios.delete(`/api/reservaciones/${reservacionId}`);

      if (res.status === 200) {
        // Actualizar el estado local inmediatamente
        setReservaciones(prevReservaciones => 
          prevReservaciones.filter(reservacion => reservacion._id !== reservacionId)
        );
        
        // Volver a cargar los datos después de un retraso
        fetchReservaciones(2000);
      } else {
        throw new Error('Failed to delete reservacion');
      }
    } catch (error) {
      console.error(error);
    }
  };

  function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const sortReservacionesByDate = (order) => {
    const sortedReservaciones = [...reservaciones].sort((a, b) =>
      order === 'asc' 
        ? new Date(a.fecha) - new Date(b.fecha)
        : new Date(b.fecha) - new Date(a.fecha)
    );
    setReservaciones(sortedReservaciones);
    setSortOrder(order);
  };

  const filteredReservaciones = reservaciones.filter(reservacion => {
    if (!reservacion || !reservacion.departamento || !reservacion.departamento.numeroDepartamento) {
      return false;
    }
    return reservacion.departamento.numeroDepartamento.toLowerCase().includes((searchTerm || '').toLowerCase());
  });

  useEffect(() => {
    fetchReservaciones();
  }, []);

  return (
    <>
      <Tabs defaultValue="reservaciones">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="reservaciones">Reservaciones</TabsTrigger>
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
                <DropdownMenuCheckboxItem checked={sortOrder === 'asc'} onClick={() => sortReservacionesByDate('asc')}>
                  Fecha ascendente
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={sortOrder === 'desc'} onClick={() => sortReservacionesByDate('desc')}>
                  Fecha descendente
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Exportar
              </span>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button size="sm" className="h-8 gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Añadir Reservación
                  </span>
                </Button>
              </SheetTrigger>
              {/* Aquí iría el componente SheetReservacion */}
            </Sheet>
          </div>
        </div>
        <TabsContent value="reservaciones">
          <Card>
            <CardHeader className="px-7">
              <CardTitle>Reservaciones</CardTitle>
              <CardDescription>Administra las reservaciones de amenidades</CardDescription>
            </CardHeader>
            {isLoading ? (
              <CardContent className="space-y-4">
                <Skeleton className="w-full h-[150px] rounded-r-lg" />
                <Skeleton className="w-4/5 h-[50px] rounded-r-lg" />
                <Skeleton className="w-2/3 h-[50px] rounded-r-lg" />
              </CardContent>
            ) : reservaciones.length !== 0 ? (
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReservaciones.map(reservacion => (
                      <TableRow key={reservacion._id}>
                        <TableCell>{new Date(reservacion.fecha).toLocaleDateString()}</TableCell>
                        <TableCell>{formatTime(reservacion.fecha)}</TableCell>
                        <TableCell>{reservacion.departamento.numeroDepartamento}</TableCell>
                        <TableCell className="flex items-center justify-end gap-2">
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8 gap-1">
                                <Pencil className="h-3.5 w-3.5"></Pencil>
                              </Button>
                            </SheetTrigger>
                            {/* Aquí iría el componente SheetReservacion con los datos de la reservación */}
                          </Sheet>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8 gap-1">
                                <X className="h-3.5 w-3.5"></X>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>¿Desea eliminar esta reservación?</DialogTitle>
                                <DialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente esta reservación.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <DialogClose>
                                  <Button
                                    variant="destructive"
                                    onClick={() => deleteReservacion(reservacion._id)}
                                  >
                                    Sí, eliminar reservación
                                  </Button>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            ) : (
              <CardContent>
                <div className="flex flex-col items-center gap-3 text-center">
                  <h3 className="text-2xl font-bold tracking-tight">
                    No hay Reservaciones en este momento
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Podrás empezar a administrar las Reservaciones en cuanto se agreguen algunas
                  </p>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button size="sm" className="h-8 gap-1">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                          Añadir Reservación
                        </span>
                      </Button>
                    </SheetTrigger>
                    {/* Aquí iría el componente SheetReservacion */}
                  </Sheet>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}