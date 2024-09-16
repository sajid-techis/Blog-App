import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'

const App = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ name: '', content: '', image: null });
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    axios.get(`${apiUrl}/api/posts`).then((res) => setPosts(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('content', form.content);
    if (form.image) formData.append('image', form.image);

    if (editingPost) {
      await axios.put(`${apiUrl}/api/posts/${editingPost._id}`, formData);
      setEditingPost(null);
    } else {
      await axios.post(`${apiUrl}/api/posts`, formData);
    }

    setForm({ name: '', content: '', image: null });
    axios.get(`${apiUrl}/api/posts`).then((res) => setPosts(res.data));
  };

  const handleDelete = async (id) => {
    await axios.delete(`${apiUrl}/api/posts/${id}`);
    axios.get(`${apiUrl}/api/posts`).then((res) => setPosts(res.data));
  };

  const handleEdit = (post) => {
    window.scroll(0,0)
    setForm({ name: post.name, content: post.content, image: post.imageUrl });
    setEditingPost(post);
  };

  return (
    <div className="container">
      <h1>Blog Posts</h1>
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
        <button type="submit">{editingPost ? 'Update' : 'Submit'}</button>
      </form>

      <div className="posts">
        {posts.map((post) => (
          <div key={post._id} className="post">
            <h2>{post.name}</h2>
            <p>{post.content}</p>
            {post.imageUrl && <img src={`${apiUrl}${post.imageUrl}`} alt="Post" />}
            <button onClick={() => handleEdit(post)} className='edit'>Edit</button>
            <button onClick={() => handleDelete(post._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
