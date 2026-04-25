import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('lucas');
  const [password, setPassword] = useState('mdp123');
  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const ok = await login(username, password);
    setLoading(false);
    if (!ok) {
      setError('❌ Identifiants incorrects !');
    }
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Identifiant</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-amber-900 rounded-xl focus:border-[#FF6B00] focus:outline-none transition-colors font-bold"
              placeholder="ton identifiant"
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
            <div className="bg-red-100 border-2 border-red-500 text-red-700 font-bold px-4 py-3 rounded-xl text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#FF6B00] to-[#D32F2F] text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-2 border-amber-900 text-lg"
          >
            Se connecter
            {loading && ' ...'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6 font-bold">
          Identifiants fournis par ton professeur
        </p>
        <p className="text-center text-xs text-gray-400 mt-2">
          Démo : lucas / mdp123
        </p>
      </div>
    </div>
  );
}
