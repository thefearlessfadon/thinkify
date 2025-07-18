import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import IdeaCard from '../components/IdeaCard';

export default function Home() {
  const [ideas, setIdeas] = useState([]);
  const [filter, setFilter] = useState('trend');

  useEffect(() => {
    const fetchIdeas = async () => {
      const querySnapshot = await getDocs(collection(db, 'ideas'));
      const ideasData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setIdeas(ideasData);
    };
    fetchIdeas();
  }, []);

  return (
    <div className="p-4">
      <div className="mb-4">
        <button onClick={() => setFilter('trend')} className="mr-2 p-2 bg-primary text-white rounded">Trend</button>
        <button onClick={() => setFilter('new')} className="mr-2 p-2 bg-primary text-white rounded">Yeni</button>
        <button onClick={() => setFilter('best')} className="p-2 bg-primary text-white rounded">En İyiler</button>
      </div>
      {ideas.map(idea => (
        <IdeaCard key={idea.id} idea={idea} />
      ))}
    </div>
  );
}