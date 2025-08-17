// Enhanced features for Prompt Maker Pro
class PromptHistory {
    constructor() {
        this.history = [];
        this.favorites = [];
        this.loadData();
    }

    async loadData() {
        try {
            const result = await chrome.storage.local.get(['promptHistory', 'promptFavorites']);
            this.history = result.promptHistory || [];
            this.favorites = result.promptFavorites || [];
        } catch (error) {
            console.error('Failed to load history data:', error);
        }
    }

    async savePrompt(original, enhanced, style, category = 'general') {
        const prompt = {
            id: Date.now().toString(),
            original,
            enhanced,
            style,
            category,
            timestamp: new Date().toISOString(),
            wordCount: enhanced.split(/\s+/).length,
            improvement: this.calculateImprovement(original, enhanced)
        };

        this.history.unshift(prompt);
        
        // Keep only last 50 prompts
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }

        await this.saveData();
        return prompt;
    }

    async addToFavorites(promptId) {
        const prompt = this.history.find(p => p.id === promptId);
        if (prompt && !this.favorites.find(f => f.id === promptId)) {
            this.favorites.unshift({...prompt, favoriteDate: new Date().toISOString()});
            await this.saveData();
        }
    }

    async removeFromFavorites(promptId) {
        this.favorites = this.favorites.filter(f => f.id !== promptId);
        await this.saveData();
    }

    async saveData() {
        try {
            await chrome.storage.local.set({
                promptHistory: this.history,
                promptFavorites: this.favorites
            });
        } catch (error) {
            console.error('Failed to save history data:', error);
        }
    }

    calculateImprovement(original, enhanced) {
        const originalWords = original.trim().split(/\s+/).length;
        const enhancedWords = enhanced.trim().split(/\s+/).length;
        return Math.round(((enhancedWords - originalWords) / originalWords) * 100);
    }

    getRecentPrompts(limit = 5) {
        return this.history.slice(0, limit);
    }

    getFavorites(limit = 5) {
        return this.favorites.slice(0, limit);
    }

    getSimilarPrompts(currentPrompt, limit = 3) {
        const words = currentPrompt.toLowerCase().split(/\s+/);
        return this.history
            .filter(p => {
                const promptWords = p.original.toLowerCase().split(/\s+/);
                const commonWords = words.filter(w => promptWords.includes(w));
                return commonWords.length >= 2;
            })
            .slice(0, limit);
    }
}

// Quick templates data
const quickTemplates = {
    blog: "Write a comprehensive blog post about",
    email: "Compose a professional email regarding", 
    social: "Create engaging social media content for",
    code: "Help me with programming code for",
    business: "Create a business document for",
    creative: "Write creative content about",
    product: "Write compelling product descriptions for",
    resume: "Help me create professional resume content for",
    presentation: "Structure a powerful presentation about",
    proposal: "Draft a compelling business proposal for",
    twitter: "Compose a Twitter thread about",
    linkedin: "Write a professional LinkedIn post about"
};

// AI Platform integration
class AIIntegration {
    static platforms = {
        chatgpt: {
            name: 'ChatGPT',
            url: 'https://chat.openai.com/',
            icon: '🤖'
        },
        claude: {
            name: 'Claude',
            url: 'https://claude.ai/',
            icon: '🧠'
        },
        gemini: {
            name: 'Gemini',
            url: 'https://gemini.google.com/',
            icon: '💫'
        },
        midjourney: {
            name: 'MidJourney',
            url: 'https://discord.com/channels/@me',
            icon: '🎨'
        }
    };

    static async sendToPlatform(platform, prompt) {
        try {
            // Copy prompt to clipboard
            await navigator.clipboard.writeText(prompt);
            
            // Open platform URL
            const platformData = this.platforms[platform];
            if (platformData) {
                chrome.tabs.create({ url: platformData.url });
                return true;
            }
        } catch (error) {
            console.error('Failed to send to platform:', error);
            return false;
        }
    }
}

// Analytics tracking
class PromptAnalytics {
    constructor() {
        this.stats = {
            totalPrompts: 0,
            averageImprovement: 0,
            mostUsedStyle: 'simple',
            mostUsedCategory: 'general'
        };
        this.loadStats();
    }

    async loadStats() {
        try {
            const result = await chrome.storage.local.get(['promptStats']);
            this.stats = { ...this.stats, ...(result.promptStats || {}) };
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    async trackPrompt(style, category, improvement) {
        this.stats.totalPrompts++;
        
        // Update average improvement
        this.stats.averageImprovement = Math.round(
            (this.stats.averageImprovement + improvement) / 2
        );

        // Track style usage
        this.stats.mostUsedStyle = style;
        this.stats.mostUsedCategory = category;

        await this.saveStats();
    }

    async saveStats() {
        try {
            await chrome.storage.local.set({ promptStats: this.stats });
        } catch (error) {
            console.error('Failed to save stats:', error);
        }
    }

    getStats() {
        return this.stats;
    }
}

// Export for use in popup.js
window.PromptHistory = PromptHistory;
window.AIIntegration = AIIntegration;
window.PromptAnalytics = PromptAnalytics;
window.quickTemplates = quickTemplates;