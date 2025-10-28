/**
 * AI Prompt Builder
 * Builds comprehensive prompts as AI traverses through node layers
 */
export class AIPromptBuilder {
    constructor() {
        this.promptHistory = [];
        this.currentPrompt = '';
        this.userPreferences = {};
        this.learningContext = {};
    }

    /**
     * Initialize prompt builder with user preferences
     * @param {Object} preferences - User learning preferences
     * @param {Object} context - Learning context
     */
    initialize(preferences, context) {
        this.userPreferences = preferences;
        this.learningContext = context;
        this.promptHistory = [];
        this.currentPrompt = this.buildInitialPrompt();
    }

    /**
     * Build initial prompt with user preferences and capabilities
     * @returns {string} Initial prompt
     */
    buildInitialPrompt() {
        return `You are an AI learning assistant creating personalized micro-lessons. 

USER PREFERENCES:
- Difficulty Level: ${this.userPreferences.difficulty || 'intermediate'}
- Lesson Duration: ${this.userPreferences.duration || 5} minutes
- Preferred Topic: ${this.userPreferences.topic || 'any'}
- Learning Style: ${this.userPreferences.learning_style || 'mixed'}

YOUR CAPABILITIES:
- You can SELECT existing learning nodes at any level
- You can CREATE NEW topics/subtopics within user preferences
- You can MODIFY existing content to better fit user needs
- You must stay within user's preferred topic area and difficulty level
- You can drill down into any existing topic to create new subtopics

DECISION MAKING PROCESS:
1. At each level, analyze available options
2. Consider user preferences and learning goals
3. Decide whether to select existing content or create new content
4. If creating new content, ensure it fits within user preferences
5. Provide detailed reasoning for each decision
6. Build upon previous level decisions

EXAMPLE CREATION PATHS:
- Coding → Python → "Python Data Structures" (new topic)
- Science → Biology → "Cell Division Process" (new topic)
- Math → Algebra → "Quadratic Word Problems" (new topic)

Remember: You have full creative freedom to create new learning content as long as it aligns with user preferences and builds logically from previous decisions.`;
    }

    /**
     * Add decision to prompt history and update current prompt
     * @param {Object} decision - AI decision
     * @param {number} level - Current hierarchical level
     * @param {Array} availableOptions - Available options at this level
     */
    addDecisionToPrompt(decision, level, availableOptions) {
        const decisionPrompt = this.buildDecisionPrompt(decision, level, availableOptions);
        this.promptHistory.push(decisionPrompt);
        this.currentPrompt += '\n\n' + decisionPrompt;
    }

    /**
     * Build prompt for a specific decision
     * @param {Object} decision - AI decision
     * @param {number} level - Current level
     * @param {Array} availableOptions - Available options
     * @returns {string} Decision prompt
     */
    buildDecisionPrompt(decision, level, availableOptions) {
        const levelName = this.getLevelName(level);
        
        return `LEVEL ${level} DECISION (${levelName}):
Decision Type: ${decision.decision_type}
Selected: ${decision.selected_node_id ? 'Existing Node' : 'Creating New Content'}
Reasoning: ${decision.reasoning}
Confidence: ${decision.confidence_score}%

AVAILABLE OPTIONS AT THIS LEVEL:
${availableOptions.map(option => 
    `- ${option.name} (${option.mastery_percentage}% mastery)`
).join('\n')}

${decision.decision_type === 'create_new' ? 
    'CREATING NEW CONTENT: You are creating new learning content within user preferences.' : 
    'SELECTING EXISTING: You selected existing content to build upon.'}

NEXT LEVEL GUIDANCE:
- Continue building the learning path
- Consider user's ${this.userPreferences.difficulty} difficulty preference
- Keep lesson duration around ${this.userPreferences.duration} minutes
- Stay within ${this.userPreferences.topic} topic area
- You can create new subtopics as needed`;
    }

    /**
     * Get level name for prompt clarity
     * @param {number} level - Level number
     * @returns {string} Level name
     */
    getLevelName(level) {
        const levelNames = {
            0: 'Subject Area',
            1: 'Main Topic',
            2: 'Specific Concept',
            3: 'Detailed Skill',
            4: 'Micro-Lesson Focus',
            5: 'Practice Exercise'
        };
        return levelNames[level] || `Level ${level}`;
    }

    /**
     * Build final lesson creation prompt
     * @param {Array} decisionChain - Complete decision chain
     * @returns {string} Final prompt for lesson creation
     */
    buildFinalLessonPrompt(decisionChain) {
        const pathSummary = this.buildPathSummary(decisionChain);
        const lessonSpecs = this.buildLessonSpecifications();
        
        return `${this.currentPrompt}

FINAL LESSON CREATION PROMPT:
${pathSummary}

${lessonSpecs}

LESSON CREATION INSTRUCTIONS:
Based on the decision chain above, create a micro-lesson that:
1. Follows the established learning path
2. Matches user preferences exactly
3. Builds logically from previous decisions
4. Provides clear, actionable learning content
5. Includes practice exercises if appropriate
6. Stays within the ${this.userPreferences.duration}-minute timeframe

Generate the complete lesson content now.`;
    }

    /**
     * Build path summary from decision chain
     * @param {Array} decisionChain - Decision chain
     * @returns {string} Path summary
     */
    buildPathSummary(decisionChain) {
        let summary = 'LEARNING PATH SUMMARY:\n';
        
        decisionChain.forEach((chainItem, index) => {
            const decision = chainItem.decision;
            summary += `${index + 1}. Level ${decision.level}: ${decision.decision_type}\n`;
            summary += `   Reasoning: ${decision.reasoning}\n`;
            summary += `   Confidence: ${decision.confidence_score}%\n\n`;
        });
        
        return summary;
    }

    /**
     * Build lesson specifications
     * @returns {string} Lesson specifications
     */
    buildLessonSpecifications() {
        return `LESSON SPECIFICATIONS:
- Duration: ${this.userPreferences.duration} minutes
- Difficulty: ${this.userPreferences.difficulty}
- Topic Area: ${this.userPreferences.topic}
- Learning Style: ${this.userPreferences.learning_style}
- Format: Micro-lesson with clear objectives
- Structure: Introduction → Core Content → Practice → Summary`;
    }

    /**
     * Get current prompt
     * @returns {string} Current prompt
     */
    getCurrentPrompt() {
        return this.currentPrompt;
    }

    /**
     * Get prompt history
     * @returns {Array} Prompt history
     */
    getPromptHistory() {
        return this.promptHistory;
    }

    /**
     * Reset prompt builder for new lesson
     */
    reset() {
        this.promptHistory = [];
        this.currentPrompt = '';
    }
}

export default AIPromptBuilder;

