"use client"

import { useState } from 'react'
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DateTimePicker } from '@/components/date-time-picker-form'
import axios from 'axios'

export function EditarExpensa({ expensa, onUpdate, onCancel }) {
  const [monto, setMonto] = useState(expensa.monto)
  const [fechaVencimiento, setFechaVencimiento] = useState(new Date(expensa.fechavencimiento))
  const [isEditing, setIsEditing] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      const response = await axios.put(`/api/expensa`, {
        id: expensa._id,
        monto: Number(monto),
        fechaVencimiento: fechaVencimiento,
        mesOriginal: expensa.fechavencimiento.getMonth(),
        anioOriginal: expensa.fechavencimiento.getFullYear()
      })
      onUpdate(response.data)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating expense:', error)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    onCancel()
  }

  const handleDateChange = (newDate) => {
    console.log("New date selected:", newDate);
    setFechaVencimiento(newDate);
  }

  if (!isEditing) {
    return (
      <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => setIsEditing(true)}>
        <Pencil className="h-3.5 w-3.5" />
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="monto" className="block text-sm font-medium text-gray-700">
            Monto
          </label>
          <Input
            id="monto"
            type="number"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <label htmlFor="fechaVencimiento" className="block text-sm font-medium text-gray-700">
            Fecha de Vencimiento
          </label>
          <DateTimePicker
            date={fechaVencimiento}
            setDate={handleDateChange}
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="secondary" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar Cambios</Button>
      </div>
    </form>
  )
}