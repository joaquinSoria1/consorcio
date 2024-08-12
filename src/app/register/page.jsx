"use client"

import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from 'axios';
import { toast } from "sonner";
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";


const formSchema = z.object({
  nombres: z.string().min(2, {
    message: "Los nombres deben tener al menos dos caracteres"
  }),
  apellidos: z.string().min(2, {
    message: "Los apellidos deben tener al menos dos caracteres"
  }),
  email: z.string().email({
    message: "Porfavor introduzca un correo electronico valido"
  }),
  telefono: z.number().min(10, {
    message: "Porfavor introduzca un telefono valido"
  }),
  piso: z.number().positive({
    message: "El numero de piso debe ser un numero positivo"
  }),
  departamento: z.string().min(1, {
    message: "El departamento debe tener un caracter valido"
  }),
});

export default function RegisterForm() {
  const [error, setError] = useState(null);
  const router = useRouter()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: ''
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await axios.post('/api/auth/signup/user', data);
      console.log(response.data);
      form.reset({
        nombres: '',
        apellidos: '',
        email: '',
        telefono: '',
        piso: 0,
        departamento: '',
      });

      toast(`${data.nombres} ${data.apellidos} se ha unido`, {
        description: "¡Registro exitoso!",
      });

      router.push("/login");
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
    <div className="flex items-center justify-center h-screen bg-no-repeat bg-cover" style={{ backgroundImage: "url('/assets/blurry-gradient-haikei2.svg')" }}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 border border-gray-500  px-5 py-8" method="post">
          {error && <div className="text-red-500">{error}</div>}
          <FormField
            control={form.control}
            name="nombres"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombres</FormLabel>
                <FormControl>
                  <Input placeholder="Nombres" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="apellidos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellidos</FormLabel>
                <FormControl>
                  <Input placeholder="Apellidos" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefono</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="+54 12 345678"
                    {...field}
                    value={field.value === '' ? '' : parseInt(field.value, 10)}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-5">
            <FormField
              control={form.control}
              name="piso"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Piso</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Piso"
                      {...field}
                      value={field.value === '' ? '' : parseInt(field.value, 10)}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="departamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departamento</FormLabel>
                  <FormControl>
                    <Input placeholder="Departamento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit">Enviar</Button>
        </form>
      </Form>
    </div>
  );
}