import { useState } from 'react';
import { db } from '../firebase';
import { addDoc, collection } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function IdeaForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (title.length > 100 || description.length > 1000) return;
    await addDoc(collection(db, 'ideas'), {
      title,
      description,
      category,
      isAnonymous,
      allowComments,
      userId: user.uid,
      username: isAnonymous ? 'Anonim' : user.displayName,
      votes: 0,
      timestamp: new Date()
    });
    setTitle('');
    setDescription('');
    setCategory('');
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Fikir Paylaş</h2>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Başlık (maks. 100 karakter)"
        className="w-full p-2 border rounded mb-4"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Fikrini yaz (maks. 1000 karakter)"
        className="w-full p-2 border rounded mb-4"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="">Kategori Seç</option>
        <option value="teknoloji">Teknoloji</option>
        <option value="sosyal">Sosyal Hayat</option>
        <option value="egitim">Eğitim</option>
        <option value="saglik">Sağlık</option>
      </select>
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={() => setIsAnonymous(!isAnonymous)}
          className="mr-2"
        />
        <label>Anonim Paylaş</label>
      </div>
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={allowComments}
          onChange={() => setAllowComments(!allowComments)}
          className="mr-2"
        />
        <label>Yorumlara İzin Ver</label>
      </div>
      <button onClick={handleSubmit} className="bg-primary text-white px-4 py-2 rounded">Paylaş</button>
    </div>
  );
}