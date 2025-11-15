import { RequestHandler } from "express";
import { AnalysisRequest, AnalysisResult } from "@shared/api";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SERP_API_KEY = process.env.SERP_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const SERP_API_URL = "https://serpapi.com/search";

export const handleAnalyze: RequestHandler = async (req, res) => {
  const { image, text } = req.body as AnalysisRequest;

  if (!image) {
    return res.status(400).json({
      is_valid: false,
      is_heritage: false,
      error: "No image provided",
    } as AnalysisResult);
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      is_valid: false,
      is_heritage: false,
      error: "Gemini API key not configured",
    } as AnalysisResult);
  }

  try {
    // Step 1: Validate image
    const imageValidation = validateImage(image);
    if (!imageValidation.valid) {
      return res.status(400).json({
        is_valid: false,
        is_heritage: false,
        error: imageValidation.error,
      } as AnalysisResult);
    }

    // Step 2: Extract base64 from data URL
    const base64Image = image.replace(/^data:image\/\w+;base64,/, "");

    // Step 3: Use Gemini to detect if it's heritage content and analyze
    const heritageCheck = await analyzeWithGemini(base64Image, text, "detect");
    if (!heritageCheck.is_heritage) {
      return res.json({
        is_valid: true,
        is_heritage: false,
        error: heritageCheck.reason,
      } as AnalysisResult);
    }

    // Step 4: Get detailed analysis from Gemini
    const analysis = await analyzeWithGemini(base64Image, text, "analyze");

    // Step 5: Generate ranked interpretations
    const rankedInterpretations = analysis.ranked_interpretations;

    const result: AnalysisResult = {
      visual_analysis: analysis.visual_analysis,
      hypotheses: analysis.hypotheses,
      evidence: analysis.evidence,
      agent_analyses: {
        architectural: analysis.architectural_analysis,
        cultural: analysis.cultural_analysis,
        verification: analysis.verification_analysis,
      },
      ranked_interpretations: rankedInterpretations,
      nearby_heritage_sites: analysis.nearby_heritage_sites,
      is_heritage: true,
      is_valid: true,
    };

    res.json(result);
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({
      is_valid: false,
      is_heritage: false,
      error: "Analysis failed. Please try again.",
    } as AnalysisResult);
  }
};

interface ImageValidation {
  valid: boolean;
  error?: string;
}

function validateImage(imageData: string): ImageValidation {
  if (!imageData.startsWith("data:image/")) {
    return { valid: false, error: "Invalid image format" };
  }

  const byteSize = (imageData.length * 3) / 4;
  if (byteSize > 5 * 1024 * 1024) {
    return { valid: false, error: "Image file too large" };
  }

  return { valid: true };
}

interface GeminiAnalysisResult {
  is_heritage: boolean;
  reason?: string;
  visual_analysis?: string;
  hypotheses?: string[];
  evidence?: string;
  architectural_analysis?: string;
  cultural_analysis?: string;
  verification_analysis?: string;
  ranked_interpretations?: Array<{
    rank: number;
    hypothesis: string;
    confidence: number;
    summary: string;
    narrative: string;
  }>;
  nearby_heritage_sites?: Array<{
    name: string;
    location: string;
    distance_km?: number;
    description: string;
    why_visit: string;
    period: string;
  }>;
}

async function analyzeWithGemini(
  base64Image: string,
  userContext: string,
  mode: "detect" | "analyze",
): Promise<GeminiAnalysisResult> {
  const detectPrompt = `You are an expert in Indian heritage, monuments, temples, sculptures, and artifacts. Analyze this image carefully.

CRITICAL TASK: Determine if this image contains Indian heritage (temples, monuments, sculptures, artifacts, historical buildings, inscriptions, carvings, architectural elements).

ACCEPT IF:
- Image shows Indian temples, monuments, sculptures, or artifacts (even if people are visible)
- Image shows historical buildings, forts, palaces
- Image shows carved reliefs, inscriptions, or architectural details
- People may be present at heritage sites - this is acceptable if heritage is the main subject

REJECT ONLY IF:
- Image is primarily of modern buildings/houses without heritage value
- Image is anime/cartoon/artwork/digital art
- Image is animals or nature landscapes (without any heritage structures)
- Image is too unclear or damaged to identify heritage elements
- Image is primarily of people/portraits without heritage context

USER CONTEXT: ${userContext || "No additional context provided"}

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "is_heritage": boolean,
  "reason": "Brief explanation if not heritage or what was detected if heritage"
}`;

  const analyzePrompt = `You are an expert in Indian heritage architecture, history, and cultural analysis. Analyze this image of an Indian heritage site/monument in extreme detail. Focus on the heritage elements visible (even if people are present in the image).

USER CONTEXT: ${userContext || "No additional context provided"}

Provide a COMPLETE analysis using this JSON structure (respond ONLY with valid JSON, no markdown):

{
  "visual_analysis": "Detailed visual cue extraction including architectural style (Dravidian/Nagara/Indo-Islamic/Hoysala/Mughal/etc), materials (granite/sandstone/marble/soapstone), structures (gopurams/pillars/domes/arches/mandapas), iconography, carvings, inscriptions visible, estimated period, and likely dynasties. Focus on heritage elements even if people are visible in the image",
  "hypotheses": ["hypothesis 1", "hypothesis 2", "hypothesis 3", "hypothesis 4", "hypothesis 5"],
  "evidence": "Web-style evidence synthesis about this type of monument, including historical background, architectural comparisons, cultural themes, dynastic information, and related monuments. Make specific references to known sites and their characteristics",
  "architectural_analysis": "Detailed architectural historian analysis covering structural style, building material, dynasty/period traits, and comparisons to known monuments",
  "cultural_analysis": "Cultural context analysis covering mythology, symbolism, religious context, ritual function, and cultural meaning. Include specific deity names and mythological narratives if visible",
  "verification_analysis": "Data verification summary - which hypotheses are most likely, factual consistency checking, confidence assessment",
  "ranked_interpretations": [
    {
      "rank": 1,
      "hypothesis": "Most likely identification",
      "confidence": 90,
      "summary": "Why this is the best match",
      "narrative": "If this belongs to [dynasty], then it likely represents... [detailed historical narrative about what this monument would have been used for, who built it, what cultural significance it held]"
    },
    {
      "rank": 2,
      "hypothesis": "Second most likely",
      "confidence": 75,
      "summary": "Why this could match",
      "narrative": "Alternative historical narrative..."
    },
    {
      "rank": 3,
      "hypothesis": "Third possibility",
      "confidence": 60,
      "summary": "Supporting evidence",
      "narrative": "Historical context for this option..."
    },
    {
      "rank": 4,
      "hypothesis": "Fourth possibility",
      "confidence": 50,
      "summary": "Less likely match",
      "narrative": "Why this is less probable..."
    },
    {
      "rank": 5,
      "hypothesis": "Fifth possibility",
      "confidence": 40,
      "summary": "Least likely match",
      "narrative": "Why this is the least probable option..."
    }
  ],
  "nearby_heritage_sites": [
    {
      "name": "Site name 1",
      "location": "City/Region",
      "distance_km": 50,
      "description": "Brief description of the site and its architectural/cultural significance",
      "why_visit": "Reason to visit alongside the identified monument - what makes it complementary",
      "period": "Historical period (e.g., Chola, Vijayanagara, 12th Century)"
    },
    {
      "name": "Site name 2",
      "location": "City/Region",
      "distance_km": 75,
      "description": "Brief description of the site",
      "why_visit": "Why visit this site - its relation to the main heritage element",
      "period": "Historical period"
    }
  ]
}

IMPORTANT:
- Provide REAL historical information about Indian monuments and dynasties
- If you recognize specific architectural features, identify the likely monument/site
- Include actual historical periods, dynasty names, and architectural schools
- Generate realistic confidence scores (40-95% range)
- Make narratives historically plausible and detailed
- Reference actual architectural treatises, carving traditions, and historical records where applicable
- For nearby_heritage_sites: Recommend 2-5 real heritage sites within 100-150 km of the identified monument
- Include sites of similar period or complementary architectural styles
- Provide realistic distance estimates
- Explain why each site is worth visiting alongside the main heritage element`;

  const prompt = mode === "detect" ? detectPrompt : analyzePrompt;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64Image,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: mode === "detect" ? 200 : 4000,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Gemini API error:", error);
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Extract JSON from response (handle cases where it's wrapped in markdown)
    let jsonText = responseText;
    if (responseText.includes("```json")) {
      jsonText = responseText.split("```json")[1].split("```")[0].trim();
    } else if (responseText.includes("```")) {
      jsonText = responseText.split("```")[1].split("```")[0].trim();
    }

    const result = JSON.parse(jsonText);
    return result;
  } catch (error) {
    console.error("Gemini analysis error:", error);
    throw error;
  }
}
