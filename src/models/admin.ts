import { Schema, model, models } from "mongoose";

const adminSchema = new Schema({
    nombres: {
        type: String,
        required: [true, "Los nombres son requeridos"],
        trim: true,
    },
    apellidos: {
        type: String,
        required: [true, "Los apellidos son requeridos"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "El email es requerido"],
        unique: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Por favor, introduce una dirección de correo electrónico válida']
    },
    telefono: {
        type: Number,
        required: [true, "El telefono es requerido"],
        unique: true,
    },
    role: {
        type: String,
        default: 'admin'
    },
    username: {
        type: String,
        required: [true, "EL nombre de usuario es requerido"],
        unique: true,
        trim: true,
        minlength: [4, 'El nombre de usuario debe tener al menos 4 caracteres'],
    },
    password: {
        type: String,
        required: [true, "La contraseña es requerida"],
        trim: true,
        select: false,
        minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
    },
    imagenPerfil:{
        type: Buffer,
    }
}, {
    timestamps: true
})

const Admin = models.Admin || model('Admin', adminSchema)
export default Admin
