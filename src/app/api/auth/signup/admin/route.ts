import { NextResponse, NextRequest } from "next/server";
import { ConnectMD } from "@/lib/conection";
import Admin from "@/models/admin";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export async function GET(): Promise<NextResponse> {
  try {
    ConnectMD();
    const admins = await Admin.find();
    return NextResponse.json(admins);
  } catch (error) {
    return NextResponse.json(error.message, {
      status: 400,
    });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  ConnectMD();
  try {
    const { nombres, apellidos, email, telefono } = await req.json();
    const username = `${nombres.toLowerCase().replace(/\s+/g, '')}${apellidos.toLowerCase().replace(/\s+/g, '')}${uuidv4().substring(0, 4)}`;
    const password = `${nombres.toLowerCase().replace(/\s+/g, '')}${apellidos.toLowerCase().replace(/\s+/g, '')}${uuidv4().substring(0, 4)}`;
    const hashedPassword = await bcrypt.hash(password, 12);

    const newAdmin = new Admin({
      nombres,
      apellidos,
      email,
      telefono,
      username,
      password: hashedPassword,
    });
    const savedAdmin = await newAdmin.save();

    return NextResponse.json({
      _id: savedAdmin._id,
      email: savedAdmin.email,
      username: savedAdmin.username,
      password: password,
    });
  } catch (error) {
    return NextResponse.json(error.message, {
      status: 400,
    });
  }
}


