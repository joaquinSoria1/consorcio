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
import Avvvatars from 'avvvatars-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import axios from 'axios';
import SheetResident from './residentes/sheet-resident';

export default function Residentes({ searchTerm = '' }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState(null);

  async function fetchResidents(delay = 0) {
    setIsLoading(true);
    try {
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      const response = await axios.get('/api/auth/signup/user');
      setUsers(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const updateUsers = (updatedUser) => {
    setUsers(prevUsers => {
      const index = prevUsers.findIndex(user => user._id === updatedUser._id);
      if (index !== -1) {
        const newUsers = [...prevUsers];
        newUsers[index] = updatedUser;
        return newUsers;
      } else {
        return [...prevUsers, updatedUser];
      }
    });
    fetchResidents(2000);
  };
  
  const deleteResident = async (userId) => {
    try {
      const res = await axios.delete(`/api/auth/signup/user/${userId}`);
  
      if (res.status === 200) {
        setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
        fetchResidents(2000);
      } else {
        throw new Error('Failed to delete resident');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const sortResidentsAZ = () => {
    const sortedResidents = [...users].sort((a, b) =>
      `${a.nombres} ${a.apellidos}`.localeCompare(`${b.nombres} ${b.apellidos}`)
    );
    setUsers(sortedResidents);
    setSortOrder('asc');
  };

  const sortResidentsZA = () => {
    const sortedResidents = [...users].sort((a, b) =>
      `${b.nombres} ${b.apellidos}`.localeCompare(`${a.nombres} ${a.apellidos}`)
    );
    setUsers(sortedResidents);
    setSortOrder('desc');
  };

  const filteredResidents = users

  useEffect(() => {
    fetchResidents();
  }, []);

  return (
    <>
      <Tabs defaultValue="residents">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="residents">Residentes</TabsTrigger>
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
                <DropdownMenuCheckboxItem checked={sortOrder === 'asc'} onClick={sortResidentsAZ}>
                  A-Z
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={sortOrder === 'desc'} onClick={sortResidentsZA}>
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
            <Sheet>
              <SheetTrigger asChild>
                <Button size="sm" className="h-8 gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Añadir Residente
                  </span>
                </Button>
              </SheetTrigger>
              <SheetResident updateUsers={updateUsers}></SheetResident>
            </Sheet>
          </div>
        </div>
        <TabsContent value="residents">
          <Card>
            <CardHeader className="px-7">
              <CardTitle>Residentes</CardTitle>
              <CardDescription>Administra los datos de los Residentes</CardDescription>
            </CardHeader>
            {isLoading ? (
              <CardContent className="space-y-4">
                <Skeleton className="w-full h-[150px] rounded-r-lg" />
                <Skeleton className="w-4/5 h-[50px] rounded-r-lg" />
                <Skeleton className="w-2/3 h-[50px] rounded-r-lg" />
              </CardContent>
            ) : users.length !== 0 ? (
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Avatar</TableHead>
                      <TableHead className="hidden sm:table-cell">Nombre</TableHead>
                      <TableHead className="hidden sm:table-cell">Email</TableHead>
                      <TableHead className="hidden sm:table-cell">Teléfono</TableHead>
                      <TableHead className="hidden sm:table-cell">Departamento</TableHead>
                      <TableHead className="text-right">Editar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResidents.map(user => (
                      <TableRow key={user._id}>
                        <TableCell>
                        {user.imagenPerfil ? (
                                <Avatar>
                                    <AvatarImage src={`data:image/jpeg;base64,${Buffer.from(user.imagenPerfil).toString('base64')}`} />
                                    <AvatarFallback></AvatarFallback>
                                </Avatar>
                            ) : (
                                <Avvvatars value={user.departamento.username} size={40} style="character" />
                            )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{`${user.nombres} ${user.apellidos}`}</div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {user.email}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {user.telefono}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {user.departamento ? user.departamento.numeroDepartamento : 'Sin departamento'}
                        </TableCell>
                        <TableCell className="flex items-center justify-end gap-2">
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8 gap-1">
                                <Pencil className="h-3.5 w-3.5"></Pencil>
                              </Button>
                            </SheetTrigger>
                            <SheetResident userData={user} updateUsers={updateUsers} />
                          </Sheet>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8 gap-1">
                                <X className="h-3.5 w-3.5"></X>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>¿Desea eliminar este residente?</DialogTitle>
                                <DialogDescription>
                                  ¡Esta acción no se puede deshacer!. Esta acción eliminará permanentemente este residente y sus datos asociados
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <DialogClose>
                                  <Button
                                    variant="destructive"
                                    onClick={() => deleteResident(user._id)}
                                  >
                                    Si, eliminar residente
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
                    No hay Residentes en este momento
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Podras empezar a administrar a los Residentes en cuanto agregues algunos
                  </p>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button size="sm" className="h-8 gap-1">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                          Añadir Residente
                        </span>
                      </Button>
                    </SheetTrigger>
                    <SheetResident></SheetResident>
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
