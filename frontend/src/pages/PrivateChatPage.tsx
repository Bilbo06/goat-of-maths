import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';

export default function PrivateChatPage() {
  const { name } = useParams<{ name: string }>();
  const { state, sendPrivateMessage } = useGame();
  const navigate = useNavigate();
  const darkMode = state.darkMode;
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';
  const [message, setMessage] = useState('');

  const decodedName = name ? decodeURIComponent(name) : '';
  const myName = state.userData.name;

  const conversation = state.privateMessages.filter(
    (m) =>
      (m.from === myName && m.to === decodedName) ||
      (m.from === decodedName && m.to === myName)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendPrivateMessage(decodedName, message);
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className={`text-sm font-bold ${textSecondary} hover:underline`}
        >
          ← Retour
        </button>
        <div
          className={`flex items-center gap-2 flex-1 p-2 rounded-xl ${cardBg} border-2 border-amber-900 cursor-pointer hover:scale-[1.01] transition-transform`}
          onClick={() => navigate(`/profil/${encodeURIComponent(decodedName)}`)}
        >
          <div className="w-10 h-10 rounded-full theme-gradient-br flex items-center justify-center text-sm font-bold text-white border border-amber-900">
            {decodedName.charAt(0)}
          </div>
          <div>
            <div className={`font-bold text-sm ${textClass}`}>{decodedName}</div>
            <div className="text-[10px] text-green-500 font-bold">En ligne</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-1">
        {conversation.length === 0 && (
          <p className={`text-center text-sm ${textSecondary} mt-8`}>
            Aucun message. Dis bonjour ! 👋
          </p>
        )}
        {conversation.map((msg) => {
          const isOwn = msg.from === myName;
          const time = new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          });
          return (
            <div
              key={msg.id}
              className={`rounded-lg p-3 border-2 border-amber-900 mb-2 ${isOwn ? 'ml-8' : 'mr-8'} ${
                isOwn ? 'theme-gradient text-white' : cardBg + ' ' + textClass
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs">{isOwn ? 'Toi' : decodedName}</span>
                <span className="text-xs opacity-70">{time}</span>
              </div>
              <p className="text-sm">{msg.message}</p>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Écris à ${decodedName.split(' ')[0]}...`}
          className={`flex-1 px-4 py-3 border-2 border-amber-900 rounded-xl font-bold focus:outline-none theme-border ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`}
        />
        <button
          type="submit"
          className="theme-gradient text-white font-bold px-6 py-3 rounded-xl border-2 border-amber-900 hover:scale-105 transition-transform"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
