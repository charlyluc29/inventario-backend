const express = require("express");
const router = express.Router();
const controller = require("../controllers/sucursalController");
const { verificarToken } = require("../middlewares/authMiddleware");

// 🔥 ESTA VA PRIMERO
router.get(
  "/mantenimiento",
  verificarToken,
  controller.obtenerSucursalMantenimiento
);

router.post("/", verificarToken, controller.crearSucursal);
router.get("/", verificarToken, controller.obtenerSucursales);
router.get("/:id", verificarToken, controller.obtenerSucursal);
router.put("/:id", verificarToken, controller.actualizarSucursal);
router.delete("/:id", verificarToken, controller.eliminarSucursal);

module.exports = router;
