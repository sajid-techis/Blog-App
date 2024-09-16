const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const MONGO_URI = process.env.MONGO_URI;

const app = express();
app.use(cors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  }));
  
  app.options('*', cors());  // Handle preflight requests for all routes  

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Create Schema
const postSchema = new mongoose.Schema({
  name: String,
  content: String,
  imageUrl: String,
});

const Post = mongoose.model('Post', postSchema);

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });

// Create a post
app.post('/api/posts', upload.single('image'), async (req, res) => {
  const { name, content } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const newPost = new Post({ name, content, imageUrl });
  await newPost.save();
  res.json(newPost);
});

// Get all posts
app.get('/api/posts', async (req, res) => {
  const posts = await Post.find();
  res.json(posts);
});

// Edit a post
app.put('/api/posts/:id', upload.single('image'), async (req, res) => {
  const { name, content } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;

  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    { name, content, imageUrl },
    { new: true }
  );
  res.json(updatedPost);
});

// Delete a post
app.delete('/api/posts/:id', async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: 'Post deleted' });
});

// Serve static image uploads
app.use('/uploads', express.static('uploads'));

app.listen(5003, () => console.log('Server running on port 5000'));
