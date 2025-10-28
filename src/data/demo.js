/**
 * Learning Data System Demo
 * Demonstrates the hierarchical learning node system
 */
import { LearningNodeManager } from './manager.js';
import { LearningNodeAPI } from './api.js';

// Initialize the system
const dataManager = new LearningNodeManager();
const api = new LearningNodeAPI();

// Demo: Create a learning hierarchy
export function createDemoData() {
    console.log('Creating demo learning hierarchy...');

    // Create root subject: Mathematics
    const mathSubject = dataManager.createNode({
        name: 'Mathematics',
        mastery_percentage: 75,
        notes: 'Focus on algebra and geometry',
        node_type: 'subject',
        metadata: {
            difficulty_level: 'intermediate',
            estimated_hours: 120
        }
    });

    // Create topic: Algebra
    const algebraTopic = dataManager.createNode({
        name: 'Algebra',
        mastery_percentage: 80,
        notes: 'Good with linear equations, need work on quadratics',
        parent_id: mathSubject.id,
        node_type: 'topic',
        metadata: {
            difficulty_level: 'intermediate',
            estimated_hours: 40
        }
    });

    // Create concept: Linear Equations
    const linearEqConcept = dataManager.createNode({
        name: 'Linear Equations',
        mastery_percentage: 90,
        notes: 'Mastered basic solving, working on word problems',
        parent_id: algebraTopic.id,
        node_type: 'concept',
        metadata: {
            difficulty_level: 'beginner',
            estimated_hours: 8,
            ai_notes: 'Student excels at mechanical solving, needs contextual application practice'
        }
    });

    // Create skill: Slope-Intercept Form
    const slopeInterceptSkill = dataManager.createNode({
        name: 'Slope-Intercept Form',
        mastery_percentage: 95,
        notes: 'y = mx + b form mastered',
        parent_id: linearEqConcept.id,
        node_type: 'skill',
        metadata: {
            difficulty_level: 'beginner',
            estimated_hours: 2,
            ai_notes: 'Ready for advanced applications'
        }
    });

    // Create another skill: Graphing
    const graphingSkill = dataManager.createNode({
        name: 'Graphing Linear Equations',
        mastery_percentage: 70,
        notes: 'Can plot points, need practice with slope interpretation',
        parent_id: linearEqConcept.id,
        node_type: 'skill',
        metadata: {
            difficulty_level: 'intermediate',
            estimated_hours: 4,
            ai_notes: 'Visual learning preference detected'
        }
    });

    console.log('Demo data created successfully!');
    return {
        mathSubject,
        algebraTopic,
        linearEqConcept,
        slopeInterceptSkill,
        graphingSkill
    };
}

// Demo: Test API operations
export function testAPI() {
    console.log('Testing API operations...');

    // Test getting root nodes
    const rootNodes = api.getRootNodes();
    console.log('Root nodes:', rootNodes);

    // Test searching
    const searchResults = api.searchNodes('algebra');
    console.log('Search results for "algebra":', searchResults);

    // Test mastery filtering
    const lowMastery = api.getNodesByMastery(0, 75);
    console.log('Nodes with mastery 0-75%:', lowMastery);

    // Test updating mastery
    const updatedNode = api.updateMastery(searchResults.data[0].id, 85);
    console.log('Updated mastery:', updatedNode);

    // Test adding notes
    const notesAdded = api.addNotes(searchResults.data[0].id, 'Updated: Ready for quadratic equations');
    console.log('Added notes:', notesAdded);
}

// Demo: Show data structure
export function showDataStructure() {
    console.log('Current data structure:');
    console.log('Total nodes:', dataManager.nodes.size);
    console.log('Root nodes:', dataManager.getRootNodes().length);
    
    // Show hierarchy
    const rootNodes = dataManager.getRootNodes();
    rootNodes.forEach(root => {
        console.log(`\n📚 ${root.name} (${root.mastery_percentage}% mastery)`);
        showChildren(root, 1);
    });
}

function showChildren(node, depth) {
    const indent = '  '.repeat(depth);
    node.children.forEach(child => {
        console.log(`${indent}📖 ${child.name} (${child.mastery_percentage}% mastery)`);
        if (child.children.length > 0) {
            showChildren(child, depth + 1);
        }
    });
}

// Export for use in other modules
export { dataManager, api };

// Auto-run demo if this file is executed directly
if (typeof window !== 'undefined') {
    // Browser environment
    window.LearningDataDemo = {
        createDemoData,
        testAPI,
        showDataStructure,
        dataManager,
        api
    };
}

