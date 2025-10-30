/**
 * Business Logic Engine for MicroLearn
 * Handles AI-driven content review, analysis, and decision making
 */
import { LearningNodeManager } from './manager.js';
import { dbManager } from './database.js';
import { AIDecisionEngine } from './ai-decision-engine.js';
import { WeightedSelector } from './weighted-selector.js';

export class BusinessLogicEngine {
    constructor() {
        this.manager = new LearningNodeManager();
        this.aiEngine = new AIDecisionEngine();
        this.weightedSelector = new WeightedSelector();
        this.isInitialized = false;
    }

    /**
     * Initialize the business logic engine
     */
    async initialize() {
        if (!this.isInitialized) {
            await this.manager.initialize();
            this.isInitialized = true;
            console.log('✅ Business Logic Engine initialized');
        }
        return this.isInitialized;
    }

    /**
     * Main entry point: AI Content Review Process
     * Reviews topmost layer content and provides recommendations
     * @param {Object} userPreferences - User preferences (empty for now)
     * @returns {Object} AI analysis and recommendations
     */
    async performContentReview(userPreferences = {}) {
        await this.initialize();
        
        console.log('🔍 Starting AI Content Review Process...');
        
        try {
            // Step 1: Analyze topmost layer content
            const topLayerAnalysis = await this.analyzeTopLayerContent();
            
            // Step 2: Generate AI recommendations
            const recommendations = await this.generateRecommendations(topLayerAnalysis, userPreferences);
            
            // Step 3: Create learning path suggestions
            const learningPaths = await this.createLearningPathSuggestions(topLayerAnalysis, recommendations);
            
            // Step 4: Compile comprehensive review
            const review = {
                timestamp: new Date().toISOString(),
                topLayerAnalysis,
                recommendations,
                learningPaths,
                userPreferences: userPreferences || { note: 'No user preferences set yet' },
                aiInsights: await this.generateAIInsights(topLayerAnalysis)
            };

            console.log('✅ AI Content Review completed');
            return review;

        } catch (error) {
            console.error('❌ AI Content Review failed:', error);
            throw error;
        }
    }

    /**
     * Analyze content at the topmost layer (Level 1)
     * @returns {Object} Top layer analysis
     */
    async analyzeTopLayerContent() {
        console.log('📊 Analyzing top layer content...');
        
        try {
            // Get all root nodes (topmost layer)
            const rootNodes = await this.manager.getRootNodes();
            
            // Get level 1 nodes if they exist
            const level1Nodes = dbManager.getLevelNodes(1);
            
            // Combine both sources for comprehensive analysis
            const allTopLevelContent = [
                ...rootNodes.map(node => ({ ...node, source: 'legacy_root' })),
                ...level1Nodes.map(node => ({ ...node, source: 'level_1' }))
            ];

            const analysis = {
                totalContent: allTopLevelContent.length,
                contentBreakdown: this.analyzeContentBreakdown(allTopLevelContent),
                masteryDistribution: this.analyzeMasteryDistribution(allTopLevelContent),
                contentGaps: this.identifyContentGaps(allTopLevelContent),
                learningOpportunities: this.identifyLearningOpportunities(allTopLevelContent),
                recommendedFocus: this.recommendFocusAreas(allTopLevelContent),
                contentQuality: this.assessContentQuality(allTopLevelContent)
            };

            console.log(`📈 Found ${allTopLevelContent.length} top-level content items`);
            return {
                content: allTopLevelContent,
                analysis
            };

        } catch (error) {
            console.error('❌ Top layer analysis failed:', error);
            throw error;
        }
    }

    /**
     * Generate AI recommendations based on content analysis
     * @param {Object} topLayerAnalysis - Analysis results
     * @param {Object} userPreferences - User preferences
     * @returns {Object} AI recommendations
     */
    async generateRecommendations(topLayerAnalysis, userPreferences) {
        console.log('🤖 Generating AI recommendations...');
        
        const { content, analysis } = topLayerAnalysis;
        
        // Create AI decision context
        const context = {
            current_level: 0, // Top level
            available_nodes: content,
            user_preferences: userPreferences,
            learning_history: {},
            mastery_patterns: analysis.masteryDistribution,
            time_constraints: {},
            difficulty_progression: { progression: 'starting', recommended_difficulty: 'intermediate' },
            previous_decisions: []
        };

        // Process AI decision for top level
        const aiDecision = await this.aiEngine.processDecision(0, context, content, []);
        
        const recommendations = {
            primaryRecommendation: this.buildPrimaryRecommendation(aiDecision, topLayerAnalysis),
            alternativeOptions: this.buildAlternativeOptions(content, analysis),
            learningStrategy: this.buildLearningStrategy(analysis, userPreferences),
            contentCreationNeeds: this.identifyContentCreationNeeds(analysis),
            priorityActions: this.buildPriorityActions(analysis, aiDecision)
        };

        return recommendations;
    }

    /**
     * Create learning path suggestions
     * @param {Object} topLayerAnalysis - Analysis results
     * @param {Object} recommendations - AI recommendations
     * @returns {Array} Learning path suggestions
     */
    async createLearningPathSuggestions(topLayerAnalysis, recommendations) {
        console.log('🛤️ Creating learning path suggestions...');
        
        const { content, analysis } = topLayerAnalysis;
        
        const learningPaths = [
            {
                id: 'path_beginner',
                name: 'Beginner Learning Path',
                description: 'Structured path for new learners',
                difficulty: 'beginner',
                estimatedDuration: '2-3 weeks',
                steps: this.createBeginnerPath(content, analysis),
                aiReasoning: 'Focuses on foundational concepts with gradual complexity increase'
            },
            {
                id: 'path_intermediate',
                name: 'Intermediate Learning Path',
                description: 'Balanced path for learners with some experience',
                difficulty: 'intermediate',
                estimatedDuration: '3-4 weeks',
                steps: this.createIntermediatePath(content, analysis),
                aiReasoning: 'Builds on existing knowledge while introducing new concepts'
            },
            {
                id: 'path_advanced',
                name: 'Advanced Learning Path',
                description: 'Challenging path for experienced learners',
                difficulty: 'advanced',
                estimatedDuration: '4-6 weeks',
                steps: this.createAdvancedPath(content, analysis),
                aiReasoning: 'Focuses on complex applications and mastery development'
            },
            {
                id: 'path_custom',
                name: 'AI-Customized Path',
                description: 'Personalized path based on content analysis',
                difficulty: 'adaptive',
                estimatedDuration: 'variable',
                steps: this.createCustomPath(content, analysis, recommendations),
                aiReasoning: recommendations.primaryRecommendation.reasoning
            }
        ];

        return learningPaths;
    }

    /**
     * Generate AI insights about the content
     * @param {Object} topLayerAnalysis - Analysis results
     * @returns {Object} AI insights
     */
    async generateAIInsights(topLayerAnalysis) {
        const { analysis } = topLayerAnalysis;
        
        return {
            contentHealth: this.assessContentHealth(analysis),
            learningEfficiency: this.calculateLearningEfficiency(analysis),
            knowledgeGaps: analysis.contentGaps,
            strengths: this.identifyStrengths(analysis),
            improvementAreas: this.identifyImprovementAreas(analysis),
            aiConfidence: this.calculateAIConfidence(analysis),
            nextSteps: this.suggestNextSteps(analysis)
        };
    }

    // Helper methods for content analysis

    analyzeContentBreakdown(content) {
        const breakdown = {
            byType: {},
            byMastery: { beginner: 0, intermediate: 0, advanced: 0 },
            bySource: { legacy_root: 0, level_1: 0 },
            totalNodes: content.length
        };

        content.forEach(node => {
            // Count by type
            const type = node.node_type || 'unknown';
            breakdown.byType[type] = (breakdown.byType[type] || 0) + 1;
            
            // Count by mastery level
            if (node.mastery_percentage < 40) breakdown.byMastery.beginner++;
            else if (node.mastery_percentage < 80) breakdown.byMastery.intermediate++;
            else breakdown.byMastery.advanced++;
            
            // Count by source
            breakdown.bySource[node.source] = (breakdown.bySource[node.source] || 0) + 1;
        });

        return breakdown;
    }

    analyzeMasteryDistribution(content) {
        if (content.length === 0) return { average: 0, distribution: 'empty' };
        
        const masteryScores = content.map(node => node.mastery_percentage || 0);
        const average = masteryScores.reduce((sum, score) => sum + score, 0) / masteryScores.length;
        
        return {
            average: Math.round(average),
            min: Math.min(...masteryScores),
            max: Math.max(...masteryScores),
            distribution: average < 40 ? 'beginner' : average < 80 ? 'intermediate' : 'advanced',
            scores: masteryScores
        };
    }

    identifyContentGaps(content) {
        const gaps = [];
        
        // Identify missing foundational topics
        const commonSubjects = ['Mathematics', 'Science', 'Language', 'History', 'Arts'];
        const existingSubjects = content.map(node => node.name.toLowerCase());
        
        commonSubjects.forEach(subject => {
            if (!existingSubjects.some(existing => existing.includes(subject.toLowerCase()))) {
                gaps.push({
                    type: 'missing_subject',
                    subject: subject,
                    priority: 'high',
                    reasoning: `Missing foundational subject: ${subject}`
                });
            }
        });

        // Identify low mastery areas
        const lowMasteryNodes = content.filter(node => (node.mastery_percentage || 0) < 30);
        lowMasteryNodes.forEach(node => {
            gaps.push({
                type: 'low_mastery',
                nodeId: node.id,
                nodeName: node.name,
                currentMastery: node.mastery_percentage,
                priority: 'medium',
                reasoning: `Low mastery in ${node.name} (${node.mastery_percentage}%)`
            });
        });

        return gaps;
    }

    identifyLearningOpportunities(content) {
        const opportunities = [];
        
        // Find nodes with moderate mastery (good for improvement)
        const moderateMasteryNodes = content.filter(node => {
            const mastery = node.mastery_percentage || 0;
            return mastery >= 40 && mastery <= 70;
        });

        moderateMasteryNodes.forEach(node => {
            opportunities.push({
                nodeId: node.id,
                nodeName: node.name,
                currentMastery: node.mastery_percentage,
                potentialGain: 100 - node.mastery_percentage,
                reasoning: `Good improvement potential in ${node.name}`
            });
        });

        return opportunities;
    }

    recommendFocusAreas(content) {
        if (content.length === 0) {
            return [{
                area: 'Content Creation',
                priority: 'critical',
                reasoning: 'No content available - need to create foundational learning materials'
            }];
        }

        const recommendations = [];
        
        // Recommend based on mastery distribution
        const masteryDistribution = this.analyzeMasteryDistribution(content);
        
        if (masteryDistribution.average < 50) {
            recommendations.push({
                area: 'Foundation Building',
                priority: 'high',
                reasoning: 'Low average mastery suggests need for foundational content'
            });
        }

        // Recommend based on content gaps
        const gaps = this.identifyContentGaps(content);
        if (gaps.length > 0) {
            recommendations.push({
                area: 'Gap Filling',
                priority: 'medium',
                reasoning: `Found ${gaps.length} content gaps that need attention`
            });
        }

        return recommendations;
    }

    assessContentQuality(content) {
        if (content.length === 0) {
            return {
                score: 0,
                rating: 'empty',
                issues: ['No content available'],
                strengths: []
            };
        }

        const issues = [];
        const strengths = [];
        
        // Check for content completeness
        const nodesWithNotes = content.filter(node => node.notes && node.notes.trim().length > 0);
        const notesRatio = nodesWithNotes.length / content.length;
        
        if (notesRatio < 0.5) {
            issues.push('Many nodes lack detailed notes');
        } else {
            strengths.push('Good content documentation');
        }

        // Check mastery distribution
        const masteryDistribution = this.analyzeMasteryDistribution(content);
        if (masteryDistribution.average < 30) {
            issues.push('Very low mastery levels across content');
        } else if (masteryDistribution.average > 70) {
            strengths.push('High mastery levels indicate good content');
        }

        // Calculate quality score
        let score = 50; // Base score
        score += (notesRatio * 30); // Notes quality
        score += Math.min(masteryDistribution.average * 0.2, 20); // Mastery quality
        
        const rating = score < 30 ? 'poor' : score < 60 ? 'fair' : score < 80 ? 'good' : 'excellent';

        return {
            score: Math.round(score),
            rating,
            issues,
            strengths,
            metrics: {
                notesRatio: Math.round(notesRatio * 100),
                averageMastery: masteryDistribution.average,
                contentCount: content.length
            }
        };
    }

    // Recommendation building methods

    buildPrimaryRecommendation(aiDecision, topLayerAnalysis) {
        return {
            action: aiDecision.decision_type,
            reasoning: aiDecision.reasoning,
            confidence: aiDecision.confidence_score,
            targetContent: aiDecision.selected_node_id && topLayerAnalysis.content ? 
                topLayerAnalysis.content.find(c => c.id === aiDecision.selected_node_id) : null,
            nextSteps: this.getNextStepsFromDecision(aiDecision, topLayerAnalysis)
        };
    }

    buildAlternativeOptions(content, analysis) {
        const alternatives = [];
        
        // Suggest alternative content based on mastery levels
        const sortedByMastery = (content || []).sort((a, b) => (b.mastery_percentage || 0) - (a.mastery_percentage || 0));
        
        sortedByMastery.slice(0, 3).forEach(node => {
            alternatives.push({
                nodeId: node.id,
                nodeName: node.name,
                mastery: node.mastery_percentage,
                reasoning: `High mastery content: ${node.name} (${node.mastery_percentage}%)`,
                priority: 'medium'
            });
        });

        return alternatives;
    }

    buildLearningStrategy(analysis, userPreferences) {
        return {
            approach: analysis.masteryDistribution.average < 50 ? 'foundational' : 'progressive',
            pacing: 'adaptive',
            focus: analysis.recommendedFocus[0]?.area || 'general',
            methodology: 'micro-learning',
            assessment: 'continuous',
            reasoning: `Strategy based on average mastery of ${analysis.masteryDistribution.average}%`
        };
    }

    identifyContentCreationNeeds(analysis) {
        const needs = [];
        
        if (analysis.contentGaps.length > 0) {
            needs.push({
                type: 'gap_filling',
                priority: 'high',
                description: 'Create content to fill identified gaps',
                count: analysis.contentGaps.length
            });
        }

        if (analysis.contentBreakdown.totalNodes < 5) {
            needs.push({
                type: 'content_expansion',
                priority: 'medium',
                description: 'Expand content library for better learning options',
                currentCount: analysis.contentBreakdown.totalNodes
            });
        }

        return needs;
    }

    buildPriorityActions(analysis, aiDecision) {
        const actions = [];
        
        // High priority: Address content gaps
        if (analysis.contentGaps.length > 0) {
            actions.push({
                action: 'create_missing_content',
                priority: 'high',
                description: 'Create content for missing subjects',
                reasoning: 'Critical gaps identified in foundational content'
            });
        }

        // Medium priority: Improve low mastery content
        const lowMasteryNodes = analysis.content.filter(c => (c.mastery_percentage || 0) < 30);
        if (lowMasteryNodes.length > 0) {
            actions.push({
                action: 'improve_content_quality',
                priority: 'medium',
                description: 'Enhance content with low mastery levels',
                reasoning: `${lowMasteryNodes.length} nodes need improvement`
            });
        }

        // Low priority: Expand successful content
        const highMasteryNodes = analysis.content.filter(c => (c.mastery_percentage || 0) > 80);
        if (highMasteryNodes.length > 0) {
            actions.push({
                action: 'expand_successful_content',
                priority: 'low',
                description: 'Create advanced content for high-mastery areas',
                reasoning: 'Build on successful learning areas'
            });
        }

        return actions;
    }

    // Learning path creation methods

    createBeginnerPath(content, analysis) {
        const steps = [];
        
        // Find content with low mastery or create new beginner content
        const beginnerContent = content.filter(c => (c.mastery_percentage || 0) < 40);
        
        if (beginnerContent.length > 0) {
            steps.push({
                step: 1,
                action: 'review_foundations',
                content: beginnerContent[0],
                duration: '1 week',
                description: 'Review foundational concepts'
            });
        } else {
            steps.push({
                step: 1,
                action: 'create_foundations',
                content: null,
                duration: '1 week',
                description: 'Create foundational learning content'
            });
        }

        return steps;
    }

    createIntermediatePath(content, analysis) {
        const steps = [];
        
        // Find content with moderate mastery
        const intermediateContent = content.filter(c => {
            const mastery = c.mastery_percentage || 0;
            return mastery >= 40 && mastery <= 70;
        });

        if (intermediateContent.length > 0) {
            steps.push({
                step: 1,
                action: 'build_on_existing',
                content: intermediateContent[0],
                duration: '2 weeks',
                description: 'Build on existing knowledge'
            });
        }

        return steps;
    }

    createAdvancedPath(content, analysis) {
        const steps = [];
        
        // Find high mastery content or create advanced content
        const advancedContent = content.filter(c => (c.mastery_percentage || 0) > 70);
        
        if (advancedContent.length > 0) {
            steps.push({
                step: 1,
                action: 'master_advanced_concepts',
                content: advancedContent[0],
                duration: '3 weeks',
                description: 'Master advanced concepts'
            });
        }

        return steps;
    }

    createCustomPath(content, analysis, recommendations) {
        const steps = [];
        
        // Create custom path based on AI recommendations
        const primaryRec = recommendations.primaryRecommendation;
        
        steps.push({
            step: 1,
            action: primaryRec.action,
            content: primaryRec.targetContent,
            duration: 'variable',
            description: primaryRec.reasoning,
            aiGenerated: true
        });

        return steps;
    }

    // Additional helper methods

    getNextStepsFromDecision(aiDecision, analysis) {
        return [
            'Analyze user preferences when available',
            'Create detailed learning objectives',
            'Develop assessment criteria',
            'Monitor learning progress'
        ];
    }

    assessContentHealth(analysis) {
        const healthScore = analysis.contentQuality.score;
        return {
            score: healthScore,
            status: healthScore < 30 ? 'critical' : healthScore < 60 ? 'needs_attention' : 'healthy',
            recommendations: analysis.contentQuality.issues.length > 0 ? 
                analysis.contentQuality.issues : ['Content health is good']
        };
    }

    calculateLearningEfficiency(analysis) {
        const masteryDistribution = analysis.masteryDistribution;
        const efficiency = Math.min(masteryDistribution.average / 10, 10);
        
        return {
            score: Math.round(efficiency),
            rating: efficiency < 3 ? 'low' : efficiency < 7 ? 'medium' : 'high',
            factors: ['mastery_levels', 'content_quality', 'learning_progression']
        };
    }

    identifyStrengths(analysis) {
        const strengths = [];
        
        if (analysis.contentQuality.strengths.length > 0) {
            strengths.push(...analysis.contentQuality.strengths);
        }
        
        if (analysis.masteryDistribution.average > 60) {
            strengths.push('Good overall mastery levels');
        }
        
        return strengths;
    }

    identifyImprovementAreas(analysis) {
        return analysis.contentQuality.issues.length > 0 ? 
            analysis.contentQuality.issues : ['No major improvement areas identified'];
    }

    calculateAIConfidence(analysis) {
        // Calculate AI confidence based on data quality and completeness
        let confidence = 50;
        
        if (analysis.contentBreakdown.totalNodes > 0) confidence += 20;
        if (analysis.contentQuality.score > 60) confidence += 20;
        if (analysis.masteryDistribution.average > 0) confidence += 10;
        
        return Math.min(confidence, 100);
    }

    suggestNextSteps(analysis) {
        return [
            'Implement user preference system',
            'Create detailed content for identified gaps',
            'Develop assessment mechanisms',
            'Build progress tracking system'
        ];
    }

    // Weighted Selection Methods

    /**
     * Generate a lesson request using weighted random selection
     * @param {Object} userPreferences - User preferences and settings
     * @returns {Object} Selected topic and context for lesson generation
     */
    async generateLessonRequest(userPreferences = {}) {
        await this.initialize();
        
        console.log('🎯 Generating lesson request with weighted selection...');
        
        try {
            // Analyze top layer content
            console.log('📊 Step 1: Analyzing top layer content...');
            const topLayerAnalysis = await this.analyzeTopLayerContent();
            console.log('✅ Top layer analysis complete:', topLayerAnalysis.content.length, 'items');
            
            if (topLayerAnalysis.content.length === 0) {
                return {
                    success: false,
                    error: 'No content available for lesson generation',
                    code: 404
                };
            }

            // Calculate weights using AI analysis and user preferences
            console.log('🎯 Step 2: Calculating weights...');
            const nodesWithWeights = this.weightedSelector.calculateWeights(
                topLayerAnalysis.content,
                userPreferences,
                topLayerAnalysis.analysis
            );
            console.log('✅ Weights calculated for', nodesWithWeights.length, 'nodes');

            // Perform weighted random selection
            console.log('🎲 Step 3: Performing weighted random selection...');
            const selectedTopic = this.weightedSelector.weightedRandomPick(nodesWithWeights);
            console.log('✅ Topic selected:', selectedTopic.name);
            
            // Handle "Create New Topic" selection
            if (selectedTopic.isCreateNewTopic) {
                return {
                    success: true,
                    selectedTopic: selectedTopic,
                    lessonContext: {
                        topic: {
                            id: 'create_new_topic',
                            name: 'Create New Topic',
                            mastery: 0,
                            difficulty: 'beginner',
                            metadata: {}
                        },
                        user: {
                            topicMastery: 0,
                            lastPracticed: null,
                            notes: 'Ready to create new learning content',
                            userPreferences: userPreferences,
                            learningHistory: {}
                        },
                        learningObjectives: ['Identify new learning opportunities', 'Create structured learning content'],
                        estimatedDuration: userPreferences.duration || 15,
                        lessonType: 'creation'
                    },
                    weightStatistics: this.weightedSelector.getWeightStatistics(nodesWithWeights),
                    timestamp: new Date().toISOString(),
                    isCreateNewTopic: true
                };
            }
            
            // Gather user experience data for AI lesson generation
            console.log('📋 Step 4: Gathering user experience data...');
            const userExperienceData = await this.gatherUserExperienceData(selectedTopic, userPreferences);
            console.log('✅ User experience data gathered');
            
            // Build AI context for lesson generation
            console.log('🤖 Step 5: Building lesson context...');
            const lessonContext = this.buildLessonContext(selectedTopic, userExperienceData, topLayerAnalysis, userPreferences);
            console.log('✅ Lesson context built');
            
            console.log(`✅ Selected topic: ${selectedTopic.name} for lesson generation`);
            
            return {
                success: true,
                selectedTopic,
                lessonContext,
                weightStatistics: this.weightedSelector.getWeightStatistics(nodesWithWeights),
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ Lesson request generation failed:', error);
            console.error('Error stack:', error.stack);
            throw error;
        }
    }

    /**
     * Handle lesson completion and weight redistribution
     * @param {string} nodeId - ID of the completed node
     * @param {boolean} passed - Whether the lesson was passed
     * @param {number} score - Lesson score (0-100)
     * @returns {Object} Updated weights and mastery information
     */
    async handleLessonComplete(nodeId, passed, score = null) {
        await this.initialize();
        
        console.log(`📝 Handling lesson completion for node ${nodeId}: ${passed ? 'PASSED' : 'FAILED'}`);
        
        try {
            // Get the completed node
            const completedNode = await this.manager.getNode(nodeId);
            if (!completedNode) {
                throw new Error('Completed node not found');
            }

            // Update mastery percentage based on lesson result
            let newMastery = completedNode.mastery_percentage || 0;
            if (passed) {
                // Increase mastery on pass (5-15 points based on score)
                const masteryIncrease = score ? Math.round(score / 10) : 10;
                newMastery = Math.min(100, newMastery + masteryIncrease);
            } else {
                // Slight decrease on fail (encourage retry)
                newMastery = Math.max(0, newMastery - 2);
            }

            // Update mastery in database
            await this.manager.updateMastery(nodeId, newMastery);

            // Update last practiced timestamp
            await this.updateLastPracticed(nodeId);

            // Handle weight redistribution if lesson was passed
            let weightUpdates = [];
            if (passed) {
                // Get all nodes at the same level for weight redistribution
                const allNodes = await this.manager.getRootNodes();
                const nodesWithWeights = allNodes.map(node => ({
                    ...node,
                    selection_weight: node.selection_weight || 100
                }));

                // Redistribute weight from completed topic
                const updatedNodes = this.weightedSelector.redistributeWeight(
                    nodeId,
                    nodesWithWeights,
                    15 // 15% redistribution
                );

                // Update weights in database
                weightUpdates = await this.updateNodeWeights(updatedNodes);
            }

            console.log(`✅ Lesson completion handled: mastery ${completedNode.mastery_percentage}% → ${newMastery}%`);
            
            return {
                success: true,
                nodeId,
                passed,
                score,
                newMastery,
                weightUpdates,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ Lesson completion handling failed:', error);
            throw error;
        }
    }

    /**
     * Gather user experience data for lesson generation
     * @param {Object} selectedTopic - Selected topic node
     * @param {Object} userPreferences - User preferences
     * @returns {Object} User experience data
     */
    async gatherUserExperienceData(selectedTopic, userPreferences) {
        return {
            topicMastery: selectedTopic.mastery_percentage || 0,
            lastPracticed: selectedTopic.last_practiced,
            notes: selectedTopic.notes || '',
            userPreferences,
            learningHistory: {
                totalLessons: 0, // TODO: Implement lesson history tracking
                averageScore: 0,
                preferredDifficulty: userPreferences.difficulty || 'intermediate'
            }
        };
    }

    /**
     * Build lesson context for AI generation
     * @param {Object} selectedTopic - Selected topic
     * @param {Object} userExperienceData - User experience data
     * @param {Object} topLayerAnalysis - Top layer analysis
     * @param {Object} userPreferences - User preferences
     * @returns {Object} Lesson context
     */
    buildLessonContext(selectedTopic, userExperienceData, topLayerAnalysis, userPreferences = {}) {
        return {
            topic: {
                id: selectedTopic.id,
                name: selectedTopic.name,
                mastery: selectedTopic.mastery_percentage,
                difficulty: this.weightedSelector.inferDifficultyFromMastery(selectedTopic.mastery_percentage),
                metadata: selectedTopic.metadata || {}
            },
            user: userExperienceData,
            learningObjectives: this.generateLearningObjectives(selectedTopic, userExperienceData),
            estimatedDuration: userPreferences.duration || 15, // minutes
            lessonType: this.determineLessonType(selectedTopic, userExperienceData)
        };
    }

    /**
     * Generate learning objectives for the lesson
     * @param {Object} topic - Selected topic
     * @param {Object} userExperience - User experience data
     * @returns {Array} Learning objectives
     */
    generateLearningObjectives(topic, userExperience) {
        const objectives = [];
        const mastery = topic.mastery_percentage || 0;
        
        if (mastery < 30) {
            objectives.push('Understand basic concepts');
            objectives.push('Practice fundamental skills');
        } else if (mastery < 70) {
            objectives.push('Apply knowledge in different contexts');
            objectives.push('Build on existing understanding');
        } else {
            objectives.push('Master advanced applications');
            objectives.push('Develop expertise');
        }
        
        return objectives;
    }

    /**
     * Determine lesson type based on topic and user experience
     * @param {Object} topic - Selected topic
     * @param {Object} userExperience - User experience data
     * @returns {string} Lesson type
     */
    determineLessonType(topic, userExperience) {
        const mastery = topic.mastery_percentage || 0;
        
        if (mastery < 30) {
            return 'introduction';
        } else if (mastery < 70) {
            return 'practice';
        } else {
            return 'mastery';
        }
    }

    /**
     * Update node weights in database
     * @param {Array} updatedNodes - Nodes with updated weights
     * @returns {Array} Weight update results
     */
    async updateNodeWeights(updatedNodes) {
        const updates = [];
        
        for (const node of updatedNodes) {
            if (node.weight_change && node.weight_change !== 0) {
                // Update weight in database
                await this.manager.updateNode(node.id, {
                    selection_weight: node.selection_weight
                });
                
                updates.push({
                    nodeId: node.id,
                    nodeName: node.name,
                    oldWeight: node.selection_weight - node.weight_change,
                    newWeight: node.selection_weight,
                    change: node.weight_change
                });
            }
        }
        
        return updates;
    }

    /**
     * Update last practiced timestamp for a node
     * @param {string} nodeId - Node ID to update
     */
    async updateLastPracticed(nodeId) {
        try {
            const now = new Date().toISOString();
            await this.manager.updateNode(nodeId, {
                last_practiced: now
            });
            console.log(`✅ Updated last practiced timestamp for node ${nodeId}`);
        } catch (error) {
            console.error('❌ Failed to update last practiced timestamp:', error);
        }
    }

    /**
     * Get current weight distribution for debugging
     * @param {number} level - Level to get weights for (0 for root level)
     * @returns {Object} Weight distribution information
     */
    async getWeightDistribution(level = 0) {
        await this.initialize();
        
        try {
            let nodes;
            if (level === 0) {
                nodes = await this.manager.getRootNodes();
            } else {
                nodes = dbManager.getLevelNodes(level);
            }
            
            const nodesWithWeights = nodes.map(node => ({
                ...node,
                selection_weight: node.selection_weight || 100
            }));
            
            return {
                success: true,
                level,
                statistics: this.weightedSelector.getWeightStatistics(nodesWithWeights),
                nodes: nodesWithWeights.map(node => ({
                    id: node.id,
                    name: node.name,
                    mastery: node.mastery_percentage,
                    weight: node.selection_weight
                }))
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export default BusinessLogicEngine;
