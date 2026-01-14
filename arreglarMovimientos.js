const mongoose = require("mongoose");
const Movimiento = require("./models/Movimiento");

// Conecta a tu DB
mongoose.connect('mongodb+srv://admin:root@cluster0.erza3jx.mongodb.net/inventario?retryWrites=true&w=majority')
  .then(async () => {
    console.log("MongoDB conectado ✅");

    // ID del producto que quieres asignar
    const productoId = "6939b5ca8a45d7fe2d964e78";

    // Buscar movimientos sin producto
    const movimientos = await Movimiento.find({ producto: null });

    if (movimientos.length === 0) {
      console.log("No hay movimientos antiguos para corregir ✅");
      process.exit(0);
    }

    // Actualizar cada movimiento
    for (const mov of movimientos) {
      mov.producto = productoId;
      await mov.save();
      console.log(`Movimiento ${mov._id} actualizado con producto ${productoId}`);
    }

    console.log("Todos los movimientos antiguos corregidos ✅");
    process.exit(0);
  })
  .catch(err => console.log("Error al conectar a MongoDB:", err));
