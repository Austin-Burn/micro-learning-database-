/**
 * Database Migration System
 * Handles database schema updates and data migrations
 */
import { dbManager } from './database.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class MigrationManager {
    constructor() {
        this.migrations = new Map();
        this.currentVersion = 0;
    }

    /**
     * Register a migration
     * @param {number} version - Migration version number
     * @param {string} description - Migration description
     * @param {Function} up - Migration function
     * @param {Function} down - Rollback function
     */
    registerMigration(version, description, up, down) {
        this.migrations.set(version, {
            version,
            description,
            up,
            down
        });
    }

    /**
     * Initialize migration system
     */
    async initialize() {
        await dbManager.initialize();
        
        // Create migrations table if it doesn't exist
        const createMigrationsTable = `
            CREATE TABLE IF NOT EXISTS migrations (
                version INTEGER PRIMARY KEY,
                description TEXT NOT NULL,
                applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        dbManager.execute(createMigrationsTable);
        
        // Get current database version
        const currentVersion = dbManager.queryOne('SELECT MAX(version) as version FROM migrations');
        this.currentVersion = currentVersion?.version || 0;
        
        console.log(`📊 Current database version: ${this.currentVersion}`);
    }

    /**
     * Run all pending migrations
     */
    async migrate() {
        await this.initialize();
        
        const pendingMigrations = Array.from(this.migrations.keys())
            .filter(version => version > this.currentVersion)
            .sort((a, b) => a - b);

        if (pendingMigrations.length === 0) {
            console.log('✅ Database is up to date');
            return;
        }

        console.log(`🔄 Running ${pendingMigrations.length} pending migrations...`);

        for (const version of pendingMigrations) {
            const migration = this.migrations.get(version);
            console.log(`📝 Applying migration ${version}: ${migration.description}`);
            
            try {
                await migration.up(dbManager);
                
                // Record migration
                dbManager.execute(
                    'INSERT INTO migrations (version, description) VALUES (?, ?)',
                    [version, migration.description]
                );
                
                console.log(`✅ Migration ${version} applied successfully`);
            } catch (error) {
                console.error(`❌ Migration ${version} failed:`, error);
                throw error;
            }
        }

        console.log('🎉 All migrations completed successfully');
    }

    /**
     * Rollback to a specific version
     * @param {number} targetVersion - Target version to rollback to
     */
    async rollback(targetVersion) {
        await this.initialize();
        
        const migrationsToRollback = Array.from(this.migrations.keys())
            .filter(version => version > targetVersion)
            .sort((a, b) => b - a); // Reverse order for rollback

        if (migrationsToRollback.length === 0) {
            console.log('✅ No migrations to rollback');
            return;
        }

        console.log(`🔄 Rolling back ${migrationsToRollback.length} migrations...`);

        for (const version of migrationsToRollback) {
            const migration = this.migrations.get(version);
            console.log(`📝 Rolling back migration ${version}: ${migration.description}`);
            
            try {
                await migration.down(dbManager);
                
                // Remove migration record
                dbManager.execute('DELETE FROM migrations WHERE version = ?', [version]);
                
                console.log(`✅ Migration ${version} rolled back successfully`);
            } catch (error) {
                console.error(`❌ Rollback ${version} failed:`, error);
                throw error;
            }
        }

        console.log('🎉 All rollbacks completed successfully');
    }

    /**
     * Get migration status
     */
    async status() {
        await this.initialize();
        
        const appliedMigrations = dbManager.query('SELECT * FROM migrations ORDER BY version ASC');
        const allMigrations = Array.from(this.migrations.values()).sort((a, b) => a.version - b.version);
        
        console.log('\n📊 Migration Status:');
        console.log('==================');
        
        allMigrations.forEach(migration => {
            const applied = appliedMigrations.find(m => m.version === migration.version);
            const status = applied ? '✅ Applied' : '⏳ Pending';
            const appliedAt = applied ? ` (${applied.applied_at})` : '';
            
            console.log(`${status} ${migration.version}: ${migration.description}${appliedAt}`);
        });
        
        console.log(`\nCurrent version: ${this.currentVersion}`);
        console.log(`Latest available: ${Math.max(...allMigrations.map(m => m.version))}`);
    }
}

// Create migration manager instance
export const migrationManager = new MigrationManager();

// Register initial migrations
migrationManager.registerMigration(
    1,
    'Create initial learning nodes table',
    async (db) => {
        const sql = `
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
        db.execute(sql);
    },
    async (db) => {
        db.execute('DROP TABLE IF EXISTS learning_nodes');
    }
);

migrationManager.registerMigration(
    2,
    'Add AI decisions table',
    async (db) => {
        const sql = `
            CREATE TABLE IF NOT EXISTS ai_decisions (
                id TEXT PRIMARY KEY,
                node_id TEXT NOT NULL,
                level INTEGER NOT NULL,
                decision_type TEXT NOT NULL,
                selected_node_id TEXT NULL,
                reasoning TEXT NOT NULL,
                confidence_score INTEGER DEFAULT 0 CHECK(confidence_score >= 0 AND confidence_score <= 100),
                context_data TEXT DEFAULT '{}',
                parent_decisions TEXT DEFAULT '[]',
                alternatives_considered TEXT DEFAULT '[]',
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                ai_model_version TEXT DEFAULT 'v2.1',
                
                FOREIGN KEY (node_id) REFERENCES learning_nodes(id) ON DELETE CASCADE,
                FOREIGN KEY (selected_node_id) REFERENCES learning_nodes(id) ON DELETE SET NULL
            )
        `;
        db.execute(sql);
    },
    async (db) => {
        db.execute('DROP TABLE IF EXISTS ai_decisions');
    }
);

migrationManager.registerMigration(
    3,
    'Add learning path history table',
    async (db) => {
        const sql = `
            CREATE TABLE IF NOT EXISTS learning_path_history (
                id TEXT PRIMARY KEY,
                node_id TEXT NOT NULL,
                level INTEGER NOT NULL,
                decision_type TEXT NOT NULL,
                reasoning TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                
                FOREIGN KEY (node_id) REFERENCES learning_nodes(id) ON DELETE CASCADE
            )
        `;
        db.execute(sql);
    },
    async (db) => {
        db.execute('DROP TABLE IF EXISTS learning_path_history');
    }
);

migrationManager.registerMigration(
    4,
    'Add AI metadata table',
    async (db) => {
        const sql = `
            CREATE TABLE IF NOT EXISTS ai_metadata (
                id TEXT PRIMARY KEY,
                node_id TEXT NOT NULL,
                difficulty_assessment TEXT DEFAULT '{}',
                learning_style_preference TEXT DEFAULT 'mixed',
                prerequisite_analysis TEXT DEFAULT '[]',
                mastery_prediction TEXT DEFAULT '{}',
                recommended_next_steps TEXT DEFAULT '[]',
                common_misconceptions TEXT DEFAULT '[]',
                optimal_practice_schedule TEXT DEFAULT '{}',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                
                FOREIGN KEY (node_id) REFERENCES learning_nodes(id) ON DELETE CASCADE
            )
        `;
        db.execute(sql);
    },
    async (db) => {
        db.execute('DROP TABLE IF EXISTS ai_metadata');
    }
);

migrationManager.registerMigration(
    5,
    'Add database indexes for performance',
    async (db) => {
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_nodes_parent_id ON learning_nodes(parent_id)',
            'CREATE INDEX IF NOT EXISTS idx_nodes_node_type ON learning_nodes(node_type)',
            'CREATE INDEX IF NOT EXISTS idx_nodes_mastery ON learning_nodes(mastery_percentage)',
            'CREATE INDEX IF NOT EXISTS idx_nodes_created_at ON learning_nodes(created_at)',
            'CREATE INDEX IF NOT EXISTS idx_decisions_node_id ON ai_decisions(node_id)',
            'CREATE INDEX IF NOT EXISTS idx_decisions_level ON ai_decisions(level)',
            'CREATE INDEX IF NOT EXISTS idx_decisions_timestamp ON ai_decisions(timestamp)',
            'CREATE INDEX IF NOT EXISTS idx_path_history_node_id ON learning_path_history(node_id)',
            'CREATE INDEX IF NOT EXISTS idx_ai_metadata_node_id ON ai_metadata(node_id)'
        ];

        indexes.forEach(index => db.execute(index));
    },
    async (db) => {
        const indexes = [
            'DROP INDEX IF EXISTS idx_nodes_parent_id',
            'DROP INDEX IF EXISTS idx_nodes_node_type',
            'DROP INDEX IF EXISTS idx_nodes_mastery',
            'DROP INDEX IF EXISTS idx_nodes_created_at',
            'DROP INDEX IF EXISTS idx_decisions_node_id',
            'DROP INDEX IF EXISTS idx_decisions_level',
            'DROP INDEX IF EXISTS idx_decisions_timestamp',
            'DROP INDEX IF EXISTS idx_path_history_node_id',
            'DROP INDEX IF EXISTS idx_ai_metadata_node_id'
        ];

        indexes.forEach(index => db.execute(index));
    }
);

// Migration 6: Remove complex AI tracking tables
migrationManager.registerMigration(
    6,
    'Remove complex AI tracking tables - simplify to modular structure',
    async (db) => {
        // Drop complex tables
        db.execute('DROP TABLE IF EXISTS ai_decisions');
        db.execute('DROP TABLE IF EXISTS learning_path_history');
        db.execute('DROP TABLE IF EXISTS ai_metadata');
        console.log('✅ Removed complex AI tracking tables');
    },
    async (db) => {
        // Recreate tables if rollback needed
        const aiDecisionsTable = `
            CREATE TABLE IF NOT EXISTS ai_decisions (
                id TEXT PRIMARY KEY,
                node_id TEXT NOT NULL,
                level INTEGER NOT NULL,
                decision_type TEXT NOT NULL,
                selected_node_id TEXT NULL,
                reasoning TEXT NOT NULL,
                confidence_score INTEGER DEFAULT 0 CHECK(confidence_score >= 0 AND confidence_score <= 100),
                context_data TEXT DEFAULT '{}',
                parent_decisions TEXT DEFAULT '[]',
                alternatives_considered TEXT DEFAULT '[]',
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                ai_model_version TEXT DEFAULT 'v2.1',
                
                FOREIGN KEY (node_id) REFERENCES learning_nodes(id) ON DELETE CASCADE,
                FOREIGN KEY (selected_node_id) REFERENCES learning_nodes(id) ON DELETE SET NULL
            )
        `;
        
        const pathHistoryTable = `
            CREATE TABLE IF NOT EXISTS learning_path_history (
                id TEXT PRIMARY KEY,
                node_id TEXT NOT NULL,
                level INTEGER NOT NULL,
                decision_type TEXT NOT NULL,
                reasoning TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                
                FOREIGN KEY (node_id) REFERENCES learning_nodes(id) ON DELETE CASCADE
            )
        `;
        
        const aiMetadataTable = `
            CREATE TABLE IF NOT EXISTS ai_metadata (
                id TEXT PRIMARY KEY,
                node_id TEXT NOT NULL,
                difficulty_assessment TEXT DEFAULT '{}',
                learning_style_preference TEXT DEFAULT 'mixed',
                prerequisite_analysis TEXT DEFAULT '[]',
                mastery_prediction TEXT DEFAULT '{}',
                recommended_next_steps TEXT DEFAULT '[]',
                common_misconceptions TEXT DEFAULT '[]',
                optimal_practice_schedule TEXT DEFAULT '{}',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                
                FOREIGN KEY (node_id) REFERENCES learning_nodes(id) ON DELETE CASCADE
            )
        `;
        
        db.execute(aiDecisionsTable);
        db.execute(pathHistoryTable);
        db.execute(aiMetadataTable);
    }
);

// Migration 7: Create level-based modular tables
migrationManager.registerMigration(
    7,
    'Create level-based modular tables for AI-driven specificity',
    async (db) => {
        const createLevelTable = (level) => `
            CREATE TABLE IF NOT EXISTS level_${level}_nodes (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                content TEXT DEFAULT '',
                mastery_percentage INTEGER DEFAULT 0 CHECK(mastery_percentage >= 0 AND mastery_percentage <= 100),
                last_practiced DATETIME,
                notes TEXT DEFAULT '',
                parent_id TEXT NULL,
                node_type TEXT DEFAULT 'concept',
                metadata TEXT DEFAULT '{}',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                
                FOREIGN KEY (parent_id) REFERENCES level_${level}_nodes(id) ON DELETE CASCADE
            )
        `;

        // Create levels 1-5
        for (let level = 1; level <= 5; level++) {
            db.execute(createLevelTable(level));
            console.log(`✅ Created level_${level}_nodes table`);
        }
    },
    async (db) => {
        // Drop level tables
        for (let level = 1; level <= 5; level++) {
            db.execute(`DROP TABLE IF EXISTS level_${level}_nodes`);
        }
    }
);

// Migration 8: Create user management tables
migrationManager.registerMigration(
    8,
    'Create user management and progress tracking tables',
    async (db) => {
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        const createUserProgressTable = `
            CREATE TABLE IF NOT EXISTS user_progress (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                node_id TEXT NOT NULL,
                level INTEGER NOT NULL CHECK(level >= 1 AND level <= 5),
                mastery_percentage INTEGER DEFAULT 0 CHECK(mastery_percentage >= 0 AND mastery_percentage <= 100),
                last_practiced DATETIME,
                notes TEXT DEFAULT '',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(user_id, node_id, level)
            )
        `;

        db.execute(createUsersTable);
        db.execute(createUserProgressTable);
        console.log('✅ Created user management tables');
    },
    async (db) => {
        db.execute('DROP TABLE IF EXISTS user_progress');
        db.execute('DROP TABLE IF EXISTS users');
    }
);

// Migration 9: Add indexes for performance
migrationManager.registerMigration(
    9,
    'Add indexes for level-based tables and user progress',
    async (db) => {
        const indexes = [];
        
        // Level table indexes
        for (let level = 1; level <= 5; level++) {
            indexes.push(`CREATE INDEX IF NOT EXISTS idx_level_${level}_parent_id ON level_${level}_nodes(parent_id)`);
            indexes.push(`CREATE INDEX IF NOT EXISTS idx_level_${level}_name ON level_${level}_nodes(name)`);
            indexes.push(`CREATE INDEX IF NOT EXISTS idx_level_${level}_mastery ON level_${level}_nodes(mastery_percentage)`);
            indexes.push(`CREATE INDEX IF NOT EXISTS idx_level_${level}_created_at ON level_${level}_nodes(created_at)`);
        }
        
        // User progress indexes
        indexes.push('CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id)');
        indexes.push('CREATE INDEX IF NOT EXISTS idx_user_progress_node_id ON user_progress(node_id)');
        indexes.push('CREATE INDEX IF NOT EXISTS idx_user_progress_level ON user_progress(level)');
        indexes.push('CREATE INDEX IF NOT EXISTS idx_user_progress_mastery ON user_progress(mastery_percentage)');
        
        // User table indexes
        indexes.push('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
        indexes.push('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');

        indexes.forEach(index => db.execute(index));
        console.log('✅ Added performance indexes');
    },
    async (db) => {
        const indexes = [];
        
        // Drop level table indexes
        for (let level = 1; level <= 5; level++) {
            indexes.push(`DROP INDEX IF EXISTS idx_level_${level}_parent_id`);
            indexes.push(`DROP INDEX IF EXISTS idx_level_${level}_name`);
            indexes.push(`DROP INDEX IF EXISTS idx_level_${level}_mastery`);
            indexes.push(`DROP INDEX IF EXISTS idx_level_${level}_created_at`);
        }
        
        // Drop user progress indexes
        indexes.push('DROP INDEX IF EXISTS idx_user_progress_user_id');
        indexes.push('DROP INDEX IF EXISTS idx_user_progress_node_id');
        indexes.push('DROP INDEX IF EXISTS idx_user_progress_level');
        indexes.push('DROP INDEX IF EXISTS idx_user_progress_mastery');
        
        // Drop user table indexes
        indexes.push('DROP INDEX IF EXISTS idx_users_username');
        indexes.push('DROP INDEX IF EXISTS idx_users_email');

        indexes.forEach(index => db.execute(index));
    }
);

export default migrationManager;
