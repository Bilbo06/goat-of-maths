import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api, setToken } from '../utils/api';

export default function LoginPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const ok = await login(username, password);
    setLoading(false);
    if (!ok) {
      setError('Identifiants incorrects !');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!prenom.trim() || !nom.trim() || !password.trim()) {
      setError('Tous les champs sont requis');
      return;
    }
    if (password.length < 4) {
      setError('Le mot de passe doit faire au moins 4 caracteres');
      return;
    }
    setLoading(true);
    try {
      const displayName = `${prenom.trim()} ${nom.trim()}`;
      const generatedUsername = `${prenom.toLowerCase().trim()}.${nom.toLowerCase().trim()}`.replace(/[^a-z0-9.]/g, '');
      const result = await api.auth.register({
        username: generatedUsername,
        password,
        displayName,
      });
      setToken(result.token);
      localStorage.setItem('goat-auth', JSON.stringify({
        isLoggedIn: true,
        username: result.user.username,
        displayName: result.user.displayName,
        isAdmin: false,
      }));
      window.location.reload();
    } catch (err) {
      setError((err as Error).message || 'Erreur lors de l\'inscription');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF6B00] via-[#D32F2F] to-[#FF6B00] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border-2 border-amber-900">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-[#FF6B00] to-[#D32F2F] rounded-full flex items-center justify-center text-5xl mx-auto mb-4 shadow-lg border-2 border-amber-900">
            🐐
          </div>
          <h1 className="text-4xl font-bold text-[#FF6B00] mb-2">GOAT of Maths</h1>
          <p className="text-gray-600 font-bold">Deviens le meilleur en maths !</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 rounded-xl font-bold text-sm border-2 border-amber-900 transition-all ${
              mode === 'login' ? 'bg-gradient-to-r from-[#FF6B00] to-[#D32F2F] text-white' : 'bg-white text-gray-700'
            }`}
          >
            Se connecter
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2 rounded-xl font-bold text-sm border-2 border-amber-900 transition-all ${
              mode === 'register' ? 'bg-gradient-to-r from-[#FF6B00] to-[#D32F2F] text-white' : 'bg-white text-gray-700'
            }`}
          >
            Creer un compte
          </button>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Identifiant</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-amber-900 rounded-xl focus:border-[#FF6B00] focus:outline-none transition-colors font-bold"
                placeholder="prenom.nom"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-amber-900 rounded-xl focus:border-[#FF6B00] focus:outline-none transition-colors font-bold"
                placeholder="••••••"
              />
            </div>
            {error && (
              <div className="bg-red-100 border-2 border-red-500 text-red-700 font-bold px-4 py-3 rounded-xl text-center text-sm">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#FF6B00] to-[#D32F2F] text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-2 border-amber-900 text-lg disabled:opacity-50"
            >
              Se connecter{loading && ' ...'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Prenom</label>
                <input
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-amber-900 rounded-xl focus:border-[#FF6B00] focus:outline-none transition-colors font-bold"
                  placeholder="Prenom"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nom</label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-amber-900 rounded-xl focus:border-[#FF6B00] focus:outline-none transition-colors font-bold"
                  placeholder="Nom"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Adresse email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-amber-900 rounded-xl focus:border-[#FF6B00] focus:outline-none transition-colors font-bold"
                placeholder="prenom.nom@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-amber-900 rounded-xl focus:border-[#FF6B00] focus:outline-none transition-colors font-bold"
                placeholder="Minimum 4 caracteres"
              />
            </div>
            {error && (
              <div className="bg-red-100 border-2 border-red-500 text-red-700 font-bold px-4 py-3 rounded-xl text-center text-sm">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#FF6B00] to-[#D32F2F] text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-2 border-amber-900 text-lg disabled:opacity-50"
            >
              Creer mon compte{loading && ' ...'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
