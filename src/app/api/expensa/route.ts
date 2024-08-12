import { NextResponse, NextRequest } from "next/server";
import Expensas from "@/models/expensas";
import Departamento from "@/models/departamento"
import { ConnectMD } from "@/lib/conection";


export async function GET(): Promise<NextResponse> {
    await ConnectMD();

    try {

        const expensas = await Expensas.find()

        return NextResponse.json(expensas);
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Error al obtener las expensas", details: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    await ConnectMD();
  
    try {
      const { monto, fechaVencimiento } = await request.json();
  
      const departamentos = await Departamento.find();
      const numeroDepartamentos = departamentos.length;
      const montoPorDepartamento = (monto / numeroDepartamentos).toFixed(2);
  
      for (const departamento of departamentos) {
        const nuevaExpensa = new Expensas({
          departamento: departamento._id,
          monto: montoPorDepartamento,
          fechavencimiento: fechaVencimiento,
        });
  
        await nuevaExpensa.save();
  
        departamento.expensas.push(nuevaExpensa._id);
        await departamento.save();
      }
  
      return NextResponse.json({ message: 'Expenses created and added to departments successfully' }, { status: 201 });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to create expenses and add to departments', details: error.message }, { status: 500 });
    }
  }
  



export async function DELETE(request: NextRequest): Promise<NextResponse> {
    await ConnectMD();

    try {
        const { month, year } = await request.json();

        const expensasToDelete = await Expensas.find({
            fechavencimiento: {
                $gte: new Date(year, month - 1, 1),
                $lt: new Date(year, month, 1)
            }
        });

        const expensasIdsToDelete = expensasToDelete.map(expensa => expensa._id);

        await Expensas.deleteMany({ _id: { $in: expensasIdsToDelete } });

        await Departamento.updateMany(
            { expensas: { $in: expensasIdsToDelete } },
            { $pull: { expensas: { $in: expensasIdsToDelete } } }
        );

        return NextResponse.json({ message: 'Expenses deleted successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete expenses', details: error.message }, { status: 500 });
    }
}


export async function PUT(request: NextRequest): Promise<NextResponse> {
    await ConnectMD();

    try {
        const { id, monto, fechaVencimiento, mesOriginal, anioOriginal } = await request.json();

        // Buscar todas las expensas del mes y año original
        const expensasOriginales = await Expensas.find({
            fechavencimiento: {
                $gte: new Date(anioOriginal, mesOriginal, 1),
                $lt: new Date(anioOriginal, mesOriginal + 1, 1)
            }
        });

        // Obtener los IDs de los departamentos afectados
        const departamentosIds = expensasOriginales.map(e => e.departamento);

        // Borrar todas las expensas originales
        await Expensas.deleteMany({
            _id: { $in: expensasOriginales.map(e => e._id) }
        });

        // Borrar las referencias de las expensas en los departamentos
        await Departamento.updateMany(
            { _id: { $in: departamentosIds } },
            { $pull: { expensas: { $in: expensasOriginales.map(e => e._id) } } }
        );

        // Crear nuevas expensas
        const numeroDepartamentos = departamentosIds.length;
        const montoPorDepartamento = (monto / numeroDepartamentos).toFixed(2);

        const nuevasExpensas = await Promise.all(departamentosIds.map(async (depId) => {
            const nuevaExpensa = new Expensas({
                departamento: depId,
                monto: montoPorDepartamento,
                fechavencimiento: fechaVencimiento
            });
            await nuevaExpensa.save();
            return nuevaExpensa;
        }));

        // Actualizar los departamentos con las nuevas expensas
        await Promise.all(departamentosIds.map((depId, index) => 
            Departamento.findByIdAndUpdate(depId, { $push: { expensas: nuevasExpensas[index]._id } })
        ));

        return NextResponse.json({ message: 'Expenses updated successfully', nuevasExpensas }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update expenses', details: error.message }, { status: 500 });
    }
}