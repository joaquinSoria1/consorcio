import { NextResponse, NextRequest } from "next/server";
import Departamento from "@/models/departamento";
import { ConnectMD } from "@/lib/conection";
import bcrypt from "bcryptjs";

export async function GET(): Promise<NextResponse> {
  await ConnectMD();

  try {

    const departamentos = await Departamento.find().lean().populate([
      { path: 'inquilinos' },
      { path: 'expensas' },
      { path: 'reservas' }
    ]);

    return NextResponse.json(departamentos);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error al obtener los departamentos", details: error.message }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  await ConnectMD();

  try {
    const { numeroDepartamento } = await request.json();

    if (!numeroDepartamento) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const existingDepartamento = await Departamento.findOne({ numeroDepartamento });
    if (existingDepartamento) {
      return NextResponse.json({ error: 'El departamento ya existe' }, { status: 409 });
    }

    const username = `departamento${numeroDepartamento}`;
    const password = `departamento${numeroDepartamento}`;
    const hashedPassword = await bcrypt.hash(password, 12);

    const departamento = new Departamento({ numeroDepartamento, username, password: hashedPassword });
    await departamento.save();

    return NextResponse.json({ message: 'Departamento creado exitosamente', departamento }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'No se pudo crear el departamento' }, { status: 500 });
  }
}

