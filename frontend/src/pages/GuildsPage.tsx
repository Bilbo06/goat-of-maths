import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { THEMES } from '../data/constants';
import { computeGradeProgress } from '../utils/grades';

export default function GuildsPage() {
  const {
    state,
    createGuild,
    joinGuild,
    leaveGuild,
    setGuildEntryFee,
    setGuildChefAdjoint,
    acceptGuildRequest,
    rejectGuildRequest,
    setGuildPayoutPercentage,
    payoutGuildTreasury,
    deleteGuild,
    transferChef,
    cancelTransfer,
    kickMember,
    completeGuildMission,
    claimGuildMissionRewards,
  } = useGame();
  const navigate = useNavigate();
  const darkMode = state.darkMode;
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';
  const theme = THEMES.find((t) => t.id === state.userData.theme) || THEMES[0];

  const [tab, setTab] = useState<'list' | 'myguild' | 'create' | 'ranking' | 'missions'>('list');
  const [guildName, setGuildName] = useState('');
  const [guildEmoji, setGuildEmoji] = useState('🏰');
  const [expandedGuild, setExpandedGuild] = useState<number | null>(null);
  const [editFee, setEditFee] = useState(false);
  const [newFee, setNewFee] = useState(50);
  const [selectedAdjoint, setSelectedAdjoint] = useState('');
  const [selectedTransfer, setSelectedTransfer] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const guilds = state.guildState.guilds;
  const myGuildId = state.guildState.myGuildId;
  const myGuild = guilds.find((g) => g.id === myGuildId) || null;
  const isChef = myGuild?.chef === state.userData.name;
  const isAdjoint = myGuild?.chefAdjoint === state.userData.name;
  const isManager = isChef || isAdjoint;

  const today = new Date();
  const isSunday = today.getDay() === 0;
  const alreadyPaidToday = myGuild?.lastPayoutDate === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const showPayout = isManager && isSunday && !alreadyPaidToday && (myGuild?.treasury || 0) > 0;

  const EMOJIS = ['🏰', '⚔️', '🛡️', '🐉', '🧙', '💀', '⚜️', '🔱', '🌙', '🔥', '❄️', '⚡'];

  if (tab === 'create') {
    return (
      <div>
        <button onClick={() => setTab('list')} className={`text-sm font-bold ${textSecondary} hover:underline mb-4`}>
          ← Retour
        </button>
        <div className={`${cardBg} rounded-xl shadow-xl p-6 border-2 border-amber-900`}>
          <h3 className={`text-lg font-bold ${textClass} mb-4 text-center`}>Créer une guilde</h3>
          <p className={`text-sm ${textSecondary} mb-4 text-center`}>Coût : <strong>10 000 🪙</strong></p>
          <p className={`text-xs text-center mb-4 ${state.userData.coins < 10000 ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}`}>
            Ton solde : {state.userData.coins.toLocaleString()} 🪙
          </p>

          <div className="mb-4">
            <label className={`text-xs font-bold ${textSecondary} mb-1 block`}>Icône</label>
            <div className="flex gap-2 flex-wrap">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setGuildEmoji(e)}
                  className={`w-10 h-10 rounded-lg border-2 text-xl flex items-center justify-center ${guildEmoji === e ? 'border-green-500 bg-green-500/20' : 'border-amber-900 ' + (darkMode ? 'bg-gray-700' : 'bg-amber-50')}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            value={guildName}
            onChange={(e) => setGuildName(e.target.value)}
            placeholder="Nom de la guilde"
            maxLength={20}
            className={`w-full px-4 py-3 border-2 border-amber-900 rounded-xl font-bold mb-4 focus:outline-none theme-border ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}
          />

          <div className="flex gap-2">
            <button
              onClick={() => {
                if (guildName.trim()) {
                  createGuild(guildName.trim(), guildEmoji);
                  setGuildName('');
                  setTab('myguild');
                }
              }}
              disabled={state.userData.coins < 10000 || !guildName.trim() || myGuildId !== null}
              className="flex-1 theme-gradient text-white font-bold py-3 rounded-xl border-2 border-amber-900 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Créer
            </button>
            <button
              onClick={() => setTab('list')}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 rounded-xl border-2 border-amber-900"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'myguild' && myGuild) {
    return (
      <div>
        <button onClick={() => setTab('list')} className={`text-sm font-bold ${textSecondary} hover:underline mb-4`}>
          ← Retour aux guildes
        </button>

        <div className={`${cardBg} rounded-xl shadow-xl p-5 border-2 border-amber-900 mb-4`}>
          <div className="text-center mb-4">
            <div className="text-5xl mb-2">{myGuild.emoji}</div>
            <h2 className={`text-xl font-bold ${textClass}`}>{myGuild.name}</h2>
            <div className={`text-xs ${textSecondary}`}>Niv. {myGuild.level} • 👥 {myGuild.memberNames.length}/{myGuild.maxMembers}</div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-amber-50'} rounded-lg p-3 border-2 border-amber-900 text-center`}>
              <div className="text-xl font-bold theme-text">{myGuild.treasury.toLocaleString()}</div>
              <div className={`text-xs font-bold ${textSecondary}`}>Trésorerie 🪙</div>
            </div>
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-amber-50'} rounded-lg p-3 border-2 border-amber-900 text-center`}>
              <div className="text-xl font-bold theme-text">{myGuild.entryFee} 🪙</div>
              <div className={`text-xs font-bold ${textSecondary}`}>Cotisation</div>
            </div>
          </div>

          <div className="mb-3">
            <div className={`text-xs font-bold ${textSecondary} mb-1`}>👥 Membres ({myGuild.memberNames.length})</div>
            <div className="space-y-1">
              {myGuild.memberNames.map((name) => {
                const role = name === myGuild.chef ? '👑 Chef' : name === myGuild.chefAdjoint ? '⭐ Adjoint' : '';
                return (
                  <div
                    key={name}
                    className={`flex items-center justify-between p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-amber-50'} border-2 border-amber-900 cursor-pointer hover:scale-[1.01] transition-transform`}
                    onClick={() => navigate(`/profil/${encodeURIComponent(name)}`)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full theme-gradient-br flex items-center justify-center text-sm font-bold text-white border border-amber-900">
                        {name.charAt(0)}
                      </div>
                      <span className={`font-bold text-sm ${textClass}`}>{name}</span>
                    </div>
                    {role && <span className="text-xs font-bold theme-text">{role}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {isManager && (
          <div className={`${cardBg} rounded-xl shadow-xl p-5 border-2 border-amber-900 mb-4`}>
            <h3 className={`font-bold ${textClass} mb-3 text-center`}>⚙️ Gestion</h3>

            {myGuild.pendingRequests.length > 0 && (
              <div className="mb-4">
                <div className={`text-xs font-bold ${textSecondary} mb-2`}>📬 Demandes en attente</div>
                <div className="space-y-2">
                  {myGuild.pendingRequests.map((name) => (
                    <div key={name} className={`flex items-center justify-between p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-amber-50'} border-2 border-amber-900`}>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-500 flex items-center justify-center text-xs font-bold text-white border border-amber-900">
                          {name.charAt(0)}
                        </div>
                        <span className={`font-bold text-sm ${textClass}`}>{name}</span>
                        <span className="text-xs text-yellow-500">(+{myGuild.entryFee} 🪙)</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => acceptGuildRequest(myGuild.id, name)}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-2 text-xs rounded-lg border border-amber-900"
                        >
                          ✓ Accepter
                        </button>
                        <button
                          onClick={() => rejectGuildRequest(myGuild.id, name)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-2 text-xs rounded-lg border border-amber-900"
                        >
                          ✗ Refuser
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-3">
              <div className={`text-xs font-bold ${textSecondary} mb-1`}>💰 Cotisation d'entrée</div>
              {editFee ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={newFee}
                    onChange={(e) => setNewFee(Math.max(0, parseInt(e.target.value) || 0))}
                    className={`flex-1 px-3 py-2 border-2 border-amber-900 rounded-lg font-bold text-sm ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}
                  />
                  <button
                    onClick={() => { setGuildEntryFee(newFee); setEditFee(false); }}
                    className="bg-green-600 text-white font-bold px-3 py-2 text-xs rounded-lg border-2 border-amber-900"
                  >
                    ✓
                  </button>
                  <button onClick={() => setEditFee(false)} className="bg-gray-500 text-white font-bold px-3 py-2 text-xs rounded-lg border-2 border-amber-900">
                    ✗
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-sm ${textClass}`}>{myGuild.entryFee} 🪙</span>
                  {isChef && (
                    <button
                      onClick={() => { setNewFee(myGuild.entryFee); setEditFee(true); }}
                      className="text-xs theme-text font-bold underline"
                    >
                      Modifier
                    </button>
                  )}
                </div>
              )}
            </div>

            {isChef && (
              <div className="mb-3">
                <div className={`text-xs font-bold ${textSecondary} mb-1`}>⭐ Chef adjoint</div>
                {myGuild.chefAdjoint ? (
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-sm ${textClass}`}>{myGuild.chefAdjoint}</span>
                    <button
                      onClick={() => setGuildChefAdjoint('')}
                      className="text-xs text-red-500 font-bold underline"
                    >
                      Retirer
                    </button>
                  </div>
                ) : (
                  <div>
                    <select
                      value={selectedAdjoint}
                      onChange={(e) => setSelectedAdjoint(e.target.value)}
                      className={`w-full px-3 py-2 border-2 border-amber-900 rounded-lg text-sm font-bold mb-2 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}
                    >
                      <option value="">-- Choisir un membre --</option>
                      {myGuild.memberNames
                        .filter((n) => n !== state.userData.name)
                        .map((name) => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                    {selectedAdjoint && (
                      <button
                        onClick={() => { setGuildChefAdjoint(selectedAdjoint); setSelectedAdjoint(''); }}
                        className="w-full theme-gradient text-white font-bold py-2 text-xs rounded-lg border-2 border-amber-900"
                      >
                        Nommer adjoint
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="mb-3">
              <div className={`text-xs font-bold ${textSecondary} mb-1`}>📊 Versement hebdomadaire</div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-sm font-bold ${textClass}`}>{myGuild.payoutPercentage}%</span>
                <span className={`text-xs ${textSecondary}`}>du trésor chaque dimanche</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 30, 40, 50, 60, 70, 80].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setGuildPayoutPercentage(pct)}
                    className={`py-2 text-xs font-bold rounded-lg border-2 border-amber-900 transition-all ${
                      myGuild.payoutPercentage === pct
                        ? 'theme-gradient text-white'
                        : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-amber-50 text-gray-600'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {showPayout && (
              <div className={`${darkMode ? 'bg-green-900/30 border-green-500' : 'bg-green-50 border-green-500'} rounded-lg p-3 border-2 mb-3`}>
                <p className={`text-sm font-bold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-2`}>
                  📅 Dimanche — Versement disponible !
                </p>
                <p className={`text-xs ${textSecondary} mb-2`}>
                  {myGuild.payoutPercentage}% de {myGuild.treasury} 🪙 = <strong>{Math.floor(myGuild.treasury * myGuild.payoutPercentage / 100)} 🪙</strong> total
                  ({Math.floor(myGuild.treasury * myGuild.payoutPercentage / 100 / myGuild.memberNames.length)} 🪙/membre)
                </p>
                <button
                  onClick={payoutGuildTreasury}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg border-2 border-amber-900"
                >
                  💰 Verser les cotisations
                </button>
              </div>
            )}

            {!isSunday && (
              <p className={`text-xs text-center ${textSecondary}`}>
                Le versement sera disponible dimanche.
              </p>
            )}
          </div>
        )}

        {isChef && (
          <div className={`${cardBg} rounded-xl shadow-xl p-5 border-2 border-amber-900 mb-4`}>
            <h3 className={`font-bold ${textClass} mb-3 text-center`}>🔧 Administration</h3>

            {myGuild.pendingChefTransfer && myGuild.pendingChefTransferDate && (
              <div className={`${darkMode ? 'bg-yellow-900/30 border-yellow-500' : 'bg-yellow-50 border-yellow-500'} rounded-lg p-3 border-2 mb-3`}>
                <p className={`text-sm font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-700'} mb-1`}>
                  ⏳ Transfert en cours
                </p>
                <p className={`text-xs ${textSecondary} mb-1`}>
                  <strong>{myGuild.pendingChefTransfer}</strong> deviendra chef le {new Date(myGuild.pendingChefTransferDate).toLocaleDateString('fr-FR')} à {new Date(myGuild.pendingChefTransferDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <button
                  onClick={cancelTransfer}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 text-xs rounded-lg border-2 border-amber-900 mt-2"
                >
                  ✗ Annuler le transfert
                </button>
              </div>
            )}

            {!myGuild.pendingChefTransfer && (
              <div className="mb-3">
                <div className={`text-xs font-bold ${textSecondary} mb-1`}>👑 Transférer le rôle de chef</div>
                <select
                  value={selectedTransfer}
                  onChange={(e) => setSelectedTransfer(e.target.value)}
                  className={`w-full px-3 py-2 border-2 border-amber-900 rounded-lg text-sm font-bold mb-2 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}
                >
                  <option value="">-- Choisir un membre --</option>
                  {myGuild.memberNames
                    .filter((n) => n !== state.userData.name)
                    .map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                </select>
                {selectedTransfer && (
                  <button
                    onClick={() => { transferChef(selectedTransfer); setSelectedTransfer(''); }}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 text-xs rounded-lg border-2 border-amber-900"
                  >
                    👑 Transférer (effectif dans 48h)
                  </button>
                )}
              </div>
            )}

            <div className="mb-3">
              <div className={`text-xs font-bold ${textSecondary} mb-1`}>👢 Exclure un membre</div>
              {myGuild.memberNames.filter((n) => n !== state.userData.name).length > 0 ? (
                <div className="space-y-1">
                  {myGuild.memberNames
                    .filter((n) => n !== state.userData.name)
                    .map((name) => (
                      <div key={name} className={`flex items-center justify-between p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-amber-50'} border-2 border-amber-900`}>
                        <span className={`font-bold text-sm ${textClass}`}>{name}</span>
                        <button
                          onClick={() => kickMember(name)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-2 text-xs rounded-lg border border-amber-900"
                        >
                          Virer
                        </button>
                      </div>
                    ))}
                </div>
              ) : (
                <p className={`text-xs ${textSecondary}`}>Tu es le seul membre</p>
              )}
            </div>

            {confirmDelete ? (
              <div className={`${darkMode ? 'bg-red-900/30 border-red-500' : 'bg-red-50 border-red-500'} rounded-lg p-3 border-2`}>
                <p className={`text-sm font-bold text-red-500 mb-2`}>⚠️ Es-tu sûr ? La guilde sera définitivement supprimée.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { deleteGuild(); setConfirmDelete(false); setTab('list'); }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 text-xs rounded-lg border-2 border-amber-900"
                  >
                    Oui, supprimer
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 bg-gray-500 text-white font-bold py-2 text-xs rounded-lg border-2 border-amber-900"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full bg-red-800 hover:bg-red-900 text-white font-bold py-2 text-xs rounded-lg border-2 border-red-900"
              >
                🗑️ Dissoudre la guilde
              </button>
            )}
          </div>
        )}

        {!isChef && (
          <button
            onClick={leaveGuild}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl border-2 border-red-800"
          >
            Quitter la guilde
          </button>
        )}
      </div>
    );
  }

  const otherGuilds = guilds.filter((g) => g.id !== myGuildId);
  const hasPendingRequest = (guildId: number) => {
    const g = guilds.find((gg) => gg.id === guildId);
    return g?.pendingRequests.includes(state.userData.name) || false;
  };

  const MEMBER_LEVELS: Record<string, number> = {
    'Lucas Dubois': computeGradeProgress(state.userData.totalXP).level,
    'Emma Martin': 15, 'Thomas Bernard': 8, 'Léa Dubois': 22,
    'Hugo Petit': 12, 'Chloé Rousseau': 18, 'Sophie Laurent': 45,
    'Antoine Moreau': 42, 'Marie Fontaine': 38, 'Jules Girard': 30,
  };

  const getGuildScore = (g: typeof guilds[0]) => {
    const avgLvl = g.memberNames.length > 0
      ? g.memberNames.reduce((s, n) => s + (MEMBER_LEVELS[n] || 1), 0) / g.memberNames.length
      : 0;
    const wealth = g.treasury;
    const cohesion = g.memberNames.length * 50;
    const power = g.memberNames.reduce((s, n) => s + (MEMBER_LEVELS[n] || 1), 0);
    return { avgLvl, wealth, cohesion, power, total: Math.round(avgLvl * 100 + wealth / 5 + cohesion + power * 2) };
  };

  if (tab === 'ranking') {
    const ranked = [...guilds]
      .filter((g) => g.memberNames.length > 0)
      .map((g) => ({ guild: g, score: getGuildScore(g) }))
      .sort((a, b) => b.score.total - a.score.total);

    return (
      <div>
        <button onClick={() => setTab('list')} className={`text-sm font-bold ${textSecondary} hover:underline mb-4`}>
          ← Retour
        </button>
        <h2 className={`text-2xl font-bold ${textClass} mb-4 text-center`}>🏆 Classement des guildes</h2>
        <p className={`text-xs text-center ${textSecondary} mb-4`}>
          Score = Niveau moyen × 100 + Richesse / 5 + Cohésion + Puissance × 2
        </p>
        <div className="space-y-3">
          {ranked.map((r, idx) => {
            const medals = ['🥇', '🥈', '🥉'];
            const isOwn = r.guild.id === myGuildId;
            return (
              <div key={r.guild.id} className={`${cardBg} rounded-xl p-4 border-2 ${isOwn ? 'border-green-500' : 'border-amber-900'} shadow-lg`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 text-center text-xl font-bold">
                    {medals[idx] || <span className={textSecondary}>#{idx + 1}</span>}
                  </div>
                  <div className="text-3xl">{r.guild.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold ${textClass}`}>{r.guild.name}</h3>
                      {isOwn && <span className="text-xs bg-green-500 text-white font-bold px-2 py-0.5 rounded-full">Toi</span>}
                    </div>
                    <div className={`text-xs ${textSecondary}`}>
                      👥 {r.guild.memberNames.length} membres
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold" style={{ color: theme.primary }}>{r.score.total}</div>
                    <div className={`text-xs ${textSecondary}`}>pts</div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-amber-50'} rounded-lg p-2 border border-amber-900 text-center`}>
                    <div className="text-sm font-bold theme-text">{r.score.avgLvl.toFixed(1)}</div>
                    <div className={`text-[9px] font-bold ${textSecondary}`}>Niv. moy.</div>
                  </div>
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-amber-50'} rounded-lg p-2 border border-amber-900 text-center`}>
                    <div className="text-sm font-bold theme-text">{r.score.wealth.toLocaleString()}</div>
                    <div className={`text-[9px] font-bold ${textSecondary}`}>Richesse 🪙</div>
                  </div>
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-amber-50'} rounded-lg p-2 border border-amber-900 text-center`}>
                    <div className="text-sm font-bold theme-text">{r.score.cohesion}</div>
                    <div className={`text-[9px] font-bold ${textSecondary}`}>Cohésion</div>
                  </div>
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-amber-50'} rounded-lg p-2 border border-amber-900 text-center`}>
                    <div className="text-sm font-bold theme-text">{r.score.power}</div>
                    <div className={`text-[9px] font-bold ${textSecondary}`}>Puissance</div>
                  </div>
                </div>
              </div>
            );
          })}
          {ranked.length === 0 && (
            <div className={`${cardBg} rounded-xl p-6 border-2 border-amber-900 text-center`}>
              <p className={`text-sm ${textSecondary}`}>Aucune guilde active</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (tab === 'missions' && myGuild) {
    return (
      <div>
        <button onClick={() => setTab('list')} className={`text-sm font-bold ${textSecondary} hover:underline mb-4`}>
          ← Retour aux guildes
        </button>

        <div className={`${cardBg} rounded-xl shadow-xl p-5 border-2 border-amber-900 mb-4`}>
          <div className="flex items-center gap-3 mb-4 justify-center">
            <span className="text-3xl">{myGuild.emoji}</span>
            <h2 className={`text-xl font-bold ${textClass}`}>{myGuild.name}</h2>
          </div>
          <h3 className={`font-bold ${textClass} mb-3 text-center`}>🎯 Missions de guilde du jour</h3>
          <p className={`text-xs text-center ${textSecondary} mb-3`}>
            Si au moins la moitié des membres complètent une mission, <strong>tous</strong> reçoivent la récompense !
          </p>

          {myGuild.guildMissions.length === 0 ? (
            <p className={`text-sm text-center ${textSecondary} py-4`}>Aucune mission aujourd'hui. Reviens demain !</p>
          ) : (
            <div className="space-y-3">
              {myGuild.guildMissions.map((m) => {
                const threshold = Math.ceil(myGuild.memberNames.length / 2);
                const done = m.completedBy.length;
                const iCompleted = m.completedBy.includes(state.userData.name);
                const canClaim = done >= threshold && !m.rewarded && myGuild.memberNames.includes(state.userData.name);
                const isDone = m.rewarded;
                const progressPct = myGuild.memberNames.length > 0 ? (done / myGuild.memberNames.length) * 100 : 0;

                return (
                  <div key={m.id} className={`${darkMode ? 'bg-gray-700' : 'bg-amber-50'} rounded-lg p-3 border-2 border-amber-900`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{m.icon}</span>
                        <span className={`font-bold text-sm ${textClass}`}>{m.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs theme-text font-bold">+{m.xpReward} XP</span>
                        <span className="text-xs text-yellow-500 font-bold">+{m.coinsReward} 🪙</span>
                      </div>
                    </div>

                    <div className="h-3 bg-gray-300 rounded-full overflow-hidden border border-black mb-1">
                      <div
                        className={`h-full transition-all ${done >= threshold ? 'bg-green-500' : 'theme-progress'}`}
                        style={{ width: `${Math.min(progressPct, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <p className={`text-[10px] ${textSecondary}`}>
                        {done}/{myGuild.memberNames.length} membres • seuil : {threshold}
                      </p>
                      {done >= threshold && !isDone && (
                        <span className="text-[10px] text-green-500 font-bold">Objectif atteint !</span>
                      )}
                    </div>

                    {m.completedBy.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {m.completedBy.map((name) => (
                          <span
                            key={name}
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              name === state.userData.name
                                ? 'bg-green-500/30 text-green-400 border border-green-500'
                                : darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {name === state.userData.name ? '✓ ' + name : name}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-end">
                      {isDone ? (
                        <span className="text-xs font-bold text-green-500">✓ Récompensé</span>
                      ) : iCompleted ? (
                        <span className="text-xs font-bold text-green-500">✓ Fait</span>
                      ) : canClaim ? (
                        <button
                          onClick={() => claimGuildMissionRewards(m.id)}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 text-xs rounded-lg border-2 border-amber-900"
                        >
                          Récupérer 🎁
                        </button>
                      ) : (
                        <button
                          onClick={() => completeGuildMission(m.id)}
                          className="theme-gradient text-white font-bold px-4 py-2 text-xs rounded-lg border-2 border-amber-900"
                        >
                          Fait ✓
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-2xl font-bold ${textClass}`}>🏰 Guildes</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('ranking')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-3 py-2 rounded-xl border-2 border-amber-900 text-sm"
          >
            🏆 Classement
          </button>
          {myGuildId !== null && (
            <button
              onClick={() => setTab('missions')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-2 rounded-xl border-2 border-amber-900 text-sm"
            >
              🎯 Missions
            </button>
          )}
          {myGuildId === null && (
            <button
              onClick={() => setTab('create')}
              className="theme-gradient text-white font-bold px-4 py-2 rounded-xl border-2 border-amber-900 text-sm"
            >
              + Créer
            </button>
          )}
          {myGuildId !== null && (
            <button
              onClick={() => setTab('myguild')}
              className="theme-gradient text-white font-bold px-4 py-2 rounded-xl border-2 border-amber-900 text-sm"
            >
              Ma guilde
            </button>
          )}
        </div>
      </div>

      {myGuildId !== null && (
        <div
          className={`${cardBg} rounded-xl p-4 border-2 border-green-500 shadow-lg mb-4 cursor-pointer hover:scale-[1.01] transition-transform`}
          onClick={() => setTab('myguild')}
        >
          <div className="flex items-center gap-3">
            <div className="text-4xl">{myGuild?.emoji}</div>
            <div className="flex-1">
              <h3 className={`font-bold text-lg ${textClass}`}>{myGuild?.name}</h3>
              <div className={`text-xs ${textSecondary}`}>
                👥 {myGuild?.memberNames.length}/{myGuild?.maxMembers} • Trésor : {myGuild?.treasury.toLocaleString()} 🪙
              </div>
            </div>
            <span className="text-xs theme-text font-bold">→ Ma guilde</span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {otherGuilds.map((guild) => {
          const isExpanded = expandedGuild === guild.id;
          const isFull = guild.memberNames.length >= guild.maxMembers;
          const pending = hasPendingRequest(guild.id);

          return (
            <div key={guild.id} className={`${cardBg} rounded-xl p-4 border-2 border-amber-900 shadow-lg`}>
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setExpandedGuild(isExpanded ? null : guild.id)}
              >
                <div className="text-4xl">{guild.emoji}</div>
                <div className="flex-1">
                  <h3 className={`font-bold text-lg ${textClass}`}>{guild.name}</h3>
                  <div className={`text-xs ${textSecondary}`}>
                    👥 {guild.memberNames.length}/{guild.maxMembers} • Niv. {guild.level} • Entrée : {guild.entryFee} 🪙
                  </div>
                </div>
                {myGuildId === null && !isFull && !pending && (
                  <button
                    onClick={(e) => { e.stopPropagation(); joinGuild(guild.id); }}
                    className="theme-bg hover:opacity-90 text-white font-bold px-3 py-2 text-xs rounded-lg border-2 border-amber-900"
                  >
                    {state.userData.coins >= guild.entryFee ? 'Postuler' : 'Trop cher'}
                  </button>
                )}
                {pending && (
                  <span className="text-xs text-yellow-500 font-bold">En attente</span>
                )}
                {isFull && <span className="text-xs text-red-500 font-bold">Complet</span>}
              </div>
              <div className="mt-2 h-2 bg-gray-300 rounded-full overflow-hidden border border-black">
                <div
                  className="h-full theme-progress"
                  style={{ width: `${(guild.memberNames.length / guild.maxMembers) * 100}%` }}
                />
              </div>
              {isExpanded && (
                <div className="mt-3 space-y-2">
                  <p className={`text-xs font-bold ${textSecondary}`}>Membres :</p>
                  {guild.memberNames.length > 0 ? guild.memberNames.map((name) => {
                    const role = name === guild.chef ? '👑' : name === guild.chefAdjoint ? '⭐' : '';
                    return (
                      <div
                        key={name}
                        className={`flex items-center gap-2 p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-amber-50'} border-2 border-amber-900 cursor-pointer hover:scale-[1.01] transition-transform`}
                        onClick={() => navigate(`/profil/${encodeURIComponent(name)}`)}
                      >
                        <div className="w-8 h-8 rounded-full theme-gradient-br flex items-center justify-center text-sm font-bold text-white border border-amber-900">
                          {name.charAt(0)}
                        </div>
                        <span className={`font-bold text-sm ${textClass}`}>{name}</span>
                        {role && <span className="text-sm">{role}</span>}
                      </div>
                    );
                  }) : (
                    <p className={`text-xs ${textSecondary}`}>Aucun membre</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
