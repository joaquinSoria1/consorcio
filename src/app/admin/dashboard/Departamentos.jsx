"use client"

import { useEffect, useState, useCallback } from 'react';
import {
  File,
  ListFilter,
  PlusCircle,
  Pencil,
  X,
} from "lucide-react"
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
import SheetDepartament from "./departamentos/sheet-departament"
import CrearDepartamentos from "./departamentos/crearDepartamentos"
import axios from 'axios';

const fetchDepartamentos = async () => {
  try {
    const response = await fetch('/api/departamento');
    const data = await response.json();
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default function Departammentos({ searchTerm }) {
  const [departamentos, setDepartamentos] = useState([]);
  const [selectedTab, setSelectedTab] = useState('todos');
  const [isLoading, setIsLoading] = useState(true);
  const [habitadoFilter, setHabitadoFilter] = useState(false);
  const [noHabitadosFilter, setNoHabitadosFilter] = useState(false);
  const [sortOrder, setSortOrder] = useState(null);


  const refreshDepartamentos = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchDepartamentos();
      setDepartamentos(data);
    } catch (error) {
      console.error("Error fetching departamentos:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDepartamentos();
  }, [refreshDepartamentos]);

  const deleteDepartment = async (deptoId) => {
    try {
      const res = await axios.delete(`/api/departamento/${deptoId}`);
      if (res.status === 200) {
        refreshDepartamentos(); 
      } else {
        throw new Error('Failed to delete department');
      }
    } catch (error) {
      console.error(error);
    }
  };


  const handleHabitado = () => {
    setSelectedTab('habitados');
    setHabitadoFilter(true);
    setNoHabitadosFilter(false);
  };

  const handleNoHabitados = () => {
    setSelectedTab('no-habitados')
    setNoHabitadosFilter(!noHabitadosFilter);
    setHabitadoFilter(false);
  };

  const sortDepartmentsAZ = () => {
    const sortedDepartments = [...departamentos].sort((a, b) =>
      a.numeroDepartamento.localeCompare(b.numeroDepartamento)
    );
    setDepartamentos(sortedDepartments);
    setSortOrder('asc');
  };

  const sortDepartmentsZA = () => {
    const sortedDepartments = [...departamentos].sort((a, b) =>
      b.numeroDepartamento.localeCompare(a.numeroDepartamento)
    );
    setDepartamentos(sortedDepartments);
    setSortOrder('desc');
  };


  const filteredDepartamentos = departamentos.filter(departamento =>
    (departamento.numeroDepartamento &&
      typeof departamento.numeroDepartamento === 'string' &&
      searchTerm &&
      departamento.numeroDepartamento.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (departamento.inquilinos && departamento.inquilinos.length > 0 &&
      searchTerm &&
      `${departamento.inquilinos[0].nombres} ${departamento.inquilinos[0].apellidos}`
        .toLowerCase().includes(searchTerm.toLowerCase()))
  );


  useEffect(() => {
    fetchDepartamentos();
  }, []);

  return (
    <>
      <Tabs value={selectedTab} onChange={setSelectedTab}>
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="todos" onClick={fetchDepartamentos}>Todos</TabsTrigger>
            <TabsTrigger value="habitados" onClick={handleHabitado}>Habitados</TabsTrigger>
            <TabsTrigger value="no-habitados" className="hidden sm:flex" onClick={handleNoHabitados}>
              No Habitados
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
                <DropdownMenuCheckboxItem checked={sortOrder === 'asc'} onClick={sortDepartmentsAZ}>
                  A-Z
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={sortOrder === 'desc'} onClick={sortDepartmentsZA}>
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
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Añadir Departamentos
                  </span>
                </Button>
              </DialogTrigger>
              <CrearDepartamentos onSuccess={refreshDepartamentos} />
            </Dialog>
            <Sheet>
              <SheetTrigger asChild>
                <Button size="sm" className="h-8 gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Añadir Departamento
                  </span>
                </Button>
              </SheetTrigger>
              <SheetDepartament onSuccess={refreshDepartamentos} />
            </Sheet>
          </div>
        </div>
        <TabsContent value={selectedTab}>
          <Card>
            <CardHeader className="px-7">
              <CardTitle>Departamentos</CardTitle>
              <CardDescription>Administra los datos de los Departamentos</CardDescription>
            </CardHeader>
            {isLoading ? (
              <CardContent className="space-y-4">
                <Skeleton className="w-full h-[150px] rounded-r-lg" />
                <Skeleton className="w-4/5 h-[50px] rounded-r-lg" />
                <Skeleton className="w-2/3 h-[50px] rounded-r-lg" />
              </CardContent>
            ) : departamentos.length !== 0 ? (
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Departamento</TableHead>
                      <TableHead className="hidden sm:table-cell">Inquilino</TableHead>
                      <TableHead className="hidden sm:table-cell">Cuenta</TableHead>
                      <TableHead className="hidden md:table-cell">Reservaciones</TableHead>
                      <TableHead className="hidden md:table-cell">Expensas del Mes</TableHead>
                      <TableHead className="text-right">Editar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departamentos.map(departamento => (
                      <TableRow key={departamento._id}>
                        <TableCell>
                          <div className="font-medium">{departamento.numeroDepartamento}</div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {departamento.inquilinos.length > 0 ?
                            `${departamento.inquilinos[0].nombres ? departamento.inquilinos[0].nombres : 'Sin nombre'} ${departamento.inquilinos[0].apellidos ? departamento.inquilinos[0].apellidos : 'Sin apellido'}` :
                            'Sin propietario'
                          }
                        </TableCell>

                        <TableCell className="hidden sm:table-cell">
                          <Badge className="text-xs" variant="secondary">
                            {departamento.username}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {departamento.reservas.length > 0 ?
                            departamento.reservas.length :
                            'Sin reservaciones'
                          }
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{departamento.expensas.length > 0 ? `${departamento.expensas[0].estado}` : 'Sin expensas'}</TableCell>
                        <TableCell className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" className="h-8 gap-1">
                            <Pencil className="h-3.5 w-3.5"></Pencil>
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8 gap-1">
                                <X className="h-3.5 w-3.5"></X>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>¿Desea eliminar este departamentos?</DialogTitle>
                                <DialogDescription>
                                  ¡Esta acción no se puede deshacer!. Esta acción eliminará permanentemente este departamento y sus datos asociados
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <DialogClose>
                                  <Button
                                    variant="destructive"
                                    onClick={() => deleteDepartment(departamento._id)}
                                  >
                                    Eliminar departamento
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
                    No hay Departamentos en este momento
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Podras empezar a administrar a los Departamentos en cuanto agregues algunos
                  </p>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button size="sm" className="h-8 gap-1">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                          Añadir Departamento
                        </span>
                      </Button>
                    </SheetTrigger>
                    <SheetDepartament></SheetDepartament>
                  </Sheet>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
