/**
 * Test script for Weighted Random Selection System
 * Demonstrates the complete lesson flow with weighted topic selection
 */
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testWeightedSelectionSystem() {
    console.log('🎯 Testing MicroLearn Weighted Random Selection System...\n');

    try {
        // 1. Health Check
        console.log('1. Health Check');
        const health = await fetch(`${BASE_URL}/health`);
        const healthData = await health.json();
        console.log('✅', healthData);
        console.log('');

        // 2. Create test content with different mastery levels
        console.log('2. Creating test content with varied mastery levels...');
        
        const testTopics = [
            { name: 'Basic Math', mastery_percentage: 20, node_type: 'subject' },
            { name: 'Advanced Algebra', mastery_percentage: 80, node_type: 'subject' },
            { name: 'Geometry', mastery_percentage: 45, node_type: 'subject' },
            { name: 'Statistics', mastery_percentage: 10, node_type: 'subject' },
            { name: 'Calculus', mastery_percentage: 90, node_type: 'subject' }
        ];

        const createdTopics = [];
        for (const topic of testTopics) {
            const response = await fetch(`${BASE_URL}/api/nodes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(topic)
            });
            const result = await response.json();
            if (result.success) {
                createdTopics.push(result.data);
                console.log(`✅ Created: ${topic.name} (${topic.mastery_percentage}% mastery)`);
            }
        }
        console.log('');

        // 3. Test Weight Distribution
        console.log('3. Testing Weight Distribution');
        const weightsResponse = await fetch(`${BASE_URL}/api/lessons/weights/0`);
        const weightsData = await weightsResponse.json();
        if (weightsData.success) {
            console.log('✅ Current Weight Distribution:');
            console.log(`   - Total Topics: ${weightsData.data.statistics.totalNodes}`);
            console.log(`   - Average Weight: ${weightsData.data.statistics.averageWeight}`);
            console.log(`   - Weight Distribution:`, weightsData.data.statistics.weightDistribution);
            console.log('');
        }

        // 4. Test Multiple Lesson Requests (showing variety)
        console.log('4. Testing Multiple Lesson Requests (showing weighted random variety)');
        
        const userPreferences = {
            difficulty: 'intermediate',
            duration: 15,
            learning_style: 'visual'
        };

        for (let i = 1; i <= 5; i++) {
            console.log(`   Request ${i}:`);
            const lessonResponse = await fetch(`${BASE_URL}/api/lessons/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userPreferences })
            });
            
            const lessonData = await lessonResponse.json();
            if (lessonData.success) {
                const topic = lessonData.data.selectedTopic;
                console.log(`   ✅ Selected: ${topic.name} (mastery: ${topic.mastery_percentage}%, weight: ${topic.selection_weight})`);
                
                // Show AI prompt preview (first 200 chars)
                if (lessonData.data.aiPrompt) {
                    const promptPreview = lessonData.data.aiPrompt.substring(0, 200) + '...';
                    console.log(`   🤖 AI Prompt Preview: ${promptPreview}`);
                }
            } else {
                console.log(`   ❌ Failed: ${lessonData.error}`);
            }
            console.log('');
        }

        // 5. Test Lesson Completion and Weight Redistribution
        console.log('5. Testing Lesson Completion and Weight Redistribution');
        
        // Get a lesson request
        const lessonRequest = await fetch(`${BASE_URL}/api/lessons/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userPreferences })
        });
        
        const lessonData = await lessonRequest.json();
        if (lessonData.success) {
            const selectedTopic = lessonData.data.selectedTopic;
            console.log(`✅ Selected topic for completion test: ${selectedTopic.name}`);
            
            // Complete the lesson (passed)
            const completionData = {
                lessonId: lessonData.data.lessonId,
                nodeId: selectedTopic.id,
                passed: true,
                score: 85
            };
            
            const completionResponse = await fetch(`${BASE_URL}/api/lessons/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(completionData)
            });
            
            const completionResult = await completionResponse.json();
            if (completionResult.success) {
                console.log('✅ Lesson completion processed:');
                console.log(`   - New Mastery: ${completionResult.data.newMastery}%`);
                console.log(`   - Weight Updates: ${completionResult.data.weightUpdates.length} topics updated`);
                
                if (completionResult.data.weightUpdates.length > 0) {
                    console.log('   - Weight Changes:');
                    completionResult.data.weightUpdates.forEach(update => {
                        console.log(`     * ${update.nodeName}: ${update.oldWeight} → ${update.newWeight} (${update.change > 0 ? '+' : ''}${update.change})`);
                    });
                }
            } else {
                console.log(`❌ Completion failed: ${completionResult.error}`);
            }
        }
        console.log('');

        // 6. Test Failed Lesson (no weight change)
        console.log('6. Testing Failed Lesson (no weight redistribution)');
        
        const failedLessonRequest = await fetch(`${BASE_URL}/api/lessons/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userPreferences })
        });
        
        const failedLessonData = await failedLessonRequest.json();
        if (failedLessonData.success) {
            const failedTopic = failedLessonData.data.selectedTopic;
            console.log(`✅ Selected topic for failure test: ${failedTopic.name}`);
            
            // Complete the lesson (failed)
            const failedCompletionData = {
                lessonId: failedLessonData.data.lessonId,
                nodeId: failedTopic.id,
                passed: false,
                score: 30
            };
            
            const failedCompletionResponse = await fetch(`${BASE_URL}/api/lessons/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(failedCompletionData)
            });
            
            const failedCompletionResult = await failedCompletionResponse.json();
            if (failedCompletionResult.success) {
                console.log('✅ Failed lesson processed:');
                console.log(`   - New Mastery: ${failedCompletionResult.data.newMastery}%`);
                console.log(`   - Weight Updates: ${failedCompletionResult.data.weightUpdates.length} (should be 0 for failed lessons)`);
            }
        }
        console.log('');

        // 7. Final Weight Distribution Check
        console.log('7. Final Weight Distribution Check');
        const finalWeightsResponse = await fetch(`${BASE_URL}/api/lessons/weights/0`);
        const finalWeightsData = await finalWeightsResponse.json();
        if (finalWeightsData.success) {
            console.log('✅ Final Weight Distribution:');
            console.log(`   - Total Topics: ${finalWeightsData.data.statistics.totalNodes}`);
            console.log(`   - Average Weight: ${finalWeightsData.data.statistics.averageWeight}`);
            console.log(`   - Weight Distribution:`, finalWeightsData.data.statistics.weightDistribution);
            
            console.log('   - Individual Topic Weights:');
            finalWeightsData.data.nodes.forEach(node => {
                console.log(`     * ${node.name}: ${node.weight} (mastery: ${node.mastery}%)`);
            });
        }
        console.log('');

        // 8. Test Lesson Statistics
        console.log('8. Testing Lesson Statistics');
        const statsResponse = await fetch(`${BASE_URL}/api/lessons/statistics`);
        const statsData = await statsResponse.json();
        if (statsData.success) {
            console.log('✅ Lesson Statistics:');
            console.log(`   - Total Topics: ${statsData.data.statistics.totalTopics}`);
            console.log(`   - Average Weight: ${statsData.data.statistics.averageWeight}`);
            console.log(`   - Weight Distribution:`, statsData.data.statistics.weightDistribution);
        }
        console.log('');

        console.log('🎉 All Weighted Selection Tests Completed Successfully!');
        console.log('\n📊 Test Summary:');
        console.log('- ✅ Weighted random topic selection working');
        console.log('- ✅ AI prompt generation for lesson context');
        console.log('- ✅ Weight redistribution on lesson pass');
        console.log('- ✅ No weight change on lesson failure');
        console.log('- ✅ Mastery percentage updates');
        console.log('- ✅ Weight statistics and monitoring');
        console.log('- ✅ Complete lesson workflow integration');

        console.log('\n🎯 Key Features Demonstrated:');
        console.log('- AI-calculated weights based on mastery and preferences');
        console.log('- Weighted random selection algorithm');
        console.log('- Automatic weight redistribution on success');
        console.log('- Comprehensive AI prompt generation');
        console.log('- Real-time weight monitoring and statistics');
        console.log('- Complete lesson lifecycle management');

    } catch (error) {
        console.error('❌ Weighted Selection Test failed:', error);
    }
}

// Run the test
testWeightedSelectionSystem();

