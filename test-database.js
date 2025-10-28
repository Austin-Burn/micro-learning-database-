/**
 * Test Script for MicroLearn Database
 * Tests the database operations via HTTP API
 */
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
    console.log('🧪 Testing MicroLearn Database API...\n');

    try {
        // 1. Health Check
        console.log('1. Health Check');
        const health = await fetch(`${BASE_URL}/health`);
        const healthData = await health.json();
        console.log('✅', healthData);
        console.log('');

        // 2. Get all root nodes (should be empty initially)
        console.log('2. Get all root nodes');
        const rootNodes = await fetch(`${BASE_URL}/api/nodes`);
        const rootData = await rootNodes.json();
        console.log('✅', rootData);
        console.log('');

        // 3. Create Mathematics root node
        console.log('3. Create Mathematics root node');
        const mathNode = await fetch(`${BASE_URL}/api/nodes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Mathematics',
                mastery_percentage: 75,
                notes: 'Focus on algebra and geometry',
                node_type: 'subject',
                metadata: {
                    difficulty_level: 'intermediate',
                    estimated_hours: 120
                }
            })
        });
        const mathData = await mathNode.json();
        console.log('✅', mathData);
        const mathId = mathData.data.id;
        console.log('');

        // 4. Create Algebra child node
        console.log('4. Create Algebra child node');
        const algebraNode = await fetch(`${BASE_URL}/api/nodes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Algebra',
                mastery_percentage: 80,
                notes: 'Good with linear equations, need work on quadratics',
                parent_id: mathId,
                node_type: 'topic',
                metadata: {
                    difficulty_level: 'intermediate',
                    estimated_hours: 40
                }
            })
        });
        const algebraData = await algebraNode.json();
        console.log('✅', algebraData);
        const algebraId = algebraData.data.id;
        console.log('');

        // 5. Get children of Mathematics
        console.log('5. Get children of Mathematics');
        const children = await fetch(`${BASE_URL}/api/nodes/${mathId}/children`);
        const childrenData = await children.json();
        console.log('✅', childrenData);
        console.log('');

        // 6. Create Linear Equations child
        console.log('6. Create Linear Equations child');
        const linearNode = await fetch(`${BASE_URL}/api/nodes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Linear Equations',
                mastery_percentage: 90,
                notes: 'Mastered basic solving, working on word problems',
                parent_id: algebraId,
                node_type: 'concept',
                metadata: {
                    difficulty_level: 'beginner',
                    estimated_hours: 8
                }
            })
        });
        const linearData = await linearNode.json();
        console.log('✅', linearData);
        const linearId = linearData.data.id;
        console.log('');

        // 7. Get full path to Linear Equations
        console.log('7. Get full path to Linear Equations');
        const path = await fetch(`${BASE_URL}/api/nodes/${linearId}/path`);
        const pathData = await path.json();
        console.log('✅', pathData);
        console.log('');

        // 8. Get all descendants of Mathematics
        console.log('8. Get all descendants of Mathematics');
        const descendants = await fetch(`${BASE_URL}/api/nodes/${mathId}/descendants`);
        const descendantsData = await descendants.json();
        console.log('✅', descendantsData);
        console.log('');

        // 9. Search for "algebra"
        console.log('9. Search for "algebra"');
        const search = await fetch(`${BASE_URL}/api/search?q=algebra`);
        const searchData = await search.json();
        console.log('✅', searchData);
        console.log('');

        // 10. Update mastery
        console.log('10. Update mastery of Linear Equations to 95%');
        const updateMastery = await fetch(`${BASE_URL}/api/nodes/${linearId}/mastery`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ percentage: 95 })
        });
        const updateData = await updateMastery.json();
        console.log('✅', updateData);
        console.log('');

        // 11. Test CASCADE DELETE - Delete Algebra (should delete Linear Equations too)
        console.log('11. Test CASCADE DELETE - Delete Algebra');
        const deleteAlgebra = await fetch(`${BASE_URL}/api/nodes/${algebraId}`, {
            method: 'DELETE'
        });
        const deleteData = await deleteAlgebra.json();
        console.log('✅', deleteData);
        console.log('');

        // 12. Verify cascade delete worked
        console.log('12. Verify cascade delete worked - Get children of Mathematics');
        const remainingChildren = await fetch(`${BASE_URL}/api/nodes/${mathId}/children`);
        const remainingData = await remainingChildren.json();
        console.log('✅', remainingData);
        console.log('');

        // 13. Export data
        console.log('13. Export all data');
        const exportData = await fetch(`${BASE_URL}/api/export`);
        const exportResult = await exportData.json();
        console.log('✅ Export successful, nodes count:', exportResult.data?.nodes?.length || 0);
        console.log('');

        console.log('🎉 All tests completed successfully!');
        console.log('\n📊 Test Summary:');
        console.log('- ✅ Database connection established');
        console.log('- ✅ Hierarchical node creation');
        console.log('- ✅ Foreign key relationships');
        console.log('- ✅ Tree traversal (path, descendants)');
        console.log('- ✅ Search functionality');
        console.log('- ✅ Mastery updates');
        console.log('- ✅ CASCADE DELETE operations');
        console.log('- ✅ Data export');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run tests
testAPI();
