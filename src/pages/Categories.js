export default function Categories() {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Kategoriler</h2>
      <div className="grid grid-cols-2 gap-4">
        <button className="p-4 bg-primary text-white rounded">Teknoloji</button>
        <button className="p-4 bg-primary text-white rounded">Sosyal Hayat</button>
        <button className="p-4 bg-primary text-white rounded">Eğitim</button>
        <button className="p-4 bg-primary text-white rounded">Sağlık</button>
      </div>
    </div>
  );
}