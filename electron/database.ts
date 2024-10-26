import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import crypto from 'crypto';

interface User {
    id: number;
    username: string;
    password_hash: string;
    salt: string;
    created_at: string;
}

export class DatabaseService {
    private db: Database.Database | null = null;
    private static instance: DatabaseService;

    private constructor() {
        try {
            const dbPath = path.join(app.getPath('userData'), 'credentials.db');
            console.log('Initializing database at:', dbPath);
            
            this.db = new Database(dbPath);
            this.db.pragma('foreign_keys = ON');
            this.initSchema();
            
            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Failed to initialize database:', error);
            throw error;
        }
    }

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    private initSchema(): void {
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
        } catch (error) {
            console.error('Failed to initialize schema:', error);
            throw error;
        }
    }

    public createUser(username: string, password: string): boolean {
        try {
            const salt = crypto.randomBytes(16).toString('hex');
            const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
            
            const stmt = this.db?.prepare('INSERT INTO users (username, password_hash, salt) VALUES (?, ?, ?)');
            stmt?.run(username, hash, salt);
            
            return true;
        } catch (error) {
            console.error('Failed to create user:', error);
            return false;
        }
    }

    public verifyUser(username: string, password: string): boolean {
        try {
            const user = this.db?.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;
            
            if (!user) {
                return false;
            }

            const hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');
            return hash === user.password_hash;
        } catch (error) {
            console.error('Failed to verify user:', error);
            return false;
        }
    }

    public close(): void {
        try {
            if (this.db) {
                this.db.close();
                console.log('Database connection closed');
            }
        } catch (error) {
            console.error('Error closing database:', error);
            throw error;
        }
    }
}
