const mongoose = require("mongoose");

const sucursalSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    direccion: String
  },
  {
    collection: "sucursales" // 👈 NOMBRE REAL EN ATLAS
  }
);

module.exports = mongoose.model("Sucursal", sucursalSchema);
