// Vercel Serverless Entry: exportiert die Express-App (src/server.js) als Function.
// Dank des `require.main === module`-Guards in server.js wird hier KEIN app.listen
// aufgerufen – die App wird nur exportiert und von @vercel/node als Handler genutzt.
module.exports = require('../src/server.js');
