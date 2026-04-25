import Database from 'better-sqlite3';
import { join } from 'path';

const db = new Database(join(process.cwd(), 'database.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    is_admin INTEGER DEFAULT 0,
    classe TEXT DEFAULT '',
    date_naissance TEXT DEFAULT '',
    avatar TEXT DEFAULT '',
    theme TEXT DEFAULT 'default',
    equipped_decoration INTEGER DEFAULT NULL,
    coins INTEGER DEFAULT 500,
    total_xp INTEGER DEFAULT 0,
    hp INTEGER DEFAULT 100,
    max_hp INTEGER DEFAULT 100,
    force INTEGER DEFAULT 10,
    stat_points INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    last_login_date TEXT DEFAULT '',
    boost_xp_until TEXT DEFAULT '',
    shield_until TEXT DEFAULT '',
    time_bonus INTEGER DEFAULT 0,
    consulted_chapters TEXT DEFAULT '[]',
    purchased_items TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS user_backpack (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    item_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    item_icon TEXT NOT NULL,
    item_type TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
    UNIQUE(username, item_id)
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer INTEGER NOT NULL,
    explanation TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS shop_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    type TEXT NOT NULL,
    price INTEGER NOT NULL,
    description TEXT DEFAULT '',
    theme_id TEXT DEFAULT NULL
  );

  CREATE TABLE IF NOT EXISTS badges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    description TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS user_badges (
    username TEXT NOT NULL,
    badge_id TEXT NOT NULL,
    unlocked INTEGER DEFAULT 0,
    unlocked_at TEXT DEFAULT NULL,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
    UNIQUE(username, badge_id)
  );

  CREATE TABLE IF NOT EXISTS friends (
    username TEXT NOT NULL,
    friend_name TEXT NOT NULL,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
    UNIQUE(username, friend_name)
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS private_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_user TEXT NOT NULL,
    to_user TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS guilds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    emoji TEXT NOT NULL,
    chef TEXT NOT NULL,
    chef_adjoint TEXT DEFAULT NULL,
    max_members INTEGER DEFAULT 10,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    treasury INTEGER DEFAULT 0,
    entry_fee INTEGER DEFAULT 50,
    payout_percentage INTEGER DEFAULT 10,
    last_payout_date TEXT DEFAULT '',
    pending_chef_transfer TEXT DEFAULT NULL,
    pending_chef_transfer_date TEXT DEFAULT NULL
  );

  CREATE TABLE IF NOT EXISTS guild_members (
    guild_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
    UNIQUE(username)
  );

  CREATE TABLE IF NOT EXISTS guild_pending_requests (
    guild_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE,
    UNIQUE(guild_id, username)
  );

  CREATE TABLE IF NOT EXISTS guild_missions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id INTEGER NOT NULL,
    label TEXT NOT NULL,
    icon TEXT NOT NULL,
    xp_reward INTEGER DEFAULT 0,
    coins_reward INTEGER DEFAULT 0,
    completed_by TEXT DEFAULT '[]',
    rewarded INTEGER DEFAULT 0,
    date TEXT NOT NULL,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS duel_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    opponent TEXT NOT NULL,
    opponent_avatar TEXT NOT NULL,
    result TEXT NOT NULL,
    date TEXT DEFAULT (datetime('now')),
    xp_gained INTEGER DEFAULT 0,
    coins_gained INTEGER DEFAULT 0,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS daily_rewards (
    username TEXT NOT NULL,
    day INTEGER NOT NULL,
    coins INTEGER NOT NULL,
    xp INTEGER NOT NULL,
    icon TEXT NOT NULL,
    claimed INTEGER DEFAULT 0,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
    UNIQUE(username, day)
  );

  CREATE TABLE IF NOT EXISTS training_state (
    username TEXT PRIMARY KEY,
    today_count INTEGER DEFAULT 0,
    last_reset_date TEXT DEFAULT '',
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    completed_at TEXT DEFAULT (datetime('now')),
    status TEXT DEFAULT 'passed',
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
  );
`);

export default db;
