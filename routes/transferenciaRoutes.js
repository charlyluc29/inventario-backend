const express = require("express");
const router = express.Router();
const transferenciaController = require("../controllers/transferenciaController");
const { verificarToken } = require("../middlewares/authMiddleware");

// ==============================
// Crear transferencia (USER)
// ==============================
router.post(
  "/",
  verificarToken,
  transferenciaController.crearTransferencia
);

// ==============================
// Transferencias ENTRANTES
// ==============================
router.get(
  "/entrantes",
  verificarToken,
  transferenciaController.transferenciasEntrantes
);

// ==============================
// Transferencias ENVIADAS
// ==============================
router.get(
  "/enviadas",
  verificarToken,
  transferenciaController.transferenciasEnviadas
);

// ==============================
// Aceptar / Rechazar
// ==============================
router.put(
  "/:id/aceptar",
  verificarToken,
  transferenciaController.aceptarTransferencia
);

router.put(
  "/:id/rechazar",
  verificarToken,
  transferenciaController.rechazarTransferencia
);

module.exports = router;
