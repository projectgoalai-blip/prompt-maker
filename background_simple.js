// Simple background service worker for Prompt Maker extension
console.log('Prompt Maker service worker starting');

// Initialize extension on install
chrome.runtime.onInstalled.addListener(async (details) => {
    console.log('Extension installed/updated');
    
    // Set default storage values
    try {
        await chrome.storage.local.set({
            dailyUsage: 0,
            lastUsageDate: new Date().toDateString(),
            isPro: false,
            theme: 'light',
            totalPromptsGenerated: 0,
            installDate: new Date().toISOString()
        });
        console.log('Default settings initialized');
    } catch (error) {
        console.error('Failed to initialize settings:', error);
    }
});

// Handle daily usage reset
chrome.runtime.onStartup.addListener(async () => {
    console.log('Extension startup - checking daily reset');
    
    try {
        const result = await chrome.storage.local.get(['lastUsageDate', 'dailyUsage']);
        const today = new Date().toDateString();
        
        if (result.lastUsageDate !== today) {
            await chrome.storage.local.set({
                dailyUsage: 0,
                lastUsageDate: today
            });
            console.log('Daily usage reset completed');
        }
    } catch (error) {
        console.error('Failed to reset daily usage:', error);
    }
});

console.log('Background script loaded successfully');