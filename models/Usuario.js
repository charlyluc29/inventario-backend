const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const usuarioSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user"
    },

    codigoEmpleado: {
      type: String,
      unique: true
    },

    sucursal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sucursal",
      required: function () {
        return this.role === "user";
      }
    },

    activo: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// 🔒 Middleware para hashear password antes de guardar
usuarioSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

// 🔑 Método para verificar contraseña
usuarioSchema.methods.verificarPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("Usuario", usuarioSchema);
