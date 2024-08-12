"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { DragHandleDots2Icon, TrashIcon } from "@radix-ui/react-icons"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sortable,
  SortableDragHandle,
  SortableItem,
} from "@/components/ui/sortable"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DateTimePicker } from '@/components/date-time-picker-form'

const schema = z.object({
  expensas: z.array(
    z.object({
      description: z.string(),
      monto: z.number(),
    })
  ),
});

export function CrearExpensas({ onClose }) {
  const [totalMonto, setTotalMonto] = useState(0);
  const [date, setDate] = useState(null);

  const updateTotalMonto = (expensas) => {
    const total = expensas.reduce((acc, expensa) => acc + expensa.monto, 0);
    setTotalMonto(total);
  };

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      expensas: [
        {
          description: "Seguridad El Halcon Volador",
          monto: 1000000,
        },
        {
          description: "Servicio de Limpieza Pompa Grande",
          monto: 500000,
        },
        {
          description: "",
          monto: 0,
        },
      ],
    },
  });

  function onSubmit() {
    event.preventDefault();
    const data = {
      monto: Number(totalMonto),
      fechaVencimiento: date,
    };
    console.log(data);

    fetch('/api/expensa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Success:', data);
        window.location.reload();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }


  const { fields, append, move, remove } = useFieldArray({
    control: form.control,
    name: "expensas",
  });

  return (
    <div className="rounded-lg border p-6 mt-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-col gap-4"
        >
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Añadir Gastos</h2>
            <p className="text-[0.8rem] text-muted-foreground">
              Añade los gastos del mes asi se sumen a las expensas
            </p>
          </div>
          <div className="space-y-2">
            <Sortable
              value={fields}
              onMove={({ activeIndex, overIndex }) => {
                move(activeIndex, overIndex);
                updateTotalMonto(form.getValues("expensas"));
              }}
              overlay={
                <div className="grid grid-cols-[0.5fr,1fr,auto,auto] items-center gap-2">
                  <Skeleton className="h-8 w-full rounded-sm" />
                  <Skeleton className="h-8 w-full rounded-sm" />
                  <Skeleton className="size-8 shrink-0 rounded-sm" />
                  <Skeleton className="size-8 shrink-0 rounded-sm" />
                </div>
              }
            >
              <div className="w-full space-y-2">
                {fields.map((field, index) => (
                  <SortableItem key={field.id} value={field.id} asChild>
                    <div className="grid grid-cols-[1fr,0.5fr,auto,auto] items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`expensas.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input className="h-8" placeholder="Descripción del gasto" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`expensas.${index}.monto`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                className="h-8"
                                type="number"
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === "") {
                                    field.onChange(null);
                                  } else {
                                    field.onChange(e.target.valueAsNumber);
                                  }
                                }}
                                onBlur={() => updateTotalMonto(form.getValues("expensas"))}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <SortableDragHandle
                        variant="outline"
                        size="icon"
                        className="size-8 shrink-0"
                      >
                        <DragHandleDots2Icon
                          className="size-4"
                          aria-hidden="true"
                        />
                      </SortableDragHandle>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8 shrink-0"
                        onClick={() => {
                          remove(index);
                          updateTotalMonto(form.getValues("expensas"));
                        }}
                      >
                        <TrashIcon
                          className="size-4 text-destructive"
                          aria-hidden="true"
                        />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  </SortableItem>
                ))}
              </div>
            </Sortable>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => {
                append({
                  description: "",
                  monto: 0,
                });
                updateTotalMonto(form.getValues("expensas"));
              }}
            >
              Añadir gasto
            </Button>
          </div>
          <div className="space-y-2 flex justify-between items-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Añadir Fecha</h2>
              <p className="text-[0.8rem] text-muted-foreground ">
                Elige la fecha de vencimiento de las expensas
              </p>
              <DateTimePicker date={date} setDate={setDate} />
            </div>
            <div>
              <Card className="w-full max-w-sm">
                <CardHeader>
                  <CardTitle>Cantidad a Pagar</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-between text-2xl font-bold">
                  <h3>Total:</h3>
                  <span >${totalMonto}</span>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="submit" className="w-fit">
              Crear Expensa
            </Button>
            <Button variant="destructive" className="w-fit" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

