const mongoose = require("mongoose");
const Transferencia = require("../models/Transferencia");
const Inventario = require("../models/Inventario");
const Movimiento = require("../models/Movimiento");

// ==============================
// Crear transferencia (USER / ADMIN)
// ==============================
exports.crearTransferencia = async (req, res) => {
  try {
    const esAdmin = req.usuario.role === "admin";

    // Solo usuarios normales necesitan sucursal
    if (!esAdmin && !req.usuario?.sucursal) {
      return res.status(400).json({
        error: "Usuario sin sucursal asignada"
      });
    }

    const { sucursalDestino, items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "La transferencia debe contener al menos un producto"
      });
    }

    // Determinar sucursal origen
    const sucursalOrigen = esAdmin
      ? null // Admin puede enviar desde cualquier sucursal si lo decides
      : req.usuario.sucursal._id || req.usuario.sucursal;

    // Validar stock (solo si no es admin o si eliges bloquear)
    for (const item of items) {
      if (!esAdmin) {
        const inv = await Inventario.findOne({
          producto: item.producto,
          sucursal: sucursalOrigen
        });

        if (!inv || inv.cantidad < item.cantidad) {
          return res.status(400).json({
            error: "Inventario insuficiente",
            producto: item.producto
          });
        }
      }
    }

    const transferencia = await Transferencia.create({
      sucursalOrigen,
      sucursalDestino,
      items,
      usuarioOrigen: req.usuario._id,
      estado: "pendiente"
    });

    res.status(201).json(transferencia);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==============================
// Transferencias ENTRANTES
// ==============================
exports.transferenciasEntrantes = async (req, res) => {
  try {
    const filtro = {};

    // Solo filtrar por sucursal si NO es admin
    if (req.usuario.role !== "admin") {
      const sucursalId = req.usuario.sucursal?._id || req.usuario.sucursal;
      if (!sucursalId) {
        return res.status(400).json({ error: "Usuario sin sucursal asignada" });
      }
      filtro.sucursalDestino = sucursalId;
    }

    // Filtrar por estado si viene en query
    if (req.query.estado) {
      filtro.estado = req.query.estado;
    }

    const data = await Transferencia.find(filtro)
      .populate("sucursalOrigen")
      .populate("usuarioOrigen", "username")
      .populate("items.producto")
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ==============================
// Transferencias ENVIADAS
// ==============================
exports.transferenciasEnviadas = async (req, res) => {
  try {
    const esAdmin = req.usuario.role === "admin";

    // Filtro: admin ve todo, usuario normal solo su sucursal origen
    const filtro = esAdmin
      ? {}
      : { sucursalOrigen: req.usuario.sucursal._id || req.usuario.sucursal };

    const data = await Transferencia.find(filtro)
      .populate("sucursalDestino")
      .populate("usuarioOrigen", "username")
      .populate("items.producto")
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==============================
// Aceptar transferencia
// ==============================
exports.aceptarTransferencia = async (req, res) => {
  try {
    const transferencia = await Transferencia.findById(req.params.id);

    if (!transferencia || transferencia.estado !== "pendiente") {
      return res.status(404).json({ error: "Transferencia no válida" });
    }

    const esAdmin = req.usuario.role === "admin";
    const sucursalUsuario = esAdmin
      ? null
      : req.usuario.sucursal._id || req.usuario.sucursal;

    if (!esAdmin && String(transferencia.sucursalDestino) !== String(sucursalUsuario)) {
      return res.status(403).json({ error: "No autorizado" });
    }

    for (const item of transferencia.items) {
      const origen = await Inventario.findOne({
        producto: item.producto,
        sucursal: transferencia.sucursalOrigen
      });

      if (!origen || origen.cantidad < item.cantidad) {
        return res.status(400).json({ error: "Inventario insuficiente en origen" });
      }

      origen.cantidad -= item.cantidad;
      await origen.save();

      let destino = await Inventario.findOne({
        producto: item.producto,
        sucursal: transferencia.sucursalDestino
      });

      if (destino) {
        destino.cantidad += item.cantidad;
        await destino.save();
      } else {
        await Inventario.create({
          producto: item.producto,
          sucursal: transferencia.sucursalDestino,
          cantidad: item.cantidad
        });
      }

      // MOVIMIENTO
      await Movimiento.create({
        tipo: "transferencia",
        producto: item.producto,
        cantidad: item.cantidad,
        sucursalOrigen: transferencia.sucursalOrigen,
        sucursalDestino: transferencia.sucursalDestino,
        usuario: transferencia.usuarioOrigen,
        usuarioAcepta: req.usuario._id
      });
    }

    transferencia.estado = "aceptada";
    transferencia.usuarioDestino = req.usuario._id;
    transferencia.fechaRespuesta = new Date();
    await transferencia.save();

    res.json({ mensaje: "Transferencia aceptada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==============================
// Rechazar transferencia
// ==============================
exports.rechazarTransferencia = async (req, res) => {
  try {
    const transferencia = await Transferencia.findById(req.params.id);

    if (!transferencia || transferencia.estado !== "pendiente") {
      return res.status(404).json({ error: "Transferencia no válida" });
    }

    const esAdmin = req.usuario.role === "admin";
    const sucursalUsuario = esAdmin
      ? null
      : req.usuario.sucursal._id || req.usuario.sucursal;

    if (!esAdmin && String(transferencia.sucursalDestino) !== String(sucursalUsuario)) {
      return res.status(403).json({ error: "No autorizado" });
    }

    transferencia.estado = "rechazada";
    transferencia.usuarioDestino = req.usuario._id;
    transferencia.fechaRespuesta = new Date();
    await transferencia.save();

    res.json({ mensaje: "Transferencia rechazada" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
