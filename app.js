const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Error:', err));

// View engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session setup
app.use(session({
  secret: 'supersecret123', // Replace in production
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));

// Set current user in views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.userId || null;
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const Movie = require('./models/Movie');

app.use('/', authRoutes);
app.use('/movies', movieRoutes);

// Homepage — list all movies
app.get('/', async (req, res) => {
  const movies = await Movie.find().populate('postedBy');
  res.render('index', { movies });
});

// Server listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
