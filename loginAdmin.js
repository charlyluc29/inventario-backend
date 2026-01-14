require("dotenv").config();

const mongoose = require("mongoose");
const Usuario = require("./models/Usuario");
const jwt = require("jsonwebtoken");

mongoose.connect(
  'mongodb+srv://admin:root@cluster0.erza3jx.mongodb.net/inventario?retryWrites=true&w=majority'
)
.then(async () => {
  console.log("MongoDB conectado ✅");

  // Buscar el admin
  const admin = await Usuario.findOne({ role: "admin" });
  if (!admin) {
    console.log("No se encontró ningún admin. Primero crea uno con crearAdmin.js");
    process.exit(0);
  }

  // Crear token
  const token = jwt.sign(
    { id: admin._id, role: admin.role, sucursal: admin.sucursal },
    process.env.JWT_SECRET || "clave_secreta",
    { expiresIn: "8h" }
  );

  console.log("Token JWT del admin:\n");
  console.log(token);
  process.exit(0);
})
.catch(err => {
  console.log("Error al conectar a MongoDB:", err);
});
