import { NextResponse } from 'next/server';
import { ConnectMD } from "@/lib/conection";
import Reservas from "@/models/reservas";
import Departamento from "@/models/departamento";

export async function GET(req) {
  await ConnectMD();

  try {
    const reservaciones = await Reservas.find().populate('departamento');
    return NextResponse.json(reservaciones, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener las reservaciones' }, { status: 500 });
  }
}

export async function POST(req) {
  await ConnectMD();

  try {
    const { fecha, hora, departamentoId } = await req.json();

    if (!fecha || !hora || !departamentoId) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const departamento = await Departamento.findById(departamentoId);
    if (!departamento) {
      return NextResponse.json({ error: 'Departamento no encontrado' }, { status: 404 });
    }

    const nuevaReservacion = new Reservas({
      departamento: departamentoId,
      fecha: new Date(fecha),
      hora: new Date(hora)
    });

    await nuevaReservacion.save();


    departamento.reservas.push(nuevaReservacion._id);
    await departamento.save();

    return NextResponse.json(nuevaReservacion, { status: 201 });
  } catch (error) {
    console.error('Error al crear la reservación:', error);
    return NextResponse.json({ error: 'Error al crear la reservación', details: error.message }, { status: 400 });
  }
}