import { NextResponse } from 'next/server';
import { ConnectMD } from "@/lib/conection";
import Expensas from "@/models/expensas";

export async function PUT(request, { params }) {
  try {
    await ConnectMD();
    
    const { expensaId } = params;
    console.log('ExpensaId recibido:', expensaId);

    const { estado } = await request.json();

    if (!['pagado', 'pendiente'].includes(estado)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
    }

    const updatedExpensa = await Expensas.findByIdAndUpdate(
      expensaId,
      { estado },
      { new: true, runValidators: true }
    );

    if (!updatedExpensa) {
      return NextResponse.json({ error: 'Expensa no encontrada' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Estado actualizado',
      expensa: updatedExpensa
    });

  } catch (error) {
    console.error('Error al actualizar la expensa:', error);
    return NextResponse.json({ error: 'Error interno del servidor', details: error.message }, { status: 500 });
  }
}