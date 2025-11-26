
import { BrandProfile } from '../types';

export interface ComplianceResult {
    score: number;
    violations: string[];
    suggestions: string[];
    isCompliant: boolean;
}

export const calculateComplianceScore = (text: string, profile: BrandProfile): ComplianceResult => {
    if (!text || !profile) return { score: 100, violations: [], suggestions: [], isCompliant: true };

    let score = 100;
    const violations: string[] = [];
    const suggestions: string[] = [];
    const lowerText = text.toLowerCase();

    // 1. Forbidden Terms Check
    if (profile.forbidden_terms && profile.forbidden_terms.length > 0) {
        profile.forbidden_terms.forEach(term => {
            if (lowerText.includes(term.toLowerCase())) {
                score -= 15; // Heavy penalty for forbidden terms
                violations.push(`Found forbidden term: "${term}"`);
            }
        });
    }

    // 2. Voice Rules (Heuristics)
    // Example: "No Jargon" might check for specific complex words, or sentence length
    // This is a simplified heuristic. In a real app, this might use a lightweight LLM call.
    
    // Heuristic: Sentence Length (Too long = likely jargon/complex)
    const sentences = text.split(/[.!?]+/);
    const avgWords = sentences.reduce((acc, s) => acc + s.split(' ').length, 0) / (sentences.length || 1);
    if (avgWords > 25) {
        score -= 5;
        suggestions.push("Average sentence length is high. Shorten sentences for clarity.");
    }

    // Heuristic: Passive Voice (simple check for "was/were + ed")
    // Very basic check
    const passiveMatches = (text.match(/\b(was|were|been)\s\w+ed\b/gi) || []).length;
    if (passiveMatches > 3) {
        score -= 5;
        suggestions.push("Detected passive voice. Try to use active voice.");
    }

    // 3. CTA Check
    if (profile.default_cta && !lowerText.includes('link') && !lowerText.includes('comment') && !lowerText.includes('below')) {
        // Mild penalty if no typical CTA words found when a default CTA exists
        score -= 5;
        suggestions.push(`Ensure you include a CTA similar to: "${profile.default_cta}"`);
    }

    // Cap Score
    score = Math.max(0, Math.min(100, score));

    return {
        score,
        violations,
        suggestions,
        isCompliant: score >= (profile.compliance_threshold || 70)
    };
};
