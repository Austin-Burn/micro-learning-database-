/**
 * Learning Node Data Manager
 * Handles CRUD operations for hierarchical learning data with proper database
 */
import { LearningNodeSchema } from './schema.js';
import { dbManager } from './database.js';

export class LearningNodeManager {
    constructor() {
        this.db = null;
        this.isInitialized = false;
    }

    /**
     * Initialize database connection
     */
    async initialize() {
        if (!this.isInitialized) {
            await dbManager.initialize();
            this.db = dbManager.getConnection();
            this.isInitialized = true;
        }
        return this.isInitialized;
    }

    /**
     * Create a new learning node
     * @param {Object} nodeData - Node data
     * @returns {Object} Created node with ID
     */
    async createNode(nodeData) {
        await this.initialize();
        
        const id = this.generateId();
        const now = new Date().toISOString();
        
        const node = {
            id,
            name: nodeData.name || 'Untitled',
            mastery_percentage: nodeData.mastery_percentage || 0,
            last_practiced: nodeData.last_practiced || now,
            notes: nodeData.notes || '',
            parent_id: nodeData.parent_id || null,
            node_type: nodeData.node_type || 'concept',
            metadata: JSON.stringify(nodeData.metadata || {}),
            created_at: now,
            updated_at: now
        };

        // Insert into database
        const sql = `
            INSERT INTO learning_nodes 
            (id, name, mastery_percentage, last_practiced, notes, parent_id, node_type, metadata, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        dbManager.execute(sql, [
            node.id, node.name, node.mastery_percentage, node.last_practiced,
            node.notes, node.parent_id, node.node_type, node.metadata,
            node.created_at, node.updated_at
        ]);

        // Parse metadata back to object for return
        node.metadata = JSON.parse(node.metadata);
        return node;
    }

    /**
     * Get a node by ID
     * @param {string} id - Node ID
     * @returns {Object|null} Node or null if not found
     */
    async getNode(id) {
        await this.initialize();
        const node = dbManager.queryOne('SELECT * FROM learning_nodes WHERE id = ?', [id]);
        
        if (node) {
            // Parse metadata from JSON string
            node.metadata = JSON.parse(node.metadata || '{}');
        }
        
        return node;
    }

    /**
     * Get all children of a node
     * @param {string} parentId - Parent node ID
     * @returns {Array} Array of child nodes
     */
    async getChildren(parentId) {
        await this.initialize();
        const children = dbManager.getChildren(parentId);
        
        // Parse metadata for each child
        return children.map(child => ({
            ...child,
            metadata: JSON.parse(child.metadata || '{}')
        }));
    }

    /**
     * Get all root nodes (nodes with no parent)
     * @returns {Array} Array of root nodes
     */
    async getRootNodes() {
        await this.initialize();
        const rootNodes = dbManager.getRootNodes();
        
        // Parse metadata for each root node
        return rootNodes.map(node => ({
            ...node,
            metadata: JSON.parse(node.metadata || '{}')
        }));
    }

    /**
     * Update a node
     * @param {string} id - Node ID
     * @param {Object} updates - Fields to update
     * @returns {Object|null} Updated node or null if not found
     */
    async updateNode(id, updates) {
        await this.initialize();
        
        // Check if node exists
        const existingNode = await this.getNode(id);
        if (!existingNode) return null;

        // Prepare update fields
        const updateFields = [];
        const updateValues = [];
        
        Object.keys(updates).forEach(key => {
            if (key !== 'id' && key !== 'created_at') {
                updateFields.push(`${key} = ?`);
                if (key === 'metadata') {
                    updateValues.push(JSON.stringify(updates[key]));
                } else {
                    updateValues.push(updates[key]);
                }
            }
        });
        
        // Always update the updated_at timestamp
        updateFields.push('updated_at = ?');
        updateValues.push(new Date().toISOString());
        updateValues.push(id);

        const sql = `UPDATE learning_nodes SET ${updateFields.join(', ')} WHERE id = ?`;
        dbManager.execute(sql, updateValues);

        // Return updated node
        return await this.getNode(id);
    }

    /**
     * Update mastery percentage
     * @param {string} id - Node ID
     * @param {number} percentage - New mastery percentage (0-100)
     * @returns {Object|null} Updated node
     */
    async updateMastery(id, percentage) {
        return await this.updateNode(id, {
            mastery_percentage: Math.max(0, Math.min(100, percentage)),
            last_practiced: new Date().toISOString()
        });
    }

    /**
     * Add notes to a node
     * @param {string} id - Node ID
     * @param {string} notes - Notes to add
     * @returns {Object|null} Updated node
     */
    async addNotes(id, notes) {
        const node = await this.getNode(id);
        if (!node) return null;

        const existingNotes = node.notes ? node.notes + '\n' : '';
        return await this.updateNode(id, {
            notes: existingNotes + notes
        });
    }

    /**
     * Delete a node and all its children (CASCADE DELETE)
     * @param {string} id - Node ID
     * @returns {boolean} Success status
     */
    async deleteNode(id) {
        await this.initialize();
        
        // Check if node exists
        const node = await this.getNode(id);
        if (!node) return false;

        // Use CASCADE DELETE - database will handle deleting all children automatically
        // due to FOREIGN KEY constraint with ON DELETE CASCADE
        const sql = 'DELETE FROM learning_nodes WHERE id = ?';
        const result = dbManager.execute(sql, [id]);
        
        return result.changes > 0;
    }

    /**
     * Search nodes by name or notes
     * @param {string} query - Search query
     * @returns {Array} Matching nodes
     */
    async searchNodes(query) {
        await this.initialize();
        const results = dbManager.searchNodes(query);
        
        // Parse metadata for each result
        return results.map(node => ({
            ...node,
            metadata: JSON.parse(node.metadata || '{}')
        }));
    }

    /**
     * Get nodes by mastery level
     * @param {number} minMastery - Minimum mastery percentage
     * @param {number} maxMastery - Maximum mastery percentage
     * @returns {Array} Nodes within mastery range
     */
    async getNodesByMastery(minMastery = 0, maxMastery = 100) {
        await this.initialize();
        const results = dbManager.getNodesByMastery(minMastery, maxMastery);
        
        // Parse metadata for each result
        return results.map(node => ({
            ...node,
            metadata: JSON.parse(node.metadata || '{}')
        }));
    }

    /**
     * Get full tree path for a node
     * @param {string} nodeId - Node ID
     * @returns {Array} Path from root to node
     */
    async getNodePath(nodeId) {
        await this.initialize();
        const path = dbManager.getNodePath(nodeId);
        
        return path.map(node => ({
            ...node,
            metadata: JSON.parse(node.metadata || '{}')
        }));
    }

    /**
     * Get all descendants of a node
     * @param {string} nodeId - Node ID
     * @returns {Array} All descendant nodes
     */
    async getDescendants(nodeId) {
        await this.initialize();
        const descendants = dbManager.getDescendants(nodeId);
        
        return descendants.map(node => ({
            ...node,
            metadata: JSON.parse(node.metadata || '{}')
        }));
    }

    /**
     * Generate unique ID
     * @returns {string} Unique identifier
     */
    generateId() {
        return 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Export all data as JSON
     * @returns {Object} Complete data structure
     */
    async exportData() {
        await this.initialize();
        
        const allNodes = dbManager.query('SELECT * FROM learning_nodes ORDER BY created_at ASC');
        const rootNodes = dbManager.getRootNodes();
        
        return {
            nodes: allNodes.map(node => ({
                ...node,
                metadata: JSON.parse(node.metadata || '{}')
            })),
            rootNodes: rootNodes.map(node => node.id),
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * Import data from JSON
     * @param {Object} data - Data to import
     * @returns {boolean} Success status
     */
    async importData(data) {
        await this.initialize();
        
        try {
            // Start transaction for atomic import
            const trans = dbManager.db.transaction(() => {
                // Clear existing data
                dbManager.execute('DELETE FROM ai_decisions');
                dbManager.execute('DELETE FROM learning_path_history');
                dbManager.execute('DELETE FROM ai_metadata');
                dbManager.execute('DELETE FROM learning_nodes');

                // Import nodes
                data.nodes.forEach(node => {
                    const sql = `
                        INSERT INTO learning_nodes 
                        (id, name, mastery_percentage, last_practiced, notes, parent_id, node_type, metadata, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    
                    dbManager.execute(sql, [
                        node.id, node.name, node.mastery_percentage, node.last_practiced,
                        node.notes, node.parent_id, node.node_type, JSON.stringify(node.metadata || {}),
                        node.created_at, node.updated_at
                    ]);
                });
            });
            
            trans();
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    /**
     * Close database connection
     */
    close() {
        if (this.isInitialized) {
            dbManager.close();
            this.isInitialized = false;
        }
    }
}

export default LearningNodeManager;

