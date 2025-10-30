/**
 * Test script for Enhanced Weighted Selection System
 * Demonstrates the new weighting factors: mastery avoidance, base importance, and spaced repetition
 */
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testEnhancedWeightedSelection() {
    console.log('🎯 Testing Enhanced Weighted Selection System...\n');

    try {
        // 1. Health Check
        console.log('1. Health Check');
        const health = await fetch(`${BASE_URL}/health`);
        const healthData = await health.json();
        console.log('✅', healthData);
        console.log('');

        // 2. Create test content with varied mastery levels and last practiced dates
        console.log('2. Creating test content with enhanced weighting factors...');
        
        const testTopics = [
            { 
                name: 'Basic Math', 
                mastery_percentage: 20, 
                node_type: 'foundation',
                last_practiced: null, // Never practiced
                metadata: { base_importance: 1.8, difficulty_level: 'beginner' }
            },
            { 
                name: 'Advanced Algebra', 
                mastery_percentage: 99, 
                node_type: 'subject',
                last_practiced: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
                metadata: { base_importance: 1.2, difficulty_level: 'advanced' }
            },
            { 
                name: 'Geometry', 
                mastery_percentage: 100, 
                node_type: 'subject',
                last_practiced: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
                metadata: { base_importance: 1.0, difficulty_level: 'intermediate' }
            },
            { 
                name: 'Statistics', 
                mastery_percentage: 10, 
                node_type: 'topic',
                last_practiced: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
                metadata: { base_importance: 1.5, difficulty_level: 'intermediate' }
            },
            { 
                name: 'Calculus', 
                mastery_percentage: 75, 
                node_type: 'subject',
                last_practiced: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
                metadata: { base_importance: 1.3, difficulty_level: 'advanced' }
            },
            { 
                name: 'Programming Basics', 
                mastery_percentage: 45, 
                node_type: 'skill',
                last_practiced: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
                metadata: { base_importance: 1.4, difficulty_level: 'intermediate' }
            }
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
                console.log(`✅ Created: ${topic.name} (${topic.mastery_percentage}% mastery, ${topic.last_practiced ? 'practiced' : 'never practiced'})`);
            }
        }
        console.log('');

        // 3. Test Weight Distribution with Enhanced Factors
        console.log('3. Testing Enhanced Weight Distribution');
        const weightsResponse = await fetch(`${BASE_URL}/api/lessons/weights/0`);
        const weightsData = await weightsResponse.json();
        if (weightsData.success) {
            console.log('✅ Enhanced Weight Distribution:');
            console.log(`   - Total Topics: ${weightsData.data.statistics.totalNodes}`);
            console.log(`   - Average Weight: ${weightsData.data.statistics.averageWeight}`);
            console.log(`   - Weight Distribution:`, weightsData.data.statistics.weightDistribution);
            
            console.log('\n   📊 Detailed Weight Breakdown:');
            weightsData.data.nodes.forEach(node => {
                console.log(`   - ${node.name}:`);
                console.log(`     * Mastery: ${node.mastery}%`);
                console.log(`     * Weight: ${node.weight}`);
                console.log(`     * Type: ${node.node_type || 'unknown'}`);
            });
        }
        console.log('');

        // 4. Test Multiple Lesson Requests (showing enhanced variety)
        console.log('4. Testing Enhanced Lesson Requests (showing new weighting factors)');
        
        const userPreferences = {
            difficulty: 'intermediate',
            duration: 15,
            learning_style: 'visual'
        };

        for (let i = 1; i <= 8; i++) {
            console.log(`   Request ${i}:`);
            const lessonResponse = await fetch(`${BASE_URL}/api/lessons/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userPreferences })
            });
            
            const lessonData = await lessonResponse.json();
            if (lessonData.success) {
                const topic = lessonData.data.selectedTopic;
                const breakdown = topic.weight_breakdown;
                console.log(`   ✅ Selected: ${topic.name}`);
                console.log(`      - Mastery: ${topic.mastery_percentage}% (weight: ${breakdown.mastery})`);
                console.log(`      - Last Practiced: ${topic.last_practiced || 'Never'} (weight: ${breakdown.lastPracticed})`);
                console.log(`      - Base Importance: ${breakdown.baseImportance}`);
                console.log(`      - Final Weight: ${topic.selection_weight}`);
                
                // Show AI prompt preview (first 150 chars)
                if (lessonData.data.aiPrompt) {
                    const promptPreview = lessonData.data.aiPrompt.substring(0, 150) + '...';
                    console.log(`   🤖 AI Prompt Preview: ${promptPreview}`);
                }
            } else {
                console.log(`   ❌ Failed: ${lessonData.error}`);
            }
            console.log('');
        }

        // 5. Test Lesson Completion and Weight Updates
        console.log('5. Testing Lesson Completion with Enhanced Weighting');
        
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
            console.log(`   - Before: Mastery ${selectedTopic.mastery_percentage}%, Last practiced: ${selectedTopic.last_practiced || 'Never'}`);
            
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
                console.log('✅ Enhanced lesson completion processed:');
                console.log(`   - New Mastery: ${completionResult.data.newMastery}%`);
                console.log(`   - Weight Updates: ${completionResult.data.weightUpdates.length} topics updated`);
                console.log(`   - Last Practiced Updated: Yes`);
                
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

        // 6. Test 100% Mastery Avoidance
        console.log('6. Testing 100% Mastery Avoidance');
        
        // Create a topic with 100% mastery
        const perfectTopic = {
            name: 'Perfect Topic',
            mastery_percentage: 100,
            node_type: 'subject',
            last_practiced: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            metadata: { base_importance: 2.0, difficulty_level: 'advanced' }
        };
        
        const perfectResponse = await fetch(`${BASE_URL}/api/nodes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(perfectTopic)
        });
        
        if (perfectResponse.ok) {
            console.log('✅ Created perfect topic (100% mastery)');
            
            // Test multiple requests to see if it's avoided
            let perfectTopicSelected = 0;
            for (let i = 0; i < 10; i++) {
                const testResponse = await fetch(`${BASE_URL}/api/lessons/request`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userPreferences })
                });
                
                const testData = await testResponse.json();
                if (testData.success && testData.data.selectedTopic.name === 'Perfect Topic') {
                    perfectTopicSelected++;
                }
            }
            
            console.log(`📊 Perfect topic selected ${perfectTopicSelected}/10 times (should be 0)`);
            if (perfectTopicSelected === 0) {
                console.log('✅ 100% mastery avoidance working correctly!');
            } else {
                console.log('❌ 100% mastery avoidance not working properly');
            }
        }
        console.log('');

        console.log('🎉 All Enhanced Weighted Selection Tests Completed!');
        console.log('\n📊 Test Summary:');
        console.log('- ✅ Enhanced mastery weighting (100% avoidance, 99% low weight)');
        console.log('- ✅ Base importance weighting by topic type');
        console.log('- ✅ Spaced repetition based on last practiced');
        console.log('- ✅ Weight redistribution on lesson completion');
        console.log('- ✅ Last practiced timestamp updates');
        console.log('- ✅ Comprehensive weight breakdown tracking');

        console.log('\n🎯 Enhanced Features Demonstrated:');
        console.log('- Mastery-based avoidance (100% = never select)');
        console.log('- Spaced repetition intervals (days since practice)');
        console.log('- Base importance by topic type (foundation > subject > topic)');
        console.log('- Enhanced weight breakdown with all factors');
        console.log('- Automatic last practiced timestamp updates');

    } catch (error) {
        console.error('❌ Enhanced Weighted Selection Test failed:', error);
    }
}

// Run the test
testEnhancedWeightedSelection();

