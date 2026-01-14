const express = require("express");
const router = express.Router();
const { verificarToken, soloAdmin } = require("../middlewares/authMiddleware");
const inventarioController = require("../controllers/inventarioController");

// ==============================
// Registrar ENTRADA de producto (SOLO ADMIN)
// ==============================
router.post("/entrada", verificarToken, soloAdmin, inventarioController.agregarInventario);

// ==============================
// Registrar SALIDA de producto (SOLO ADMIN)
// ==============================
router.post("/salida", verificarToken, soloAdmin, inventarioController.salidaInventario);

// ==============================
// Registrar TRANSFERENCIA entre sucursales (SOLO ADMIN)
// ==============================
router.post("/transferencia", verificarToken, soloAdmin, inventarioController.transferirProducto);

// ==============================
// Obtener todos los movimientos (SOLO ADMIN)
// ==============================
router.get("/", verificarToken, soloAdmin, inventarioController.obtenerMovimientos);

// ==============================
// Borrar TODOS los movimientos (SOLO ADMIN)
// ==============================
router.delete("/borrar-todo", verificarToken, soloAdmin, async (req, res) => {
  try {
    const { confirmar } = req.body;

    if (confirmar !== "SI_QUIERO_BORRAR_TODO") {
      return res.status(400).json({
        error: "Debes enviar { confirmar: 'SI_QUIERO_BORRAR_TODO' }"
      });
    }

    const resultado = await Movimiento.deleteMany({});

    res.json({
      mensaje: "Todos los movimientos han sido eliminados",
      eliminados: resultado.deletedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==============================
// Eliminar un movimiento por ID (SOLO ADMIN)
// ==============================
router.delete("/:id", verificarToken, soloAdmin, async (req, res) => {
  try {
    const deleted = await Movimiento.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        error: "Movimiento no encontrado"
      });
    }

    res.json({
      mensaje: "Movimiento eliminado correctamente",
      deleted
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
