import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

const formSchema = z.object({
    nombres: z.string().min(2, {
        message: "Nombres must be at least 2 characters.",
    }),
    apellidos: z.string().min(2, {
        message: "Apellidos must be at least 2 characters.",
    }),
    email: z.string().email("Invalid email address."),
    telefono: z.string().min(10, {
        message: "Telefono must be at least 10 characters.",
    }),
    piso: z.string().min(1, {
        message: "Piso is required.",
    }),
    departamento: z.string().min(1, {
        message: "Departamento is required.",
    }),
});

export default function SheetResident({ userData, updateUsers }) {
    const [error, setError] = useState(null);
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombres: "",
            apellidos: "",
            email: "",
            telefono: "",
            piso: "",
            departamento: "",
        },
    });

    useEffect(() => {
        if (userData && userData.departamento && userData.departamento.numeroDepartamento) {
          const { departamento: { numeroDepartamento }, ...rest } = userData;
          const piso = numeroDepartamento.match(/\d+/)[0];
          const departamento = numeroDepartamento.match(/[a-zA-Z]+/)[0];
          form.reset({ ...rest, piso, departamento });
        }
      }, [userData, form]);

      const onSubmit = async (data) => {
        console.log('Data:', data);
        try {
          if (userData) {
            const response = await axios.put(`/api/auth/signup/user/${userData._id}`, data);
            console.log('Usuario actualizado:', response.data);
            updateUsers(response.data);
    
            toast(`${userData.nombres} ${userData.apellidos} se ha actualizado`, {
              description: "¡Actualización exitosa!",
            });
          } else {
            const response = await axios.post('/api/auth/signup/user', data);
            console.log('Usuario creado:', response.data);
            updateUsers(response.data);
    
            toast(`${data.nombres} ${data.apellidos} se ha unido`, {
              description: "¡Registro exitoso!",
            });
          }
        } catch (error) {
          if (error.response && error.response.status === 409) {
            setError('Ya existe un usuario en el mismo piso y departamento');
          } else {
            setError(error.message);
          }
          console.error(error);
        }
      };
      

    return (
        <>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Añadir Residente</SheetTitle>
                    <SheetDescription>
                        Crea un nuevo residente rellenando los campos y luego guarda los cambios
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" method="post">
                    {error && <div className="text-red-500">{error}</div>}
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nombres" className="text-left">
                                Nombres
                            </Label>
                            <Input id="nombres" type="text" {...form.register("nombres")} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="apellidos" className="text-left">
                                Apellidos
                            </Label>
                            <Input id="apellidos" type="text" {...form.register("apellidos")} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-left">
                                Email
                            </Label>
                            <Input id="email" type="email" {...form.register("email")} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="telefono" className="text-left">
                                Telefono
                            </Label>
                            <Input id="telefono" type="number" {...form.register("telefono")} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="piso" className="text-left">
                                Piso
                            </Label>
                            <Input id="piso" type="number" {...form.register("piso")} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="departamento" className="text-left">
                                Departamento
                            </Label>
                            <Input id="departamento" type="text" {...form.register("departamento")} className="col-span-3" />
                        </div>
                    </div>
                    <SheetFooter>
                        <SheetClose asChild>
                            <Button type="submit">Guardar</Button>
                        </SheetClose>
                    </SheetFooter>
                </form>
            </SheetContent>
        </>
    )
}
