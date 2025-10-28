/**
 * Database Connection and Initialization
 * Handles SQLite database setup with proper relational structure
 */
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DatabaseManager {
    constructor(dbPath = null) {
        this.dbPath = dbPath || path.join(__dirname, '../../data/microlearn.db');
        this.db = null;
        this.isInitialized = false;
    }

    /**
     * Initialize database connection and create tables
     */
    async initialize() {
        try {
            // Create database connection
            this.db = new Database(this.dbPath);
            
            // Enable foreign key constraints
            this.db.pragma('foreign_keys = ON');
            
            // Create tables
            await this.createTables();
            
            // Create indexes for performance
            await this.createIndexes();
            
            this.isInitialized = true;
            console.log('✅ Database initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            throw error;
        }
    }

    /**
     * Create database tables with modular level-based structure
     */
    async createTables() {
        // Keep original learning_nodes table for backward compatibility
        const createNodesTable = `
            CREATE TABLE IF NOT EXISTS learning_nodes (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                mastery_percentage INTEGER DEFAULT 0 CHECK(mastery_percentage >= 0 AND mastery_percentage <= 100),
                last_practiced DATETIME,
                notes TEXT DEFAULT '',
                parent_id TEXT NULL,
                node_type TEXT DEFAULT 'concept',
                metadata TEXT DEFAULT '{}',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                
                FOREIGN KEY (parent_id) REFERENCES learning_nodes(id) ON DELETE CASCADE
            )
        `;

        this.db.exec(createNodesTable);
        console.log('✅ Database tables created');
    }

    /**
     * Create database indexes for performance
     */
    async createIndexes() {
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_nodes_parent_id ON learning_nodes(parent_id)',
            'CREATE INDEX IF NOT EXISTS idx_nodes_name ON learning_nodes(name)',
            'CREATE INDEX IF NOT EXISTS idx_nodes_mastery ON learning_nodes(mastery_percentage)',
            'CREATE INDEX IF NOT EXISTS idx_nodes_created_at ON learning_nodes(created_at)'
        ];

        indexes.forEach(index => this.db.exec(index));
        console.log('✅ Database indexes created');
    }

    /**
     * Get database connection
     */
    getConnection() {
        if (!this.isInitialized) {
            throw new Error('Database not initialized. Call initialize() first.');
        }
        return this.db;
    }

    /**
     * Execute a prepared statement with parameters
     */
    execute(sql, params = []) {
        const stmt = this.db.prepare(sql);
        return stmt.run(params);
    }

    /**
     * Query database and return results
     */
    query(sql, params = []) {
        const stmt = this.db.prepare(sql);
        return stmt.all(params);
    }

    /**
     * Query database and return single result
     */
    queryOne(sql, params = []) {
        const stmt = this.db.prepare(sql);
        return stmt.get(params);
    }

    /**
     * Begin transaction
     */
    beginTransaction() {
        return this.db.transaction(() => {});
    }

    /**
     * Execute multiple operations in a transaction
     */
    transaction(operations) {
        const trans = this.db.transaction(operations);
        return trans();
    }

    /**
     * Get all root nodes (nodes with no parent)
     */
    getRootNodes() {
        return this.query('SELECT * FROM learning_nodes WHERE parent_id IS NULL ORDER BY created_at ASC');
    }

    /**
     * Get children of a specific node
     */
    getChildren(parentId) {
        return this.query('SELECT * FROM learning_nodes WHERE parent_id = ? ORDER BY created_at ASC', [parentId]);
    }

    /**
     * Get a node by ID
     */
    getNode(id) {
        return this.queryOne('SELECT * FROM learning_nodes WHERE id = ?', [id]);
    }

    /**
     * Get full tree path for a node (from root to node)
     */
    getNodePath(nodeId) {
        const sql = `
            WITH RECURSIVE node_path AS (
                SELECT id, name, parent_id, node_type, mastery_percentage, 0 as level
                FROM learning_nodes WHERE id = ?
                UNION ALL
                SELECT n.id, n.name, n.parent_id, n.node_type, n.mastery_percentage, np.level + 1
                FROM learning_nodes n
                JOIN node_path np ON n.id = np.parent_id
            )
            SELECT * FROM node_path ORDER BY level DESC
        `;
        return this.query(sql, [nodeId]);
    }

    /**
     * Get all descendants of a node
     */
    getDescendants(nodeId) {
        const sql = `
            WITH RECURSIVE descendants AS (
                SELECT id, name, parent_id, node_type, mastery_percentage, 1 as level
                FROM learning_nodes WHERE parent_id = ?
                UNION ALL
                SELECT n.id, n.name, n.parent_id, n.node_type, n.mastery_percentage, d.level + 1
                FROM learning_nodes n
                JOIN descendants d ON n.parent_id = d.id
            )
            SELECT * FROM descendants ORDER BY level, name ASC
        `;
        return this.query(sql, [nodeId]);
    }

    /**
     * Search nodes by name or notes
     */
    searchNodes(query) {
        const searchTerm = `%${query}%`;
        return this.query(`
            SELECT * FROM learning_nodes 
            WHERE name LIKE ? OR notes LIKE ? 
            ORDER BY mastery_percentage DESC, created_at ASC
        `, [searchTerm, searchTerm]);
    }

    /**
     * Get nodes by mastery range
     */
    getNodesByMastery(minMastery = 0, maxMastery = 100) {
        return this.query(`
            SELECT * FROM learning_nodes 
            WHERE mastery_percentage >= ? AND mastery_percentage <= ? 
            ORDER BY mastery_percentage DESC
        `, [minMastery, maxMastery]);
    }

    // Level-based operations for modular structure
    getLevelNodes(level) {
        const sql = `SELECT * FROM level_${level}_nodes ORDER BY created_at DESC`;
        return this.query(sql);
    }

    getLevelNode(level, id) {
        const sql = `SELECT * FROM level_${level}_nodes WHERE id = ?`;
        return this.queryOne(sql, [id]);
    }

    getLevelChildren(level, parentId) {
        const sql = `SELECT * FROM level_${level}_nodes WHERE parent_id = ? ORDER BY name ASC`;
        return this.query(sql, [parentId]);
    }

    getLevelRootNodes(level) {
        const sql = `SELECT * FROM level_${level}_nodes WHERE parent_id IS NULL ORDER BY name ASC`;
        return this.query(sql);
    }

    createLevelNode(level, nodeData) {
        const sql = `
            INSERT INTO level_${level}_nodes 
            (id, name, content, mastery_percentage, last_practiced, notes, parent_id, node_type, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        return this.execute(sql, [
            nodeData.id,
            nodeData.name,
            nodeData.content || '',
            nodeData.mastery_percentage || 0,
            nodeData.last_practiced || null,
            nodeData.notes || '',
            nodeData.parent_id || null,
            nodeData.node_type || 'concept',
            JSON.stringify(nodeData.metadata || {})
        ]);
    }

    updateLevelNode(level, id, updates) {
        const fields = [];
        const values = [];
        
        Object.keys(updates).forEach(key => {
            if (key === 'metadata') {
                fields.push(`${key} = ?`);
                values.push(JSON.stringify(updates[key]));
            } else {
                fields.push(`${key} = ?`);
                values.push(updates[key]);
            }
        });
        
        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);
        
        const sql = `UPDATE level_${level}_nodes SET ${fields.join(', ')} WHERE id = ?`;
        return this.execute(sql, values);
    }

    deleteLevelNode(level, id) {
        const sql = `DELETE FROM level_${level}_nodes WHERE id = ?`;
        return this.execute(sql, [id]);
    }

    searchLevelNodes(level, query) {
        const searchTerm = `%${query.toLowerCase()}%`;
        const sql = `
            SELECT * FROM level_${level}_nodes 
            WHERE LOWER(name) LIKE ? OR LOWER(content) LIKE ? OR LOWER(notes) LIKE ?
            ORDER BY name ASC
        `;
        return this.query(sql, [searchTerm, searchTerm, searchTerm]);
    }

    // User management operations
    createUser(userData) {
        const sql = `
            INSERT INTO users (id, username, email)
            VALUES (?, ?, ?)
        `;
        return this.execute(sql, [userData.id, userData.username, userData.email]);
    }

    getUser(id) {
        const sql = `SELECT * FROM users WHERE id = ?`;
        return this.queryOne(sql, [id]);
    }

    getUserByUsername(username) {
        const sql = `SELECT * FROM users WHERE username = ?`;
        return this.queryOne(sql, [username]);
    }

    // User progress operations
    getUserProgress(userId, level = null) {
        let sql = `
            SELECT up.*, u.username 
            FROM user_progress up
            JOIN users u ON up.user_id = u.id
            WHERE up.user_id = ?
        `;
        const params = [userId];
        
        if (level) {
            sql += ` AND up.level = ?`;
            params.push(level);
        }
        
        sql += ` ORDER BY up.level, up.created_at DESC`;
        return this.query(sql, params);
    }

    updateUserProgress(userId, nodeId, level, progressData) {
        const sql = `
            INSERT OR REPLACE INTO user_progress 
            (id, user_id, node_id, level, mastery_percentage, last_practiced, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        return this.execute(sql, [
            `${userId}_${nodeId}_${level}`,
            userId,
            nodeId,
            level,
            progressData.mastery_percentage || 0,
            progressData.last_practiced || new Date().toISOString(),
            progressData.notes || ''
        ]);
    }

    /**
     * Close database connection
     */
    close() {
        if (this.db) {
            this.db.close();
            this.isInitialized = false;
            console.log('✅ Database connection closed');
        }
    }

    /**
     * Check if database is ready
     */
    isReady() {
        return this.isInitialized && this.db !== null;
    }
}

// Export singleton instance
export const dbManager = new DatabaseManager();
export default dbManager;
