const express = require("express");
const router = express.Router();
const controller = require("../controllers/productoController.js");

router.get("/codigo/:codigo", controller.obtenerPorCodigo);
router.put("/codigo/:codigo", controller.actualizarPorCodigo);
router.delete("/codigo/:codigo", controller.eliminarPorCodigo);

router.post("/", controller.crearProducto);
router.get("/", controller.obtenerProductos);

module.exports = router;