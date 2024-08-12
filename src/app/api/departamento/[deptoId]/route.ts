import Departamento from '@/models/departamento';
import { NextResponse, NextRequest } from "next/server";
import { ConnectMD } from "@/lib/conection";

type Params = {
  deptoId: string
}

export async function GET(request: Request, { params }: { params: Params }) {
  await ConnectMD()
  try {
    const { deptoId } = params;
    console.log(`Searching for departamento: ${deptoId}`)
    const departamento = await Departamento.findById(deptoId).lean().populate([
      { path: 'inquilinos' },
      { path: 'expensas' },
      { path: 'reservas' }
    ]);
    console.log(`Departamento found:`, departamento)
    if (!departamento) {
      return NextResponse.json({ error: 'Departamento not found' }, { status: 404 })
    }
    return NextResponse.json(departamento, { status: 200 })
  } catch (error) {
    console.error(`Error fetching departamento:`, error)
    return NextResponse.json({ error: 'Failed to fetch departamento' }, { status: 500 })
  }
}

  
  


export async function DELETE(request: Request, { params }: { params: Params }) {
    await ConnectMD();

    try {
        const departamento = await Departamento.findByIdAndDelete(params.deptoId);
        if (!departamento) {
            return NextResponse.json({ error: 'Departamento not found' }, { status: 404 });
        }
        return NextResponse.json(departamento, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete departamento' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Params }) {
    await ConnectMD();

    try {
        const body = await request.json();
        const departamento = await Departamento.findByIdAndUpdate(params.deptoId, body, {
            new: true,
        });
        if (!departamento) {
            return NextResponse.json({ error: 'Departamento not found' }, { status: 404 });
        }
        return NextResponse.json(departamento, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update departamento' }, { status: 500 });
    }
}
