import { NextResponse, NextRequest } from "next/server";
import { ConnectMD } from "@/lib/conection";
import Admin from "@/models/admin";

interface Params {
  adminId: string;
}

export async function GET(req: NextRequest, { params }: { params: Params }): Promise<NextResponse> {
    try {
      ConnectMD();
      const adminFound = await Admin.findById(params.adminId);
  
      if (!adminFound)
        return NextResponse.json(
          {
            message: "Admin no encontrado",
          },
          {
            status: 404,
          }
        );
      return NextResponse.json(adminFound);
    } catch (error) {
      return NextResponse.json(error.message, {
        status: 400,
      });
    }
  }
  
  export async function DELETE(req: NextRequest, { params }: { params: Params }): Promise<NextResponse> {
    try {
      const adminDeleted = await Admin.findByIdAndDelete(params.adminId);
      if (!adminDeleted)
        return NextResponse.json(
          {
            message: "Admin no encontrado",
          },
          {
            status: 404,
          }
        );
      return NextResponse.json(adminDeleted);
    } catch (error) {
      return NextResponse.json(error.message, {
        status: 400,
      });
    }
  }
  
  export async function PUT(req: NextRequest, { params }: { params: Params }): Promise<NextResponse> {
    try {
      const data = await req.json();
      const adminUpdated = await Admin.findByIdAndUpdate(params.adminId, data, {
        new: true,
      });
      return NextResponse.json(adminUpdated);
    } catch (error){
      return NextResponse.json(error.message, {
          status: 400,
        });
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
  
    