"use client"
import { useForm } from "react-hook-form"
import { signIn } from 'next-auth/react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState } from 'react';

export default function LoginForm({ role }) {
  const form = useForm()
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (values) => {
    setIsLoading(true)
    try {
      const res = await signIn("credentials", {
        username: values.username,
        password: values.password,
        role: role,
        redirect: false, 
      });
  
      if (res?.ok) {
        toast(`${values.username} ha iniciado sesión de manera exitosa`, {
          description: "¡Bienvenido!",
        });
  
        await new Promise(resolve => setTimeout(resolve, 2000));
  
        window.location.href = role === 'admin' ? '/admin/dashboard' : '/user/profile';
      } else {
        toast.error("Error al iniciar sesión");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 flex flex-col">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de usuario</FormLabel>
              <FormControl>
                <Input placeholder="Nombre de usuario" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Contraseña" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </Button>
      </form>
    </Form>
  )
}