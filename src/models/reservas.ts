import { Schema, model, models } from "mongoose";

const reservasSchema = new Schema({
    departamento: {
        type: Schema.Types.ObjectId,
        ref: 'Departamento',
        strictPopulate: false,
    },
    fecha: {
        type: Date,
        required: [true, "La fecha es requerida"],
    },
    hora: {
        type: Date,
        required: [true, "La hora es requerida"],
    }
}, {
    timestamps: true,
    strictPopulate: false
})


const Reservas = models.Reservas || model('Reservas', reservasSchema)
export default Reservas
