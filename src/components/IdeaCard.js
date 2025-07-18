import { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';

export default function IdeaCard({ idea }) {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const handleVote = async (type) => {
    // Oy verme işlemi (Firebase ile)
    await updateDoc(doc(db, 'ideas', idea.id), {
      votes: type === 'up' ? idea.votes + 1 : idea.votes - 1
    });
  };

  const handleComment = async () => {
    await addDoc(collection(db, 'ideas', idea.id, 'comments'), {
      text: comment,
      timestamp: new Date(),
      userId: 'currentUserId' // Gerçek kullanıcı ID'si kullanılmalı
    });
    setComment('');
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <p className="text-sm text-gray-500">{idea.username}</p>
      <h3 className="text-lg font-bold">{idea.title}</h3>
      {idea.image ? (
        <div className="relative">
          <img src={idea.image} alt="Idea" className="w-full h-48 object-cover rounded" />
          <p className="absolute bottom-0 text-white bg-black bg-opacity-50 p-2">{idea.description}</p>
        </div>
      ) : (
        <p>{idea.description}</p>
      )}
      <div className="flex justify-between mt-4">
        <div className="flex space-x-2">
          <button onClick={() => handleVote('up')} className="text-gray-500">
            <i className="fas fa-thumbs-up"></i> {idea.votes}
          </button>
          <button onClick={() => handleVote('down')} className="text-gray-500">
            <i className="fas fa-thumbs-down"></i>
          </button>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setShowComments(!showComments)} className="text-gray-500">
            <i className="fas fa-comment"></i>
          </button>
          <button className="text-gray-500">
            <i className="fas fa-star"></i>
          </button>
          <button className="text-gray-500">
            <i className="fas fa-share"></i>
          </button>
        </div>
      </div>
      {showComments && (
        <div className="mt-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="mb-2 p-2 border rounded"
          >
            <option value="newest">En Yeni</option>
            <option value="popular">En Beğenilen</option>
          </select>
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Yorum yap..."
            className="w-full p-2 border rounded mb-2"
          />
          <button onClick={handleComment} className="bg-primary text-white px-4 py-2 rounded">Yorum Yap</button>
        </div>
      )}
    </div>
  );
}