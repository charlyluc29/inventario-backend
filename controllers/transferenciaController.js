const Transferencia = require("../models/Transferencia");
const Inventario = require("../models/Inventario");
const Movimiento = require("../models/Movimiento");

// ==============================
// Crear transferencia
// ==============================
exports.crearTransferencia = async (req, res) => {
  try {
    const esAdmin = req.usuario.role === "admin";

    if (!esAdmin && !req.usuario?.sucursal) {
      return res.status(400).json({
        error: "Usuario sin sucursal asignada",
      });
    }

    const { sucursalDestino, items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "Debe contener al menos un producto",
      });
    }

    const sucursalOrigen = esAdmin
      ? null
      : req.usuario.sucursal._id || req.usuario.sucursal;

    // Validar stock
    if (!esAdmin) {
      for (const item of items) {
        const inv = await Inventario.findOne({
          producto: item.producto,
          sucursal: sucursalOrigen,
        });

        if (!inv || inv.cantidad < item.cantidad) {
          return res.status(400).json({
            error: "Inventario insuficiente",
          });
        }
      }
    }

    const transferencia = await Transferencia.create({
      sucursalOrigen,
      sucursalDestino,
      items,
      usuarioOrigen: req.usuario._id,
      estado: "pendiente",
    });

    res.status(201).json(transferencia);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==============================
// Transferencias entrantes
// ==============================
exports.transferenciasEntrantes = async (req, res) => {
  try {
    const filtro = {};

    if (req.usuario.role !== "admin") {
      const sucursalId =
        req.usuario.sucursal?._id || req.usuario.sucursal;

      if (!sucursalId) {
        return res
          .status(400)
          .json({ error: "Usuario sin sucursal" });
      }

      filtro.sucursalDestino = sucursalId;
    }

    if (req.query.estado) {
      filtro.estado = req.query.estado;
    }

    const data = await Transferencia.find(filtro)
      .populate("sucursalOrigen")
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
// Transferencias enviadas
// ==============================
exports.transferenciasEnviadas = async (req, res) => {
  try {
    const esAdmin = req.usuario.role === "admin";

    const filtro = esAdmin
      ? {}
      : {
          sucursalOrigen:
            req.usuario.sucursal._id || req.usuario.sucursal,
        };

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
    const transferencia = await Transferencia.findById(
      req.params.id
    );

    if (!transferencia || transferencia.estado !== "pendiente") {
      return res
        .status(404)
        .json({ error: "Transferencia inválida" });
    }

    const esAdmin = req.usuario.role === "admin";

    const sucursalUsuario = esAdmin
      ? null
      : req.usuario.sucursal._id || req.usuario.sucursal;

    if (
      !esAdmin &&
      String(transferencia.sucursalDestino) !==
        String(sucursalUsuario)
    ) {
      return res.status(403).json({ error: "No autorizado" });
    }

    for (const item of transferencia.items) {
      // ORIGEN
      const origen = await Inventario.findOne({
        producto: item.producto,
        sucursal: transferencia.sucursalOrigen,
      });

      if (!origen || origen.cantidad < item.cantidad) {
        return res
          .status(400)
          .json({ error: "Stock insuficiente" });
      }

      origen.cantidad -= item.cantidad;
      await origen.save();

      // DESTINO
      let destino = await Inventario.findOne({
        producto: item.producto,
        sucursal: transferencia.sucursalDestino,
      });

      if (destino) {
        destino.cantidad += item.cantidad;
        await destino.save();
      } else {
        await Inventario.create({
          producto: item.producto,
          sucursal: transferencia.sucursalDestino,
          cantidad: item.cantidad,
        });
      }

      // 👉 SOLO USUARIOS REGISTRAN MOVIMIENTO AQUÍ
      if (!esAdmin) {
        await Movimiento.create({
          tipo: "transferencia",
          producto: item.producto,
          cantidad: item.cantidad,
          sucursalOrigen: transferencia.sucursalOrigen,
          sucursalDestino: transferencia.sucursalDestino,
          usuario: transferencia.usuarioOrigen,
          usuarioAcepta: req.usuario._id,
        });
      }
    }

    transferencia.estado = "aceptada";
    transferencia.usuarioDestino = req.usuario._id;
    transferencia.fechaRespuesta = new Date();

    await transferencia.save();

    res.json({
      mensaje: "Transferencia aceptada",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==============================
// Rechazar transferencia
// ==============================
exports.rechazarTransferencia = async (req, res) => {
  try {
    const transferencia = await Transferencia.findById(
      req.params.id
    );

    if (!transferencia || transferencia.estado !== "pendiente") {
      return res
        .status(404)
        .json({ error: "Transferencia inválida" });
    }

    const esAdmin = req.usuario.role === "admin";

    const sucursalUsuario = esAdmin
      ? null
      : req.usuario.sucursal._id || req.usuario.sucursal;

    if (
      !esAdmin &&
      String(transferencia.sucursalDestino) !==
        String(sucursalUsuario)
    ) {
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
