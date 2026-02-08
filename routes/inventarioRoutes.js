const express = require("express")
const router = express.Router()

const inventarioController = require("../controllers/inventarioController")
const {
  verificarToken,
  soloAdmin
} = require("../middlewares/authMiddleware")

// ==============================
// CONSULTAS (ORDEN IMPORTANTE)
// ==============================

// Inventario general
router.get(
  "/",
  verificarToken,
  inventarioController.obtenerInventarioGeneral
)

// Movimientos (ANTES de rutas dinámicas)
router.get(
  "/movimientos/all",
  verificarToken,
  inventarioController.obtenerMovimientos
)

// ==============================
// ELIMINAR INVENTARIO (SIN HISTORIAL)
// ==============================
// ⚠️ Borra un producto de una sucursal SIN generar movimiento
// SOLO ADMIN
router.delete(
  "/item/:id",
  verificarToken,
  soloAdmin,
  inventarioController.eliminarInventario
)

// ==============================
// INVENTARIO POR SUCURSAL
// ==============================
router.get(
  "/:id",
  verificarToken,
  inventarioController.obtenerInventarioPorSucursal
)

// ==============================
// OPERACIONES
// ==============================

// Entrada (SOLO ADMIN)
router.post(
  "/entrada",
  verificarToken,
  soloAdmin,
  inventarioController.agregarInventario
)

// Salida (SOLO ADMIN)
router.post(
  "/salida",
  verificarToken,
  soloAdmin,
  inventarioController.salidaInventario
)

// ==============================
// TRANSFERENCIAS
// ==============================

// Transferencia individual
// ✅ Admin: cualquier sucursal
// ✅ User: SOLO su sucursal
router.post(
  "/transferir",
  verificarToken,
  inventarioController.transferirProducto
)

// Transferencia múltiple (LOTE)
router.post(
  "/transferir-lote",
  verificarToken,
  inventarioController.transferirProductosLote
)

// ==============================
// CREAR PRODUCTO
// ==============================

// Crear producto + inventario (SOLO ADMIN)
router.post(
  "/nuevo",
  verificarToken,
  soloAdmin,
  inventarioController.crearProductoConInventario
)

module.exports = router
