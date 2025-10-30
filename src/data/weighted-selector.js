/**
 * Weighted Random Selection Engine
 * Handles AI-driven weight calculation and weighted random topic selection
 */
export class WeightedSelector {
    constructor() {
        this.defaultWeight = 100;
        this.maxWeight = 200;
        this.minWeight = 0;
    }

    /**
     * Calculate selection weights for nodes based on AI analysis and user preferences
     * @param {Array} nodes - Array of learning nodes
     * @param {Object} userPreferences - User preferences and settings
     * @param {Object} analysis - AI analysis results
     * @returns {Array} Nodes with calculated weights
     */
    calculateWeights(nodes, userPreferences = {}, analysis = {}) {
        console.log('🎯 Calculating selection weights...');
        
        // Calculate "Create New Topic" weight based on overall mastery
        const newTopicWeight = this.calculateNewTopicWeight(nodes);
        
        const nodesWithWeights = nodes.map(node => {
            let baseWeight = node.selection_weight || this.defaultWeight;
            
            // Apply simplified mastery weighting (reduced multipliers)
            const masteryWeight = this.calculateMasteryWeight(node.mastery_percentage || 0);
            
            // Apply simplified base importance weighting
            const baseImportance = this.calculateBaseImportance(node);
            
            // Apply simplified last practiced weighting
            const lastPracticedWeight = this.calculateLastPracticedWeight(node);
            
            // Apply user interest multiplier
            const interestMultiplier = this.calculateInterestMultiplier(node, userPreferences);
            
            // Apply frequency bias from analysis
            const frequencyBias = this.calculateFrequencyBias(node, analysis);
            
            // Calculate final weight with reduced multipliers
            const finalWeight = Math.round(baseWeight * masteryWeight * baseImportance * lastPracticedWeight * interestMultiplier * frequencyBias);
            
            // Clamp weight to valid range
            const clampedWeight = Math.max(this.minWeight, Math.min(this.maxWeight, finalWeight));
            
            return {
                ...node,
                selection_weight: clampedWeight,
                weight_breakdown: {
                    base: baseWeight,
                    mastery: masteryWeight,
                    baseImportance: baseImportance,
                    lastPracticed: lastPracticedWeight,
                    interest: interestMultiplier,
                    frequency: frequencyBias,
                    final: clampedWeight
                }
            };
        });

        // Add "Create New Topic" option
        const createNewTopicOption = {
            id: 'create_new_topic',
            name: 'Create New Topic',
            mastery_percentage: 0,
            node_type: 'action',
            selection_weight: Math.round(newTopicWeight * this.defaultWeight),
            weight_breakdown: {
                base: this.defaultWeight,
                mastery: 1.0,
                baseImportance: 1.0,
                lastPracticed: 1.0,
                interest: 1.0,
                frequency: 1.0,
                newTopicWeight: newTopicWeight,
                final: Math.round(newTopicWeight * this.defaultWeight)
            },
            isCreateNewTopic: true
        };

        nodesWithWeights.push(createNewTopicOption);

        console.log(`✅ Calculated weights for ${nodesWithWeights.length} nodes (including Create New Topic)`);
        return nodesWithWeights;
    }

    /**
     * Calculate mastery-based weight with ticket redistribution
     * @param {number} masteryPercentage - Mastery percentage (0-100)
     * @returns {number} Weight multiplier
     */
    calculateMasteryWeight(masteryPercentage) {
        // Avoid topics with 100% mastery completely
        if (masteryPercentage >= 100) {
            return 0; // Never select
        }
        
        // 99% mastery = very low weight (occasional review)
        if (masteryPercentage >= 99) {
            return 0.1; // Very low selection probability
        }
        
        // 90-98% mastery = low weight (infrequent review)
        if (masteryPercentage >= 90) {
            return 0.3; // Low selection probability
        }
        
        // 70-89% mastery = moderate weight (regular practice)
        if (masteryPercentage >= 70) {
            return 0.6; // Moderate selection probability
        }
        
        // 50-69% mastery = high weight (frequent practice)
        if (masteryPercentage >= 50) {
            return 1.0; // Normal selection probability
        }
        
        // 30-49% mastery = very high weight (intensive practice)
        if (masteryPercentage >= 30) {
            return 1.5; // High selection probability
        }
        
        // 0-29% mastery = maximum weight (critical practice)
        return 2.0; // Maximum selection probability
    }

    /**
     * Calculate base importance weight (simplified)
     * @param {Object} node - Learning node
     * @returns {number} Base importance multiplier
     */
    calculateBaseImportance(node) {
        // Check if node has explicit importance metadata
        if (node.metadata && node.metadata.base_importance) {
            return node.metadata.base_importance;
        }
        
        // Simplified importance based on node type
        switch (node.node_type) {
            case 'foundation':
            case 'core':
                return 1.3; // Slightly higher importance for foundational topics
            case 'subject':
                return 1.1; // Slightly higher importance for subjects
            case 'skill':
                return 1.05; // Very slightly higher importance for skills
            default:
                return 1.0; // Default importance
        }
    }

    /**
     * Calculate last practiced weight (simplified spaced repetition)
     * @param {Object} node - Learning node
     * @returns {number} Last practiced multiplier
     */
    calculateLastPracticedWeight(node) {
        if (!node.last_practiced) {
            return 1.3; // Higher weight for never practiced topics
        }
        
        const lastPracticed = new Date(node.last_practiced);
        const now = new Date();
        const daysSincePractice = Math.floor((now - lastPracticed) / (1000 * 60 * 60 * 24));
        
        // Simplified spaced repetition intervals
        if (daysSincePractice < 1) {
            return 0.3; // Very low weight - just practiced today
        } else if (daysSincePractice < 3) {
            return 0.6; // Low weight - practiced recently
        } else if (daysSincePractice < 7) {
            return 0.8; // Moderate-low weight - practiced this week
        } else if (daysSincePractice < 14) {
            return 1.1; // Moderate-high weight - practiced 1-2 weeks ago
        } else if (daysSincePractice < 30) {
            return 1.4; // High weight - practiced 2-4 weeks ago
        } else {
            return 1.8; // Maximum weight - practiced over a month ago
        }
    }

    /**
     * Calculate "Create New Topic" weight based on overall mastery
     * @param {Array} nodes - All nodes to analyze
     * @returns {number} Weight for creating new topics
     */
    calculateNewTopicWeight(nodes) {
        if (!nodes || nodes.length === 0) {
            return 2.0; // High weight if no topics exist
        }

        // Calculate average mastery
        const totalMastery = nodes.reduce((sum, node) => sum + (node.mastery_percentage || 0), 0);
        const averageMastery = totalMastery / nodes.length;
        
        // Count high mastery topics (90%+)
        const highMasteryCount = nodes.filter(node => (node.mastery_percentage || 0) >= 90).length;
        const highMasteryRatio = highMasteryCount / nodes.length;
        
        // Base weight increases as mastery increases
        let baseWeight = 0.5; // Start with low weight
        
        if (averageMastery >= 80) {
            baseWeight = 1.5; // High weight when most topics are mastered
        } else if (averageMastery >= 60) {
            baseWeight = 1.2; // Medium-high weight
        } else if (averageMastery >= 40) {
            baseWeight = 1.0; // Medium weight
        } else if (averageMastery >= 20) {
            baseWeight = 0.8; // Medium-low weight
        }
        
        // Additional boost if many topics are highly mastered
        if (highMasteryRatio >= 0.5) {
            baseWeight += 0.5; // Extra boost if half or more topics are 90%+ mastered
        }
        
        return Math.min(baseWeight, 2.0); // Cap at 2.0
    }

    /**
     * Calculate interest multiplier based on user preferences
     * @param {Object} node - Learning node
     * @param {Object} userPreferences - User preferences
     * @returns {number} Interest multiplier
     */
    calculateInterestMultiplier(node, userPreferences) {
        const preferences = userPreferences || {};
        
        // Check if node matches user's preferred topic
        const preferredTopic = preferences.topic || '';
        const nodeName = node.name.toLowerCase();
        
        if (preferredTopic && nodeName.includes(preferredTopic.toLowerCase())) {
            return 1.5; // 50% boost for preferred topics
        }
        
        // Check difficulty preference
        const preferredDifficulty = preferences.difficulty || 'intermediate';
        const nodeDifficulty = this.inferDifficultyFromMastery(node.mastery_percentage);
        
        if (preferredDifficulty === 'beginner' && nodeDifficulty === 'beginner') {
            return 1.2; // 20% boost for matching difficulty
        } else if (preferredDifficulty === 'advanced' && nodeDifficulty === 'advanced') {
            return 1.2;
        } else if (preferredDifficulty === 'intermediate' && nodeDifficulty === 'intermediate') {
            return 1.1; // 10% boost for intermediate
        }
        
        return 1.0; // No multiplier
    }

    /**
     * Calculate frequency bias based on AI analysis
     * @param {Object} node - Learning node
     * @param {Object} analysis - AI analysis results
     * @returns {number} Frequency bias multiplier
     */
    calculateFrequencyBias(node, analysis) {
        // If node is identified as a learning opportunity, boost frequency
        const learningOpportunities = analysis.learningOpportunities || [];
        const isOpportunity = learningOpportunities.some(opp => opp.nodeId === node.id);
        
        if (isOpportunity) {
            return 1.3; // 30% boost for learning opportunities
        }
        
        // If node has content gaps, boost frequency
        const contentGaps = analysis.contentGaps || [];
        const hasGaps = contentGaps.some(gap => gap.nodeId === node.id);
        
        if (hasGaps) {
            return 1.2; // 20% boost for content gaps
        }
        
        return 1.0; // No bias
    }

    /**
     * Infer difficulty level from mastery percentage
     * @param {number} masteryPercentage - Mastery percentage
     * @returns {string} Difficulty level
     */
    inferDifficultyFromMastery(masteryPercentage) {
        if (masteryPercentage < 40) return 'beginner';
        if (masteryPercentage < 80) return 'intermediate';
        return 'advanced';
    }

    /**
     * Perform weighted random selection from nodes
     * @param {Array} nodesWithWeights - Nodes with calculated weights
     * @returns {Object} Selected node
     */
    weightedRandomPick(nodesWithWeights) {
        if (!nodesWithWeights || nodesWithWeights.length === 0) {
            throw new Error('No nodes available for selection');
        }

        // Calculate total weight
        const totalWeight = nodesWithWeights.reduce((sum, node) => sum + node.selection_weight, 0);
        
        if (totalWeight === 0) {
            // If all weights are 0, fall back to equal probability
            const randomIndex = Math.floor(Math.random() * nodesWithWeights.length);
            return nodesWithWeights[randomIndex];
        }

        // Generate random number between 0 and totalWeight
        const randomValue = Math.random() * totalWeight;
        
        // Find the selected node by accumulating weights
        let accumulatedWeight = 0;
        for (const node of nodesWithWeights) {
            accumulatedWeight += node.selection_weight;
            if (randomValue <= accumulatedWeight) {
                console.log(`🎲 Selected: ${node.name} (weight: ${node.selection_weight}/${totalWeight})`);
                return node;
            }
        }

        // Fallback (should never reach here)
        return nodesWithWeights[nodesWithWeights.length - 1];
    }

    /**
     * Redistribute weight from a completed topic to other topics
     * @param {string} selectedNodeId - ID of the completed node
     * @param {Array} nodes - All nodes at the same level
     * @param {number} redistributionAmount - Percentage of weight to redistribute (10-20%)
     * @returns {Array} Updated nodes with new weights
     */
    redistributeWeight(selectedNodeId, nodes, redistributionAmount = 15) {
        console.log(`🔄 Redistributing ${redistributionAmount}% weight from completed topic...`);
        
        const redistributionFactor = redistributionAmount / 100;
        const updatedNodes = [];
        
        // Find the completed node
        const completedNode = nodes.find(node => node.id === selectedNodeId);
        if (!completedNode) {
            console.warn('Completed node not found for weight redistribution');
            return nodes;
        }

        // Calculate weight to redistribute
        const weightToRedistribute = Math.round(completedNode.selection_weight * redistributionFactor);
        const remainingWeight = completedNode.selection_weight - weightToRedistribute;
        
        // Ensure remaining weight doesn't go below minimum
        const finalCompletedWeight = Math.max(this.minWeight, remainingWeight);
        
        // Find other nodes to receive redistributed weight
        const otherNodes = nodes.filter(node => node.id !== selectedNodeId);
        const weightPerNode = Math.round(weightToRedistribute / otherNodes.length);
        
        // Update all nodes
        for (const node of nodes) {
            if (node.id === selectedNodeId) {
                // Reduce weight of completed node
                updatedNodes.push({
                    ...node,
                    selection_weight: finalCompletedWeight,
                    weight_change: finalCompletedWeight - node.selection_weight
                });
            } else {
                // Increase weight of other nodes
                const newWeight = Math.min(this.maxWeight, node.selection_weight + weightPerNode);
                updatedNodes.push({
                    ...node,
                    selection_weight: newWeight,
                    weight_change: newWeight - node.selection_weight
                });
            }
        }

        console.log(`✅ Redistributed ${weightToRedistribute} weight points across ${otherNodes.length} topics`);
        return updatedNodes;
    }

    /**
     * Get weight statistics for debugging
     * @param {Array} nodesWithWeights - Nodes with weights
     * @returns {Object} Weight statistics
     */
    getWeightStatistics(nodesWithWeights) {
        const weights = nodesWithWeights.map(node => node.selection_weight);
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        const avgWeight = totalWeight / weights.length;
        const minWeight = Math.min(...weights);
        const maxWeight = Math.max(...weights);
        
        return {
            totalNodes: nodesWithWeights.length,
            totalWeight,
            averageWeight: Math.round(avgWeight),
            minWeight,
            maxWeight,
            weightDistribution: {
                low: weights.filter(w => w < 50).length,
                normal: weights.filter(w => w >= 50 && w <= 150).length,
                high: weights.filter(w => w > 150).length
            }
        };
    }

    /**
     * Normalize weights to ensure they're within valid range
     * @param {Array} nodes - Nodes with potentially invalid weights
     * @returns {Array} Nodes with normalized weights
     */
    normalizeWeights(nodes) {
        return nodes.map(node => ({
            ...node,
            selection_weight: Math.max(this.minWeight, Math.min(this.maxWeight, node.selection_weight || this.defaultWeight))
        }));
    }

    /**
     * Reset all weights to default value
     * @param {Array} nodes - Nodes to reset
     * @returns {Array} Nodes with reset weights
     */
    resetWeights(nodes) {
        return nodes.map(node => ({
            ...node,
            selection_weight: this.defaultWeight
        }));
    }
}

export default WeightedSelector;
