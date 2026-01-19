const mongoose = require("mongoose");
const Usuario = require("./models/Usuario");

mongoose.connect(
  'mongodb+srv://mandalagroup9493_db_user:TbPXT75t2pmrQB6A@cluster0.vxf0ax2.mongodb.net/inventario?retryWrites=true&w=majority&appName=Cluster0'
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
    password: "Mand23#4",  // Cambia a la contraseña que quieras
    role: "admin"
  });

  await admin.save();
  console.log("Admin creado exitosamente ✅");
  process.exit(0);
})
.catch(err => {
  console.log("Error al conectar a MongoDB:", err);
});
const bcrypt = require("bcrypt");

(async () => {
  const hash = await bcrypt.hash("Mand23#4", 10);
  console.log(hash);
})();
