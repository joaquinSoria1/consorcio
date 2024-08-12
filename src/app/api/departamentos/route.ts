import { NextResponse, NextRequest } from "next/server";
import Departamento from "@/models/departamento";
import { ConnectMD } from "@/lib/conection";
import bcrypt from "bcryptjs";


export async function POST(request: NextRequest) {
  await ConnectMD();

  try {
    const { pisos, departamentos } = await request.json();

    if (!pisos || !departamentos) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const departamentosCreados = [];

    for (let piso = 1; piso <= pisos; piso++) {
      for (let deptoCode = 'A'.charCodeAt(0); deptoCode <= 'A'.charCodeAt(0) + departamentos.charCodeAt(0) - 'A'.charCodeAt(0); deptoCode++) {
        const depto = String.fromCharCode(deptoCode);
        const numeroDepartamento = `${piso}${depto}`;

        const existingDepartamento = await Departamento.findOne({ numeroDepartamento });
        if (existingDepartamento) {
          console.log(`El departamento ${numeroDepartamento} ya existe, skipping...`);
          continue;
        }

        const username = `departamento${numeroDepartamento}`;
        const password = `departamento${numeroDepartamento}`;
        const hashedPassword = await bcrypt.hash(password, 12);

        const departamento = new Departamento({ numeroDepartamento, username, password: hashedPassword });
        await departamento.save();

      }
    }

    return NextResponse.json({ message: 'Departamentos creados exitosamente', departamentos: departamentosCreados }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'No se pudieron crear los departamentos' }, { status: 500 });
}
}
