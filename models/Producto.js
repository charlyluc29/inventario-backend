const mongoose = require("mongoose");

const productoSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  caracteristicas: { type: String, required: true },
  modelo: { type: String, required: true },
  estado: { type: String, enum: ["funciona", "no funciona"], required: true },
  numeroSerie: { type: String, default: "" },
  precio: { type: Number, required: true }
}, {
  versionKey: false
});

module.exports = mongoose.model("Producto", productoSchema);
