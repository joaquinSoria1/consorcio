import { Schema, model, models } from "mongoose";

function getLastDayOfMonth(): number {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1; 
    return new Date(year, month, 0).getTime();
}


const expensasSchema = new Schema({
    departamento: {
        type: Schema.Types.ObjectId,
        ref: 'Departamento'
    },
    monto: {
        type: Number,
        required: [true, "El monto es requerido"],
    },
    estado: {
        type: String,
        enum: ['pagado', 'pendiente'],
        default: 'pendiente'
    },
    fechavencimiento: {
        type: Date,
        required: [true, "La fecha de vencimiento es requerida"],
        default: getLastDayOfMonth()
    },
}, {
    timestamps: true,
    strictPopulate: false
})


const Expensas = models.Expensas || model('Expensas', expensasSchema)
export default Expensas
