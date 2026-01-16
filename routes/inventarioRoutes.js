const express = require("express");
const router = express.Router();

const inventarioController = require("../controllers/inventarioController");
const { verificarToken, soloAdmin } = require("../middlewares/authMiddleware");

// ==============================
// CONSULTAS (ORDEN CRÍTICO)
// ==============================

// Inventario general
router.get(
  "/",
  verificarToken,
  inventarioController.obtenerInventarioGeneral
);

// Movimientos (ANTES de /:id)
router.get(
  "/movimientos/all",
  verificarToken,
  inventarioController.obtenerMovimientos
);

// Eliminar producto SOLO de una sucursal (inventario)
router.delete(
  "/item/:id",
  verificarToken,
  soloAdmin,
  inventarioController.eliminarInventario
);


// Inventario por sucursal
router.get(
  "/:id",
  verificarToken,
  inventarioController.obtenerInventarioPorSucursal
);

// ==============================
// OPERACIONES
// ==============================

// Entrada (SOLO ADMIN)
router.post(
  "/entrada",
  verificarToken,
  soloAdmin,
  inventarioController.agregarInventario
);

// Salida (SOLO ADMIN)
router.post(
  "/salida",
  verificarToken,
  soloAdmin,
  inventarioController.salidaInventario
);

// Transferencia individual
// ✅ Admin: cualquier sucursal
// ✅ User: SOLO su sucursal (validado en controller)
router.post(
  "/transferir",
  verificarToken,
  inventarioController.transferirProducto
);

// Transferencia múltiple (LOTE)
// ✅ Admin: cualquier sucursal
// ✅ User: SOLO su sucursal (validado en controller)
router.post(
  "/transferir-lote",
  verificarToken,
  inventarioController.transferirProductosLote
);

// Crear producto + inventario (SOLO ADMIN)
router.post(
  "/nuevo",
  verificarToken,
  soloAdmin,
  inventarioController.crearProductoConInventario
);

module.exports = router;
