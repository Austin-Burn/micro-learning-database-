# MicroLearn - Modular AI-Driven Database System

A hierarchical learning management system built with a modular "byte file structure" approach, designed for AI-driven content organization and user progress tracking.

## 🧠 Concept: AI Byte File Structure

This system implements a **modular data storage approach** where each level represents increasing specificity of learning topics, similar to how computers organize data in hierarchical file systems:

- **Level 1 (General)** → Broad categories (Science, Math, History)
- **Level 2 (Domain)** → Specific fields (Physics, Chemistry, Algebra)  
- **Level 3 (Subject)** → Sub-fields (Mechanics, Thermodynamics)
- **Level 4 (Topic)** → Specific topics (Newton's Laws, Gas Laws)
- **Level 5 (Detail)** → Individual concepts (F=ma, PV=nRT)

## 🗄️ Database Architecture

### Modular Level Tables
- `level_1_nodes` - General topics
- `level_2_nodes` - Domain-specific content
- `level_3_nodes` - Subject-specific content
- `level_4_nodes` - Topic-specific content
- `level_5_nodes` - Detail-specific content

### User Management
- `users` - User accounts and profiles
- `user_progress` - Cross-level progress tracking

### Legacy Support
- `learning_nodes` - Backward compatibility with original system

## 🚀 Features

### Level-Based API Endpoints
```
GET    /api/levels/:level             - Get all nodes from level (1-5)
GET    /api/levels/:level/:id         - Get specific node from level
POST   /api/levels/:level             - Create node in level
PUT    /api/levels/:level/:id         - Update node in level
DELETE /api/levels/:level/:id        - Delete node from level
GET    /api/levels/:level/search?q=  - Search nodes in level
```

### Legacy API Endpoints
```
GET    /api/nodes                     - Get all root nodes
GET    /api/nodes/:id                 - Get specific node
POST   /api/nodes                     - Create new node
PUT    /api/nodes/:id                 - Update node
DELETE /api/nodes/:id                 - Delete node
GET    /api/search?q=query           - Search nodes
```

### Dev Panel
- **Real-time API testing** with interactive interface
- **Database schema visualization** showing all tables and relationships
- **Level-based data viewing** with clickable level buttons
- **Live response display** with formatted JSON output

## 🛠️ Technology Stack

- **Database**: SQLite with `better-sqlite3`
- **Backend**: Node.js with ES6 modules
- **API**: RESTful HTTP endpoints
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Migration System**: Custom database migration manager

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Austin-Burn/micro-learning-database-.git
   cd micro-learning-database-
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Initialize database**:
   ```bash
   npm run init-db
   ```

4. **Run migrations**:
   ```bash
   npm run migrate
   ```

5. **Start the server**:
   ```bash
   npm start
   ```

## 🎯 Usage

### Start the Server
```bash
npm start
```

The server will start on `http://localhost:3000` with:
- **Dev Panel**: Interactive API testing interface
- **API Endpoints**: RESTful endpoints for all operations
- **Database**: SQLite database with modular structure

### Using the Dev Panel

1. **Open** `http://localhost:3000` in your browser
2. **View Schema**: See the modular database structure
3. **Test Levels**: Click level buttons to view/create data
4. **API Testing**: Use the request panel to test endpoints
5. **Real-time Results**: See responses formatted in JSON

### API Examples

**Create a Science topic in Level 1**:
```bash
curl -X POST http://localhost:3000/api/levels/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Science", "content": "General science topics"}'
```

**Get all Level 1 nodes**:
```bash
curl http://localhost:3000/api/levels/1
```

**Create Physics in Level 2**:
```bash
curl -X POST http://localhost:3000/api/levels/2 \
  -H "Content-Type: application/json" \
  -d '{"name": "Physics", "content": "Physical sciences and mechanics"}'
```

## 🗂️ Project Structure

```
microlearn/
├── src/
│   ├── data/
│   │   ├── api.js              # RESTful API endpoints
│   │   ├── database.js         # Database connection & queries
│   │   ├── manager.js          # Learning node manager
│   │   ├── migrations.js       # Database migration system
│   │   ├── schema.js           # Basic node schema
│   │   ├── enhanced-schema.js  # Extended schema with AI features
│   │   ├── enhanced-manager.js # AI-enhanced manager
│   │   ├── ai-decision-engine.js # AI decision logic
│   │   ├── ai-prompt-builder.js  # AI prompt generation
│   │   └── demo.js             # Demo and testing
│   └── server.js               # HTTP server
├── dev-panel.html              # Interactive dev panel
├── package.json                 # Dependencies and scripts
├── README.md                    # This file
└── data/
    └── microlearn.db           # SQLite database file
```

## 🔧 Scripts

- `npm start` - Start the server
- `npm run init-db` - Initialize database
- `npm run migrate` - Run database migrations
- `npm test` - Run automated tests

## 🧪 Testing

The project includes automated testing via `test-database.js`:

```bash
npm test
```

This will test all major API endpoints and verify the database functionality.

## 🤖 AI Integration Ready

The system is designed for AI integration with:
- **Modular structure** allowing AI to organize content at any level
- **Flexible metadata** storage for AI analysis and decisions
- **User progress tracking** for personalized learning paths
- **Extensible schema** for future AI features

## 📊 Database Schema

Each level table contains:
- `id` - Unique identifier
- `name` - Node name/title
- `content` - Detailed content
- `mastery_percentage` - Learning progress (0-100)
- `parent_id` - Reference to parent node (self-referencing)
- `metadata` - JSON storage for flexible data
- `created_at` / `updated_at` - Timestamps

## 🔄 Migration System

The system includes a robust migration system that:
- **Tracks versions** in the `migrations` table
- **Supports rollbacks** to previous versions
- **Handles schema changes** safely
- **Maintains data integrity** during updates

## 🎉 Success Metrics

✅ **Modular Structure**: 5 level-based tables implemented  
✅ **API Endpoints**: All CRUD operations working  
✅ **Dev Panel**: Interactive testing interface  
✅ **Database**: SQLite with proper relationships  
✅ **Migrations**: Version-controlled schema changes  
✅ **User Management**: Progress tracking system  
✅ **Legacy Support**: Backward compatibility maintained  

## 🤝 Contributing

This is a personal project showcasing modular database design for AI-driven learning systems. The architecture demonstrates how to build scalable, flexible systems that can adapt to AI-driven content organization.

## 📝 License

This project is for educational and demonstration purposes, showcasing modern database design patterns and AI-ready architectures.

---

**Built with ❤️ for AI-driven learning systems**