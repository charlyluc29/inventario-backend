const mongoose = require("mongoose");
const Inventario = require("../models/Inventario");
const Producto = require("../models/Producto");
const Movimiento = require("../models/Movimiento");
const Sucursal = require("../models/Sucursal");

// ==============================
// Inventario por sucursal
// ==============================
exports.obtenerInventarioPorSucursal = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID de sucursal inválido" });
    }

    let inventario = await Inventario.find({ sucursal: id })
      .populate("producto")
      .populate("sucursal")
      .lean();

    inventario = inventario.filter(i => i.producto && i.sucursal);

    res.json(inventario);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==============================
// Inventario general
// ==============================
exports.obtenerInventarioGeneral = async (req, res) => {
  try {
    let inventario = await Inventario.find()
      .populate("producto")
      .populate("sucursal")
      .lean();

    inventario = inventario.filter(i => i.producto && i.sucursal);

    res.json(inventario);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==============================
// Entrada de inventario (ADMIN)
// ==============================
exports.agregarInventario = async (req, res) => {
  try {
    const { sucursal, producto, cantidad } = req.body;

    if (!mongoose.Types.ObjectId.isValid(sucursal))
      return res.status(400).json({ error: "Sucursal inválida" });

    if (!mongoose.Types.ObjectId.isValid(producto))
      return res.status(400).json({ error: "Producto inválido" });

    if (!cantidad || cantidad <= 0)
      return res.status(400).json({ error: "Cantidad inválida" });

    let registro = await Inventario.findOne({ sucursal, producto });

    if (registro) {
      registro.cantidad += cantidad;
      await registro.save();
    } else {
      registro = await Inventario.create({ sucursal, producto, cantidad });
    }

    await Movimiento.create({
      tipo: "entrada",
      producto,
      cantidad,
      sucursalOrigen: null,
      sucursalDestino: sucursal,
      usuario: req.usuario?.id || null
    });

    res.json({ mensaje: "Entrada registrada", registro });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==============================
// Salida de inventario (ADMIN)
// ==============================
exports.salidaInventario = async (req, res) => {
  try {
    const { sucursal, producto, cantidad } = req.body;

    const registro = await Inventario.findOne({ sucursal, producto });

    if (!registro || registro.cantidad < cantidad) {
      return res.status(400).json({ error: "Inventario insuficiente" });
    }

    registro.cantidad -= cantidad;
    await registro.save();

    await Movimiento.create({
      tipo: "salida",
      producto,
      cantidad,
      sucursalOrigen: sucursal,
      sucursalDestino: null,
      usuario: req.usuario?.id || null
    });

    res.json({ mensaje: "Salida registrada", registro });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==============================
// Transferencia individual
// ==============================
exports.transferirProducto = async (req, res) => {
  try {
    const { producto, sucursalOrigen, sucursalDestino, cantidad } = req.body;

    if (
      req.usuario.role === "user" &&
      req.usuario.sucursal.toString() !== sucursalOrigen.toString()
    ) {
      return res.status(403).json({
        error: "No puedes transferir desde otra sucursal"
      });
    }

    const origen = await Inventario.findOne({
      producto,
      sucursal: sucursalOrigen
    });

    if (!origen || origen.cantidad < cantidad) {
      return res.status(400).json({ error: "Inventario insuficiente" });
    }

    origen.cantidad -= cantidad;
    await origen.save();

    let destino = await Inventario.findOne({
      producto,
      sucursal: sucursalDestino
    });

    if (destino) {
      destino.cantidad += cantidad;
      await destino.save();
    } else {
      destino = await Inventario.create({
        producto,
        sucursal: sucursalDestino,
        cantidad
      });
    }

    await Movimiento.create({
      tipo: "transferencia",
      producto,
      cantidad,
      sucursalOrigen,
      sucursalDestino,
      usuario: req.usuario.id
    });

    res.json({ mensaje: "Transferencia realizada", origen, destino });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==============================
// Movimientos (LECTURA)
// ==============================
exports.obtenerMovimientos = async (req, res) => {
  try {
    let movimientos = await Movimiento.find()
      .populate("producto")
      .populate("sucursalOrigen")
      .populate("sucursalDestino")
      .populate("usuario", "username")

      // 🔥 AGREGADO: quien aceptó la transferencia
      .populate("usuarioAcepta", "username")

      .lean();

    movimientos = movimientos.filter(m => m.producto);

    res.json(movimientos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==============================
// Crear producto + inventario (ADMIN)
// ==============================
exports.crearProductoConInventario = async (req, res) => {
  try {
    const {
      codigo,
      nombre,
      caracteristicas,
      modelo,
      estado,
      precio,
      sucursal,
      cantidad
    } = req.body;

    const producto = await Producto.create({
      codigo,
      nombre,
      caracteristicas,
      modelo,
      estado,
      precio
    });

    const inventario = await Inventario.create({
      producto: producto._id,
      sucursal,
      cantidad
    });

    await Movimiento.create({
      tipo: "entrada",
      producto: producto._id,
      cantidad,
      sucursalOrigen: null,
      sucursalDestino: sucursal,
      usuario: req.usuario?.id || null
    });

    res.json({ mensaje: "Producto creado", producto, inventario });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==============================
// Transferencia múltiple (LOTE)
// ==============================
exports.transferirProductosLote = async (req, res) => {
  try {
    const { sucursalOrigen, sucursalDestino, items } = req.body;

    if (
      req.usuario.role === "user" &&
      req.usuario.sucursal.toString() !== sucursalOrigen.toString()
    ) {
      return res.status(403).json({
        error: "No puedes transferir desde otra sucursal"
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(sucursalOrigen) ||
      !mongoose.Types.ObjectId.isValid(sucursalDestino) ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    const movimientos = [];

    for (const item of items) {
      const { producto, cantidad } = item;

      const origen = await Inventario.findOne({
        producto,
        sucursal: sucursalOrigen
      });

      if (!origen || origen.cantidad < cantidad) {
        return res.status(400).json({
          error: "Inventario insuficiente",
          producto
        });
      }

      origen.cantidad -= cantidad;
      await origen.save();

      let destino = await Inventario.findOne({
        producto,
        sucursal: sucursalDestino
      });

      if (destino) {
        destino.cantidad += cantidad;
        await destino.save();
      } else {
        destino = await Inventario.create({
          producto,
          sucursal: sucursalDestino,
          cantidad
        });
      }

      const movimiento = await Movimiento.create({
        tipo: "transferencia",
        producto,
        cantidad,
        sucursalOrigen,
        sucursalDestino,
        usuario: req.usuario.id
      });

      movimientos.push(movimiento);
    }

    res.json({
      mensaje: "Transferencia múltiple realizada correctamente",
      movimientos
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
