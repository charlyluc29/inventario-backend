const mongoose = require("mongoose");

const inventarioSchema = new mongoose.Schema(
  {
    producto: { 
      type: mongoose.Schema.Types.ObjectId, // <-- ObjectId
      ref: "Producto", 
      required: true 
    },
    sucursal: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Sucursal", 
      required: true 
    },
    cantidad: { 
      type: Number, 
      required: true, 
      min: [0, "La cantidad no puede ser negativa"] 
    }
  },
  { timestamps: true }
);

inventarioSchema.index({ producto: 1, sucursal: 1 }, { unique: true });

module.exports = mongoose.model("Inventario", inventarioSchema);
