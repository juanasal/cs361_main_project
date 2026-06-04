const Database = require("better-sqlite3");

const db = new Database("users.db");

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
  )
`).run();

const userColumns = db.prepare("PRAGMA table_info(users)").all();
const hasEmailColumn = userColumns.some((column) => column.name === "email");

if (!hasEmailColumn) {
  db.prepare("ALTER TABLE users ADD COLUMN email TEXT").run();
  db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users(email)").run();
}

db.prepare(`
  CREATE TABLE IF NOT EXISTS user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    language_to_learn TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`).run();

const insertUser = db.prepare(
  "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)"
);
const insertUserPreferences = db.prepare(
  "INSERT INTO user_preferences (user_id, language_to_learn) VALUES (?, ?)"
);

const createUserTransaction = db.transaction((username, email, passwordHash, language) => {
  const result = insertUser.run(username, email, passwordHash);
  insertUserPreferences.run(result.lastInsertRowid, language);

  return result.lastInsertRowid;
});

function createUser(username, email, passwordHash, language) {
  return createUserTransaction(username, email, passwordHash, language);
}

function findUserByUsernameOrEmail(identifier) {
  return db
    .prepare("SELECT * FROM users WHERE username = ? OR email = ?")
    .get(identifier, identifier.toLowerCase());
}

function getUserDashboardStats() {
  return {
    gamesCompleted: 0,
    averageGameScore: 0,
    readingsCompleted: 0,
    averageQuizScore: 0
  };
}

module.exports = {
  createUser,
  findUserByUsernameOrEmail,
  getUserDashboardStats
};
