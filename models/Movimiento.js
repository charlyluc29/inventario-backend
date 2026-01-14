const mongoose = require("mongoose");

const movimientoSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ["entrada", "salida", "transferencia"],
    required: true
  },

  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Producto"
  },

  cantidad: {
    type: Number,
    required: true
  },

  sucursalOrigen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sucursal"
  },

  sucursalDestino: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sucursal"
  },

  // 👤 QUIEN ENVÍA
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario"
  },

  // 👤 QUIEN ACEPTA (NUEVO)
  usuarioAcepta: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    default: null
  },

  fecha: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Movimiento", movimientoSchema);
