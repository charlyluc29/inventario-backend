const Movimiento = require("../models/Movimiento");

// ==============================
// Todos los movimientos
// ==============================
exports.obtenerMovimientos = async (req, res) => {
  try {
    const movimientos = await Movimiento.find()
      .populate("producto")
      .populate("sucursalOrigen")
      .populate("sucursalDestino")
      .populate("usuario", "username role")
      .populate("usuarioAcepta", "username role")
      .sort({ createdAt: -1 });

    res.json(movimientos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==============================
// Movimientos por sucursal
// ==============================
exports.obtenerMovimientosPorSucursal = async (req, res) => {
  try {
    const movimientos = await Movimiento.find({
      $or: [
        { sucursalOrigen: req.params.id },
        { sucursalDestino: req.params.id },
      ],
    })
      .populate("producto")
      .populate("sucursalOrigen")
      .populate("sucursalDestino")
      .populate("usuario", "username role")
      .populate("usuarioAcepta", "username role")
      .sort({ createdAt: -1 });

    res.json(movimientos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==============================
// Crear movimiento manual
// ==============================
exports.crearMovimiento = async (req, res) => {
  try {
    const {
      producto,
      sucursalOrigen,
      sucursalDestino,
      cantidad,
      tipo,
    } = req.body;

    const movimiento = await Movimiento.create({
      producto,
      sucursalOrigen: sucursalOrigen || null,
      sucursalDestino: sucursalDestino || null,
      cantidad,
      tipo,
      usuario: req.usuario._id,
    });

    res.json(movimiento);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==============================
// Eliminar movimiento
// ==============================
exports.eliminarMovimiento = async (req, res) => {
  try {
    await Movimiento.findByIdAndDelete(req.params.id);

    res.json({ mensaje: "Movimiento eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
