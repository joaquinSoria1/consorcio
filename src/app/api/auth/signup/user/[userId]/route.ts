import { NextResponse, NextRequest } from "next/server";
import { ConnectMD } from "@/lib/conection";
import User from "@/models/user";
import Departamento from "@/models/departamento";

interface Params {
  userId: string;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function GET(req: NextRequest, { params }: { params: Params }): Promise<NextResponse> {
    try {
        ConnectMD()
        const userFound = await User.findById(params.userId).populate('departamento', 'numeroDepartamento');

        if (!userFound)
            return NextResponse.json({
                message: "Usuario no encontrado"
            }, {
                status: 404
            })
        return NextResponse.json(userFound)
    } catch (error) {
        return NextResponse.json(error.message, {
            status: 400
        })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Params }): Promise<NextResponse> {
    try {
        const userDeleted = await User.findByIdAndDelete(params.userId);
        if (!userDeleted)
            return NextResponse.json({
                message: "Usuario no encontrado"
            }, {
                status: 404
            })

        await Departamento.findByIdAndUpdate(userDeleted.departamento, {
            $pull: { inquilinos: userDeleted._id }
        });

        return NextResponse.json(userDeleted)
    } catch (error) {
        return NextResponse.json(error.message, {
            status: 400
        })
    }
}

export async function PUT(req: NextRequest, { params }: { params: Params }): Promise<NextResponse> {
  try {
      ConnectMD()
      const data = await req.json()

      let userUpdateData = { ...data };
      let departamentoUpdate = false;

      if (data.piso && data.departamento) {
          const numeroDepartamento = `${data.piso}${data.departamento}`
          const departamento = await Departamento.findOne({ numeroDepartamento });

          if (!departamento) {
              return NextResponse.json('Departamento no encontrado', {
                  status: 404
              });
          }

          userUpdateData.departamento = departamento._id;
          departamentoUpdate = true;
      }

      const userUpdated = await User.findByIdAndUpdate(params.userId, userUpdateData, {
          new: true
      });

      if (departamentoUpdate && data.departamento !== userUpdated.departamento.toString()) {
          await Departamento.findByIdAndUpdate(userUpdated.departamento, {
              $pull: { inquilinos: userUpdated._id }
          });
          await Departamento.findByIdAndUpdate(userUpdateData.departamento, {
              $addToSet: { inquilinos: userUpdated._id }
          });
      }

      return NextResponse.json(userUpdated)
  } catch (error) {
      return NextResponse.json(error.message, {
          status: 400
      })
  }
}

export async function POST(req: NextRequest, { params }: { params: Params }): Promise<NextResponse> {
    try {
      ConnectMD();
  
      const data = await req.formData();
      const file = data.get('imagenPerfil') as File;
  
      if (!file) {
        return NextResponse.json({
          message: "No se proporcionó ninguna imagen"
        }, {
          status: 400
        });
      }
  
      const buffer = Buffer.from(await file.arrayBuffer());
  
      const userUpdated = await User.findByIdAndUpdate(params.userId, {
        imagenPerfil: buffer,
      }, {
        new: true,
      });
  
      if (!userUpdated) {
        return NextResponse.json({
          message: "Usuario no encontrado"
        }, {
          status: 404
        });
      }
  
      return NextResponse.json(userUpdated);
    } catch (error) {
      return NextResponse.json(error.message, {
        status: 400
      });
    }
  }