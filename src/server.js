/**
 * Simple HTTP Server for MicroLearn API Testing
 * Provides REST endpoints for testing the database
 */
import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LearningNodeAPI } from './data/api.js';
import { migrationManager } from './data/migrations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const api = new LearningNodeAPI();

// Initialize database and run migrations
async function initializeServer() {
    try {
        console.log('🚀 Starting MicroLearn Server...');
        
        // Run migrations first
        console.log('📊 Running database migrations...');
        await migrationManager.migrate();
        
        // Initialize API
        console.log('🔌 Initializing API...');
        await api.initialize();
        
        console.log('✅ Server initialized successfully!');
        console.log(`🌐 Server running on http://localhost:${PORT}`);
        console.log(`🔧 Dev Panel: http://localhost:${PORT}`);
        console.log('\n📋 Available endpoints:');
        console.log('  GET    /                             - Dev panel');
        console.log('  GET    /health                        - Health check');
        console.log('  GET    /api/schema                    - Get database schema');
        console.log('  GET    /api/tables/:tableName         - Get table data');
        console.log('');
        console.log('📊 Level-based endpoints (Modular Structure):');
        console.log('  GET    /api/levels/:level             - Get all nodes from level (1-5)');
        console.log('  GET    /api/levels/:level/:id         - Get specific node from level');
        console.log('  POST   /api/levels/:level             - Create node in level');
        console.log('  PUT    /api/levels/:level/:id         - Update node in level');
        console.log('  DELETE /api/levels/:level/:id        - Delete node from level');
        console.log('  GET    /api/levels/:level/search?q=  - Search nodes in level');
        console.log('');
        console.log('🌳 Legacy endpoints (Backward compatibility):');
        console.log('  GET    /api/nodes                     - Get all root nodes');
        console.log('  GET    /api/nodes/:id                 - Get specific node');
        console.log('  GET    /api/nodes/:id/children        - Get children of node');
        console.log('  GET    /api/nodes/:id/path            - Get full path to node');
        console.log('  GET    /api/nodes/:id/descendants     - Get all descendants');
        console.log('  POST   /api/nodes                     - Create new node');
        console.log('  PUT    /api/nodes/:id                 - Update node');
        console.log('  PUT    /api/nodes/:id/mastery         - Update mastery');
        console.log('  POST   /api/nodes/:id/notes           - Add notes');
        console.log('  DELETE /api/nodes/:id                 - Delete node');
        console.log('  GET    /api/search?q=query           - Search nodes');
        console.log('  GET    /api/nodes/mastery?min=0&max=100 - Filter by mastery');
        console.log('  GET    /api/export                    - Export data');
        console.log('  POST   /api/import                    - Import data');
        console.log('\n🧪 Test with curl commands (see test-commands.txt)');
        
    } catch (error) {
        console.error('❌ Server initialization failed:', error);
        process.exit(1);
    }
}

// Parse request body
function parseBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (error) {
                resolve({});
            }
        });
    });
}

// Send JSON response
function sendResponse(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(data, null, 2));
}

// Handle CORS preflight
function handleCORS(res) {
    res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
}

// Main request handler
async function handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;
    const query = parsedUrl.query;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
        return handleCORS(res);
    }

    console.log(`📡 ${method} ${path}`);

    try {
        // Parse request body for POST/PUT requests
        let body = {};
        if (method === 'POST' || method === 'PUT') {
            body = await parseBody(req);
        }

        // Merge query parameters with body
        const data = { ...query, ...body };

        // Handle API requests
        if (path.startsWith('/api/')) {
            const apiPath = path.replace('/api', '');
            const result = await api.handleRequest(method, apiPath, data);
            
            const statusCode = result.success ? 200 : (result.code || 500);
            sendResponse(res, statusCode, result);
            return;
        }

        // Handle root path - serve dev panel
        if (path === '/') {
            try {
                const htmlPath = './dev-panel.html';
                const htmlContent = fs.readFileSync(htmlPath, 'utf8');
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(htmlContent);
                return;
            } catch (error) {
                sendResponse(res, 500, {
                    error: 'Internal Server Error',
                    message: 'Could not load dev panel: ' + error.message
                });
                return;
            }
        }

        // Handle health check
        if (path === '/health') {
            sendResponse(res, 200, {
                status: 'healthy',
                database: 'connected',
                timestamp: new Date().toISOString()
            });
            return;
        }

        // 404 for unknown paths
        sendResponse(res, 404, {
            error: 'Not Found',
            message: `Path ${path} not found`,
            availablePaths: ['/api/*', '/health']
        });

    } catch (error) {
        console.error('❌ Request error:', error);
        sendResponse(res, 500, {
            error: 'Internal Server Error',
            message: error.message
        });
    }
}

// Create HTTP server
const server = http.createServer(handleRequest);

// Start server
server.listen(PORT, async () => {
    await initializeServer();
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    api.close();
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

export default server;
