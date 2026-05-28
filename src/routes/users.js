const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/users/routes - Gibt die gespeicherten Routen des eingeloggten Benutzers zurück
router.get('/routes', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden.' });
    }
    res.json({
      success: true,
      routes: user.savedRoutes
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/routes - Fügt eine Route zu den gespeicherten Routen hinzu
router.post('/routes', authMiddleware, async (req, res, next) => {
  try {
    const { from, to, label } = req.body;

    if (!from || !to) {
      return res.status(400).json({ error: 'from und to sind erforderlich.' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden.' });
    }

    user.savedRoutes.push({ from, to, label: label || '' });
    await user.save();

    res.json({
      success: true,
      routes: user.savedRoutes
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/routes/:index - Löscht eine Route anhand ihres Index
router.delete('/routes/:index', authMiddleware, async (req, res, next) => {
  try {
    const index = parseInt(req.params.index, 10);

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden.' });
    }

    if (isNaN(index) || index < 0 || index >= user.savedRoutes.length) {
      return res.status(400).json({ error: 'Ungültiger Index.' });
    }

    user.savedRoutes.splice(index, 1);
    await user.save();

    res.json({
      success: true,
      routes: user.savedRoutes
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
