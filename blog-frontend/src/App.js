import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'

const App = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ name: '', content: '', image: null });
  const [editingPost, setEditingPost] = useState(null);
  const [submitting, setSubmitting] = useState(false); // Loading for submit
  const [deleting, setDeleting] = useState({}); // Loading for individual deletes
  const [fetchingPosts, setFetchingPosts] = useState(true); // Loading for fetching posts

  // Fetch posts when component mounts
  useEffect(() => {
    const fetchPosts = async () => {
      setFetchingPosts(true);
      try {
        const res = await axios.get(`${apiUrl}/api/posts`);
        // Sort posts to show the latest first
        setPosts(res.data.reverse());
      } catch (error) {
        console.error('Error fetching posts', error);
      } finally {
        setFetchingPosts(false);
      }
    };
    fetchPosts();
  }, [apiUrl]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('content', form.content);
    if (form.image) formData.append('image', form.image);

    try {
      if (editingPost) {
        await axios.put(`${apiUrl}/api/posts/${editingPost._id}`, formData);
        setEditingPost(null);
      } else {
        await axios.post(`${apiUrl}/api/posts`, formData);
      }
      // Refresh posts after submit and ensure latest posts are on top
      const res = await axios.get(`${apiUrl}/api/posts`);
      setPosts(res.data.reverse());
    } catch (error) {
      console.error('Error submitting form', error);
    } finally {
      setForm({ name: '', content: '', image: null });
      setSubmitting(false);
    }
  };

  // Handle delete post
  const handleDelete = async (id) => {
    setDeleting((prev) => ({ ...prev, [id]: true }));
    try {
      await axios.delete(`${apiUrl}/api/posts/${id}`);
      const res = await axios.get(`${apiUrl}/api/posts`);
      setPosts(res.data.reverse());
    } catch (error) {
      console.error('Error deleting post', error);
    } finally {
      setDeleting((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Handle edit post
  const handleEdit = (post) => {
    window.scroll(0, 0);
    setForm({ name: post.name, content: post.content, image: post.imageUrl });
    setEditingPost(post);
  };

  return (
    <div className="container">
      <h1>Blog Posting App</h1>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <textarea
          placeholder="Content"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          required
        ></textarea>
        <input type="file" onChange={(e) => setForm({ ...form, image: e.target.files[0] })} />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : editingPost ? 'Update' : 'Submit'}
        </button>
      </form>

      {/* Loading state for fetching posts */}
      {fetchingPosts ? (
        <p>Loading posts...</p>
      ) : (
        <div className="posts">
          {posts.map((post) => (
            <div key={post._id} className="post">
              <h2>{post.name}</h2>
              <p>{post.content}</p>
              {post.imageUrl && <img src={post.imageUrl} alt="Post" />}
              <button onClick={() => handleEdit(post)} className="edit">Edit</button>
              <button onClick={() => handleDelete(post._id)} disabled={deleting[post._id]}>
                {deleting[post._id] ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
