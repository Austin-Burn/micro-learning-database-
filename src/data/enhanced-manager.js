/**
 * Enhanced Learning Node Manager with AI Decision Integration
 * Integrates AI decision-making at every hierarchical level
 */
import { LearningNodeManager } from './manager.js';
import { AIDecisionEngine } from './ai-decision-engine.js';
import { AIPromptBuilder } from './ai-prompt-builder.js';
import { EnhancedLearningNodeSchema } from './enhanced-schema.js';

export class EnhancedLearningNodeManager extends LearningNodeManager {
    constructor() {
        super();
        this.aiEngine = new AIDecisionEngine();
        this.promptBuilder = new AIPromptBuilder();
        this.currentLessonDecisionChain = []; // Only current lesson decisions
    }

    /**
     * Start fresh lesson creation session
     * @param {Object} userPreferences - User learning preferences
     * @param {Object} learningContext - Learning context
     */
    startFreshLessonSession(userPreferences = {}, learningContext = {}) {
        this.aiEngine.startFreshSession();
        this.promptBuilder.reset();
        this.promptBuilder.initialize(userPreferences, learningContext);
        this.currentLessonDecisionChain = [];
    }

    /**
     * Create a new learning node with AI decision tracking
     * @param {Object} nodeData - Node data
     * @param {Object} context - AI decision context
     * @param {Array} parentDecisions - Previous level decisions (from current lesson only)
     * @returns {Object} Created node with AI decision record
     */
    async createNodeWithAI(nodeData, context, parentDecisions = []) {
        // Determine current level
        const level = parentDecisions.length;
        
        // Get available nodes at current level
        const availableNodes = this.getAvailableNodesAtLevel(level, nodeData.parent_id);
        
        // Process AI decision
        const aiDecision = await this.aiEngine.processDecision(
            level, 
            context, 
            availableNodes, 
            parentDecisions
        );
        
        // Create enhanced node with AI data
        const enhancedNodeData = {
            ...nodeData,
            ai_decisions: [aiDecision],
            current_ai_context: context,
            learning_path_history: parentDecisions.map(d => ({
                level: d.level,
                decision: d.decision_type,
                reasoning: d.reasoning,
                timestamp: d.timestamp
            })),
            ai_metadata: {
                difficulty_assessment: this.assessDifficulty(nodeData),
                learning_style_preference: context.user_preferences?.learning_style || 'mixed',
                prerequisite_analysis: this.analyzePrerequisites(nodeData, context),
                mastery_prediction: this.predictMasteryProgression(nodeData, context),
                recommended_next_steps: this.generateNextSteps(nodeData, context),
                common_misconceptions: this.identifyMisconceptions(nodeData, context),
                optimal_practice_schedule: this.recommendPracticeSchedule(nodeData, context)
            }
        };
        
        // Create the node
        const node = this.createNode(enhancedNodeData);
        
        // Add decision to prompt builder
        this.promptBuilder.addDecisionToPrompt(aiDecision, level, availableNodes);
        
        // Add to current lesson decision chain only
        this.currentLessonDecisionChain.push({
            level,
            decision: aiDecision,
            node: node,
            timestamp: new Date().toISOString()
        });
        
        return {
            node,
            ai_decision: aiDecision,
            decision_chain: this.currentLessonDecisionChain,
            current_prompt: this.promptBuilder.getCurrentPrompt()
        };
    }

    /**
     * Get available nodes at a specific hierarchical level
     * @param {number} level - Hierarchical level
     * @param {string|null} parentId - Parent node ID
     * @returns {Array} Available nodes
     */
    getAvailableNodesAtLevel(level, parentId) {
        if (level === 0) {
            // Root level - return all root nodes
            return this.getRootNodes();
        } else if (parentId) {
            // Child level - return children of parent
            return this.getChildren(parentId);
        } else {
            // No parent specified - return empty array
            return [];
        }
    }

    /**
     * Process AI decision for existing node selection
     * @param {string} nodeId - Node ID to potentially select
     * @param {Object} context - AI decision context
     * @param {Array} parentDecisions - Previous level decisions
     * @returns {Object} AI decision and reasoning
     */
    async processNodeSelection(nodeId, context, parentDecisions = []) {
        const node = this.getNode(nodeId);
        if (!node) {
            throw new Error('Node not found');
        }
        
        const level = parentDecisions.length;
        const availableNodes = this.getAvailableNodesAtLevel(level, node.parent_id);
        
        // Process AI decision
        const aiDecision = await this.aiEngine.processDecision(
            level,
            context,
            availableNodes,
            parentDecisions
        );
        
        // Update node with AI decision
        const updatedNode = this.updateNode(nodeId, {
            ai_decisions: [...(node.ai_decisions || []), aiDecision],
            current_ai_context: context,
            learning_path_history: [
                ...(node.learning_path_history || []),
                ...parentDecisions.map(d => ({
                    level: d.level,
                    decision: d.decision_type,
                    reasoning: d.reasoning,
                    timestamp: d.timestamp
                }))
            ]
        });
        
        // Add to current lesson decision chain only
        this.currentLessonDecisionChain.push({
            level,
            decision: aiDecision,
            node: updatedNode,
            timestamp: new Date().toISOString()
        });
        
        return {
            node: updatedNode,
            ai_decision: aiDecision,
            decision_chain: this.currentLessonDecisionChain
        };
    }

    /**
     * Get AI decision history for a node
     * @param {string} nodeId - Node ID
     * @returns {Array} AI decision history
     */
    getAIDecisionHistory(nodeId) {
        const node = this.getNode(nodeId);
        return node?.ai_decisions || [];
    }

    /**
     * Get final lesson creation prompt
     * @returns {string} Complete prompt for lesson generation
     */
    getFinalLessonPrompt() {
        return this.promptBuilder.buildFinalLessonPrompt(this.currentLessonDecisionChain);
    }

    /**
     * Get current AI prompt
     * @returns {string} Current prompt
     */
    getCurrentPrompt() {
        return this.promptBuilder.getCurrentPrompt();
    }

    /**
     * Analyze learning path effectiveness
     * @param {string} nodeId - Node ID to analyze
     * @returns {Object} Path effectiveness analysis
     */
    analyzeLearningPath(nodeId) {
        const node = this.getNode(nodeId);
        if (!node) return null;
        
        const decisionHistory = node.ai_decisions || [];
        const pathHistory = node.learning_path_history || [];
        
        return {
            node_id: nodeId,
            total_decisions: decisionHistory.length,
            average_confidence: this.calculateAverageConfidence(decisionHistory),
            path_efficiency: this.calculatePathEfficiency(pathHistory),
            mastery_progression: this.trackMasteryProgression(node),
            ai_reasoning_quality: this.assessReasoningQuality(decisionHistory),
            learning_outcomes: this.assessLearningOutcomes(node),
            recommendations: this.generatePathRecommendations(node, decisionHistory)
        };
    }

    /**
     * Get AI insights for learning optimization
     * @returns {Object} AI insights
     */
    getAIInsights() {
        const allNodes = Array.from(this.nodes.values());
        const allDecisions = this.decisionChain.map(chain => chain.decision);
        
        return {
            overall_performance: this.calculateOverallPerformance(allNodes),
            decision_patterns: this.analyzeDecisionPatterns(allDecisions),
            learning_gaps: this.identifyLearningGaps(allNodes),
            optimization_opportunities: this.identifyOptimizationOpportunities(allNodes, allDecisions),
            ai_confidence_trends: this.analyzeConfidenceTrends(allDecisions),
            recommended_adjustments: this.generateAdjustmentRecommendations(allNodes, allDecisions)
        };
    }

    // Helper methods for AI analysis
    assessDifficulty(nodeData) {
        return {
            level: nodeData.metadata?.difficulty_level || 'intermediate',
            factors: ['content_complexity', 'prerequisite_requirements', 'time_to_mastery'],
            confidence: 75
        };
    }

    analyzePrerequisites(nodeData, context) {
        return {
            required: nodeData.metadata?.prerequisites || [],
            current_readiness: this.checkPrerequisiteReadiness(nodeData, context),
            gaps: this.identifyPrerequisiteGaps(nodeData, context)
        };
    }

    predictMasteryProgression(nodeData, context) {
        return {
            current_mastery: nodeData.mastery_percentage || 0,
            predicted_timeline: this.estimateMasteryTimeline(nodeData, context),
            confidence: 80
        };
    }

    generateNextSteps(nodeData, context) {
        return [
            'Practice core concepts',
            'Apply knowledge in different contexts',
            'Review and reinforce understanding'
        ];
    }

    identifyMisconceptions(nodeData, context) {
        return [
            'Common confusion with similar concepts',
            'Typical errors in this domain'
        ];
    }

    recommendPracticeSchedule(nodeData, context) {
        return {
            frequency: 'daily',
            duration: '15-20 minutes',
            optimal_times: ['morning', 'evening']
        };
    }

    calculateAverageConfidence(decisions) {
        if (decisions.length === 0) return 0;
        return decisions.reduce((sum, d) => sum + d.confidence_score, 0) / decisions.length;
    }

    calculatePathEfficiency(pathHistory) {
        // Simplified efficiency calculation
        return Math.min(100, pathHistory.length * 20);
    }

    trackMasteryProgression(node) {
        return {
            current: node.mastery_percentage,
            trend: 'improving',
            rate: 5 // percentage points per session
        };
    }

    assessReasoningQuality(decisions) {
        return {
            average_length: decisions.reduce((sum, d) => sum + d.reasoning.length, 0) / decisions.length,
            clarity_score: 85,
            consistency_score: 90
        };
    }

    assessLearningOutcomes(node) {
        return {
            mastery_gained: node.mastery_percentage,
            time_invested: this.calculateTimeInvested(node),
            retention_rate: 85
        };
    }

    generatePathRecommendations(node, decisions) {
        return [
            'Continue current learning path',
            'Focus on weak areas',
            'Increase practice frequency'
        ];
    }

    calculateOverallPerformance(nodes) {
        const avgMastery = nodes.reduce((sum, n) => sum + n.mastery_percentage, 0) / nodes.length;
        return {
            average_mastery: avgMastery,
            total_nodes: nodes.length,
            performance_score: avgMastery
        };
    }

    analyzeDecisionPatterns(decisions) {
        return {
            most_common_type: 'select_existing',
            average_confidence: this.calculateAverageConfidence(decisions),
            decision_frequency: decisions.length
        };
    }

    identifyLearningGaps(nodes) {
        return nodes.filter(n => n.mastery_percentage < 70);
    }

    identifyOptimizationOpportunities(nodes, decisions) {
        return [
            'Focus on low-mastery areas',
            'Optimize learning sequence',
            'Improve practice scheduling'
        ];
    }

    analyzeConfidenceTrends(decisions) {
        return {
            trend: 'stable',
            average: this.calculateAverageConfidence(decisions),
            variance: 15
        };
    }

    generateAdjustmentRecommendations(nodes, decisions) {
        return [
            'Adjust difficulty progression',
            'Modify practice schedule',
            'Focus on identified gaps'
        ];
    }

    checkPrerequisiteReadiness(nodeData, context) { return true; }
    identifyPrerequisiteGaps(nodeData, context) { return []; }
    estimateMasteryTimeline(nodeData, context) { return '2-3 weeks'; }
    calculateTimeInvested(node) { return 30; } // minutes
}

export default EnhancedLearningNodeManager;
