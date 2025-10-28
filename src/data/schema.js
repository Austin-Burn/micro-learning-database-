/**
 * Learning Node Data Structure
 * Hierarchical system for organizing learning content with unlimited nesting
 */

// Core Learning Node Schema
export const LearningNodeSchema = {
    id: 'string',           // Unique identifier
    name: 'string',         // Display name
    mastery_percentage: 'number',  // 0-100 mastery level
    last_practiced: 'date', // Last practice date
    notes: 'string',         // Free-form notes
    parent_id: 'string|null', // Reference to parent node (null for root)
    node_type: 'string',    // Type: 'subject', 'topic', 'concept', 'skill', etc.
    metadata: 'object',     // Flexible data storage for AI
    created_at: 'date',
    updated_at: 'date'
};

// Example Data Structure
export const ExampleLearningHierarchy = {
    // Root Level - Subjects
    subjects: [
        {
            id: 'math-001',
            name: 'Mathematics',
            mastery_percentage: 75,
            last_practiced: '2024-10-25',
            notes: 'Focus on algebra and geometry',
            parent_id: null,
            node_type: 'subject',
            metadata: {
                difficulty_level: 'intermediate',
                estimated_hours: 120,
                prerequisites: []
            },
            children: [
                {
                    id: 'algebra-001',
                    name: 'Algebra',
                    mastery_percentage: 80,
                    last_practiced: '2024-10-24',
                    notes: 'Good with linear equations, need work on quadratics',
                    parent_id: 'math-001',
                    node_type: 'topic',
                    metadata: {
                        difficulty_level: 'intermediate',
                        estimated_hours: 40,
                        prerequisites: ['arithmetic-001']
                    },
                    children: [
                        {
                            id: 'linear-eq-001',
                            name: 'Linear Equations',
                            mastery_percentage: 90,
                            last_practiced: '2024-10-23',
                            notes: 'Mastered basic solving, working on word problems',
                            parent_id: 'algebra-001',
                            node_type: 'concept',
                            metadata: {
                                difficulty_level: 'beginner',
                                estimated_hours: 8,
                                prerequisites: ['arithmetic-001'],
                                ai_notes: 'Student excels at mechanical solving, needs contextual application practice'
                            },
                            children: [
                                {
                                    id: 'slope-intercept-001',
                                    name: 'Slope-Intercept Form',
                                    mastery_percentage: 95,
                                    last_practiced: '2024-10-22',
                                    notes: 'y = mx + b form mastered',
                                    parent_id: 'linear-eq-001',
                                    node_type: 'skill',
                                    metadata: {
                                        difficulty_level: 'beginner',
                                        estimated_hours: 2,
                                        prerequisites: ['linear-eq-001'],
                                        ai_notes: 'Ready for advanced applications'
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};

export default LearningNodeSchema;

