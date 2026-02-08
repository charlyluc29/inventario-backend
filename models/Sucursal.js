const mongoose = require("mongoose")

const sucursalSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },

    direccion: {
      type: String,
      trim: true
    },

    tipo: {
      type: String,
      enum: ["normal", "mantenimiento"],
      default: "normal"
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model("Sucursal", sucursalSchema)
