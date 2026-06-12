// Vercel Serverless Entry: exportiert die Express-App (src/server.js) als Function.
// Dank des `require.main === module`-Guards in server.js wird hier KEIN app.listen
// aufgerufen – die App wird nur exportiert und von @vercel/node als Handler genutzt.
// db-vendo-client (ESM) wird in hafas.js lazy per dynamic import() geladen, daher
// crasht das Modul-Laden hier nicht.
module.exports = require('../src/server.js');
