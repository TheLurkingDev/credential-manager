import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

export class DatabaseService {
    private db: Database.Database | null = null;
    private static instance: DatabaseService;

    private constructor() {
        try {
            // Store database in user's app data directory
            const dbPath = path.join(app.getPath('userData'), 'credentials.db');
            console.log('Initializing database at:', dbPath);
            
            this.db = new Database(dbPath, {
                verbose: console.log // Enable query logging
            });
            
            // Enable foreign keys
            this.db.pragma('foreign_keys = ON');

            // Initialize database schema
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
        try {
            // Create credentials table
            this.db?.exec(`
                CREATE TABLE IF NOT EXISTS credentials (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    username TEXT,
                    password TEXT NOT NULL,
                    url TEXT,
                    notes TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // Create categories table for organizing credentials
            this.db?.exec(`
                CREATE TABLE IF NOT EXISTS categories (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // Create credential_categories junction table
            this.db?.exec(`
                CREATE TABLE IF NOT EXISTS credential_categories (
                    credential_id INTEGER,
                    category_id INTEGER,
                    FOREIGN KEY (credential_id) REFERENCES credentials(id) ON DELETE CASCADE,
                    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
                    PRIMARY KEY (credential_id, category_id)
                );
            `);
            
            // Verify tables were created
            const tables = this.db?.prepare(`
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name IN ('credentials', 'categories', 'credential_categories');
            `).all();
            
            console.log('Created tables:', tables);
            console.log('Schema initialized successfully');

            // Test a simple insert and select to verify table functionality
            try {
                // Insert a test category
                this.db?.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)').run('Test Category');
                
                // Verify the insert
                const testCategory = this.db?.prepare('SELECT * FROM categories WHERE name = ?').get('Test Category');
                console.log('Test category record:', testCategory);
            } catch (error) {
                console.error('Table functionality test failed:', error);
                throw error;
            }
        } catch (error) {
            console.error('Failed to initialize schema:', error);
            throw error;
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

    // Test method to verify database connection
    public testConnection(): boolean {
        try {
            if (!this.db) {
                throw new Error('Database not initialized');
            }
            // Simple test query
            const result = this.db.prepare('SELECT 1 AS test').get();
            console.log('Database connection test result:', result);
            return true;
        } catch (error) {
            console.error('Database connection test failed:', error);
            return false;
        }
    }
}
