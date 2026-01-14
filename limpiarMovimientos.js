const mongoose = require("mongoose");
const Movimiento = require("./models/Movimiento");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB conectado ✅");

    const resultado = await Movimiento.deleteMany({
      producto: { $type: "string" }
    });

    console.log("Movimientos corruptos eliminados:", resultado.deletedCount);
    process.exit(0);
  })
  .catch(err => {
    console.error("Error:", err);
    process.exit(1);
  });
