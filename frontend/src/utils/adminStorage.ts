import type { ShopItem } from '../types';
import { SHOP_ITEMS, DUEL_QUESTIONS, BADGE_DEFS } from '../data/constants';
import { api, getToken } from './api';

export interface AdminQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface AdminAccount {
  username: string;
  password: string;
  displayName: string;
  isAdmin: boolean;
  classe: string;
  dateNaissance: string;
}

export interface AdminBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface AdminData {
  accounts: AdminAccount[];
  questions: AdminQuestion[];
  shopItems: ShopItem[];
  badges: AdminBadge[];
}

const STORAGE_KEY = 'goat-admin-data';

let cachedQuestions: AdminQuestion[] | null = null;
let cachedShopItems: ShopItem[] | null = null;
let cachedBadges: AdminBadge[] | null = null;
let cachedAccounts: AdminAccount[] | null = null;

export function clearCache() {
  cachedQuestions = null;
  cachedShopItems = null;
  cachedBadges = null;
  cachedAccounts = null;
}

export function loadAdminData(): AdminData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function saveAdminData(data: AdminData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getNextId(items: { id: number }[]): number {
  if (items.length === 0) return 1;
  return Math.max(...items.map((i) => i.id)) + 1;
}

export function parseCsvQuestions(csv: string): Omit<AdminQuestion, 'id'>[] {
  const lines = csv.trim().split('\n');
  const results: Omit<AdminQuestion, 'id'>[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('question')) continue;
    const parts = line.split(';');
    if (parts.length < 6) continue;
    const [question, opt1, opt2, opt3, opt4, correctStr, explanation] = parts;
    const correct = parseInt(correctStr, 10);
    if (isNaN(correct) || correct < 0 || correct > 3) continue;
    results.push({
      question: question.trim(),
      options: [opt1.trim(), opt2.trim(), opt3.trim(), opt4.trim()],
      correctAnswer: correct,
      explanation: (explanation || '').trim(),
    });
  }
  return results;
}

export function parseCsvAccounts(csv: string, existingUsernames: string[]): AdminAccount[] {
  const lines = csv.trim().split('\n');
  const results: AdminAccount[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.toLowerCase().startsWith('nom')) continue;
    const parts = line.split(';');
    if (parts.length < 5) continue;
    const [nom, prenom, classe, dateNaissance, password] = parts.map((s) => s.trim());
    if (!nom || !prenom) continue;
    const base = `${prenom.toLowerCase()}.${nom.toLowerCase()}`.replace(/[^a-z0-9.]/g, '');
    let username = base;
    let suffix = 1;
    const allUsernames = [...existingUsernames, ...results.map((r) => r.username)];
    while (allUsernames.includes(username)) {
      suffix++;
      username = `${base}${suffix}`;
    }
    results.push({
      username,
      password: password || 'mdp123',
      displayName: `${prenom} ${nom}`,
      isAdmin: false,
      classe: classe || '',
      dateNaissance: dateNaissance || '',
    });
  }
  return results;
}

const DEFAULT_ACCOUNTS: AdminAccount[] = [
  { username: 'lucas', password: 'mdp123', displayName: 'Lucas Dubois', isAdmin: true, classe: '', dateNaissance: '' },
  { username: 'emma', password: 'mdp123', displayName: 'Emma Martin', isAdmin: false, classe: '', dateNaissance: '' },
  { username: 'thomas', password: 'mdp123', displayName: 'Thomas Bernard', isAdmin: false, classe: '', dateNaissance: '' },
];

export async function getAdminAccountsAsync(): Promise<AdminAccount[]> {
  if (!getToken()) return DEFAULT_ACCOUNTS;
  try {
    const accounts = await api.accounts.list();
    cachedAccounts = accounts.map((a) => ({ ...a, password: '••••••' }));
    return cachedAccounts;
  } catch {
    return cachedAccounts || DEFAULT_ACCOUNTS;
  }
}

export function getAdminAccounts(): AdminAccount[] {
  if (cachedAccounts) return cachedAccounts;
  const saved = loadAdminData();
  return saved?.accounts || DEFAULT_ACCOUNTS;
}

export async function getAdminQuestionsAsync(): Promise<AdminQuestion[]> {
  try {
    const questions = await api.questions.list();
    cachedQuestions = questions;
    return questions;
  } catch {
    return cachedQuestions || DUEL_QUESTIONS.map((q, i) => ({ ...q, id: i + 1 }));
  }
}

export function getAdminQuestions(): AdminQuestion[] {
  if (cachedQuestions) return cachedQuestions;
  const saved = loadAdminData();
  if (saved?.questions && saved.questions.length > 0) return saved.questions;
  return DUEL_QUESTIONS.map((q, i) => ({ ...q, id: i + 1 }));
}

export async function getAdminShopItemsAsync(): Promise<ShopItem[]> {
  try {
    const items = await api.shop.list();
    cachedShopItems = items.map((i) => ({
      id: i.id,
      name: i.name,
      icon: i.icon,
      type: i.type as ShopItem['type'],
      price: i.price,
      description: i.description,
      ...(i.theme_id ? { themeId: i.theme_id } : {}),
    }));
    return cachedShopItems;
  } catch {
    return cachedShopItems || SHOP_ITEMS;
  }
}

export function getAdminShopItems(): ShopItem[] {
  if (cachedShopItems) return cachedShopItems;
  const saved = loadAdminData();
  if (saved?.shopItems && saved.shopItems.length > 0) return saved.shopItems;
  return SHOP_ITEMS;
}

export async function getAdminBadgesAsync(): Promise<AdminBadge[]> {
  try {
    const badges = await api.badges.list();
    cachedBadges = badges;
    return badges;
  } catch {
    return cachedBadges || BADGE_DEFS.map((b) => ({ ...b }));
  }
}

export function getAdminBadges(): AdminBadge[] {
  if (cachedBadges) return cachedBadges;
  const saved = loadAdminData();
  if (saved?.badges && saved.badges.length > 0) return saved.badges;
  return BADGE_DEFS.map((b) => ({ ...b }));
}
