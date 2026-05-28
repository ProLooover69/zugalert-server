const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email und Passwort sind erforderlich.' });
    }

    // Prüfen, ob der User bereits existiert
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Diese E-Mail-Adresse wird bereits verwendet.' });
    }

    // Passwort hashen
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // User erstellen
    const user = new User({
      email,
      passwordHash
    });

    await user.save();

    // JWT erstellen
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email und Passwort sind erforderlich.' });
    }

    // User suchen
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Ungültige E-Mail-Adresse oder Passwort.' });
    }

    // Passwort prüfen
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Ungültige E-Mail-Adresse oder Passwort.' });
    }

    // JWT erstellen
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
});

const authMiddleware = require('../middleware/auth');

// GET /api/auth/me (Geschützter Endpoint zum Testen der Middleware)
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden.' });
    }
    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
