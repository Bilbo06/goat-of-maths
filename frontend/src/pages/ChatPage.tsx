import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import ChatMessage from '../components/ChatMessage';

export default function ChatPage() {
  const { state, sendMessage } = useGame();
  const navigate = useNavigate();
  const darkMode = state.darkMode;
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <h2 className={`text-2xl font-bold mb-4 text-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        💬 Le Foyer
      </h2>

      <div className="flex-1 overflow-y-auto mb-4 space-y-1">
        {state.chatMessages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            darkMode={darkMode}
            isOwn={msg.username === state.userData.name.split(' ')[0]}
            onProfileClick={(username) => navigate(`/profil/${encodeURIComponent(username)}`)}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Écris un message..."
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
