const mongoose = require("mongoose");
const Usuario = require("./models/Usuario");

mongoose.connect(
  'mongodb+srv://admin:root@cluster0.erza3jx.mongodb.net/inventario?retryWrites=true&w=majority'
)
.then(async () => {
  console.log("MongoDB conectado ✅");

  // Verificar si ya hay un admin
  const adminExistente = await Usuario.findOne({ role: "admin" });
  if (adminExistente) {
    console.log("Ya existe un usuario admin:", adminExistente.username);
    process.exit(0);
  }

  // Crear admin
  const admin = new Usuario({
    username: "admin",
    password: "admin123",  // Cambia a la contraseña que quieras
    role: "admin"
  });

  await admin.save();
  console.log("Admin creado exitosamente ✅");
  process.exit(0);
})
.catch(err => {
  console.log("Error al conectar a MongoDB:", err);
});
