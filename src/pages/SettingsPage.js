import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Ayarlar</h2>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-bold">Profil</h3>
        <p>Kullanıcı Adı: {user?.displayName || 'Anonim'}</p>
        <p>E-posta: {user?.email}</p>
        <button className="mt-4 bg-primary text-white px-4 py-2 rounded">Profili Düzenle</button>
      </div>
      <div className="bg-white p-4 rounded shadow mt-4">
        <h3 className="text-lg font-bold">Hesap</h3>
        <button className="mt-4 bg-primary text-white px-4 py-2 rounded">Şifre Değiştir</button>
      </div>
    </div>
  );
}