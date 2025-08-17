// Global state management
let currentStep = 1;
let promptData = {
    original: '',
    style: '',
    customStyle: '',
    enhanced: ''
};

// DOM elements
const elements = {
    steps: {
        step1: document.getElementById('step1'),
        step2: document.getElementById('step2'),
        step3: document.getElementById('step3')
    },
    inputs: {
        promptInput: document.getElementById('promptInput'),
        styleOptions: document.getElementsByName('style'),
        customStyle: document.getElementById('customStyle'),
        outputPrompt: document.getElementById('outputPrompt')
    },
    buttons: {
        nextBtn: document.getElementById('nextBtn'),
        backBtn1: document.getElementById('backBtn1'),
        backBtn2: document.getElementById('backBtn2'),
        makePromptBtn: document.getElementById('makePromptBtn'),
        copyBtn: document.getElementById('copyBtn'),
        themeToggle: document.getElementById('themeToggle')
    },
    ui: {
        charCount: document.getElementById('charCount'),
        usageCount: document.getElementById('usageCount'),
        outputLength: document.getElementById('outputLength'),
        improvement: document.getElementById('improvement'),
        customInput: document.getElementById('customInput'),
        upgradeModal: document.getElementById('upgradeModal'),
        closeModal: document.getElementById('closeModal'),
        toast: document.getElementById('toast'),
        toastMessage: document.getElementById('toastMessage')
    }
};

// Initialize the extension
document.addEventListener('DOMContentLoaded', async () => {
    await initializeExtension();
    setupEventListeners();
    loadTheme();
    await updateUsageDisplay();
});

// Initialize extension state
async function initializeExtension() {
    try {
        // Load saved data from storage
        const result = await chrome.storage.local.get(['theme', 'isPro', 'dailyUsage', 'lastUsageDate']);
        
        // Initialize theme
        if (result.theme) {
            document.documentElement.setAttribute('data-theme', result.theme);
            elements.buttons.themeToggle.textContent = result.theme === 'dark' ? '☀️' : '🌙';
        }
        
        // Reset daily usage if it's a new day
        const today = new Date().toDateString();
        if (result.lastUsageDate !== today) {
            await chrome.storage.local.set({
                dailyUsage: 0,
                lastUsageDate: today
            });
        }
    } catch (error) {
        console.error('Failed to initialize extension:', error);
        showToast('Failed to load extension data', 'error');
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Step 1 events
    elements.inputs.promptInput.addEventListener('input', handlePromptInput);
    elements.buttons.nextBtn.addEventListener('click', () => navigateToStep(2));
    
    // Step 2 events
    elements.inputs.styleOptions.forEach(radio => {
        radio.addEventListener('change', handleStyleSelection);
    });
    elements.inputs.customStyle.addEventListener('input', handleCustomStyleInput);
    elements.buttons.backBtn1.addEventListener('click', () => navigateToStep(1));
    elements.buttons.makePromptBtn.addEventListener('click', generatePrompt);
    
    // Step 3 events
    elements.buttons.backBtn2.addEventListener('click', () => navigateToStep(2));
    elements.buttons.copyBtn.addEventListener('click', copyPromptToClipboard);
    
    // Theme toggle
    elements.buttons.themeToggle.addEventListener('click', toggleTheme);
    
    // Modal events
    elements.ui.closeModal.addEventListener('click', () => hideUpgradeModal());
    elements.ui.upgradeModal.addEventListener('click', (e) => {
        if (e.target === elements.ui.upgradeModal) {
            hideUpgradeModal();
        }
    });
}

// Handle prompt input changes
function handlePromptInput() {
    const value = elements.inputs.promptInput.value;
    const length = value.length;
    
    // Update character count
    elements.ui.charCount.textContent = length;
    
    // Update character count color based on length
    if (length > 1800) {
        elements.ui.charCount.style.color = 'var(--error)';
    } else if (length > 1500) {
        elements.ui.charCount.style.color = 'var(--warning)';
    } else {
        elements.ui.charCount.style.color = 'var(--text-secondary)';
    }
    
    // Enable/disable next button
    elements.buttons.nextBtn.disabled = length < 3;
    
    // Store the original prompt
    promptData.original = value;
}

// Handle style selection
function handleStyleSelection() {
    const selectedStyle = document.querySelector('input[name="style"]:checked');
    
    if (selectedStyle) {
        promptData.style = selectedStyle.value;
        
        // Show/hide custom input
        if (selectedStyle.value === 'custom') {
            elements.ui.customInput.style.display = 'block';
            elements.buttons.makePromptBtn.disabled = !elements.inputs.customStyle.value.trim();
        } else {
            elements.ui.customInput.style.display = 'none';
            elements.buttons.makePromptBtn.disabled = false;
        }
    }
}

// Handle custom style input
function handleCustomStyleInput() {
    const value = elements.inputs.customStyle.value.trim();
    promptData.customStyle = value;
    elements.buttons.makePromptBtn.disabled = !value;
}

// Navigate between steps
function navigateToStep(stepNumber) {
    // Hide all steps
    Object.values(elements.steps).forEach(step => {
        step.classList.remove('active');
    });
    
    // Show target step
    elements.steps[`step${stepNumber}`].classList.add('active');
    currentStep = stepNumber;
    
    // Focus appropriate element
    if (stepNumber === 1) {
        elements.inputs.promptInput.focus();
    } else if (stepNumber === 3) {
        elements.inputs.outputPrompt.focus();
    }
}

// Generate enhanced prompt
async function generatePrompt() {
    try {
        // Check usage limits
        const canUse = await checkUsageLimit();
        if (!canUse) {
            showUpgradeModal();
            return;
        }
        
        // Increment usage
        await incrementUsage();
        
        // Generate the enhanced prompt
        const enhancedPrompt = enhancePrompt(promptData.original, promptData.style, promptData.customStyle);
        promptData.enhanced = enhancedPrompt;
        
        // Display the result
        elements.inputs.outputPrompt.value = enhancedPrompt;
        elements.ui.outputLength.textContent = `${enhancedPrompt.length} characters`;
        
        // Calculate improvement indicator
        const improvement = calculateImprovement(promptData.original, enhancedPrompt);
        elements.ui.improvement.textContent = improvement;
        
        // Navigate to output step
        navigateToStep(3);
        
        // Update usage display
        await updateUsageDisplay();
        
    } catch (error) {
        console.error('Failed to generate prompt:', error);
        showToast('Failed to generate prompt. Please try again.', 'error');
    }
}

// Check if user can use the feature
async function checkUsageLimit() {
    try {
        const result = await chrome.storage.local.get(['isPro', 'dailyUsage']);
        
        if (result.isPro) {
            return true;
        }
        
        const usage = result.dailyUsage || 0;
        return usage < 5;
    } catch (error) {
        console.error('Failed to check usage limit:', error);
        return false;
    }
}

// Increment usage counter
async function incrementUsage() {
    try {
        const result = await chrome.storage.local.get(['dailyUsage']);
        const currentUsage = result.dailyUsage || 0;
        
        await chrome.storage.local.set({
            dailyUsage: currentUsage + 1
        });
    } catch (error) {
        console.error('Failed to increment usage:', error);
    }
}

// Update usage display
async function updateUsageDisplay() {
    try {
        const result = await chrome.storage.local.get(['isPro', 'dailyUsage']);
        
        if (result.isPro) {
            elements.ui.usageCount.textContent = '∞';
            elements.ui.usageCount.parentElement.innerHTML = 'Daily prompts used: <span id="usageCount">∞</span> (Pro)';
        } else {
            const usage = result.dailyUsage || 0;
            elements.ui.usageCount.textContent = usage;
        }
    } catch (error) {
        console.error('Failed to update usage display:', error);
    }
}

// Calculate improvement indicator
function calculateImprovement(original, enhanced) {
    const originalWords = original.trim().split(/\s+/).length;
    const enhancedWords = enhanced.trim().split(/\s+/).length;
    
    if (enhancedWords > originalWords * 2) {
        return 'Greatly Enhanced';
    } else if (enhancedWords > originalWords * 1.5) {
        return 'Enhanced';
    } else if (enhancedWords > originalWords) {
        return 'Improved';
    } else {
        return 'Refined';
    }
}

// Copy prompt to clipboard
async function copyPromptToClipboard() {
    try {
        await navigator.clipboard.writeText(promptData.enhanced);
        showToast('Prompt copied to clipboard!', 'success');
        
        // Optional: Close the popup after copying
        setTimeout(() => {
            window.close();
        }, 1500);
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        
        // Fallback: select the text
        elements.inputs.outputPrompt.select();
        elements.inputs.outputPrompt.setSelectionRange(0, 99999);
        
        try {
            document.execCommand('copy');
            showToast('Prompt copied to clipboard!', 'success');
        } catch (fallbackError) {
            showToast('Failed to copy. Please select and copy manually.', 'error');
        }
    }
}

// Toggle theme
async function toggleTheme() {
    try {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        elements.buttons.themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        
        // Save theme preference
        await chrome.storage.local.set({ theme: newTheme });
    } catch (error) {
        console.error('Failed to toggle theme:', error);
    }
}

// Load saved theme
function loadTheme() {
    chrome.storage.local.get(['theme']).then(result => {
        if (result.theme) {
            document.documentElement.setAttribute('data-theme', result.theme);
            elements.buttons.themeToggle.textContent = result.theme === 'dark' ? '☀️' : '🌙';
        }
    });
}

// Show upgrade modal
function showUpgradeModal() {
    elements.ui.upgradeModal.style.display = 'flex';
}

// Hide upgrade modal
function hideUpgradeModal() {
    elements.ui.upgradeModal.style.display = 'none';
}

// Handle upgrade selection
async function handleUpgrade(plan) {
    try {
        // In a real implementation, this would integrate with Stripe
        // For now, we'll simulate the upgrade
        showToast(`Redirecting to ${plan} payment...`, 'info');
        
        // Simulate successful payment
        setTimeout(async () => {
            await chrome.storage.local.set({ isPro: true });
            hideUpgradeModal();
            await updateUsageDisplay();
            showToast('Welcome to Pro! You now have unlimited prompts.', 'success');
        }, 2000);
        
    } catch (error) {
        console.error('Failed to process upgrade:', error);
        showToast('Failed to process upgrade. Please try again.', 'error');
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    elements.ui.toastMessage.textContent = message;
    elements.ui.toast.style.display = 'block';
    
    // Style based on type
    if (type === 'error') {
        elements.ui.toast.style.backgroundColor = 'var(--error)';
    } else if (type === 'warning') {
        elements.ui.toast.style.backgroundColor = 'var(--warning)';
    } else if (type === 'info') {
        elements.ui.toast.style.backgroundColor = 'var(--secondary-color)';
    } else {
        elements.ui.toast.style.backgroundColor = 'var(--success)';
    }
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        elements.ui.toast.style.display = 'none';
    }, 3000);
}

// Make handleUpgrade globally available
window.handleUpgrade = handleUpgrade;
