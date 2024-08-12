import { Schema, model, models } from "mongoose";

const departamentoSchema = new Schema({
    numeroDepartamento: {
        type: String,
        required: [true, "El número de departamento es requerido"],
        unique: true,
    },
    username: {
        type: String,
        required: [true, "EL nombre de usuario es requerido"],
        unique: true,
        trim: true,
        minlength: [4, 'El nombre de usuario debe tener al menos 4 caracteres'],
        maxlength: [50, 'El nombre de usuario no puede tener más de 50 caracteres']
    },
    password: {
        type: String,
        required: [true, "La contraseña es requerida"],
        trim: true,
        select: false,
        minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
    },
    estado: {
        type: String,
        default: "Propietario"
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'admin'] 
    },
    inquilinos: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    expensas: [{
        type: Schema.Types.ObjectId,
        ref: 'Expensas'
    }],
    reservas: [{
        type: Schema.Types.ObjectId,
        ref: 'Reservas'
    }],
}, {
    timestamps: true,
    strictPopulate: false
})


const Departamento = models.Departamento || model('Departamento', departamentoSchema)
export default Departamento
