/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export interface AnalysisRequest {
  image: string;
  text: string;
}

export interface AnalysisResult {
  visual_analysis: string;
  hypotheses: string[];
  evidence: string;
  agent_analyses: {
    architectural: string;
    cultural: string;
    verification: string;
  };
  ranked_interpretations: Array<{
    rank: number;
    hypothesis: string;
    confidence: number;
    summary: string;
    narrative: string;
    resembles?: string[];
    monument_images?: string[];
  }>;
  nearby_heritage_sites?: Array<{
    name: string;
    location: string;
    distance_km?: number;
    description: string;
    why_visit: string;
    period: string;
  }>;
  enhanced_visual_details?: {
    carving_techniques?: string;
    material_condition?: string;
    architectural_features?: string[];
    iconography_details?: string;
  };
  is_heritage: boolean;
  is_valid: boolean;
  error?: string;
}
