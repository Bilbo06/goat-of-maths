import type { ShopItem } from '../types';

interface ShopCardProps {
  item: ShopItem;
  darkMode: boolean;
  userCoins: number;
  owned: boolean;
  onBuy: (itemId: number, price: number) => void;
}

const typeColors: Record<string, string> = {
  avatar: 'bg-blue-500',
  boost: 'bg-purple-500',
  decoration: 'bg-pink-500',
  consumable: 'bg-green-500',
  theme: 'bg-indigo-500',
};

const typeLabels: Record<string, string> = {
  avatar: 'Avatar',
  boost: 'Boost',
  decoration: 'Décoration',
  consumable: 'Consommable',
  theme: 'Thème',
};

export default function ShopCard({ item, darkMode, userCoins, owned, onBuy }: ShopCardProps) {
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';
  const canAfford = userCoins >= item.price;
  const isConsumable = item.type === 'consumable';

  return (
    <div className={`${cardBg} rounded-xl shadow-lg p-4 border-2 border-amber-900`}>
      <div className="text-center mb-3">
        <div className="text-5xl mb-2">{item.icon}</div>
        <h3 className={`text-lg font-bold ${textClass} mb-1`}>{item.name}</h3>
        <span className={`${typeColors[item.type]} text-white text-xs font-bold px-2 py-1 rounded-full`}>
          {typeLabels[item.type]}
        </span>
      </div>

      <p className={`${textSecondary} text-xs mb-3 text-center`}>{item.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <span className="text-xl">🪙</span>
          <span className={`font-bold ${textClass}`}>{item.price}</span>
        </div>
        <button
          onClick={() => onBuy(item.id, item.price)}
          disabled={!isConsumable && (owned || !canAfford)}
          className={`font-bold text-sm px-4 py-3 rounded-lg transition-all ${
            !isConsumable && owned
              ? 'bg-green-600 text-white cursor-default'
              : canAfford
                ? 'theme-bg hover:opacity-90 text-white'
                : 'bg-gray-400 text-gray-700 cursor-not-allowed'
          }`}
        >
          {!isConsumable && owned ? '✓ Possédé' : canAfford ? 'Acheter' : 'Trop cher'}
        </button>
      </div>
    </div>
  );
}
