/**
 * AI Decision Engine
 * Processes AI decisions at each hierarchical level with full context awareness
 */
import { AIDecisionSchema, AIContextSchema } from './enhanced-schema.js';

export class AIDecisionEngine {
    constructor() {
        this.currentSessionDecisions = []; // Only current session decisions
        this.contextCache = new Map();
        this.aiModelVersion = 'v2.1';
    }

    /**
     * Process AI decision at a specific hierarchical level
     * @param {number} level - Current hierarchical level
     * @param {Object} context - Full context for decision making
     * @param {Array} availableNodes - Nodes available at current level
     * @param {Array} parentDecisions - Previous level decisions
     * @returns {Object} AI decision with reasoning
     */
    async processDecision(level, context, availableNodes, parentDecisions = []) {
        console.log(`🤖 AI Processing decision at level ${level}`);
        
        // Build comprehensive context
        const decisionContext = this.buildDecisionContext(level, context, availableNodes, parentDecisions);
        
        // Analyze available options
        const analysis = await this.analyzeOptions(decisionContext);
        
        // Make decision based on analysis
        const decision = await this.makeDecision(analysis, decisionContext);
        
        // Record decision for current session only
        this.currentSessionDecisions.push(decision);
        
        return decision;
    }

    /**
     * Build comprehensive context for decision making
     * @param {number} level - Current level
     * @param {Object} context - Base context
     * @param {Array} availableNodes - Available nodes
     * @param {Array} parentDecisions - Parent decisions
     * @returns {Object} Enhanced context
     */
    buildDecisionContext(level, context, availableNodes, parentDecisions) {
        const enhancedContext = {
            current_level: level,
            available_nodes: availableNodes,
            parent_context: this.extractParentContext(parentDecisions),
            user_preferences: context.user_preferences || {},
            learning_history: context.learning_history || {},
            mastery_patterns: this.analyzeMasteryPatterns(availableNodes),
            time_constraints: context.time_constraints || {},
            difficulty_progression: this.analyzeDifficultyProgression(parentDecisions),
            previous_decisions: parentDecisions,
            session_context: this.getSessionContext(),
            timestamp: new Date().toISOString()
        };

        // Cache context for future reference
        this.contextCache.set(`level_${level}_${Date.now()}`, enhancedContext);
        
        return enhancedContext;
    }

    /**
     * Analyze all available options at current level
     * @param {Object} context - Decision context
     * @returns {Object} Analysis results
     */
    async analyzeOptions(context) {
        const analysis = {
            existing_nodes: [],
            recommended_actions: [],
            risk_assessment: {},
            learning_opportunities: []
        };

        // Analyze each available node
        for (const node of context.available_nodes) {
            const nodeAnalysis = await this.analyzeNode(node, context);
            analysis.existing_nodes.push(nodeAnalysis);
        }

        // Identify learning opportunities
        analysis.learning_opportunities = this.identifyLearningOpportunities(context);
        
        // Assess risks
        analysis.risk_assessment = this.assessRisks(context);
        
        // Generate recommendations
        analysis.recommended_actions = this.generateRecommendations(analysis, context);

        return analysis;
    }

    /**
     * Analyze individual node for decision making
     * @param {Object} node - Node to analyze
     * @param {Object} context - Decision context
     * @returns {Object} Node analysis
     */
    async analyzeNode(node, context) {
        return {
            node_id: node.id,
            name: node.name,
            mastery_score: node.mastery_percentage,
            difficulty_level: this.assessDifficulty(node, context),
            learning_potential: this.calculateLearningPotential(node, context),
            time_to_mastery: this.estimateTimeToMastery(node, context),
            prerequisite_readiness: this.checkPrerequisites(node, context),
            engagement_likelihood: this.predictEngagement(node, context),
            recommended_action: this.getRecommendedAction(node, context),
            reasoning: this.generateNodeReasoning(node, context)
        };
    }

    /**
     * Make final decision based on analysis
     * @param {Object} analysis - Analysis results
     * @param {Object} context - Decision context
     * @returns {Object} Final decision
     */
    async makeDecision(analysis, context) {
        const decisionId = this.generateDecisionId();
        
        // Determine decision type
        const decisionType = this.determineDecisionType(analysis, context);
        
        // Select best option
        const selectedOption = this.selectBestOption(analysis, context);
        
        // Generate reasoning
        const reasoning = this.generateDecisionReasoning(analysis, context, selectedOption);
        
        // Calculate confidence
        const confidence = this.calculateConfidence(analysis, context, selectedOption);
        
        // Consider alternatives
        const alternatives = this.considerAlternatives(analysis, context, selectedOption);

        return {
            decision_id: decisionId,
            level: context.current_level,
            decision_type: decisionType,
            selected_node_id: selectedOption?.node_id || null,
            reasoning: reasoning,
            confidence_score: confidence,
            context_data: context,
            parent_decisions: context.previous_decisions.map(d => d.decision_id),
            alternatives_considered: alternatives,
            timestamp: new Date().toISOString(),
            ai_model_version: this.aiModelVersion,
            analysis_summary: this.createAnalysisSummary(analysis)
        };
    }

    /**
     * Extract context from parent decisions
     * @param {Array} parentDecisions - Parent decisions
     * @returns {Object} Parent context
     */
    extractParentContext(parentDecisions) {
        if (parentDecisions.length === 0) return {};

        const latestParent = parentDecisions[parentDecisions.length - 1];
        return {
            parent_reasoning: latestParent.reasoning,
            parent_confidence: latestParent.confidence_score,
            parent_context: latestParent.context_data,
            decision_chain: parentDecisions.map(d => ({
                level: d.level,
                decision: d.decision_type,
                reasoning: d.reasoning
            }))
        };
    }

    /**
     * Analyze mastery patterns across available nodes
     * @param {Array} nodes - Available nodes
     * @returns {Object} Mastery pattern analysis
     */
    analyzeMasteryPatterns(nodes) {
        const masteryLevels = nodes.map(n => n.mastery_percentage);
        const avgMastery = masteryLevels.reduce((a, b) => a + b, 0) / masteryLevels.length;
        
        return {
            average_mastery: avgMastery,
            mastery_distribution: {
                beginner: masteryLevels.filter(m => m < 40).length,
                intermediate: masteryLevels.filter(m => m >= 40 && m < 80).length,
                advanced: masteryLevels.filter(m => m >= 80).length
            },
            learning_gaps: nodes.filter(n => n.mastery_percentage < 70),
            strengths: nodes.filter(n => n.mastery_percentage >= 80)
        };
    }

    /**
     * Analyze difficulty progression from parent decisions
     * @param {Array} parentDecisions - Parent decisions
     * @returns {Object} Difficulty progression analysis
     */
    analyzeDifficultyProgression(parentDecisions) {
        if (parentDecisions.length === 0) {
            return { progression: 'starting', recommended_difficulty: 'beginner' };
        }

        const difficultyTrend = parentDecisions.map(d => 
            d.context_data?.difficulty_level || 'unknown'
        );

        return {
            progression: this.determineProgression(difficultyTrend),
            recommended_difficulty: this.recommendNextDifficulty(difficultyTrend),
            trend_analysis: difficultyTrend
        };
    }

    /**
     * Generate decision reasoning
     * @param {Object} analysis - Analysis results
     * @param {Object} context - Decision context
     * @param {Object} selectedOption - Selected option
     * @returns {string} Reasoning text
     */
    generateDecisionReasoning(analysis, context, selectedOption) {
        const reasoning = [];
        
        // Add level-specific reasoning
        reasoning.push(`At level ${context.current_level}, `);
        
        // Add mastery-based reasoning
        if (selectedOption) {
            reasoning.push(`selected ${selectedOption.name} (${selectedOption.mastery_score}% mastery) because `);
            reasoning.push(selectedOption.reasoning);
        } else {
            reasoning.push(`creating new content because `);
            reasoning.push(this.generateCreationReasoning(analysis, context));
        }
        
        // Add parent decision influence
        if (context.previous_decisions.length > 0) {
            const parentReasoning = context.previous_decisions[context.previous_decisions.length - 1].reasoning;
            reasoning.push(` Building on previous decision: "${parentReasoning.substring(0, 100)}..."`);
        }
        
        return reasoning.join('');
    }

    /**
     * Start fresh session (clear current session decisions)
     */
    startFreshSession() {
        this.currentSessionDecisions = [];
        this.contextCache.clear();
    }

    /**
     * Get session context (current session only)
     * @returns {Object} Session context
     */
    getSessionContext() {
        return {
            session_start: this.currentSessionDecisions.length > 0 ? this.currentSessionDecisions[0].timestamp : new Date().toISOString(),
            total_decisions: this.currentSessionDecisions.length,
            average_confidence: this.calculateCurrentSessionConfidence(),
            decision_patterns: this.analyzeCurrentSessionPatterns()
        };
    }

    /**
     * Calculate average confidence for current session only
     * @returns {number} Average confidence
     */
    calculateCurrentSessionConfidence() {
        if (this.currentSessionDecisions.length === 0) return 0;
        
        const totalConfidence = this.currentSessionDecisions.reduce((sum, d) => sum + d.confidence_score, 0);
        return totalConfidence / this.currentSessionDecisions.length;
    }

    /**
     * Analyze decision patterns for current session only
     * @returns {Object} Decision pattern analysis
     */
    analyzeCurrentSessionPatterns() {
        const patterns = {
            decision_types: {},
            confidence_trends: [],
            reasoning_themes: []
        };

        this.currentSessionDecisions.forEach(decision => {
            // Count decision types
            patterns.decision_types[decision.decision_type] = 
                (patterns.decision_types[decision.decision_type] || 0) + 1;
            
            // Track confidence trends
            patterns.confidence_trends.push(decision.confidence_score);
            
            // Extract reasoning themes (simplified)
            patterns.reasoning_themes.push(decision.reasoning.substring(0, 50));
        });

        return patterns;
    }

    /**
     * Generate unique decision ID
     * @returns {string} Decision ID
     */
    generateDecisionId() {
        return `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Determine decision type based on analysis and user preferences
     * @param {Object} analysis - Analysis results
     * @param {Object} context - Decision context
     * @returns {string} Decision type
     */
    determineDecisionType(analysis, context) {
        const userPreferences = context.user_preferences || {};
        const availableNodes = context.available_nodes || [];
        
        // Check if we should create new content
        const shouldCreateNew = this.shouldCreateNewContent(analysis, context, userPreferences);
        
        if (shouldCreateNew) {
            return 'create_new';
        } else if (availableNodes.length > 0) {
            return 'select_existing';
        } else {
            return 'create_new'; // Default to creating new if no options
        }
    }

    /**
     * Determine if we should create new content based on user preferences
     * @param {Object} analysis - Analysis results
     * @param {Object} context - Decision context
     * @param {Object} userPreferences - User preferences
     * @returns {boolean} Should create new content
     */
    shouldCreateNewContent(analysis, context, userPreferences) {
        const availableNodes = context.available_nodes || [];
        
        // If no existing nodes, create new
        if (availableNodes.length === 0) {
            return true;
        }
        
        // Check if existing nodes match user preferences well enough
        const matchingNodes = availableNodes.filter(node => 
            this.nodeMatchesPreferences(node, userPreferences)
        );
        
        // If no good matches, create new
        if (matchingNodes.length === 0) {
            return true;
        }
        
        // If user prefers new content or existing options are too advanced/basic
        const avgMastery = availableNodes.reduce((sum, n) => sum + n.mastery_percentage, 0) / availableNodes.length;
        const difficulty = userPreferences.difficulty || 'intermediate';
        
        if (difficulty === 'beginner' && avgMastery > 70) {
            return true; // Create easier content
        }
        
        if (difficulty === 'advanced' && avgMastery < 50) {
            return true; // Create more advanced content
        }
        
        // Check if user wants to explore new topics within their preference area
        const preferredTopic = userPreferences.topic || '';
        const hasTopicMatch = availableNodes.some(node => 
            node.name.toLowerCase().includes(preferredTopic.toLowerCase())
        );
        
        if (preferredTopic && !hasTopicMatch) {
            return true; // Create new content in preferred topic area
        }
        
        return false; // Use existing content
    }

    /**
     * Check if node matches user preferences
     * @param {Object} node - Learning node
     * @param {Object} preferences - User preferences
     * @returns {boolean} Matches preferences
     */
    nodeMatchesPreferences(node, preferences) {
        const difficulty = preferences.difficulty || 'intermediate';
        const topic = preferences.topic || '';
        
        // Check difficulty match
        const masteryLevel = this.getMasteryLevel(node.mastery_percentage);
        const difficultyMatch = this.difficultyMatches(masteryLevel, difficulty);
        
        // Check topic match
        const topicMatch = !topic || node.name.toLowerCase().includes(topic.toLowerCase());
        
        return difficultyMatch && topicMatch;
    }

    /**
     * Get mastery level from percentage
     * @param {number} percentage - Mastery percentage
     * @returns {string} Mastery level
     */
    getMasteryLevel(percentage) {
        if (percentage < 40) return 'beginner';
        if (percentage < 80) return 'intermediate';
        return 'advanced';
    }

    /**
     * Check if mastery level matches difficulty preference
     * @param {string} masteryLevel - Mastery level
     * @param {string} difficulty - Difficulty preference
     * @returns {boolean} Matches difficulty
     */
    difficultyMatches(masteryLevel, difficulty) {
        const difficultyMap = {
            'beginner': ['beginner'],
            'intermediate': ['beginner', 'intermediate'],
            'advanced': ['beginner', 'intermediate', 'advanced']
        };
        
        return difficultyMap[difficulty]?.includes(masteryLevel) || false;
    }

    // Helper methods (simplified implementations)
    assessDifficulty(node, context) { return 'intermediate'; }
    calculateLearningPotential(node, context) { return Math.random() * 100; }
    estimateTimeToMastery(node, context) { return Math.random() * 60; }
    checkPrerequisites(node, context) { return true; }
    predictEngagement(node, context) { return Math.random() * 100; }
    getRecommendedAction(node, context) { return 'practice'; }
    generateNodeReasoning(node, context) { return `Node ${node.name} shows good potential for learning`; }
    selectBestOption(analysis, context) { return analysis.existing_nodes[0]; }
    calculateConfidence(analysis, context, selectedOption) { return Math.random() * 100; }
    considerAlternatives(analysis, context, selectedOption) { return []; }
    createAnalysisSummary(analysis) { return 'Analysis completed'; }
    identifyLearningOpportunities(context) { return []; }
    assessRisks(context) { return {}; }
    generateRecommendations(analysis, context) { return []; }
    determineProgression(trend) { return 'progressive'; }
    recommendNextDifficulty(trend) { return 'intermediate'; }
    generateCreationReasoning(analysis, context) { return 'existing options do not meet learning objectives'; }
}

export default AIDecisionEngine;
