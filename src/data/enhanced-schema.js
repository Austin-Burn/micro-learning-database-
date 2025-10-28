/**
 * Enhanced Learning Node Schema with AI Decision Tracking
 * Supports AI decision-making at every hierarchical level
 */

// AI Decision Record Schema
export const AIDecisionSchema = {
    decision_id: 'string',           // Unique decision identifier
    level: 'number',                 // Hierarchical level (0=root, 1=first child, etc.)
    decision_type: 'string',         // Type: 'select_existing', 'create_new', 'modify_existing'
    selected_node_id: 'string|null', // ID of selected node (null if creating new)
    reasoning: 'string',             // AI's explanation for this decision
    confidence_score: 'number',      // AI confidence 0-100
    context_data: 'object',          // All relevant context for this decision
    parent_decisions: 'array',       // Previous level decisions that influenced this
    alternatives_considered: 'array', // Other options AI considered
    timestamp: 'date',
    ai_model_version: 'string'        // Track which AI model made this decision
};

// Enhanced Learning Node Schema
export const EnhancedLearningNodeSchema = {
    id: 'string',
    name: 'string',
    mastery_percentage: 'number',
    last_practiced: 'date',
    notes: 'string',
    parent_id: 'string|null',
    node_type: 'string',
    metadata: 'object',
    created_at: 'date',
    updated_at: 'date',
    
    // AI Decision Tracking
    ai_decisions: 'array',           // All AI decisions made for this node
    current_ai_context: 'object',    // Current context for AI decision-making
    learning_path_history: 'array',  // History of how this node was reached
    
    // Enhanced metadata for AI
    ai_metadata: {
        difficulty_assessment: 'object',    // AI's assessment of difficulty
        learning_style_preference: 'string', // Detected learning style
        prerequisite_analysis: 'array',     // AI analysis of prerequisites
        mastery_prediction: 'object',      // AI prediction of mastery progression
        recommended_next_steps: 'array',   // AI recommendations
        common_misconceptions: 'array',    // AI-identified misconceptions
        optimal_practice_schedule: 'object' // AI-recommended practice timing
    }
};

// AI Context Schema for Decision Making
export const AIContextSchema = {
    current_level: 'number',
    available_nodes: 'array',       // All nodes at current level
    parent_context: 'object',        // Context from parent level
    user_preferences: 'object',      // User settings and preferences
    learning_history: 'object',     // Historical learning data
    mastery_patterns: 'object',      // Detected mastery patterns
    time_constraints: 'object',     // Available time and scheduling
    difficulty_progression: 'object', // Difficulty progression analysis
    previous_decisions: 'array'      // Previous AI decisions in this session
};

// Example Enhanced Data Structure
export const EnhancedExampleHierarchy = {
    // Root Level Decision
    root_decision: {
        decision_id: 'root_001',
        level: 0,
        decision_type: 'create_new',
        selected_node_id: null,
        reasoning: 'User shows interest in mathematics based on profile. Mathematics provides strong foundation for many other subjects.',
        confidence_score: 85,
        context_data: {
            user_profile: { interests: ['math', 'science'], experience_level: 'intermediate' },
            available_subjects: ['mathematics', 'science', 'history', 'language'],
            user_goals: ['career_development', 'personal_growth']
        },
        parent_decisions: [],
        alternatives_considered: [
            { option: 'science', reason: 'User shows science interest', confidence: 70 },
            { option: 'language', reason: 'Could improve communication skills', confidence: 45 }
        ],
        timestamp: '2024-10-26T15:00:00Z',
        ai_model_version: 'v2.1'
    },
    
    // First Level Decision
    first_level_decision: {
        decision_id: 'level1_001',
        level: 1,
        decision_type: 'select_existing',
        selected_node_id: 'algebra_001',
        reasoning: 'User has 80% mastery in algebra but struggles with quadratics. Linear equations are strong foundation, so focusing on quadratics builds on existing strength.',
        confidence_score: 92,
        context_data: {
            parent_node: { id: 'math_001', name: 'Mathematics', mastery: 75 },
            available_topics: [
                { id: 'algebra_001', name: 'Algebra', mastery: 80, last_practiced: '2024-10-24' },
                { id: 'geometry_001', name: 'Geometry', mastery: 60, last_practiced: '2024-10-20' },
                { id: 'calculus_001', name: 'Calculus', mastery: 30, last_practiced: '2024-10-15' }
            ],
            user_strengths: ['linear_equations', 'basic_algebra'],
            user_weaknesses: ['quadratic_equations', 'graphing'],
            time_available: 30 // minutes
        },
        parent_decisions: ['root_001'],
        alternatives_considered: [
            { option: 'geometry_001', reason: 'Could improve spatial reasoning', confidence: 65 },
            { option: 'calculus_001', reason: 'Advanced but user not ready', confidence: 25 }
        ],
        timestamp: '2024-10-26T15:05:00Z',
        ai_model_version: 'v2.1'
    },
    
    // Second Level Decision
    second_level_decision: {
        decision_id: 'level2_001',
        level: 2,
        decision_type: 'create_new',
        selected_node_id: null,
        reasoning: 'User needs specific practice with quadratic word problems. Creating targeted lesson that builds on their linear equation strength while addressing quadratic weakness.',
        confidence_score: 88,
        context_data: {
            parent_node: { id: 'algebra_001', name: 'Algebra', mastery: 80 },
            available_concepts: [
                { id: 'linear_eq_001', name: 'Linear Equations', mastery: 90 },
                { id: 'quadratic_eq_001', name: 'Quadratic Equations', mastery: 45 },
                { id: 'systems_001', name: 'Systems of Equations', mastery: 70 }
            ],
            previous_lessons: [
                { topic: 'linear_equations', success_rate: 0.9, time_spent: 15 },
                { topic: 'quadratic_basics', success_rate: 0.6, time_spent: 25 }
            ],
            learning_patterns: {
                visual_learner: true,
                struggles_with_word_problems: true,
                excels_with_step_by_step: true
            }
        },
        parent_decisions: ['root_001', 'level1_001'],
        alternatives_considered: [
            { option: 'quadratic_eq_001', reason: 'Direct weakness but too advanced', confidence: 40 },
            { option: 'linear_eq_001', reason: 'Already mastered, no growth', confidence: 20 }
        ],
        timestamp: '2024-10-26T15:10:00Z',
        ai_model_version: 'v2.1'
    }
};

export default EnhancedLearningNodeSchema;

