const express = require("express")
const router = express.Router()
const mantenimientoController = require("../controllers/mantenimientoController")
const { verificarToken } = require("../middlewares/authMiddleware")

// 🔒 Proteger TODAS las rutas de mantenimiento
router.use(verificarToken)

// ==============================
// Inventario de mantenimiento (solo lectura)
// ==============================
router.get(
  "/inventario",
  mantenimientoController.obtenerInventarioMantenimiento
)

// ==============================
// Enviar producto A mantenimiento
// ==============================
router.post(
  "/transferir/entrada",
  mantenimientoController.transferirAMantenimiento
)

// ==============================
// Sacar producto DE mantenimiento
// ==============================
router.post(
  "/transferir/salida",
  mantenimientoController.transferirDesdeMantenimiento
)

module.exports = router
