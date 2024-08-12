import { NextResponse } from 'next/server';
import { ConnectMD } from "@/lib/conection";
import Reservas from "@/models/reservas";
import Departamento from "@/models/departamento";

export async function GET(req, { params }) {
  const { reservacionId } = params;
  await ConnectMD();

  try {
    const reservacion = await Reservas.findById(reservacionId).populate('departamento');
    if (!reservacion) {
      return NextResponse.json({ error: 'Reservación no encontrada' }, { status: 404 });
    }
    return NextResponse.json(reservacion, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener la reservación' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const { reservacionId } = params;
  await ConnectMD();

  try {
    const { fecha, hora, departamentoId } = await req.json();

    // Verificar si el departamento existe
    const departamento = await Departamento.findById(departamentoId);
    if (!departamento) {
      return NextResponse.json({ error: 'Departamento no encontrado' }, { status: 404 });
    }

    const reservacionActualizada = await Reservas.findByIdAndUpdate(
      reservacionId,
      { departamento: departamentoId, fecha, hora },
      { new: true, runValidators: true }
    );

    if (!reservacionActualizada) {
      return NextResponse.json({ error: 'Reservación no encontrada' }, { status: 404 });
    }

    return NextResponse.json(reservacionActualizada, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar la reservación' }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  const { reservacionId } = params;
  await ConnectMD();

  try {
    const reservacionEliminada = await Reservas.findByIdAndDelete(reservacionId);
    if (!reservacionEliminada) {
      return NextResponse.json({ error: 'Reservación no encontrada' }, { status: 404 });
    }

    await Departamento.updateOne(
      { reservas: reservacionId },
      { $pull: { reservas: reservacionId } }
    );

    return NextResponse.json({ message: 'Reservación eliminada con éxito' }, { status: 200 });
  } catch (error) {
    console.error('Error al eliminar la reservación:', error);
    return NextResponse.json({ error: 'Error al eliminar la reservación' }, { status: 500 });
  }
}