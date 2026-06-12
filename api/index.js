// Vercel Serverless Entry: exportiert die Express-App (src/server.js) als Function.
// Dank des `require.main === module`-Guards in server.js wird hier KEIN app.listen
// aufgerufen – die App wird nur exportiert und von @vercel/node als Handler genutzt.
//
// DIAGNOSE: Init-Fehler (z. B. Bundling-Probleme beim Laden von db-vendo-client) passieren
// beim Modul-Laden und erscheinen in den Vercel-Logs nur abgeschnitten. Daher fangen wir sie
// hier ab und geben sie als JSON zurück, damit sie per curl sichtbar werden.
let app, initError = null;
try {
  app = require('../src/server.js');
} catch (e) {
  initError = e;
}

module.exports = (req, res) => {
  if (initError) {
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({
      diagnose: 'init-error',
      message: initError.message,
      code: initError.code,
      stack: String(initError.stack || '').split('\n').slice(0, 8),
    }));
    return;
  }
  return app(req, res);
};
