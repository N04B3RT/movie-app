const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

// Register (GET)
router.get('/register', (req, res) => {
  res.render('register');
});

// Register (POST)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.render('register', { error: 'All fields are required.' });
    }

    // ensure unique username OR email
    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) {
      return res.render('register', { error: 'Username or email already exists.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hash });

    req.session.userId = user._id;
    res.redirect('/');
  } catch (err) {
    console.error('Register error:', err);
    res.render('register', { error: 'Registration failed. Try again.' });
  }
});

// Login (GET)
router.get('/login', (req, res) => {
  res.render('login');
});

// Login (POST)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.render('login', { error: 'All fields are required.' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.render('login', { error: 'Invalid username or password' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.render('login', { error: 'Invalid username or password' });
    }

    req.session.userId = user._id;
    res.redirect('/');
  } catch (err) {
    console.error('Login error:', err);
    res.render('login', { error: 'Login failed. Try again.' });
  }
});

// Logout (GET is fine; match your form/link)
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;
