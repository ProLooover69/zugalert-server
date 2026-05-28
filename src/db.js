const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI fehlt in .env – Datenbank wird nicht verbunden.');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log(`✅ MongoDB verbunden: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Verbindungsfehler:', error.message);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB Fehler:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB getrennt');
  });
}

module.exports = connectDB;
