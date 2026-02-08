const Inventario = require("../models/Inventario");
const Movimiento = require("../models/Movimiento");
const Sucursal = require("../models/Sucursal");

// ==============================
// Obtener sucursal mantenimiento
// ==============================
const obtenerSucursalMantenimiento = async () => {
  const sucursal = await Sucursal.findOne({
    tipo: "mantenimiento",
  });

  if (!sucursal) {
    throw new Error("No existe sucursal mantenimiento");
  }

  return sucursal;
};

// ==============================
// Inventario mantenimiento
// ==============================
exports.obtenerInventarioMantenimiento = async (req, res) => {
  try {
    const sucursal = await obtenerSucursalMantenimiento();

    const inventario = await Inventario.find({
      sucursal: sucursal._id,
    })
      .populate("producto")
      .populate("sucursal");

    res.json(inventario.filter((i) => i.producto));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==============================
// Enviar a mantenimiento
// ==============================
exports.transferirAMantenimiento = async (req, res) => {
  try {
    const { producto, sucursalOrigen, cantidad } = req.body;

    const sucursalMantenimiento =
      await obtenerSucursalMantenimiento();

    const origen = await Inventario.findOne({
      producto,
      sucursal: sucursalOrigen,
    });

    if (!origen || origen.cantidad < cantidad) {
      return res
        .status(400)
        .json({ error: "Stock insuficiente" });
    }

    origen.cantidad -= cantidad;
    await origen.save();

    let destino = await Inventario.findOne({
      producto,
      sucursal: sucursalMantenimiento._id,
    });

    if (destino) {
      destino.cantidad += cantidad;
      await destino.save();
    } else {
      destino = await Inventario.create({
        producto,
        sucursal: sucursalMantenimiento._id,
        cantidad,
      });
    }

    await Movimiento.create({
      tipo: "transferencia",
      producto,
      cantidad,
      sucursalOrigen,
      sucursalDestino: sucursalMantenimiento._id,
      usuario: req.usuario._id,
    });

    res.json({ mensaje: "Enviado a mantenimiento" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==============================
// Regresar de mantenimiento
// ==============================
exports.transferirDesdeMantenimiento = async (req, res) => {
  try {
    const { producto, sucursalDestino, cantidad } = req.body;

    const sucursalMantenimiento =
      await obtenerSucursalMantenimiento();

    const origen = await Inventario.findOne({
      producto,
      sucursal: sucursalMantenimiento._id,
    });

    if (!origen || origen.cantidad < cantidad) {
      return res
        .status(400)
        .json({ error: "Stock insuficiente" });
    }

    origen.cantidad -= cantidad;
    await origen.save();

    let destino = await Inventario.findOne({
      producto,
      sucursal: sucursalDestino,
    });

    if (destino) {
      destino.cantidad += cantidad;
      await destino.save();
    } else {
      destino = await Inventario.create({
        producto,
        sucursal: sucursalDestino,
        cantidad,
      });
    }

    await Movimiento.create({
      tipo: "transferencia",
      producto,
      cantidad,
      sucursalOrigen: sucursalMantenimiento._id,
      sucursalDestino,
      usuario: req.usuario._id,
    });

    res.json({ mensaje: "Devuelto de mantenimiento" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
