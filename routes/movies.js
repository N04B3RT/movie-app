const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');

// Middleware to check if user is logged in
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

// Show form to add movie
router.get('/add', requireLogin, (req, res) => {
  res.render('add_movie');
});

// Handle adding movie
router.post('/add', requireLogin, async (req, res) => {
  try {
    const movie = new Movie({ ...req.body, postedBy: req.session.userId });
    await movie.save();
    res.redirect('/');
  } catch (err) {
    res.render('add_movie', { error: 'Please fill out all fields' });
  }
});

// View single movie
router.get('/:id', async (req, res) => {
  const movie = await Movie.findById(req.params.id).populate('postedBy');
  if (!movie) return res.status(404).send('Movie not found');
  res.render('movie_details', { movie });
});

// Show edit form
router.get('/:id/edit', requireLogin, async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie || movie.postedBy.toString() !== req.session.userId) {
    return res.redirect('/');
  }
  res.render('edit_movie', { movie });
});

// Handle edit movie
router.post('/:id/edit', requireLogin, async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (movie.postedBy.toString() !== req.session.userId) {
    return res.redirect('/');
  }
  await Movie.findByIdAndUpdate(req.params.id, req.body);
  res.redirect(`/movies/${req.params.id}`);
});

// Delete movie
router.post('/:id/delete', requireLogin, async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (movie.postedBy.toString() === req.session.userId) {
    await Movie.findByIdAndDelete(req.params.id);
  }
  res.redirect('/');
});

module.exports = router;
