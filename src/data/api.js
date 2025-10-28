/**
 * Learning Node API
 * RESTful API endpoints for learning data management with database
 */
import { LearningNodeManager } from './manager.js';
import { dbManager } from './database.js';

export class LearningNodeAPI {
    constructor() {
        this.manager = new LearningNodeManager();
    }

    /**
     * Initialize database connection
     */
    async initialize() {
        return await this.manager.initialize();
    }

    /**
     * GET /api/nodes - Get all root nodes
     */
    async getRootNodes() {
        const nodes = await this.manager.getRootNodes();
        return {
            success: true,
            data: nodes,
            count: nodes.length
        };
    }

    /**
     * GET /api/nodes/:id - Get specific node
     */
    async getNode(id) {
        const node = await this.manager.getNode(id);
        if (!node) {
            return {
                success: false,
                error: 'Node not found',
                code: 404
            };
        }
        return {
            success: true,
            data: node
        };
    }

    /**
     * GET /api/nodes/:id/children - Get children of a node
     */
    async getChildren(id) {
        const children = await this.manager.getChildren(id);
        return {
            success: true,
            data: children,
            count: children.length
        };
    }

    /**
     * GET /api/nodes/:id/path - Get full path from root to node
     */
    async getNodePath(id) {
        const path = await this.manager.getNodePath(id);
        return {
            success: true,
            data: path,
            count: path.length
        };
    }

    /**
     * GET /api/nodes/:id/descendants - Get all descendants of a node
     */
    async getDescendants(id) {
        const descendants = await this.manager.getDescendants(id);
        return {
            success: true,
            data: descendants,
            count: descendants.length
        };
    }

    /**
     * POST /api/nodes - Create new node
     */
    async createNode(nodeData) {
        try {
            const node = await this.manager.createNode(nodeData);
            return {
                success: true,
                data: node,
                message: 'Node created successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: 400
            };
        }
    }

    /**
     * PUT /api/nodes/:id - Update node
     */
    async updateNode(id, updates) {
        const node = await this.manager.updateNode(id, updates);
        if (!node) {
            return {
                success: false,
                error: 'Node not found',
                code: 404
            };
        }
        return {
            success: true,
            data: node,
            message: 'Node updated successfully'
        };
    }

    /**
     * PUT /api/nodes/:id/mastery - Update mastery percentage
     */
    async updateMastery(id, percentage) {
        const node = await this.manager.updateMastery(id, percentage);
        if (!node) {
            return {
                success: false,
                error: 'Node not found',
                code: 404
            };
        }
        return {
            success: true,
            data: node,
            message: 'Mastery updated successfully'
        };
    }

    /**
     * POST /api/nodes/:id/notes - Add notes to node
     */
    async addNotes(id, notes) {
        const node = await this.manager.addNotes(id, notes);
        if (!node) {
            return {
                success: false,
                error: 'Node not found',
                code: 404
            };
        }
        return {
            success: true,
            data: node,
            message: 'Notes added successfully'
        };
    }

    /**
     * DELETE /api/nodes/:id - Delete node and children (CASCADE)
     */
    async deleteNode(id) {
        const success = await this.manager.deleteNode(id);
        if (!success) {
            return {
                success: false,
                error: 'Node not found',
                code: 404
            };
        }
        return {
            success: true,
            message: 'Node and all children deleted successfully'
        };
    }

    /**
     * GET /api/search?q=query - Search nodes
     */
    async searchNodes(query) {
        const results = await this.manager.searchNodes(query);
        return {
            success: true,
            data: results,
            count: results.length,
            query: query
        };
    }

    /**
     * GET /api/nodes/mastery?min=0&max=100 - Get nodes by mastery range
     */
    async getNodesByMastery(minMastery = 0, maxMastery = 100) {
        const results = await this.manager.getNodesByMastery(minMastery, maxMastery);
        return {
            success: true,
            data: results,
            count: results.length,
            masteryRange: { min: minMastery, max: maxMastery }
        };
    }

    /**
     * GET /api/export - Export all data
     */
    async exportData() {
        const data = await this.manager.exportData();
        return {
            success: true,
            data: data,
            message: 'Data exported successfully'
        };
    }

    /**
     * POST /api/import - Import data
     */
    async importData(data) {
        const success = await this.manager.importData(data);
        if (!success) {
            return {
                success: false,
                error: 'Failed to import data',
                code: 400
            };
        }
        return {
            success: true,
            message: 'Data imported successfully'
        };
    }

    /**
     * GET /api/schema - Get database schema information
     */
    async getSchema() {
        try {
            const db = dbManager.getConnection();
            
            // Get all tables
            const tables = db.prepare(`
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name NOT LIKE 'sqlite_%'
                ORDER BY name
            `).all();

            const schema = {};
            
            for (const table of tables) {
                const tableName = table.name;
                
                // Get table info
                const tableInfo = db.prepare(`PRAGMA table_info(${tableName})`).all();
                
                // Get foreign keys
                const foreignKeys = db.prepare(`PRAGMA foreign_key_list(${tableName})`).all();
                
                // Get indexes
                const indexes = db.prepare(`PRAGMA index_list(${tableName})`).all();
                
                schema[tableName] = {
                    columns: tableInfo.map(col => ({
                        name: col.name,
                        type: col.type,
                        notNull: col.notnull === 1,
                        defaultValue: col.dflt_value,
                        primaryKey: col.pk === 1
                    })),
                    foreignKeys: foreignKeys.map(fk => ({
                        column: fk.from,
                        referencesTable: fk.table,
                        referencesColumn: fk.to,
                        onDelete: fk.on_delete,
                        onUpdate: fk.on_update
                    })),
                    indexes: indexes.map(idx => ({
                        name: idx.name,
                        unique: idx.unique === 1,
                        partial: idx.partial === 1
                    }))
                };
            }
            
            return {
                success: true,
                data: schema,
                message: 'Database schema retrieved successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: 500
            };
        }
    }

    /**
     * GET /api/levels/:level - Get all nodes from specific level
     */
    async getLevelNodes(level) {
        try {
            const levelNum = parseInt(level);
            if (levelNum < 1 || levelNum > 5) {
                return {
                    success: false,
                    error: 'Level must be between 1 and 5',
                    code: 400
                };
            }
            
            const nodes = dbManager.getLevelNodes(levelNum);
            
            return {
                success: true,
                data: nodes,
                count: nodes.length,
                level: levelNum,
                message: `Level ${levelNum} nodes retrieved successfully`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: 500
            };
        }
    }

    /**
     * GET /api/levels/:level/:id - Get specific node from level
     */
    async getLevelNode(level, id) {
        try {
            const levelNum = parseInt(level);
            if (levelNum < 1 || levelNum > 5) {
                return {
                    success: false,
                    error: 'Level must be between 1 and 5',
                    code: 400
                };
            }
            
            const node = dbManager.getLevelNode(levelNum, id);
            if (!node) {
                return {
                    success: false,
                    error: 'Node not found',
                    code: 404
                };
            }
            
            return {
                success: true,
                data: node,
                level: levelNum,
                message: 'Node retrieved successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: 500
            };
        }
    }

    /**
     * POST /api/levels/:level - Create new node in specific level
     */
    async createLevelNode(level, nodeData) {
        try {
            const levelNum = parseInt(level);
            if (levelNum < 1 || levelNum > 5) {
                return {
                    success: false,
                    error: 'Level must be between 1 and 5',
                    code: 400
                };
            }
            
            // Generate ID if not provided
            if (!nodeData.id) {
                nodeData.id = `level_${levelNum}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            }
            
            const result = dbManager.createLevelNode(levelNum, nodeData);
            const node = dbManager.getLevelNode(levelNum, nodeData.id);
            
            return {
                success: true,
                data: node,
                level: levelNum,
                message: 'Node created successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: 400
            };
        }
    }

    /**
     * PUT /api/levels/:level/:id - Update node in specific level
     */
    async updateLevelNode(level, id, updates) {
        try {
            const levelNum = parseInt(level);
            if (levelNum < 1 || levelNum > 5) {
                return {
                    success: false,
                    error: 'Level must be between 1 and 5',
                    code: 400
                };
            }
            
            const result = dbManager.updateLevelNode(levelNum, id, updates);
            const node = dbManager.getLevelNode(levelNum, id);
            
            if (!node) {
                return {
                    success: false,
                    error: 'Node not found',
                    code: 404
                };
            }
            
            return {
                success: true,
                data: node,
                level: levelNum,
                message: 'Node updated successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: 500
            };
        }
    }

    /**
     * DELETE /api/levels/:level/:id - Delete node from specific level
     */
    async deleteLevelNode(level, id) {
        try {
            const levelNum = parseInt(level);
            if (levelNum < 1 || levelNum > 5) {
                return {
                    success: false,
                    error: 'Level must be between 1 and 5',
                    code: 400
                };
            }
            
            const result = dbManager.deleteLevelNode(levelNum, id);
            
            return {
                success: true,
                level: levelNum,
                message: 'Node deleted successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: 500
            };
        }
    }

    /**
     * GET /api/levels/:level/search?q=query - Search nodes in specific level
     */
    async searchLevelNodes(level, query) {
        try {
            const levelNum = parseInt(level);
            if (levelNum < 1 || levelNum > 5) {
                return {
                    success: false,
                    error: 'Level must be between 1 and 5',
                    code: 400
                };
            }
            
            const results = dbManager.searchLevelNodes(levelNum, query);
            
            return {
                success: true,
                data: results,
                count: results.length,
                level: levelNum,
                query: query,
                message: 'Search completed successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: 500
            };
        }
    }

    /**
     * GET /api/tables/:tableName - Get data from specific table (legacy support)
     */
    async getTableData(tableName) {
        try {
            const db = dbManager.getConnection();
            
            // Validate table name (prevent SQL injection)
            const validTables = ['learning_nodes', 'migrations'];
            if (!validTables.includes(tableName)) {
                return {
                    success: false,
                    error: 'Invalid table name',
                    code: 400
                };
            }
            
            const data = db.prepare(`SELECT * FROM ${tableName} ORDER BY created_at DESC LIMIT 100`).all();
            
            return {
                success: true,
                data: data,
                count: data.length,
                table: tableName,
                message: `Data from ${tableName} table retrieved successfully`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: 500
            };
        }
    }

    /**
     * Handle API requests
     * @param {string} method - HTTP method
     * @param {string} path - Request path
     * @param {Object} data - Request data
     * @returns {Object} API response
     */
    async handleRequest(method, path, data = {}) {
        const pathParts = path.split('/').filter(part => part);
        
        try {
            switch (method.toUpperCase()) {
                case 'GET':
                    // Level-based endpoints
                    if (pathParts.length === 2 && pathParts[0] === 'levels') {
                        if (pathParts[1] === 'search') {
                            return await this.searchLevelNodes(data.level, data.q);
                        }
                        return await this.getLevelNodes(pathParts[1]);
                    } else if (pathParts.length === 3 && pathParts[0] === 'levels') {
                        if (pathParts[2] === 'search') {
                            return await this.searchLevelNodes(pathParts[1], data.q);
                        }
                        return await this.getLevelNode(pathParts[1], pathParts[2]);
                    }
                    
                    // Legacy endpoints for backward compatibility
                    if (pathParts.length === 2 && pathParts[0] === 'nodes') {
                        if (pathParts[1] === 'mastery') {
                            return await this.getNodesByMastery(data.min, data.max);
                        }
                        return await this.getNode(pathParts[1]);
                    } else if (pathParts.length === 3 && pathParts[0] === 'nodes' && pathParts[2] === 'children') {
                        return await this.getChildren(pathParts[1]);
                    } else if (pathParts.length === 3 && pathParts[0] === 'nodes' && pathParts[2] === 'path') {
                        return await this.getNodePath(pathParts[1]);
                    } else if (pathParts.length === 3 && pathParts[0] === 'nodes' && pathParts[2] === 'descendants') {
                        return await this.getDescendants(pathParts[1]);
                    } else if (pathParts.length === 1 && pathParts[0] === 'search') {
                        return await this.searchNodes(data.q);
                    } else if (pathParts.length === 1 && pathParts[0] === 'export') {
                        return await this.exportData();
                    } else if (pathParts.length === 1 && pathParts[0] === 'schema') {
                        return await this.getSchema();
                    } else if (pathParts.length === 2 && pathParts[0] === 'tables') {
                        return await this.getTableData(pathParts[1]);
                    } else if (pathParts.length === 1 && pathParts[0] === 'nodes') {
                        return await this.getRootNodes();
                    }
                    break;

                case 'POST':
                    // Level-based endpoints
                    if (pathParts.length === 2 && pathParts[0] === 'levels') {
                        return await this.createLevelNode(pathParts[1], data);
                    }
                    
                    // Legacy endpoints
                    if (pathParts.length === 1 && pathParts[0] === 'nodes') {
                        return await this.createNode(data);
                    } else if (pathParts.length === 3 && pathParts[0] === 'nodes' && pathParts[2] === 'notes') {
                        return await this.addNotes(pathParts[1], data.notes);
                    } else if (pathParts.length === 1 && pathParts[0] === 'import') {
                        return await this.importData(data);
                    }
                    break;

                case 'PUT':
                    // Level-based endpoints
                    if (pathParts.length === 3 && pathParts[0] === 'levels') {
                        return await this.updateLevelNode(pathParts[1], pathParts[2], data);
                    }
                    
                    // Legacy endpoints
                    if (pathParts.length === 2 && pathParts[0] === 'nodes') {
                        return await this.updateNode(pathParts[1], data);
                    } else if (pathParts.length === 3 && pathParts[0] === 'nodes' && pathParts[2] === 'mastery') {
                        return await this.updateMastery(pathParts[1], data.percentage);
                    }
                    break;

                case 'DELETE':
                    // Level-based endpoints
                    if (pathParts.length === 3 && pathParts[0] === 'levels') {
                        return await this.deleteLevelNode(pathParts[1], pathParts[2]);
                    }
                    
                    // Legacy endpoints
                    if (pathParts.length === 2 && pathParts[0] === 'nodes') {
                        return await this.deleteNode(pathParts[1]);
                    }
                    break;
            }

            return {
                success: false,
                error: 'Endpoint not found',
                code: 404
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: 500
            };
        }
    }

    /**
     * Close database connection
     */
    close() {
        this.manager.close();
    }
}

export default LearningNodeAPI;

