// controllers/movimientoController.js
const Movimiento = require("../models/Movimiento");
const Producto = require("../models/Producto");
const Sucursal = require("../models/Sucursal");

// Obtener todos los movimientos
exports.obtenerMovimientos = async (req, res) => {
  try {
    const movimientos = await Movimiento.find()
      .populate("sucursalOrigen")
      .populate("sucursalDestino");

    const movimientosConProductos = await Promise.all(
      movimientos.map(async (mov) => {
        const productoInfo = await Producto.findOne({ _id: mov.producto });
        return {
          ...mov.toObject(),
          producto: productoInfo || null
        };
      })
    );

    res.json(movimientosConProductos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener movimientos por sucursal
exports.obtenerMovimientosPorSucursal = async (req, res) => {
  try {
    const movimientos = await Movimiento.find({
      $or: [
        { sucursalOrigen: req.params.id },
        { sucursalDestino: req.params.id },
      ],
    })
      .populate("sucursalOrigen")
      .populate("sucursalDestino");

    const movimientosConProductos = await Promise.all(
      movimientos.map(async (mov) => {
        const productoInfo = await Producto.findOne({ _id: mov.producto });
        return {
          ...mov.toObject(),
          producto: productoInfo || null
        };
      })
    );

    res.json(movimientosConProductos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear un movimiento manualmente
exports.crearMovimiento = async (req, res) => {
  try {
    const { producto, sucursalOrigen, sucursalDestino, cantidad, tipo } = req.body;

    const movimiento = await Movimiento.create({
      producto,
      sucursalOrigen: sucursalOrigen || null,
      sucursalDestino: sucursalDestino || null,
      cantidad,
      tipo,
    });

    const productoInfo = await Producto.findOne({ _id: producto });

    res.json({
      ...movimiento.toObject(),
      producto: productoInfo || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Eliminar movimiento
exports.eliminarMovimiento = async (req, res) => {
  try {
    await Movimiento.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Movimiento eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

