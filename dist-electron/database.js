"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const crypto_1 = __importDefault(require("crypto"));
class DatabaseService {
    constructor() {
        this.db = null;
        try {
            const dbPath = path_1.default.join(electron_1.app.getPath('userData'), 'credentials.db');
            console.log('Initializing database at:', dbPath);
            this.db = new better_sqlite3_1.default(dbPath);
            this.db.pragma('foreign_keys = ON');
            this.initSchema();
            console.log('Database initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize database:', error);
            throw error;
        }
    }
    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
    initSchema() {
        const queries = [
            `DROP TABLE IF EXISTS credential_categories;`,
            `DROP TABLE IF EXISTS credentials;`,
            `DROP TABLE IF EXISTS categories;`,
            `DROP TABLE IF EXISTS users;`,
            `
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );`,
            `
            CREATE TABLE credentials (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                username TEXT,
                password TEXT NOT NULL,
                url TEXT,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );`,
            `
            CREATE TABLE categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );`,
            `
            CREATE TABLE credential_categories (
                credential_id INTEGER,
                category_id INTEGER,
                FOREIGN KEY (credential_id) REFERENCES credentials(id) ON DELETE CASCADE,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
                PRIMARY KEY (credential_id, category_id)
            );`
        ];
        try {
            this.db?.transaction(() => {
                queries.forEach(query => {
                    this.db?.exec(query);
                });
            })();
            const tables = this.db?.prepare(`
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name IN ('users', 'credentials', 'categories', 'credential_categories');
            `).all();
            console.log('Created tables:', tables);
        }
        catch (error) {
            console.error('Failed to initialize schema:', error);
            throw error;
        }
    }
    createUser(username, password) {
        try {
            const salt = crypto_1.default.randomBytes(16).toString('hex');
            const hash = crypto_1.default.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
            const stmt = this.db?.prepare('INSERT INTO users (username, password_hash, salt) VALUES (?, ?, ?)');
            stmt?.run(username, hash, salt);
            return true;
        }
        catch (error) {
            console.error('Failed to create user:', error);
            return false;
        }
    }
    verifyUser(username, password) {
        try {
            const user = this.db?.prepare('SELECT * FROM users WHERE username = ?').get(username);
            if (!user) {
                return false;
            }
            const hash = crypto_1.default.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');
            return hash === user.password_hash;
        }
        catch (error) {
            console.error('Failed to verify user:', error);
            return false;
        }
    }
    close() {
        try {
            if (this.db) {
                this.db.close();
                console.log('Database connection closed');
            }
        }
        catch (error) {
            console.error('Error closing database:', error);
            throw error;
        }
    }
}
exports.DatabaseService = DatabaseService;
