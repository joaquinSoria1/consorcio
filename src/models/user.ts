import { Schema, model, models } from "mongoose";

const userSchema = new Schema({
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
    departamento: {
        type: Schema.Types.ObjectId,
        ref: 'Departamento'
    },
    imagenPerfil:{
        type: Buffer,
    }
}, {
    timestamps: true,
    strictPopulate: false
})


const User = models.User || model('User', userSchema)
export default User
