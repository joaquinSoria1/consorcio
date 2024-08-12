import { NextResponse, NextRequest } from "next/server";
import { ConnectMD } from "@/lib/conection";
import User from "@/models/user";
import Departamento from "@/models/departamento";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export async function GET(): Promise<NextResponse> {
    await ConnectMD();
  
    try {
      const users = await User.find().populate('departamento');
      return NextResponse.json(users);
    } catch (error) {
      console.error("Error:", error);
      return NextResponse.json({ error: "Error al obtener los usuarios", details: error.message }, { status: 500 });
    }
  }

export async function POST(req: NextRequest): Promise<NextResponse> {
    ConnectMD()
    try {
        const { nombres, apellidos, email, piso, departamento, telefono } = await req.json()
        const numeroDepartamento = `${piso}${departamento}`


        const foundDepartamento = await Departamento.findOne({ numeroDepartamento })
        if (!foundDepartamento) {
            return NextResponse.json({ message: 'Department not found' }, { status: 404 })
        }


        const newUser = new User({ email, nombres, apellidos, telefono, departamento: foundDepartamento._id })
        const savedUser = await newUser.save()


        const username = `${nombres.toLowerCase().replace(/\s+/g, '')}${apellidos.toLowerCase().replace(/\s+/g, '')}${numeroDepartamento}`
        const password = `${nombres.toLowerCase().replace(/\s+/g, '')}${apellidos.toLowerCase().replace(/\s+/g, '')}${numeroDepartamento}`
        const hashedPassword = await bcrypt.hash(password, 12);
        foundDepartamento.password = hashedPassword
        foundDepartamento.username = username

        foundDepartamento.inquilinos.push(savedUser._id)

        await foundDepartamento.save()

        return NextResponse.json({
            _id: savedUser._id,
            email: savedUser.email,
            numeroDepartamento: foundDepartamento.numeroDepartamento,
            username: foundDepartamento.username,
            password: password
        })
    } catch (error) {
        return NextResponse.json(error.message, {
            status: 400
        })
    }
}





