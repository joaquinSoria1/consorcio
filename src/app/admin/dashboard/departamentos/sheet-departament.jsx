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
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

const formSchema = z.object({
    piso: z.string().min(1, {
        message: "Piso is required.",
    }),
    departamento: z.string().min(1, {
        message: "Departamento is required.",
    }),
});

export default function SheetDepartament({onSuccess }) {
    const [error, setError] = useState(null);
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            piso: "",
            departamento: "",
        },
    });

    const onSubmit = async (data) => {
        try {
          const numeroDepartamento = `${data.piso}${data.departamento}`;
          const response = await axios.post('/api/departamento', { numeroDepartamento });
          console.log(response.data);
      
          toast(`Departamento ${numeroDepartamento} se ha creado`, {
            description: "¡Registro exitoso!",
          });
      
          onSuccess(); 
        } catch (error) {
          if (error.response && error.response.status === 409) {
            setError('Ya existe un departamento con ese número');
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
                    <SheetTitle>Añadir Departamento</SheetTitle>
                    <SheetDescription>
                        Crea un nuevo departamento rellenando los campos y luego guarda los cambios
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" method="post">
                    {error && <div className="text-red-500">{error}</div>}
                    <div className="grid gap-4 py-4">
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
