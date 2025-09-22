const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Wähle, ob Atlas oder lokal genutzt werden soll
    const dbEnv = process.env.DB_ENV || "local";

    let uri;
    if (dbEnv === "atlas") {
      uri = process.env.MONGODB_URI_ATLAS;
    } else {
      uri =
        process.env.MONGODB_URI_LOCAL || "mongodb://localhost:27017/forcham";
    }

    if (!uri) {
      throw new Error("Keine gültige MongoDB-URI gefunden! Bitte .env prüfen.");
    }

    const conn = await mongoose.connect(uri);

    // Debug-Output (URI ohne Passwort)
    const safeUri = uri.replace(/\/\/.*:.*@/, "//<user>:<password>@");
    console.log(`✅ MongoDB verbunden: ${conn.connection.host} [${dbEnv}]`);
    console.log(`🔗 Verwendete URI: ${safeUri}`);
  } catch (error) {
    console.error("❌ MongoDB Verbindungsfehler:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
