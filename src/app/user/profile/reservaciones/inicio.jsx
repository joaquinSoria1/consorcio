"use client"

import { useState, useEffect } from "react";
import axios from "axios";
import { Clock, Plus, Edit, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateTimePicker } from "@/components/date-time-picker-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

function ReservationComponent({ userData, reservasData }) {
  const [reservations, setReservations] = useState([]);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const timeSlots = [
    "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "00:00"
  ];

  useEffect(() => {
    if (reservasData) {
      setReservations(reservasData);
      setIsLoading(false);
    }
  }, [reservasData]);


  const handleCreate = async () => {
    if (date && time) {
      try {
        const dateTime = new Date(date);
        const [hours, minutes] = time.split(':');
        dateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));

        const response = await axios.post('/api/reservaciones', {
          fecha: dateTime.toISOString(), 
          hora: dateTime.toISOString(), 
          departamentoId: userData?.departamento?._id
        });
        setReservations([...reservations, response.data]);
        setDate(null);
        setTime("");
      } catch (error) {
        console.error('Error al crear la reservación:', error);
      }
    }
  };

  const handleEdit = (id) => {
    const reservation = reservations.find((r) => r._id === id);
    if (reservation) {
      setDate(new Date(reservation.fecha));
      setTime(new Date(reservation.hora).toTimeString().slice(0, 5));
      setEditingId(id);
    }
  };

  const handleUpdate = async () => {
    if (date && time && editingId) {
      try {
        const response = await axios.put(`/api/reservaciones/${editingId}`, {
          fecha: date,
          hora: time,
          departamentoId: userData?.departamento?._id 
        });
        setReservations(reservations.map(r => r._id === editingId ? response.data : r));
        setEditingId(null);
        setDate(null);
        setTime("");
      } catch (error) {
        console.error('Error al actualizar la reservación:', error);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/reservaciones/${id}`);
      setReservations(reservations.filter((r) => r._id !== id));
    } catch (error) {
      console.error('Error al eliminar la reservación:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="mt-6">
            <Skeleton className="h-6 w-1/2 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Reservaciones SUM</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <DateTimePicker date={date} setDate={setDate} />
          <Select value={time} onValueChange={setTime}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar hora" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {editingId ? (
            <Button onClick={handleUpdate} className="w-full">
              Actualizar Reserva
            </Button>
          ) : (
            <Button onClick={handleCreate} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Crear Reserva
            </Button>
          )}
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Mis Reservas</h3>
          {reservations.length === 0 ? (
            <div className="flex items-center justify-center text-muted-foreground">
              <AlertCircle className="w-4 h-4 mr-2" />
              No tienes reservas actualmente
            </div>
          ) : (
            <ul className="space-y-2">
              {reservations.map((reservation) => (
                <li
                  key={reservation._id}
                  className="flex items-center justify-between"
                >
                  <span>
                    {new Date(reservation.fecha).toLocaleDateString()} - {new Date(reservation.hora).toTimeString().slice(0, 5)}
                  </span>
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(reservation._id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(reservation._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ReservationComponent;