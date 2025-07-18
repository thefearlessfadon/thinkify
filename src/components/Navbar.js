import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-primary text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold">Thinkify</Link>
      <div className="flex items-center space-x-4">
        <Link to="/explore" className="bg-white text-primary px-4 py-2 rounded">Keşfet</Link>
        <Link to="/categories" className="bg-white text-primary px-4 py-2 rounded">Kategoriler</Link>
        <Link to="/idea-form" className="bg-white text-primary px-4 py-2 rounded">Fikir Paylaş</Link>
        <Link to="/settings" className="text-white">
          <i className="fas fa-cog"></i>
        </Link>
        <Link to="/premium" className="text-white">
          <i className="fas fa-gem"></i>
        </Link>
        {user && <button onClick={logout} className="text-white">Çıkış Yap</button>}
      </div>
    </nav>
  );
}