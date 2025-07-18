import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import IdeaCard from '../components/IdeaCard';

export default function Explore() {
  const [ideas, setIdeas] = useState([]);

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
      <h2 className="text-2xl font-bold mb-4">Keşfet</h2>
      {ideas.map(idea => (
        <IdeaCard key={idea.id} idea={idea} />
      ))}
    </div>
  );
}