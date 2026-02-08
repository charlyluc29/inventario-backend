const mongoose = require("mongoose")

const Inventario = require("../models/Inventario")
const Producto = require("../models/Producto")
const Movimiento = require("../models/Movimiento")
const Sucursal = require("../models/Sucursal")

// ==============================
// Inventario por sucursal
// ==============================
exports.obtenerInventarioPorSucursal = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "ID de sucursal inválido"
      })
    }

    let inventario = await Inventario.find({ sucursal: id })
      .populate("producto")
      .populate("sucursal")
      .lean()

    inventario = inventario.filter(i => i.producto && i.sucursal)

    res.json(inventario)

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}

// ==============================
// Inventario general
// ==============================
exports.obtenerInventarioGeneral = async (req, res) => {
  try {
    let inventario = await Inventario.find()
      .populate("producto")
      .populate("sucursal")
      .lean()

    inventario = inventario.filter(i => i.producto && i.sucursal)

    res.json(inventario)

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}

// ==============================
// Eliminar inventario (SIN HISTORIAL)
// ==============================
exports.eliminarInventario = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "ID de inventario inválido"
      })
    }

    const inventario = await Inventario.findById(id)

    if (!inventario) {
      return res.status(404).json({
        error: "Registro no encontrado"
      })
    }

    // 🔥 BORRAR MOVIMIENTOS RELACIONADOS
    await Movimiento.deleteMany({
      producto: inventario.producto,
      $or: [
        { sucursalOrigen: inventario.sucursal },
        { sucursalDestino: inventario.sucursal }
      ]
    })

    // 🔥 BORRAR INVENTARIO
    await Inventario.findByIdAndDelete(id)

    res.json({
      mensaje: "Producto eliminado sin generar historial"
    })

  } catch (err) {
    console.error("Error eliminar inventario:", err)
    res.status(500).json({ error: err.message })
  }
}

// ==============================
// Entrada (ADMIN)
// ==============================
exports.agregarInventario = async (req, res) => {
  try {
    const { sucursal, producto, cantidad } = req.body

    if (!mongoose.Types.ObjectId.isValid(sucursal))
      return res.status(400).json({ error: "Sucursal inválida" })

    if (!mongoose.Types.ObjectId.isValid(producto))
      return res.status(400).json({ error: "Producto inválido" })

    if (!cantidad || cantidad <= 0)
      return res.status(400).json({ error: "Cantidad inválida" })

    const sucursalDB = await Sucursal.findById(sucursal)

    if (!sucursalDB)
      return res.status(404).json({ error: "Sucursal no encontrada" })

    if (sucursalDB.tipo === "mantenimiento") {
      return res.status(403).json({
        error: "No se permiten entradas en mantenimiento"
      })
    }

    let registro = await Inventario.findOne({ sucursal, producto })

    if (registro) {
      registro.cantidad += cantidad
      await registro.save()
    } else {
      registro = await Inventario.create({
        sucursal,
        producto,
        cantidad
      })
    }

    await Movimiento.create({
      tipo: "entrada",
      producto,
      cantidad,
      sucursalDestino: sucursal,
      usuario: req.usuario?.id || null
    })

    res.json({
      mensaje: "Entrada registrada",
      registro
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}

// ==============================
// Salida (ADMIN)
// ==============================
exports.salidaInventario = async (req, res) => {
  try {
    const { sucursal, producto, cantidad } = req.body

    const registro = await Inventario.findOne({
      sucursal,
      producto
    })

    if (!registro || registro.cantidad < cantidad) {
      return res.status(400).json({
        error: "Inventario insuficiente"
      })
    }

    registro.cantidad -= cantidad
    await registro.save()

    await Movimiento.create({
      tipo: "salida",
      producto,
      cantidad,
      sucursalOrigen: sucursal,
      usuario: req.usuario?.id || null
    })

    res.json({
      mensaje: "Salida registrada",
      registro
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}

// ==============================
// Transferencia individual
// ==============================
exports.transferirProducto = async (req, res) => {
  try {
    const {
      producto,
      sucursalOrigen,
      sucursalDestino,
      cantidad
    } = req.body

    if (
      req.usuario.role === "user" &&
      req.usuario.sucursal.toString() !== sucursalOrigen.toString()
    ) {
      return res.status(403).json({
        error: "No autorizado"
      })
    }

    const origen = await Inventario.findOne({
      producto,
      sucursal: sucursalOrigen
    })

    if (!origen || origen.cantidad < cantidad) {
      return res.status(400).json({
        error: "Inventario insuficiente"
      })
    }

    origen.cantidad -= cantidad
    await origen.save()

    let destino = await Inventario.findOne({
      producto,
      sucursal: sucursalDestino
    })

    if (destino) {
      destino.cantidad += cantidad
      await destino.save()
    } else {
      destino = await Inventario.create({
        producto,
        sucursal: sucursalDestino,
        cantidad
      })
    }

    await Movimiento.create({
      tipo: "transferencia",
      producto,
      cantidad,
      sucursalOrigen,
      sucursalDestino,
      usuario: req.usuario.id
    })

    res.json({
      mensaje: "Transferencia realizada",
      origen,
      destino
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}

// ==============================
// Transferencia lote
// ==============================
exports.transferirProductosLote = async (req, res) => {
  try {
    const { items, sucursalOrigen, sucursalDestino } = req.body

    for (const item of items) {
      const { producto, cantidad } = item

      const origen = await Inventario.findOne({
        producto,
        sucursal: sucursalOrigen
      })

      if (!origen || origen.cantidad < cantidad) {
        return res.status(400).json({
          error: "Inventario insuficiente"
        })
      }

      origen.cantidad -= cantidad
      await origen.save()

      let destino = await Inventario.findOne({
        producto,
        sucursal: sucursalDestino
      })

      if (destino) {
        destino.cantidad += cantidad
        await destino.save()
      } else {
        await Inventario.create({
          producto,
          sucursal: sucursalDestino,
          cantidad
        })
      }

      await Movimiento.create({
        tipo: "transferencia",
        producto,
        cantidad,
        sucursalOrigen,
        sucursalDestino,
        usuario: req.usuario.id
      })
    }

    res.json({
      mensaje: "Transferencia por lote completada"
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}

// ==============================
// Crear producto + inventario
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
    } = req.body

    if (
      !codigo ||
      !nombre ||
      !caracteristicas ||
      !modelo ||
      !estado ||
      precio == null ||
      !sucursal ||
      !cantidad
    ) {
      return res.status(400).json({
        error: "Faltan campos"
      })
    }

    const sucursalDB = await Sucursal.findById(sucursal)

    if (!sucursalDB)
      return res.status(404).json({
        error: "Sucursal no encontrada"
      })

    if (sucursalDB.tipo === "mantenimiento") {
      return res.status(403).json({
        error: "Sucursal en mantenimiento"
      })
    }

    const producto = await Producto.create({
      codigo,
      nombre,
      caracteristicas,
      modelo,
      estado,
      precio
    })

    const inventario = await Inventario.create({
      producto: producto._id,
      sucursal,
      cantidad
    })

    await Movimiento.create({
      tipo: "entrada",
      producto: producto._id,
      cantidad,
      sucursalDestino: sucursal,
      usuario: req.usuario.id
    })

    res.status(201).json({
      mensaje: "Producto creado",
      producto,
      inventario
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}

// ==============================
// Movimientos
// ==============================
exports.obtenerMovimientos = async (req, res) => {
  try {
    let movimientos = await Movimiento.find()
      .populate("producto")
      .populate("sucursalOrigen")
      .populate("sucursalDestino")
      .populate("usuario", "username")
      .populate("usuarioAcepta", "username")
      .lean()

    movimientos = movimientos.filter(m => m.producto)

    res.json(movimientos)

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
