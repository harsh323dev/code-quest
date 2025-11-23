cimport React, { useEffect, useState } from 'react';
import axios from '../lib/axiosinstance';
import { Card, Button, Input, Textarea } from '../components/ui';

const PublicSpace = () => {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [error, setError] = useState('');

  const fetchFeed = async () => {
    try {
      const res = await axios.get('/post/feed');
      setPosts(res.data);
    } catch (err) {
      setError('Failed to load feed');
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handlePost = async () => {
    try {
      await axios.post('/post/create', { content, mediaType, mediaUrl });
      setContent('');
      setMediaUrl('');
      fetchFeed();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Post failed');
    }
  };

  const handleLike = async (postId) => {
    await axios.post(`/post/${postId}/like`);
    fetchFeed();
  };

  const handleComment = async (postId, comment) => {
    await axios.post(`/post/${postId}/comment`, { content: comment });
    fetchFeed();
  };

  const handleShare = async (postId) => {
    await axios.post(`/post/${postId}/share`);
    fetchFeed();
  };

  return (
    <div>
      <h1>Public Space</h1>
      <Card>
        <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="What's on your mind?" />
        <Input type="text" value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} placeholder="Image/Video URL" />
        <select value={mediaType} onChange={e => setMediaType(e.target.value)}>
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
        <Button onClick={handlePost}>Post</Button>
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </Card>
      <div>
        {posts.map(post => (
          <Card key={post._id}>
            <div><b>{post.user.name}</b></div>
            <div>{post.content}</div>
            {post.media?.type === 'image' && <img src={post.media.url} alt="post" style={{ maxWidth: '300px' }} />}
            {post.media?.type === 'video' && <video src={post.media.url} controls style={{ maxWidth: '300px' }} />}
            <div>
              <Button onClick={() => handleLike(post._id)}>{post.likes.length} Like</Button>
              <Button onClick={() => handleShare(post._id)}>{post.shares.length} Share</Button>
            </div>
            <div>
              <b>Comments:</b>
              {post.comments.map((c, idx) => (
                <div key={idx}><b>{c.user.name}:</b> {c.content}</div>
              ))}
              <Input type="text" placeholder="Add a comment" onKeyDown={e => {
                if (e.key === 'Enter') handleComment(post._id, e.target.value);
              }} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PublicSpace;
