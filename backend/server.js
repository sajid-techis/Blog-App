const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.use(cors({
  origin: '*',
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
}));

app.options('*', cors()); // Handle preflight requests for all routes

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Create Schema
const postSchema = new mongoose.Schema({
  name: String,
  content: String,
  imageUrl: String,
});

const Post = mongoose.model('Post', postSchema);

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'blog_images', // Folder where images will be stored in Cloudinary
    allowedFormats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage });

// Create a post with image upload to Cloudinary
app.post('/api/posts', upload.single('image'), async (req, res) => {
  const { name, content } = req.body;
  const imageUrl = req.file ? req.file.path : null; // Cloudinary returns the full image URL in `path`

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
  const imageUrl = req.file ? req.file.path : req.body.imageUrl; // Use Cloudinary URL or keep the original

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

app.listen(5003, () => console.log('Server running on port 5000'));
