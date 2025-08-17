# Overview

Prompt Maker is a Chrome extension designed to help users write better prompts for AI tools like ChatGPT, Claude, Gemini, and MidJourney. The extension takes raw user ideas and transforms them into well-structured, detailed prompts using predefined templates and style options. Users can choose from different communication styles (Simple, Professional, Technical, or Custom) and the extension automatically enhances short prompts with additional context and detail.

# User Preferences

Preferred communication style: Simple, everyday language.

# Enhancement Ideas for Increased Usage

The user is interested in expanding the extension's features to attract more users. Key areas for improvement include:
- Prompt history and favorites
- More template categories 
- AI platform integration
- Social features
- Analytics and insights

# System Architecture

## Frontend Architecture
- **Popup-based UI**: Uses Chrome extension popup with HTML/CSS/JavaScript for the main interface
- **Multi-step workflow**: Three-step process (input → style selection → output) with state management
- **Responsive design**: CSS variables for theming with light/dark mode support
- **Character counting**: Real-time input validation and character limits (2000 chars)

## State Management
- **Global state object**: Centralized `promptData` object tracking original input, selected style, custom style, and enhanced output
- **Step navigation**: Current step tracking with DOM manipulation for multi-step UI
- **Local storage persistence**: Chrome storage API for user preferences and usage tracking

## Template System
- **Style-specific templates**: Predefined templates for Simple, Professional, and Technical styles
- **Dynamic enhancement**: Automatic prompt expansion based on length and content analysis
- **Expansion rules**: Configurable word targets and enhancement patterns for each style
- **Topic detection**: Pattern matching for common use cases (blog posts, technical docs, etc.)

## Usage Tracking
- **Daily limits**: Free tier limited to 5 prompts per day with automatic reset
- **Usage persistence**: Tracks daily usage, total prompts generated, and installation date
- **Premium upgrade path**: Built-in upgrade modal for pro features

## Extension Lifecycle
- **Background service worker**: Handles installation, updates, and daily usage reset
- **Alarm system**: Scheduled daily reset of usage counters
- **Migration handling**: Version update logic for settings preservation

## Data Storage
- **Chrome storage API**: Local storage for user preferences, usage data, and settings
- **No external database**: Fully client-side operation for privacy
- **Settings management**: Theme preferences, pro status, and usage statistics

# External Dependencies

## Chrome Extension APIs
- **chrome.storage**: For persisting user data and preferences locally
- **chrome.clipboardWrite**: For copying enhanced prompts to clipboard
- **chrome.runtime**: For extension lifecycle management and background tasks
- **chrome.alarms**: For scheduled daily usage reset functionality

## Browser Features
- **Service Worker**: Background script for extension management
- **Popup API**: Main user interface through browser action popup
- **Content Security Policy**: Secure script execution with CSP restrictions

## Styling Framework
- **CSS Custom Properties**: For theming and consistent design system
- **System fonts**: Uses native system font stack for better performance
- **No external CSS frameworks**: Custom CSS for lightweight implementation

## No External Services
- **Fully offline**: No API calls or external service dependencies
- **Client-side processing**: All prompt enhancement done locally
- **Privacy-focused**: No data transmitted outside the browser