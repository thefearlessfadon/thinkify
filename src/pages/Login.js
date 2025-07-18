import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { signInWithGoogle, signInWithEmail, registerWithEmail } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      if (isRegister) {
        await registerWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <div className="flex w-full max-w-4xl">
        <div className="w-1/2 p-8">
          <h1 className="text-4xl font-bold text-primary">Thinkify</h1>
          <p className="mt-4 text-lg">Fikirlerini paylaş, yeni bakış açıları keşfet</p>
        </div>
        <div className="w-1/2 p-8 bg-white rounded shadow">
          <h2 className="text-2xl font-bold mb-4">{isRegister ? 'Kayıt Ol' : 'Giriş Yap'}</h2>
          <button onClick={signInWithGoogle} className="w-full bg-primary text-white py-2 rounded mb-4">Google ile Giriş Yap</button>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-posta"
            className="w-full p-2 border rounded mb-4"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifre"
            className="w-full p-2 border rounded mb-4"
          />
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              className="mr-2"
            />
            <label>Şifremi Hatırla</label>
          </div>
          <button onClick={handleSubmit} className="w-full bg-primary text-white py-2 rounded">
            {isRegister ? 'Kayıt Ol' : 'Giriş Yap'}
          </button>
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="w-full text-primary mt-4 underline"
          >
            {isRegister ? 'Giriş Yap' : 'Yeni Hesap Oluştur'}
          </button>
          {!isRegister && <button className="w-full text-primary mt-2 underline">Şifremi Unuttum</button>}
        </div>
      </div>
    </div>
  );
}