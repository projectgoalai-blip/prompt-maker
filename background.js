// Background service worker for Prompt Maker extension
// Handles extension lifecycle, storage management, and daily usage reset

// Extension installation and updates
chrome.runtime.onInstalled.addListener(async (details) => {
    try {
        if (details.reason === 'install') {
            // First time installation
            console.log('Prompt Maker extension installed');
            
            // Initialize default settings
            await chrome.storage.local.set({
                dailyUsage: 0,
                lastUsageDate: new Date().toDateString(),
                isPro: false,
                theme: 'light',
                totalPromptsGenerated: 0,
                installDate: new Date().toISOString()
            });
            
            // Set up daily reset alarm
            await setupDailyResetAlarm();
            
        } else if (details.reason === 'update') {
            console.log('Prompt Maker extension updated');
            
            // Handle any migration logic for updates
            await handleExtensionUpdate(details.previousVersion);
        }
    } catch (error) {
        console.error('Error during extension installation/update:', error);
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(async () => {
    try {
        console.log('Prompt Maker extension starting up');
        
        // Check if daily usage needs to be reset
        await checkAndResetDailyUsage();
        
        // Ensure daily reset alarm is set
        await setupDailyResetAlarm();
        
    } catch (error) {
        console.error('Error during extension startup:', error);
    }
});

// Handle alarm events (for daily reset)
chrome.alarms.onAlarm.addListener(async (alarm) => {
    try {
        if (alarm.name === 'dailyReset') {
            console.log('Performing daily usage reset');
            await resetDailyUsage();
        }
    } catch (error) {
        console.error('Error handling alarm:', error);
    }
});

// Set up daily reset alarm
async function setupDailyResetAlarm() {
    try {
        // Clear any existing alarm
        await chrome.alarms.clear('dailyReset');
        
        // Calculate time until next midnight
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const delayInMinutes = (tomorrow.getTime() - now.getTime()) / (1000 * 60);
        
        // Create alarm for next midnight, then repeat every 24 hours
        await chrome.alarms.create('dailyReset', {
            delayInMinutes: delayInMinutes,
            periodInMinutes: 24 * 60 // 24 hours
        });
        
        console.log(`Daily reset alarm set for ${delayInMinutes} minutes from now`);
        
    } catch (error) {
        console.error('Failed to setup daily reset alarm:', error);
    }
}

// Check and reset daily usage if needed
async function checkAndResetDailyUsage() {
    try {
        const result = await chrome.storage.local.get(['lastUsageDate', 'dailyUsage']);
        const today = new Date().toDateString();
        
        if (result.lastUsageDate !== today) {
            await resetDailyUsage();
        }
    } catch (error) {
        console.error('Failed to check daily usage:', error);
    }
}

// Reset daily usage counter
async function resetDailyUsage() {
    try {
        const today = new Date().toDateString();
        
        await chrome.storage.local.set({
            dailyUsage: 0,
            lastUsageDate: today
        });
        
        console.log('Daily usage reset completed');
        
        // Optional: Show notification to user if they have the extension open
        await notifyUsageReset();
        
    } catch (error) {
        console.error('Failed to reset daily usage:', error);
    }
}

// Handle extension updates
async function handleExtensionUpdate(previousVersion) {
    try {
        console.log(`Extension updated from version ${previousVersion}`);
        
        // Get current stored data
        const currentData = await chrome.storage.local.get();
        
        // Migration logic for different version updates
        const currentVersion = chrome.runtime.getManifest().version;
        
        // Example migration: Add new fields if they don't exist
        const updates = {};
        
        if (!currentData.hasOwnProperty('totalPromptsGenerated')) {
            updates.totalPromptsGenerated = currentData.dailyUsage || 0;
        }
        
        if (!currentData.hasOwnProperty('theme')) {
            updates.theme = 'light';
        }
        
        if (!currentData.hasOwnProperty('installDate')) {
            updates.installDate = new Date().toISOString();
        }
        
        // Apply updates if any
        if (Object.keys(updates).length > 0) {
            await chrome.storage.local.set(updates);
            console.log('Extension data migrated:', updates);
        }
        
    } catch (error) {
        console.error('Failed to handle extension update:', error);
    }
}

// Notify about usage reset (if extension is active)
async function notifyUsageReset() {
    try {
        // This would only show if the popup is open
        // We can't send notifications without permission, so this is just a console log
        console.log('Daily prompt limit has been reset');
        
        // If we had notification permission, we could do:
        // chrome.notifications.create({
        //     type: 'basic',
        //     iconUrl: 'icons/icon48.svg',
        //     title: 'Prompt Maker',
        //     message: 'Daily prompt limit has been reset!'
        // });
        
    } catch (error) {
        console.error('Failed to notify about usage reset:', error);
    }
}

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
        switch (message.type) {
            case 'getUsageStats':
                handleGetUsageStats(sendResponse);
                return true; // Keep message channel open for async response
                
            case 'incrementUsage':
                handleIncrementUsage(sendResponse);
                return true;
                
            case 'resetUsage':
                handleResetUsage(sendResponse);
                return true;
                
            case 'upgradeToPro':
                handleUpgradeToPro(message.data, sendResponse);
                return true;
                
            default:
                console.log('Unknown message type:', message.type);
                sendResponse({ error: 'Unknown message type' });
        }
    } catch (error) {
        console.error('Error handling message:', error);
        sendResponse({ error: error.message });
    }
});

// Handle get usage stats request
async function handleGetUsageStats(sendResponse) {
    try {
        const result = await chrome.storage.local.get([
            'dailyUsage',
            'isPro',
            'totalPromptsGenerated',
            'lastUsageDate'
        ]);
        
        // Ensure usage is reset if it's a new day
        const today = new Date().toDateString();
        if (result.lastUsageDate !== today) {
            await resetDailyUsage();
            result.dailyUsage = 0;
            result.lastUsageDate = today;
        }
        
        sendResponse({
            success: true,
            data: {
                dailyUsage: result.dailyUsage || 0,
                isPro: result.isPro || false,
                totalPromptsGenerated: result.totalPromptsGenerated || 0,
                remainingFreeUsage: Math.max(0, 5 - (result.dailyUsage || 0))
            }
        });
    } catch (error) {
        sendResponse({ success: false, error: error.message });
    }
}

// Handle increment usage request
async function handleIncrementUsage(sendResponse) {
    try {
        const result = await chrome.storage.local.get([
            'dailyUsage',
            'totalPromptsGenerated',
            'isPro'
        ]);
        
        const newDailyUsage = (result.dailyUsage || 0) + 1;
        const newTotalUsage = (result.totalPromptsGenerated || 0) + 1;
        
        await chrome.storage.local.set({
            dailyUsage: newDailyUsage,
            totalPromptsGenerated: newTotalUsage,
            lastUsageDate: new Date().toDateString()
        });
        
        sendResponse({
            success: true,
            data: {
                dailyUsage: newDailyUsage,
                totalPromptsGenerated: newTotalUsage,
                remainingFreeUsage: result.isPro ? -1 : Math.max(0, 5 - newDailyUsage)
            }
        });
    } catch (error) {
        sendResponse({ success: false, error: error.message });
    }
}

// Handle reset usage request (for testing purposes)
async function handleResetUsage(sendResponse) {
    try {
        await resetDailyUsage();
        sendResponse({ success: true });
    } catch (error) {
        sendResponse({ success: false, error: error.message });
    }
}

// Handle upgrade to pro
async function handleUpgradeToPro(data, sendResponse) {
    try {
        // In a real implementation, this would validate the payment with Stripe
        // For now, we'll simulate the upgrade
        
        await chrome.storage.local.set({
            isPro: true,
            proUpgradeDate: new Date().toISOString(),
            proPlan: data.plan || 'monthly'
        });
        
        console.log('User upgraded to Pro');
        
        sendResponse({
            success: true,
            data: {
                isPro: true,
                plan: data.plan || 'monthly'
            }
        });
    } catch (error) {
        sendResponse({ success: false, error: error.message });
    }
}

// Cleanup function (called when extension is disabled/uninstalled)
chrome.runtime.onSuspend.addListener(() => {
    console.log('Prompt Maker extension suspending');
    // Cleanup any ongoing operations
});

// Error handling for unhandled promise rejections
self.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection in background script:', event.reason);
});

// Log extension startup
console.log('Prompt Maker background script loaded');
