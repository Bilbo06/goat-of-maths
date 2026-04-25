import type { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
  darkMode: boolean;
  isOwn: boolean;
  onProfileClick?: (username: string) => void;
}

export default function ChatMessage({ message, darkMode, isOwn, onProfileClick }: ChatMessageProps) {
  const bgClass = isOwn
    ? 'theme-gradient text-white'
    : darkMode
      ? 'bg-gray-800 text-white'
      : 'bg-white text-gray-800';

  const time = new Date(message.timestamp).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`${bgClass} rounded-lg p-3 border-2 border-amber-900 mb-2 ${isOwn ? 'ml-8' : 'mr-8'}`}>
      <div className="flex items-center justify-between mb-1">
        <span
          className="font-bold text-sm cursor-pointer hover:underline"
          onClick={() => onProfileClick?.(message.username)}
        >
          {message.username}
        </span>
        <span className="text-xs opacity-70">{time}</span>
      </div>
      <p className="text-sm">{message.message}</p>
    </div>
  );
}
