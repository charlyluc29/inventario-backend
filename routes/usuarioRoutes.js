const express = require("express");
const router = express.Router();

const usuarioController = require("../controllers/usuarioController");
const { verificarToken, soloAdmin } = require("../middlewares/authMiddleware");

// ==============================
// Crear usuario (SOLO ADMIN)
// ==============================
router.post(
  "/",
  verificarToken,
  soloAdmin,
  usuarioController.crearUsuario
);

// ==============================
// Listar usuarios (SOLO ADMIN)
// ==============================
router.get(
  "/",
  verificarToken,
  soloAdmin,
  usuarioController.listarUsuarios
);

// ==============================
// Editar usuario (SOLO ADMIN)
// ==============================
router.put(
  "/:id",
  verificarToken,
  soloAdmin,
  usuarioController.actualizarUsuario
);

// ==============================
// Desactivar usuario (SOLO ADMIN)
// ==============================
router.put(
  "/:id/desactivar",
  verificarToken,
  soloAdmin,
  usuarioController.desactivarUsuario
);
// ==============================
// Reactivar usuario (SOLO ADMIN)
// ==============================
router.put(
  "/:id/reactivar",
  verificarToken,
  soloAdmin,
  usuarioController.reactivarUsuario
);


module.exports = router;
