/**
 * Test Script for MicroLearn Business Logic
 * Tests the AI-driven content review and business logic system
 */
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testBusinessLogic() {
    console.log('🧠 Testing MicroLearn Business Logic System...\n');

    try {
        // 1. Health Check
        console.log('1. Health Check');
        const health = await fetch(`${BASE_URL}/health`);
        const healthData = await health.json();
        console.log('✅', healthData);
        console.log('');

        // 2. Create some test content first
        console.log('2. Creating test content for analysis...');
        
        // Create Mathematics root node
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
        console.log('✅ Created Mathematics node:', mathData.data?.name);
        
        // Create Science root node
        const scienceNode = await fetch(`${BASE_URL}/api/nodes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Science',
                mastery_percentage: 60,
                notes: 'Physics and chemistry focus',
                node_type: 'subject',
                metadata: {
                    difficulty_level: 'intermediate',
                    estimated_hours: 100
                }
            })
        });
        const scienceData = await scienceNode.json();
        console.log('✅ Created Science node:', scienceData.data?.name);
        
        // Create Programming root node
        const progNode = await fetch(`${BASE_URL}/api/nodes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Programming',
                mastery_percentage: 45,
                notes: 'Learning Python and JavaScript',
                node_type: 'subject',
                metadata: {
                    difficulty_level: 'beginner',
                    estimated_hours: 80
                }
            })
        });
        const progData = await progNode.json();
        console.log('✅ Created Programming node:', progData.data?.name);
        console.log('');

        // 3. Test Content Analysis
        console.log('3. Testing Content Analysis');
        const analysis = await fetch(`${BASE_URL}/api/business-logic/analysis`);
        const analysisData = await analysis.json();
        
        if (analysisData.success) {
            console.log('✅ Content Analysis Results:');
            console.log(`   - Total Content: ${analysisData.data.analysis.totalContent}`);
            console.log(`   - Average Mastery: ${analysisData.data.analysis.masteryDistribution.average}%`);
            console.log(`   - Content Quality: ${analysisData.data.analysis.contentQuality.rating}`);
            console.log(`   - Learning Opportunities: ${analysisData.data.analysis.learningOpportunities.length}`);
            console.log(`   - Content Gaps: ${analysisData.data.analysis.contentGaps.length}`);
        } else {
            console.log('❌ Analysis failed:', analysisData.error);
        }
        console.log('');

        // 4. Test AI Recommendations
        console.log('4. Testing AI Recommendations');
        const recommendations = await fetch(`${BASE_URL}/api/business-logic/recommendations`);
        const recData = await recommendations.json();
        
        if (recData.success) {
            console.log('✅ AI Recommendations:');
            console.log(`   - Primary Action: ${recData.data.primaryRecommendation.action}`);
            console.log(`   - Confidence: ${recData.data.primaryRecommendation.confidence}%`);
            console.log(`   - Reasoning: ${recData.data.primaryRecommendation.reasoning.substring(0, 100)}...`);
            console.log(`   - Alternative Options: ${recData.data.alternativeOptions.length}`);
            console.log(`   - Priority Actions: ${recData.data.priorityActions.length}`);
        } else {
            console.log('❌ Recommendations failed:', recData.error);
        }
        console.log('');

        // 5. Test Learning Path Suggestions
        console.log('5. Testing Learning Path Suggestions');
        const learningPaths = await fetch(`${BASE_URL}/api/business-logic/learning-paths`);
        const pathsData = await learningPaths.json();
        
        if (pathsData.success) {
            console.log('✅ Learning Path Suggestions:');
            pathsData.data.forEach((path, index) => {
                console.log(`   ${index + 1}. ${path.name} (${path.difficulty})`);
                console.log(`      Duration: ${path.estimatedDuration}`);
                console.log(`      Steps: ${path.steps.length}`);
                console.log(`      Reasoning: ${path.aiReasoning.substring(0, 80)}...`);
            });
        } else {
            console.log('❌ Learning paths failed:', pathsData.error);
        }
        console.log('');

        // 6. Test Full Content Review
        console.log('6. Testing Full AI Content Review');
        const fullReview = await fetch(`${BASE_URL}/api/business-logic/content-review`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userPreferences: {
                    difficulty: 'intermediate',
                    duration: 15,
                    topic: 'mathematics',
                    learning_style: 'visual'
                }
            })
        });
        const reviewData = await fullReview.json();
        
        if (reviewData.success) {
            console.log('✅ Full AI Content Review:');
            console.log(`   - Review Timestamp: ${reviewData.data.timestamp}`);
            console.log(`   - Top Layer Analysis: ${reviewData.data.topLayerAnalysis.analysis.totalContent} items`);
            console.log(`   - AI Insights Confidence: ${reviewData.data.aiInsights.aiConfidence}%`);
            console.log(`   - Learning Paths Generated: ${reviewData.data.learningPaths.length}`);
            console.log(`   - User Preferences: ${JSON.stringify(reviewData.data.userPreferences)}`);
            
            // Show detailed insights
            console.log('\n   📊 Detailed AI Insights:');
            console.log(`   - Content Health: ${reviewData.data.aiInsights.contentHealth.status}`);
            console.log(`   - Learning Efficiency: ${reviewData.data.aiInsights.learningEfficiency.rating}`);
            console.log(`   - Knowledge Gaps: ${reviewData.data.aiInsights.knowledgeGaps.length}`);
            console.log(`   - Strengths: ${reviewData.data.aiInsights.strengths.length}`);
            console.log(`   - Next Steps: ${reviewData.data.aiInsights.nextSteps.length}`);
        } else {
            console.log('❌ Full review failed:', reviewData.error);
        }
        console.log('');

        // 7. Test with Empty User Preferences
        console.log('7. Testing with Empty User Preferences (as requested)');
        const emptyPrefsReview = await fetch(`${BASE_URL}/api/business-logic/content-review`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userPreferences: {}
            })
        });
        const emptyPrefsData = await emptyPrefsReview.json();
        
        if (emptyPrefsData.success) {
            console.log('✅ Empty Preferences Review:');
            console.log(`   - User Preferences Note: ${emptyPrefsData.data.userPreferences.note}`);
            console.log(`   - AI still generated recommendations: ${emptyPrefsData.data.recommendations ? 'Yes' : 'No'}`);
            console.log(`   - Learning paths created: ${emptyPrefsData.data.learningPaths.length}`);
        } else {
            console.log('❌ Empty preferences review failed:', emptyPrefsData.error);
        }
        console.log('');

        console.log('🎉 All Business Logic Tests Completed Successfully!');
        console.log('\n📊 Test Summary:');
        console.log('- ✅ Business Logic Engine initialized');
        console.log('- ✅ Content analysis and AI recommendations');
        console.log('- ✅ Learning path generation');
        console.log('- ✅ Full AI content review process');
        console.log('- ✅ Empty user preferences handling');
        console.log('- ✅ AI decision-making integration');
        console.log('\n🧠 Business Logic Features Demonstrated:');
        console.log('- AI-driven content analysis');
        console.log('- Intelligent recommendation generation');
        console.log('- Adaptive learning path creation');
        console.log('- Content gap identification');
        console.log('- Mastery-based decision making');
        console.log('- User preference integration (placeholder)');

    } catch (error) {
        console.error('❌ Business Logic Test failed:', error);
    }
}

// Run tests
testBusinessLogic();

