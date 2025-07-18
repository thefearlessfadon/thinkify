export default function PremiumPage() {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Premium Abonelik</h2>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-bold">Premium Özellikler</h3>
        <ul className="list-disc pl-5">
          <li>Günde 10 fikir paylaşma hakkı</li>
          <li>Fikirleri ana sayfaya sabitleme</li>
          <li>Geliştirilecek Fikirler alanına erişim</li>
        </ul>
        <button disabled className="mt-4 bg-gray-500 text-white px-4 py-2 rounded">Şu an kullanılamıyor</button>
      </div>
    </div>
  );
}