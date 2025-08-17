// Template system for prompt enhancement
const PromptTemplates = {
    
    // Style-specific templates
    styles: {
        simple: {
            prefix: "Please explain this in simple, easy-to-understand language:",
            suffix: "Keep the response clear and straightforward, avoiding technical jargon.",
            expansionRules: {
                minWords: 8,
                targetWords: 25,
                addContext: true,
                addExamples: true
            }
        },
        
        professional: {
            prefix: "Please provide a comprehensive, professional analysis of:",
            suffix: "Structure your response in a clear, business-appropriate format with actionable insights.",
            expansionRules: {
                minWords: 12,
                targetWords: 35,
                addContext: true,
                addStructure: true,
                addBenefits: true
            }
        },
        
        technical: {
            prefix: "Please provide a detailed technical breakdown of:",
            suffix: "Include specific methodologies, technical considerations, and implementation details where applicable.",
            expansionRules: {
                minWords: 15,
                targetWords: 45,
                addContext: true,
                addSteps: true,
                addTechnicalDetails: true,
                addBestPractices: true
            }
        }
    },
    
    // Auto-expansion templates for common topics
    expansionTemplates: {
        // Content creation
        blog: {
            pattern: /blog|article|post|content|write/i,
            template: "Write a comprehensive blog post about {topic}. Include an engaging introduction, main points with supporting details, real-world examples, and a compelling conclusion. Target audience: {audience}. Tone: {tone}."
        },
        
        email: {
            pattern: /email|message|letter/i,
            template: "Compose a professional email about {topic}. Include a clear subject line, proper greeting, concise main message, call-to-action if needed, and appropriate closing. Tone: {tone}."
        },
        
        // Analysis and explanation
        explain: {
            pattern: /explain|describe|what is|how does/i,
            template: "Provide a clear explanation of {topic}. Break down complex concepts into understandable parts, include relevant examples, and explain the practical implications or applications."
        },
        
        compare: {
            pattern: /compare|versus|vs|difference|similarities/i,
            template: "Create a detailed comparison of {topic}. Highlight key similarities and differences, provide specific examples, and include a summary of when each option might be preferred."
        },
        
        // Problem-solving
        solve: {
            pattern: /solve|fix|troubleshoot|problem|issue/i,
            template: "Analyze and provide solutions for {topic}. Include step-by-step troubleshooting approaches, potential root causes, preventive measures, and alternative solutions if the primary approach fails."
        },
        
        // Creative and design
        design: {
            pattern: /design|create|build|make/i,
            template: "Provide detailed guidance for designing/creating {topic}. Include planning considerations, step-by-step process, best practices, common pitfalls to avoid, and tips for optimization."
        },
        
        // Research and analysis
        research: {
            pattern: /research|analyze|study|investigate/i,
            template: "Conduct a thorough analysis of {topic}. Include current trends, key findings, data sources, methodology considerations, and actionable recommendations based on the research."
        },
        
        // Learning and education
        learn: {
            pattern: /learn|teach|tutorial|guide|how to/i,
            template: "Create a comprehensive learning guide for {topic}. Structure the content from beginner to advanced concepts, include practical exercises, common mistakes to avoid, and additional resources for further learning."
        },
        
        // Social Media Content
        social: {
            pattern: /social|post|tweet|instagram|linkedin|facebook/i,
            template: "Create engaging social media content about {topic}. Include attention-grabbing headlines, compelling visuals descriptions, relevant hashtags, call-to-action, and platform-specific optimizations for maximum engagement."
        },
        
        twitter: {
            pattern: /twitter|tweet/i,
            template: "Compose a Twitter thread about {topic}. Start with a hook tweet, break down key points across multiple tweets (under 280 characters each), include relevant hashtags, and end with a strong call-to-action."
        },
        
        linkedin: {
            pattern: /linkedin|professional post/i,
            template: "Write a professional LinkedIn post about {topic}. Include industry insights, personal experience or expertise, actionable advice, professional tone, and relevant hashtags to increase visibility in professional networks."
        },
        
        // Business Content
        business: {
            pattern: /business|proposal|report|presentation/i,
            template: "Create a comprehensive business document about {topic}. Include executive summary, market analysis, strategic recommendations, implementation timeline, budget considerations, and measurable success metrics."
        },
        
        proposal: {
            pattern: /proposal|pitch|offer/i,
            template: "Draft a compelling business proposal for {topic}. Include problem statement, proposed solution, benefits and ROI, implementation plan, timeline, pricing structure, and next steps for decision-makers."
        },
        
        presentation: {
            pattern: /presentation|slides|deck/i,
            template: "Structure a powerful presentation about {topic}. Include compelling opening, clear agenda, key talking points with supporting data, visual aids suggestions, audience engagement strategies, and strong closing with clear takeaways."
        },
        
        // E-commerce and Product
        product: {
            pattern: /product|description|listing|ecommerce/i,
            template: "Write compelling product descriptions for {topic}. Include key features and benefits, target audience appeal, unique selling propositions, technical specifications if relevant, customer pain points addressed, and clear call-to-action."
        },
        
        // Creative Writing
        creative: {
            pattern: /story|poem|script|creative writing/i,
            template: "Create engaging creative content about {topic}. Include vivid descriptions, compelling characters or elements, emotional resonance, proper narrative structure, and immersive details that captivate the audience."
        },
        
        // Resume and Career
        resume: {
            pattern: /resume|cv|cover letter|job application/i,
            template: "Write professional career documents for {topic}. Include relevant skills and achievements, quantifiable results, industry keywords, proper formatting guidelines, and compelling narratives that align with target opportunities."
        },
        
        // Code and Technical Documentation
        code: {
            pattern: /code|programming|development|software/i,
            template: "Provide comprehensive coding assistance for {topic}. Include clear code examples, best practices, error handling, documentation, testing considerations, and step-by-step implementation guidance."
        }
    },
    
    // Context enhancers
    contextEnhancers: {
        audience: [
            "beginners",
            "professionals",
            "students",
            "business executives",
            "technical specialists",
            "general public"
        ],
        
        tones: [
            "professional",
            "casual",
            "friendly",
            "authoritative",
            "educational",
            "conversational"
        ],
        
        structures: [
            "with clear headings and bullet points",
            "in a step-by-step format",
            "with examples and case studies",
            "including pros and cons",
            "with actionable takeaways"
        ]
    }
};

// Main prompt enhancement function
function enhancePrompt(originalPrompt, style, customStyle = '') {
    // Clean and prepare the original prompt
    const cleanPrompt = originalPrompt.trim();
    
    if (!cleanPrompt) {
        return "Please provide a prompt to enhance.";
    }
    
    // Check if prompt needs expansion
    const wordCount = cleanPrompt.split(/\s+/).length;
    const needsExpansion = wordCount < 8;
    
    let enhancedPrompt = cleanPrompt;
    
    // Apply auto-expansion if needed
    if (needsExpansion) {
        enhancedPrompt = autoExpandPrompt(cleanPrompt);
    }
    
    // Apply style-specific enhancements
    if (style === 'custom' && customStyle) {
        enhancedPrompt = applyCustomStyle(enhancedPrompt, customStyle);
    } else if (style && PromptTemplates.styles[style]) {
        enhancedPrompt = applyStyleTemplate(enhancedPrompt, style);
    }
    
    // Final optimization
    enhancedPrompt = optimizePrompt(enhancedPrompt);
    
    return enhancedPrompt;
}

// Auto-expand short prompts
function autoExpandPrompt(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    // Find matching template
    for (const [key, template] of Object.entries(PromptTemplates.expansionTemplates)) {
        if (template.pattern.test(lowerPrompt)) {
            return expandWithTemplate(prompt, template);
        }
    }
    
    // Generic expansion for unmatched prompts
    return expandGeneric(prompt);
}

// Expand using specific template
function expandWithTemplate(prompt, template) {
    const topic = extractTopic(prompt);
    const audience = detectAudience(prompt);
    const tone = detectTone(prompt);
    
    let expanded = template.template
        .replace('{topic}', topic)
        .replace('{audience}', audience)
        .replace('{tone}', tone);
    
    return expanded;
}

// Extract main topic from prompt
function extractTopic(prompt) {
    // Remove common trigger words and articles
    const cleanedPrompt = prompt
        .replace(/^(write|create|make|explain|describe|blog|article|email|about|on)\s+/i, '')
        .replace(/^(a|an|the)\s+/i, '');
    
    return cleanedPrompt || prompt;
}

// Detect target audience
function detectAudience(prompt) {
    const audienceKeywords = {
        'beginners': /beginner|start|basic|simple|new|intro/i,
        'professionals': /professional|business|corporate|enterprise/i,
        'students': /student|learn|study|education|school/i,
        'technical specialists': /technical|advanced|expert|developer|engineer/i
    };
    
    for (const [audience, pattern] of Object.entries(audienceKeywords)) {
        if (pattern.test(prompt)) {
            return audience;
        }
    }
    
    return 'general readers';
}

// Detect desired tone
function detectTone(prompt) {
    const toneKeywords = {
        'professional': /professional|business|formal|corporate/i,
        'casual': /casual|friendly|informal|relaxed/i,
        'educational': /learn|teach|explain|educational|tutorial/i,
        'authoritative': /expert|definitive|comprehensive|thorough/i
    };
    
    for (const [tone, pattern] of Object.entries(toneKeywords)) {
        if (pattern.test(prompt)) {
            return tone;
        }
    }
    
    return 'clear and engaging';
}

// Generic expansion for unmatched prompts
function expandGeneric(prompt) {
    const wordCount = prompt.split(/\s+/).length;
    
    if (wordCount <= 3) {
        return `Provide a comprehensive overview of ${prompt}. Include key concepts, practical applications, current trends, and actionable insights. Structure your response clearly with examples and real-world context.`;
    } else if (wordCount <= 6) {
        return `${prompt}. Please provide detailed information including background context, step-by-step explanations where relevant, practical examples, and key takeaways that readers can apply.`;
    } else {
        return `${prompt}. Please elaborate with specific details, supporting examples, and practical guidance.`;
    }
}

// Apply style-specific template
function applyStyleTemplate(prompt, style) {
    const template = PromptTemplates.styles[style];
    
    if (!template) {
        return prompt;
    }
    
    // Build enhanced prompt
    let enhanced = '';
    
    if (template.prefix) {
        enhanced += template.prefix + '\n\n';
    }
    
    enhanced += prompt;
    
    if (template.suffix) {
        enhanced += '\n\n' + template.suffix;
    }
    
    // Apply expansion rules if needed
    if (template.expansionRules) {
        enhanced = applyExpansionRules(enhanced, template.expansionRules);
    }
    
    return enhanced;
}

// Apply custom style
function applyCustomStyle(prompt, customStyle) {
    return `${prompt}\n\nPlease respond using the following style and approach: ${customStyle}`;
}

// Apply expansion rules
function applyExpansionRules(prompt, rules) {
    let enhanced = prompt;
    
    if (rules.addContext) {
        enhanced += '\n\nPlease provide relevant background context and explain why this topic is important.';
    }
    
    if (rules.addExamples) {
        enhanced += '\n\nInclude specific, real-world examples to illustrate key points.';
    }
    
    if (rules.addStructure) {
        enhanced += '\n\nOrganize your response with clear headings and logical flow.';
    }
    
    if (rules.addSteps) {
        enhanced += '\n\nBreak down the process into clear, actionable steps.';
    }
    
    if (rules.addTechnicalDetails) {
        enhanced += '\n\nInclude technical specifications, methodologies, and implementation considerations.';
    }
    
    if (rules.addBestPractices) {
        enhanced += '\n\nHighlight industry best practices and common pitfalls to avoid.';
    }
    
    if (rules.addBenefits) {
        enhanced += '\n\nExplain the benefits and potential impact of implementing these ideas.';
    }
    
    return enhanced;
}

// Final prompt optimization
function optimizePrompt(prompt) {
    // Remove excessive whitespace
    let optimized = prompt.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Ensure proper sentence endings
    optimized = optimized.replace(/([.!?])\s*([A-Z])/g, '$1 $2');
    
    // Capitalize first letter of sentences
    optimized = optimized.replace(/(^|\. )([a-z])/g, (match, prefix, letter) => {
        return prefix + letter.toUpperCase();
    });
    
    // Trim and clean
    optimized = optimized.trim();
    
    return optimized;
}

// Export for use in popup.js
window.enhancePrompt = enhancePrompt;
