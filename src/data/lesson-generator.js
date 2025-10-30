/**
 * Lesson Generator
 * Orchestrates the lesson request workflow and handles lesson completion feedback
 */
import { BusinessLogicEngine } from './business-logic.js';

export class LessonGenerator {
    constructor(businessLogic = null) {
        this.businessLogic = businessLogic || new BusinessLogicEngine();
        this.isInitialized = false;
    }

    /**
     * Initialize the lesson generator
     */
    async initialize() {
        if (!this.isInitialized) {
            await this.businessLogic.initialize();
            this.isInitialized = true;
            console.log('✅ Lesson Generator initialized');
        }
        return this.isInitialized;
    }

    /**
     * Request a new lesson using weighted random selection
     * @param {Object} userPreferences - User preferences and settings
     * @returns {Object} Lesson request with selected topic and context
     */
    async requestLesson(userPreferences = {}) {
        await this.initialize();
        
        console.log('📚 Requesting new lesson...');
        
        try {
            // Use business logic to generate lesson request
            const lessonRequest = await this.businessLogic.generateLessonRequest(userPreferences);
            
            if (!lessonRequest.success) {
                return lessonRequest;
            }

            // Enhance lesson request with additional context
            const enhancedRequest = {
                ...lessonRequest,
                lessonId: this.generateLessonId(),
                requestType: 'weighted_random',
                userPreferences,
                readyForAI: true,
                aiPromptContext: this.buildAIPromptContext(lessonRequest)
            };

            console.log(`✅ Lesson request generated: ${enhancedRequest.selectedTopic.name}`);
            return enhancedRequest;

        } catch (error) {
            console.error('❌ Lesson request failed:', error);
            return {
                success: false,
                error: error.message,
                code: 500
            };
        }
    }

    /**
     * Handle lesson completion feedback
     * @param {string} lessonId - Lesson ID
     * @param {string} nodeId - Node ID of the completed lesson
     * @param {boolean} passed - Whether the lesson was passed
     * @param {number} score - Lesson score (0-100)
     * @param {Object} additionalData - Additional lesson data
     * @returns {Object} Completion feedback result
     */
    async completeLessonFeedback(lessonId, nodeId, passed, score = null, additionalData = {}) {
        await this.initialize();
        
        console.log(`📝 Processing lesson completion feedback for lesson ${lessonId}...`);
        
        try {
            // Use business logic to handle lesson completion
            const completionResult = await this.businessLogic.handleLessonComplete(nodeId, passed, score);
            
            if (!completionResult.success) {
                return completionResult;
            }

            // Enhance completion result with lesson-specific data
            const enhancedResult = {
                ...completionResult,
                lessonId,
                completionTimestamp: new Date().toISOString(),
                feedback: this.generateFeedback(passed, score),
                nextRecommendations: this.generateNextRecommendations(completionResult),
                additionalData
            };

            console.log(`✅ Lesson completion processed: ${passed ? 'PASSED' : 'FAILED'}`);
            return enhancedResult;

        } catch (error) {
            console.error('❌ Lesson completion processing failed:', error);
            return {
                success: false,
                error: error.message,
                code: 500
            };
        }
    }

    /**
     * Get current weight distribution for debugging
     * @param {number} level - Level to get weights for (0 for root level)
     * @returns {Object} Weight distribution information
     */
    async getWeightDistribution(level = 0) {
        await this.initialize();
        return await this.businessLogic.getWeightDistribution(level);
    }

    /**
     * Generate a unique lesson ID
     * @returns {string} Unique lesson ID
     */
    generateLessonId() {
        return `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Build AI prompt context for lesson generation
     * @param {Object} lessonRequest - Lesson request data
     * @returns {Object} AI prompt context
     */
    buildAIPromptContext(lessonRequest) {
        const { selectedTopic, lessonContext } = lessonRequest;
        
        return {
            topic: {
                name: selectedTopic.name,
                mastery: selectedTopic.mastery_percentage,
                difficulty: lessonContext.topic.difficulty,
                metadata: selectedTopic.metadata
            },
            user: {
                preferences: lessonContext.user.userPreferences,
                experience: lessonContext.user.topicMastery,
                learningHistory: lessonContext.user.learningHistory
            },
            lesson: {
                type: lessonContext.lessonType,
                objectives: lessonContext.learningObjectives,
                duration: lessonContext.estimatedDuration
            },
            context: {
                weightStatistics: lessonRequest.weightStatistics,
                selectionMethod: 'weighted_random',
                timestamp: lessonRequest.timestamp
            }
        };
    }

    /**
     * Generate feedback based on lesson result
     * @param {boolean} passed - Whether lesson was passed
     * @param {number} score - Lesson score
     * @returns {Object} Feedback information
     */
    generateFeedback(passed, score) {
        if (passed) {
            if (score >= 90) {
                return {
                    message: 'Excellent work! You\'ve mastered this topic.',
                    encouragement: 'Keep up the great work!',
                    level: 'excellent'
                };
            } else if (score >= 70) {
                return {
                    message: 'Good job! You\'re making solid progress.',
                    encouragement: 'You\'re on the right track!',
                    level: 'good'
                };
            } else {
                return {
                    message: 'You passed! There\'s still room for improvement.',
                    encouragement: 'Practice makes perfect!',
                    level: 'passing'
                };
            }
        } else {
            return {
                message: 'Don\'t worry! Learning takes time and practice.',
                encouragement: 'Try again - you\'ll get it!',
                level: 'needs_work'
            };
        }
    }

    /**
     * Generate next recommendations based on lesson completion
     * @param {Object} completionResult - Lesson completion result
     * @returns {Array} Next recommendations
     */
    generateNextRecommendations(completionResult) {
        const recommendations = [];
        
        if (completionResult.passed) {
            recommendations.push('Great job! Consider trying a more advanced topic.');
            recommendations.push('Your mastery has improved - keep practicing!');
            
            if (completionResult.weightUpdates && completionResult.weightUpdates.length > 0) {
                recommendations.push('Weight has been redistributed to other topics for variety.');
            }
        } else {
            recommendations.push('Practice this topic again to improve your understanding.');
            recommendations.push('Consider reviewing related foundational concepts.');
            recommendations.push('Take your time - learning is a process.');
        }
        
        return recommendations;
    }

    /**
     * Get lesson statistics
     * @returns {Object} Lesson statistics
     */
    async getLessonStatistics() {
        await this.initialize();
        
        try {
            // Get weight distribution for root level
            const weightDistribution = await this.getWeightDistribution(0);
            
            return {
                success: true,
                statistics: {
                    totalTopics: weightDistribution.statistics?.totalNodes || 0,
                    averageWeight: weightDistribution.statistics?.averageWeight || 100,
                    weightDistribution: weightDistribution.statistics?.weightDistribution || {},
                    lastUpdated: new Date().toISOString()
                },
                message: 'Lesson statistics retrieved successfully'
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
     * Reset all weights to default (admin function)
     * @param {number} level - Level to reset (0 for root level)
     * @returns {Object} Reset result
     */
    async resetWeights(level = 0) {
        await this.initialize();
        
        try {
            // Get current nodes
            let nodes;
            if (level === 0) {
                nodes = await this.businessLogic.manager.getRootNodes();
            } else {
                nodes = this.businessLogic.dbManager.getLevelNodes(level);
            }
            
            // Reset all weights to default
            const resetNodes = nodes.map(node => ({
                ...node,
                selection_weight: 100
            }));
            
            // Update weights in database
            await this.businessLogic.updateNodeWeights(resetNodes);
            
            console.log(`✅ Reset weights for ${resetNodes.length} nodes at level ${level}`);
            
            return {
                success: true,
                level,
                nodesReset: resetNodes.length,
                message: `Reset ${resetNodes.length} node weights to default`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: 500
            };
        }
    }
}

export default LessonGenerator;
