const mongoose = require("mongoose");

const sucursalSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  direccion: String
});

module.exports = mongoose.model("Sucursal", sucursalSchema);
