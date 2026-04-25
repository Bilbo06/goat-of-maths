import { useState, useCallback, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import type { ShopItem } from '../types';
import { api } from '../utils/api';
import {
  parseCsvQuestions,
  parseCsvAccounts,
  clearCache,
  type AdminQuestion,
  type AdminAccount,
  type AdminBadge,
} from '../utils/adminStorage';

type Tab = 'comptes' | 'questions' | 'boutique' | 'badges';

export default function AdminPage() {
  const { state } = useGame();
  const { logout } = useAuth();
  const darkMode = state.darkMode;
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';
  const inputBg = darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300';

  const [tab, setTab] = useState<Tab>('comptes');
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const inputCls = `w-full px-3 py-2 rounded-lg border-2 text-sm ${inputBg} focus:outline-none focus:ring-2 focus:ring-amber-500`;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className={`text-2xl font-bold ${textClass}`}>🛠️ Dashboard Admin</h1>
        <div className="flex gap-2">
          <button onClick={() => { clearCache(); window.location.reload(); }} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-3 py-2 text-xs rounded-lg border-2 border-amber-900">
            Recharger
          </button>
          <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-2 text-xs rounded-lg border-2 border-amber-900">
            Déconnexion
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {([
          ['comptes', '👤 Comptes'],
          ['questions', '❓ Questions'],
          ['boutique', '🛒 Boutique'],
          ['badges', '🏅 Badges'],
        ] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => { setTab(t); setShowForm(false); setEditingId(null); }}
            className={`px-4 py-2 font-bold text-sm rounded-lg border-2 border-amber-900 whitespace-nowrap ${
              tab === t ? 'theme-gradient text-white' : `${cardBg} ${textClass}`
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'comptes' && (
        <AccountsTab
          editingId={editingId} setEditingId={setEditingId}
          showForm={showForm} setShowForm={setShowForm}
          cardBg={cardBg} textClass={textClass} textSecondary={textSecondary} inputCls={inputCls}
        />
      )}
      {tab === 'questions' && (
        <QuestionsTab
          editingId={editingId} setEditingId={setEditingId}
          showForm={showForm} setShowForm={setShowForm}
          cardBg={cardBg} textClass={textClass} textSecondary={textSecondary} inputCls={inputCls} darkMode={darkMode}
        />
      )}
      {tab === 'boutique' && (
        <ShopTab
          editingId={editingId} setEditingId={setEditingId}
          showForm={showForm} setShowForm={setShowForm}
          cardBg={cardBg} textClass={textClass} textSecondary={textSecondary} inputCls={inputCls}
        />
      )}
      {tab === 'badges' && (
        <BadgesTab
          editingId={editingId} setEditingId={setEditingId}
          showForm={showForm} setShowForm={setShowForm}
          cardBg={cardBg} textClass={textClass} textSecondary={textSecondary} inputCls={inputCls}
        />
      )}
    </div>
  );
}

function AccountsTab({ editingId, setEditingId, showForm, setShowForm, cardBg, textClass, textSecondary, inputCls }: {
  editingId: string | number | null; setEditingId: (v: string | number | null) => void;
  showForm: boolean; setShowForm: (v: boolean) => void;
  cardBg: string; textClass: string; textSecondary: string; inputCls: string;
}) {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [form, setForm] = useState({ username: '', password: '', displayName: '', isAdmin: false, classe: '', dateNaissance: '' });
  const [csvText, setCsvText] = useState('');
  const [showCsv, setShowCsv] = useState(false);

  const load = useCallback(async () => {
    try {
      const list = await api.accounts.list();
      setAccounts(list.map((a) => ({ ...a, password: '••••••' })));
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (acc: AdminAccount) => {
    setForm({ username: acc.username, password: '', displayName: acc.displayName, isAdmin: acc.isAdmin, classe: acc.classe || '', dateNaissance: acc.dateNaissance || '' });
    setEditingId(acc.username);
    setShowForm(true);
  };

  const startCreate = () => {
    setForm({ username: '', password: '', displayName: '', isAdmin: false, classe: '', dateNaissance: '' });
    setEditingId(null);
    setShowForm(true);
  };

  const save = async () => {
    if (!form.username.trim() || !form.displayName.trim()) {
      alert("Nom d'utilisateur et nom affiché sont requis");
      return;
    }
    try {
      if (editingId !== null) {
        await api.accounts.update(editingId as string, {
          displayName: form.displayName,
          password: form.password || undefined,
          isAdmin: form.isAdmin,
          classe: form.classe,
          dateNaissance: form.dateNaissance,
        });
      } else {
        if (!form.password.trim()) {
          alert("Mot de passe requis pour un nouveau compte");
          return;
        }
        await api.accounts.register({
          username: form.username.toLowerCase(),
          password: form.password,
          displayName: form.displayName,
          isAdmin: form.isAdmin,
          classe: form.classe,
          dateNaissance: form.dateNaissance,
        });
      }
      await load();
      setShowForm(false);
      setEditingId(null);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const remove = async (username: string) => {
    if (!confirm('Supprimer ce compte ?')) return;
    try {
      await api.accounts.delete(username);
      await load();
    } catch {}
  };

  const importCsv = async () => {
    const parsed = parseCsvAccounts(csvText, accounts.map((a) => a.username));
    if (parsed.length === 0) return;
    for (const acc of parsed) {
      try {
        await api.accounts.register({
          username: acc.username,
          password: acc.password,
          displayName: acc.displayName,
          isAdmin: false,
          classe: acc.classe,
          dateNaissance: acc.dateNaissance,
        });
      } catch {}
    }
    await load();
    setCsvText('');
    setShowCsv(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <span className={`text-sm font-bold ${textSecondary}`}>{accounts.length} compte(s)</span>
        <div className="flex gap-2">
          <button onClick={() => setShowCsv(!showCsv)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 text-sm rounded-lg border-2 border-amber-900">
            📄 CSV
          </button>
          <button onClick={startCreate} className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 text-sm rounded-lg border-2 border-amber-900">
            + Nouveau
          </button>
        </div>
      </div>

      {showCsv && (
        <div className={`${cardBg} rounded-xl p-4 border-2 border-purple-500 mb-4 space-y-3`}>
          <h3 className={`font-bold ${textClass}`}>Import CSV — Comptes élèves</h3>
          <p className={`text-xs ${textSecondary}`}>Format : Nom;Prénom;Classe;Date de naissance;Mot de passe</p>
          <p className={`text-xs ${textSecondary}`}>L'username sera généré automatiquement (prenom.nom). Le mot de passe est optionnel (défaut: mdp123).</p>
          <textarea value={csvText} onChange={(e) => setCsvText(e.target.value)} rows={8} placeholder={"Dubois;Lucas;3ème B;15/03/2010;mdp123\nMartin;Emma;4ème A;22/07/2009;mdp456\nBernard;Thomas;3ème B;01/12/2010"} className={inputCls} />
          <div className="flex gap-2">
            <button onClick={importCsv} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg border-2 border-amber-900">
              Importer ({parseCsvAccounts(csvText, accounts.map((a) => a.username)).length} trouvé(s))
            </button>
            <button onClick={() => setShowCsv(false)} className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded-lg border-2 border-amber-900">Fermer</button>
          </div>
        </div>
      )}

      {showForm && (
        <div className={`${cardBg} rounded-xl p-4 border-2 border-amber-900 mb-4 space-y-3`}>
          <h3 className={`font-bold ${textClass}`}>{editingId !== null ? 'Modifier' : 'Créer'} un compte</h3>
          <input placeholder="Nom d'utilisateur" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} disabled={editingId !== null} className={inputCls} />
          <input placeholder={editingId !== null ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputCls} />
          <input placeholder="Nom affiché (Prénom Nom)" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className={inputCls} />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Classe (ex: 3ème B)" value={form.classe} onChange={(e) => setForm({ ...form, classe: e.target.value })} className={inputCls} />
            <input placeholder="Date de naissance" value={form.dateNaissance} onChange={(e) => setForm({ ...form, dateNaissance: e.target.value })} className={inputCls} />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isAdmin} onChange={(e) => setForm({ ...form, isAdmin: e.target.checked })} className="w-5 h-5" />
            <span className={`text-sm ${textClass}`}>Admin</span>
          </label>
          <div className="flex gap-2">
            <button onClick={save} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg border-2 border-amber-900">Enregistrer</button>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 rounded-lg border-2 border-amber-900">Annuler</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {accounts.map((acc) => (
          <div key={acc.username} className={`flex items-center gap-3 p-3 rounded-lg ${cardBg} border-2 border-amber-900`}>
            <span className="text-2xl">{acc.isAdmin ? '👑' : '👤'}</span>
            <div className="flex-1">
              <div className={`font-bold text-sm ${textClass}`}>{acc.displayName}</div>
              <div className={`text-xs ${textSecondary}`}>
                @{acc.username}
                {acc.classe && <> • 🏫 {acc.classe}</>}
                {acc.dateNaissance && <> • 🎂 {acc.dateNaissance}</>}
              </div>
            </div>
            {acc.isAdmin && <span className="text-xs font-bold text-yellow-500">ADMIN</span>}
            <button onClick={() => startEdit(acc)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 text-xs rounded-lg border-2 border-amber-900">✏️</button>
            <button onClick={() => remove(acc.username)} className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1 text-xs rounded-lg border-2 border-amber-900">🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuestionsTab({ editingId, setEditingId, showForm, setShowForm, cardBg, textClass, textSecondary, inputCls, darkMode }: {
  editingId: string | number | null; setEditingId: (v: string | number | null) => void;
  showForm: boolean; setShowForm: (v: boolean) => void;
  cardBg: string; textClass: string; textSecondary: string; inputCls: string; darkMode: boolean;
}) {
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [form, setForm] = useState({ question: '', opt1: '', opt2: '', opt3: '', opt4: '', correctAnswer: 0, explanation: '' });
  const [csvText, setCsvText] = useState('');
  const [showCsv, setShowCsv] = useState(false);

  const load = useCallback(async () => {
    try {
      setQuestions(await api.questions.list());
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (q: AdminQuestion) => {
    setForm({ question: q.question, opt1: q.options[0], opt2: q.options[1], opt3: q.options[2], opt4: q.options[3], correctAnswer: q.correctAnswer, explanation: q.explanation });
    setEditingId(q.id);
    setShowForm(true);
  };

  const startCreate = () => {
    setForm({ question: '', opt1: '', opt2: '', opt3: '', opt4: '', correctAnswer: 0, explanation: '' });
    setEditingId(null);
    setShowForm(true);
  };

  const save = async () => {
    if (!form.question.trim()) return;
    const opts = [form.opt1, form.opt2, form.opt3, form.opt4].filter((o) => o.trim());
    if (opts.length < 2) return;
    while (opts.length < 4) opts.push('');
    try {
      if (editingId !== null) {
        await api.questions.update(editingId as number, { question: form.question, options: opts, correctAnswer: form.correctAnswer, explanation: form.explanation });
      } else {
        await api.questions.create({ question: form.question, options: opts, correctAnswer: form.correctAnswer, explanation: form.explanation });
      }
      await load();
      clearCache();
      setShowForm(false);
      setEditingId(null);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Supprimer cette question ?')) return;
    try {
      await api.questions.delete(id);
      await load();
      clearCache();
    } catch {}
  };

  const importCsv = async () => {
    const parsed = parseCsvQuestions(csvText);
    if (parsed.length === 0) return;
    for (const q of parsed) {
      try {
        await api.questions.create(q);
      } catch {}
    }
    await load();
    clearCache();
    setCsvText('');
    setShowCsv(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <span className={`text-sm font-bold ${textSecondary}`}>{questions.length} question(s)</span>
        <div className="flex gap-2">
          <button onClick={() => setShowCsv(!showCsv)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 text-sm rounded-lg border-2 border-amber-900">
            📄 CSV
          </button>
          <button onClick={startCreate} className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 text-sm rounded-lg border-2 border-amber-900">
            + Nouveau
          </button>
        </div>
      </div>

      {showCsv && (
        <div className={`${cardBg} rounded-xl p-4 border-2 border-purple-500 mb-4 space-y-3`}>
          <h3 className={`font-bold ${textClass}`}>Import CSV</h3>
          <p className={`text-xs ${textSecondary}`}>Format : question;option1;option2;option3;option4;bonne_reponse(0-3);explication</p>
          <textarea value={csvText} onChange={(e) => setCsvText(e.target.value)} rows={6} placeholder="7 x 8 ?;54;56;58;64;1;7 × 8 = 56" className={inputCls} />
          <div className="flex gap-2">
            <button onClick={importCsv} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg border-2 border-amber-900">Importer ({parseCsvQuestions(csvText).length} trouvée(s))</button>
            <button onClick={() => setShowCsv(false)} className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded-lg border-2 border-amber-900">Fermer</button>
          </div>
        </div>
      )}

      {showForm && (
        <div className={`${cardBg} rounded-xl p-4 border-2 border-amber-900 mb-4 space-y-3`}>
          <h3 className={`font-bold ${textClass}`}>{editingId !== null ? 'Modifier' : 'Créer'} une question</h3>
          <input placeholder="Question" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className={inputCls} />
          <div className="grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`flex gap-2 items-center p-2 rounded-lg border-2 ${form.correctAnswer === i ? 'border-green-500 bg-green-500/10' : 'border-gray-600'}`}>
                <input type="radio" name="correct" checked={form.correctAnswer === i} onChange={() => setForm({ ...form, correctAnswer: i })} className="w-4 h-4" />
                <input placeholder={`Option ${i + 1}`} value={form[`opt${i + 1}` as keyof typeof form] as string} onChange={(e) => setForm({ ...form, [`opt${i + 1}`]: e.target.value })} className={`${inputCls} flex-1`} />
              </div>
            ))}
          </div>
          <input placeholder="Explication" value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} className={inputCls} />
          <div className="flex gap-2">
            <button onClick={save} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg border-2 border-amber-900">Enregistrer</button>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 rounded-lg border-2 border-amber-900">Annuler</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {questions.map((q) => (
          <div key={q.id} className={`p-3 rounded-lg ${cardBg} border-2 border-amber-900`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className={`font-bold text-sm ${textClass}`}>{q.question}</div>
                <div className={`text-xs ${textSecondary} mt-1`}>
                  {q.options.map((o, i) => (
                    <span key={i} className={`mr-2 ${i === q.correctAnswer ? 'text-green-500 font-bold' : ''}`}>{String.fromCharCode(65 + i)}: {o}</span>
                  ))}
                </div>
                <div className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>💡 {q.explanation}</div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(q)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2 py-1 text-xs rounded-lg border-2 border-amber-900">✏️</button>
                <button onClick={() => remove(q.id)} className="bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-1 text-xs rounded-lg border-2 border-amber-900">🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShopTab({ editingId, setEditingId, showForm, setShowForm, cardBg, textClass, textSecondary, inputCls }: {
  editingId: string | number | null; setEditingId: (v: string | number | null) => void;
  showForm: boolean; setShowForm: (v: boolean) => void;
  cardBg: string; textClass: string; textSecondary: string; inputCls: string;
}) {
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [form, setForm] = useState({ name: '', icon: '', type: 'avatar' as ShopItem['type'], price: 100, description: '', themeId: '' });
  const [filter, setFilter] = useState<string>('all');

  const load = useCallback(async () => {
    try {
      const items = await api.shop.list();
      setShopItems(items.map((i) => ({
        id: i.id, name: i.name, icon: i.icon, type: i.type as ShopItem['type'],
        price: i.price, description: i.description, ...(i.theme_id ? { themeId: i.theme_id } : {}),
      })));
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (item: ShopItem) => {
    setForm({ name: item.name, icon: item.icon, type: item.type, price: item.price, description: item.description, themeId: item.themeId || '' });
    setEditingId(item.id);
    setShowForm(true);
  };

  const startCreate = () => {
    setForm({ name: '', icon: '', type: 'avatar', price: 100, description: '', themeId: '' });
    setEditingId(null);
    setShowForm(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.icon.trim()) return;
    try {
      const payload = {
        name: form.name, icon: form.icon, type: form.type, price: form.price,
        description: form.description, ...(form.type === 'theme' && form.themeId ? { themeId: form.themeId } : {}),
      };
      if (editingId !== null) {
        await api.shop.update(editingId as number, payload);
      } else {
        await api.shop.create(payload);
      }
      await load();
      clearCache();
      setShowForm(false);
      setEditingId(null);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Supprimer cet item ?')) return;
    try {
      await api.shop.delete(id);
      await load();
      clearCache();
    } catch {}
  };

  const filtered = filter === 'all' ? shopItems : shopItems.filter((i) => i.type === filter);
  const types = ['all', 'avatar', 'boost', 'decoration', 'consumable', 'theme'];
  const typeLabels: Record<string, string> = { all: 'Tous', avatar: '👤 Avatars', boost: '⚡ Boosts', decoration: '🖼️ Décors', consumable: '🩹 Conso', theme: '🎨 Thèmes' };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <span className={`text-sm font-bold ${textSecondary}`}>{shopItems.length} item(s)</span>
        <button onClick={startCreate} className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 text-sm rounded-lg border-2 border-amber-900">
          + Nouveau
        </button>
      </div>

      <div className="flex gap-2 mb-3 overflow-x-auto">
        {types.map((t) => (
          <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1 text-xs font-bold rounded-lg border-2 border-amber-900 whitespace-nowrap ${filter === t ? 'theme-gradient text-white' : `${cardBg} ${textClass}`}`}>
            {typeLabels[t]}
          </button>
        ))}
      </div>

      {showForm && (
        <div className={`${cardBg} rounded-xl p-4 border-2 border-amber-900 mb-4 space-y-3`}>
          <h3 className={`font-bold ${textClass}`}>{editingId !== null ? 'Modifier' : 'Créer'} un item</h3>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
            <input placeholder="Icône (emoji)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ShopItem['type'] })} className={inputCls}>
              <option value="avatar">Avatar</option>
              <option value="boost">Boost</option>
              <option value="decoration">Décoration</option>
              <option value="consumable">Consommable</option>
              <option value="theme">Thème</option>
            </select>
            <input type="number" placeholder="Prix" value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })} className={inputCls} />
          </div>
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} />
          {form.type === 'theme' && (
            <input placeholder="Theme ID (ex: ocean)" value={form.themeId} onChange={(e) => setForm({ ...form, themeId: e.target.value })} className={inputCls} />
          )}
          <div className="flex gap-2">
            <button onClick={save} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg border-2 border-amber-900">Enregistrer</button>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 rounded-lg border-2 border-amber-900">Annuler</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((item) => (
          <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg ${cardBg} border-2 border-amber-900`}>
            <span className="text-2xl">{item.icon}</span>
            <div className="flex-1">
              <div className={`font-bold text-sm ${textClass}`}>{item.name}</div>
              <div className={`text-xs ${textSecondary}`}>{item.type} • 🪙 {item.price} • {item.description}</div>
            </div>
            <button onClick={() => startEdit(item)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2 py-1 text-xs rounded-lg border-2 border-amber-900">✏️</button>
            <button onClick={() => remove(item.id)} className="bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-1 text-xs rounded-lg border-2 border-amber-900">🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function BadgesTab({ editingId, setEditingId, showForm, setShowForm, cardBg, textClass, textSecondary, inputCls }: {
  editingId: string | number | null; setEditingId: (v: string | number | null) => void;
  showForm: boolean; setShowForm: (v: boolean) => void;
  cardBg: string; textClass: string; textSecondary: string; inputCls: string;
}) {
  const [badges, setBadges] = useState<AdminBadge[]>([]);
  const [form, setForm] = useState({ id: '', name: '', icon: '', description: '' });

  const load = useCallback(async () => {
    try {
      setBadges(await api.badges.list());
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (badge: AdminBadge) => {
    setForm({ id: badge.id, name: badge.name, icon: badge.icon, description: badge.description });
    setEditingId(badge.id);
    setShowForm(true);
  };

  const startCreate = () => {
    setForm({ id: '', name: '', icon: '', description: '' });
    setEditingId(null);
    setShowForm(true);
  };

  const save = async () => {
    if (!form.id.trim() || !form.name.trim() || !form.icon.trim()) return;
    try {
      if (editingId !== null) {
        await api.badges.update(editingId as string, { name: form.name, icon: form.icon, description: form.description });
      } else {
        await api.badges.create(form);
      }
      await load();
      clearCache();
      setShowForm(false);
      setEditingId(null);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Supprimer ce badge ?')) return;
    try {
      await api.badges.delete(id);
      await load();
      clearCache();
    } catch {}
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <span className={`text-sm font-bold ${textSecondary}`}>{badges.length} badge(s)</span>
        <button onClick={startCreate} className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 text-sm rounded-lg border-2 border-amber-900">
          + Nouveau
        </button>
      </div>

      {showForm && (
        <div className={`${cardBg} rounded-xl p-4 border-2 border-amber-900 mb-4 space-y-3`}>
          <h3 className={`font-bold ${textClass}`}>{editingId !== null ? 'Modifier' : 'Créer'} un badge</h3>
          <input placeholder="ID (ex: first_login)" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} disabled={editingId !== null} className={inputCls} />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
            <input placeholder="Icône (emoji)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className={inputCls} />
          </div>
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} />
          <div className="flex gap-2">
            <button onClick={save} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg border-2 border-amber-900">Enregistrer</button>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 rounded-lg border-2 border-amber-900">Annuler</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {badges.map((badge) => (
          <div key={badge.id} className={`flex items-center gap-3 p-3 rounded-lg ${cardBg} border-2 border-amber-900`}>
            <span className="text-2xl">{badge.icon}</span>
            <div className="flex-1">
              <div className={`font-bold text-sm ${textClass}`}>{badge.name}</div>
              <div className={`text-xs ${textSecondary}`}>{badge.id} • {badge.description}</div>
            </div>
            <button onClick={() => startEdit(badge)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2 py-1 text-xs rounded-lg border-2 border-amber-900">✏️</button>
            <button onClick={() => remove(badge.id)} className="bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-1 text-xs rounded-lg border-2 border-amber-900">🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}
