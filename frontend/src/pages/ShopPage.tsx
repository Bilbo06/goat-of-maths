import { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import ShopCard from '../components/ShopCard';
import { THEMES } from '../data/constants';
import { getAdminShopItems } from '../utils/adminStorage';
import { playPurchase } from '../utils/sounds';

type Tab = 'shop' | 'owned';

export default function ShopPage() {
  const { state, buyItem, applyTheme, applyAvatar, applyDecoration } = useGame();
  const darkMode = state.darkMode;
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';
  const [tab, setTab] = useState<Tab>('shop');
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const allShopItems = getAdminShopItems();

  const handleBuy = (itemId: number, price: number) => {
    const item = allShopItems.find((i) => i.id === itemId);
    if (!item || state.userData.coins < price) return;
    buyItem(itemId, price);
    playPurchase();
    setToast(`${item.icon} ${item.name} acheté !`);
    setTimeout(() => setToast(null), 2500);
  };

  const ownedItems = allShopItems.filter((i) => state.userData.purchasedItems.includes(i.id));
  const shopItems = allShopItems.filter((i) => i.type !== 'theme' || !state.userData.purchasedItems.includes(i.id));

  const currentTheme = THEMES.find((t) => t.id === state.userData.theme) || THEMES[0];
  const activePreview = THEMES.find((t) => t.id === previewTheme);

  const ownedThemes = ownedItems.filter((i) => i.type === 'theme');
  const ownedAvatars = ownedItems.filter((i) => i.type === 'avatar');
  const ownedDecorations = ownedItems.filter((i) => i.type === 'decoration');

  return (
    <div>
      {toast && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none animate-fade-in">
          <div className="bg-green-600 text-white font-bold px-8 py-4 rounded-2xl shadow-2xl border-2 border-green-400 text-base">
            ✅ {toast}
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-3">
        <h2 className={`text-2xl font-bold ${textClass}`}>🛒 Boutique</h2>
        <div className="flex items-center gap-2 text-white font-bold px-4 py-2 rounded-xl border-2 border-amber-900" style={{ background: `linear-gradient(to right, ${currentTheme.primary}, ${currentTheme.secondary})` }}>
          <span>🪙</span>
          <span>{state.userData.coins}</span>
        </div>
      </div>

      {activePreview && (
        <div className={`${cardBg} rounded-xl p-4 border-2 border-amber-900 shadow-xl mb-4`}>
          <p className={`text-xs font-bold text-center mb-2 ${textSecondary}`}>👁️ Aperçu du thème</p>
          <div className="flex items-center gap-3 justify-center">
            <div className="h-10 flex-1 rounded-lg border-2 border-black" style={{ background: `linear-gradient(to right, ${activePreview.primary}, ${activePreview.secondary})` }} />
            <button
              onClick={() => setPreviewTheme(null)}
              className={`text-xs ${textSecondary} underline`}
            >
              Fermer
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2 justify-center">
            <span className="text-xl">{activePreview.icon}</span>
            <span className={`font-bold ${textClass}`}>{activePreview.name}</span>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('shop')}
          className={`flex-1 font-bold py-2 px-4 rounded-xl border-2 border-amber-900 transition-all ${
            tab === 'shop'
              ? 'text-white'
              : `${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'}`
          }`}
          style={tab === 'shop' ? { background: `linear-gradient(to right, ${currentTheme.primary}, ${currentTheme.secondary})` } : undefined}
        >
          🛒 Boutique
        </button>
        <button
          onClick={() => setTab('owned')}
          className={`flex-1 font-bold py-2 px-4 rounded-xl border-2 border-amber-900 transition-all ${
            tab === 'owned'
              ? 'text-white'
              : `${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'}`
          }`}
          style={tab === 'owned' ? { background: `linear-gradient(to right, ${currentTheme.primary}, ${currentTheme.secondary})` } : undefined}
        >
          🎒 Mes achats ({ownedItems.length})
        </button>
      </div>

      {tab === 'shop' && (
        <div className="space-y-5">
          {([
            { type: 'consumable' as const, icon: '🩹', label: 'Soin' },
            { type: 'boost' as const, icon: '⚡', label: 'Boosts' },
            { type: 'avatar' as const, icon: '👴', label: 'Avatars' },
            { type: 'decoration' as const, icon: '🖼️', label: 'Décorations' },
            { type: 'theme' as const, icon: '🎨', label: 'Thèmes' },
          ]).map(({ type, icon, label }) => {
            const items = shopItems.filter((i) => i.type === type);
            if (items.length === 0) return null;

            return (
              <div key={type}>
                <div className={`flex items-center gap-2 mb-3 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl px-3 py-2 border-2 border-amber-900`}>
                  <span className="text-lg">{icon}</span>
                  <span className={`font-bold ${textClass}`}>{label}</span>
                  <span className={`text-xs ${textSecondary}`}>({items.length})</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {items.map((item) => {
                    if (item.type === 'theme') {
                      const theme = THEMES.find((t) => t.id === item.themeId);
                      return (
                        <div key={item.id} className={`${cardBg} rounded-xl shadow-lg p-4 border-2 border-amber-900`}>
                          <div className="text-center mb-3">
                            <div className="text-5xl mb-2">{item.icon}</div>
                            <h3 className={`text-lg font-bold ${textClass} mb-1`}>{item.name}</h3>
                          </div>
                          <p className={`${textSecondary} text-xs mb-3 text-center`}>{item.description}</p>
                          {theme && (
                            <div className="h-6 rounded-lg mb-3 border-2 border-black overflow-hidden">
                              <div className="h-full" style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }} />
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <span className="text-xl">🪙</span>
                              <span className={`font-bold ${textClass}`}>{item.price}</span>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => setPreviewTheme(item.themeId || null)}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-bold text-xs px-3 py-2 rounded-lg border-2 border-amber-900"
                              >
                                👁️
                              </button>
                              <button
                                onClick={() => handleBuy(item.id, item.price)}
                                disabled={state.userData.coins < item.price}
                                className={`font-bold text-sm px-4 py-3 rounded-lg border-2 border-amber-900 ${
                                  state.userData.coins >= item.price
                                    ? 'theme-bg hover:opacity-90 text-white'
                                    : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                }`}
                              >
                                Acheter
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <ShopCard
                        key={item.id}
                        item={item}
                        darkMode={darkMode}
                        userCoins={state.userData.coins}
                        owned={state.userData.purchasedItems.includes(item.id)}
                        onBuy={handleBuy}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'owned' && (
        <div className="space-y-4">
          {ownedAvatars.length > 0 && (
            <div>
              <h3 className={`font-bold ${textClass} mb-3`}>👴 Mes avatars</h3>
              <div className="grid grid-cols-2 gap-3">
                {ownedAvatars.map((item) => {
                  const isActive = state.userData.avatar === item.icon;
                  return (
                    <div key={item.id} className={`${cardBg} rounded-xl p-4 border-2 ${isActive ? 'border-green-500' : 'border-amber-900'} shadow-lg`}>
                      <div className="text-center mb-2">
                        <div className="text-4xl mb-1">{item.icon}</div>
                        <h4 className={`font-bold text-sm ${textClass}`}>{item.name}</h4>
                      </div>
                      {isActive ? (
                        <button
                          onClick={() => applyAvatar('')}
                          className="w-full font-bold text-sm py-3 rounded-lg border-2 border-red-500 bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                          ✗ Retirer
                        </button>
                      ) : (
                        <button
                          onClick={() => applyAvatar(item.icon)}
                          className="w-full font-bold text-sm py-3 rounded-lg border-2 border-amber-900 text-white hover:scale-105 transition-transform"
                          style={{ background: `linear-gradient(to right, ${currentTheme.primary}, ${currentTheme.secondary})` }}
                        >
                          Appliquer
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {ownedThemes.length > 0 && (
            <div>
              <h3 className={`font-bold ${textClass} mb-3`}>🎨 Mes thèmes</h3>
              <div className="grid grid-cols-2 gap-3">
                {ownedThemes.map((item) => {
                  const theme = THEMES.find((t) => t.id === item.themeId);
                  if (!theme) return null;
                  const isActive = state.userData.theme === theme.id;
                  return (
                    <div key={item.id} className={`${cardBg} rounded-xl p-4 border-2 ${isActive ? 'border-green-500' : 'border-amber-900'} shadow-lg`}>
                      <div className="text-center mb-2">
                        <div className="text-4xl mb-1">{theme.icon}</div>
                        <h4 className={`font-bold text-sm ${textClass}`}>{theme.name}</h4>
                      </div>
                      <div className="h-5 rounded-lg mb-2 border-2 border-black overflow-hidden">
                        <div className="h-full" style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }} />
                      </div>
                      {isActive ? (
                        <button
                          onClick={() => applyTheme('default')}
                          className="w-full font-bold text-sm py-3 rounded-lg border-2 border-red-500 bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                          ✗ Retirer
                        </button>
                      ) : (
                        <button
                          onClick={() => applyTheme(theme.id)}
                          className="w-full font-bold text-sm py-3 rounded-lg border-2 border-amber-900 text-white hover:scale-105 transition-transform"
                          style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }}
                        >
                          Appliquer
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {ownedDecorations.length > 0 && (
            <div>
              <h3 className={`font-bold ${textClass} mb-3`}>🖼️ Mes décorations</h3>
              <div className="grid grid-cols-2 gap-3">
                {ownedDecorations.map((item) => {
                  const isActive = state.userData.equippedDecoration === item.id;
                  return (
                    <div key={item.id} className={`${cardBg} rounded-xl p-4 border-2 ${isActive ? 'border-green-500' : 'border-amber-900'} shadow-lg text-center`}>
                      <div className="text-4xl mb-2">{item.icon}</div>
                      <div className={`text-sm font-bold ${textClass} mb-3`}>{item.name}</div>
                      {isActive ? (
                        <button
                          onClick={() => applyDecoration(null)}
                          className="w-full font-bold text-sm py-3 rounded-lg border-2 border-red-500 bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                          ✗ Retirer
                        </button>
                      ) : (
                        <button
                          onClick={() => applyDecoration(item.id)}
                          className="w-full font-bold text-sm py-3 rounded-lg border-2 border-amber-900 text-white hover:scale-105 transition-transform"
                          style={{ background: `linear-gradient(to right, ${currentTheme.primary}, ${currentTheme.secondary})` }}
                        >
                          Appliquer
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {ownedItems.length === 0 && (
            <div className={`${cardBg} rounded-xl p-6 border-2 border-amber-900 text-center`}>
              <div className="text-4xl mb-2">🛒</div>
              <p className={`text-sm ${textSecondary}`}>Tu n'as rien acheté encore !</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
