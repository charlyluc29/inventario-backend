const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const productoRoutes = require("./routes/productoRoutes");
const sucursalRoutes = require("./routes/sucursalRoutes");
const inventarioRoutes = require("./routes/inventarioRoutes");
const movimientoRoutes = require("./routes/movimientosRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const authRoutes = require("./routes/authRoutes");
const transferenciaRoutes = require("./routes/transferenciaRoutes");

const app = express();
app.use(express.json());
app.use(cors());

// Conexión DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.log("Error:", err));

// Rutas
app.use("/api/auth", authRoutes);          // LOGIN
app.use("/api/productos", productoRoutes);
app.use("/api/sucursales", sucursalRoutes);
app.use("/api/inventario", inventarioRoutes);
app.use("/api/movimientos", movimientoRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/transferencias", transferenciaRoutes);

app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

