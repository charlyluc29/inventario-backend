const mongoose = require("mongoose");

const transferenciaSchema = new mongoose.Schema(
  {
    sucursalOrigen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sucursal",
      required: true,
      index: true
    },

    sucursalDestino: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sucursal",
      required: true,
      index: true
    },

    // 👤 Usuario que ENVÍA
    usuarioOrigen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      index: true
    },

    // 👤 Usuario que ACEPTA / RECHAZA
    usuarioDestino: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      default: null
    },

    items: {
      type: [
        {
          producto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Producto",
            required: true
          },
          cantidad: {
            type: Number,
            required: true,
            min: 1
          }
        }
      ],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "La transferencia debe contener al menos un producto"
      }
    },

    estado: {
      type: String,
      enum: ["pendiente", "aceptada", "rechazada"],
      default: "pendiente",
      index: true
    },

    fechaRespuesta: {
      type: Date,
      default: null
    },

    // 📝 opcional (útil para rechazos)
    comentario: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Transferencia", transferenciaSchema);
