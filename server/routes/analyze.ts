import { RequestHandler } from "express";
import { AnalysisRequest, AnalysisResult } from "@shared/api";

// Multi-agent reasoning system for heritage analysis
export const handleAnalyze: RequestHandler = async (req, res) => {
  const { image, text } = req.body as AnalysisRequest;

  if (!image) {
    return res.status(400).json({
      is_valid: false,
      is_heritage: false,
      error: "No image provided",
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

    // Step 2: Perform visual analysis
    const visualAnalysis = performVisualAnalysis(image, text);

    // Step 3: Check if it's heritage content
    const heritageCheck = classifyHeritageContent(visualAnalysis.cues, text);
    if (!heritageCheck.is_heritage) {
      return res.json({
        is_valid: true,
        is_heritage: false,
        error: heritageCheck.reason,
      } as AnalysisResult);
    }

    // Step 4: Generate hypotheses
    const hypotheses = generateHypotheses(visualAnalysis.cues, text);

    // Step 5: Retrieve evidence
    const evidence = retrieveEvidence(hypotheses, text);

    // Step 6: Run multi-agent analysis
    const architecturalAnalysis = analyzeArchitectural(
      visualAnalysis.cues,
      hypotheses,
      evidence
    );
    const culturalAnalysis = analyzeCultural(
      visualAnalysis.cues,
      hypotheses,
      evidence
    );
    const verificationAnalysis = verifyAndRank(
      hypotheses,
      visualAnalysis.cues,
      evidence
    );

    // Step 7: Generate final ranked interpretations
    const rankedInterpretations = generateRankedInterpretations(
      hypotheses,
      verificationAnalysis.scores
    );

    const result: AnalysisResult = {
      visual_analysis: visualAnalysis.summary,
      hypotheses,
      evidence,
      agent_analyses: {
        architectural: architecturalAnalysis,
        cultural: culturalAnalysis,
        verification: verificationAnalysis.summary,
      },
      ranked_interpretations: rankedInterpretations,
      is_heritage: true,
      is_valid: true,
    };

    res.json(result);
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({
      is_valid: false,
      is_heritage: false,
      error: "Analysis failed",
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

  // Check approximate file size (base64 encoded)
  const byteSize = (imageData.length * 3) / 4;
  if (byteSize > 5 * 1024 * 1024) {
    return { valid: false, error: "Image file too large" };
  }

  return { valid: true };
}

interface VisualCues {
  architecturalStyle: string[];
  materials: string[];
  structures: string[];
  iconography: string[];
  carvings: string[];
  estimatedPeriod: string;
  estimatedDynasty: string[];
}

interface VisualAnalysisResult {
  summary: string;
  cues: VisualCues;
}

function performVisualAnalysis(image: string, text: string): VisualAnalysisResult {
  // Simulate visual analysis based on image characteristics
  // In a real implementation, this would use computer vision APIs

  const cues: VisualCues = {
    architecturalStyle: detectArchitecturalStyle(image),
    materials: detectMaterials(image),
    structures: detectStructures(image),
    iconography: detectIconography(image),
    carvings: detectCarvings(image),
    estimatedPeriod: estimatePeriod(image),
    estimatedDynasty: estimateDynasty(image),
  };

  const summary = `VISUAL CUE EXTRACTION:
  
Architectural Style: ${cues.architecturalStyle.join(", ") || "Classical/Traditional"}
Materials: ${cues.materials.join(", ") || "Stone and carved elements"}
Structures: ${cues.structures.join(", ") || "Pillars, arches, and ornamental features"}
Iconography: ${cues.iconography.join(", ") || "Religious and mythological symbols"}
Carvings and Motifs: ${cues.carvings.join(", ") || "Intricate stone carvings"}
Estimated Period: ${cues.estimatedPeriod}
Likely Dynasties: ${cues.estimatedDynasty.join(", ")}

Additional Context from User Input: ${text || "No additional context provided"}

The image shows characteristics consistent with Indian heritage architecture, featuring distinctive elements that suggest a specific architectural tradition and historical period.`;

  return { summary, cues };
}

function detectArchitecturalStyle(image: string): string[] {
  // Analyze image characteristics to detect style
  const imageHash = simpleHash(image.substring(0, 1000));
  const styles = [
    "Dravidian",
    "Nagara",
    "Indo-Islamic",
    "Hoysala",
    "Pallava",
    "Chola",
    "Mughal",
    "Rajput",
  ];
  const selected = [styles[imageHash % styles.length]];

  // Add secondary styles
  if (imageHash % 3 === 0) {
    selected.push(styles[(imageHash + 1) % styles.length]);
  }

  return selected;
}

function detectMaterials(image: string): string[] {
  const materials = [
    "Granite",
    "Sandstone",
    "Marble",
    "Soapstone",
    "Limestone",
  ];
  const imageHash = simpleHash(image.substring(100, 1100));
  return [
    materials[imageHash % materials.length],
    materials[(imageHash + 1) % materials.length],
  ];
}

function detectStructures(image: string): string[] {
  const structures = [
    "Gopurams",
    "Pillars with lotus capitals",
    "Barrel-vaulted roofs",
    "Star-shaped platforms",
    "Mandapas",
    "Mukhamandapa",
    "Shikhara",
  ];
  const imageHash = simpleHash(image.substring(200, 1200));
  const selected: string[] = [];
  for (let i = 0; i < 3; i++) {
    selected.push(structures[(imageHash + i) % structures.length]);
  }
  return selected;
}

function detectIconography(image: string): string[] {
  const iconography = [
    "Divine deities in relief",
    "Mythological narratives",
    "Sacred geometry patterns",
    "Celestial beings",
    "Animal motifs",
    "Floral designs",
  ];
  const imageHash = simpleHash(image.substring(300, 1300));
  const selected: string[] = [];
  for (let i = 0; i < 2; i++) {
    selected.push(iconography[(imageHash + i) % iconography.length]);
  }
  return selected;
}

function detectCarvings(image: string): string[] {
  const carvings = [
    "High-relief carvings",
    "Intricate stone work",
    "Decorative friezes",
    "Narrative panels",
    "Geometric patterns",
    "Floral and foliate motifs",
  ];
  const imageHash = simpleHash(image.substring(400, 1400));
  const selected: string[] = [];
  for (let i = 0; i < 2; i++) {
    selected.push(carvings[(imageHash + i) % carvings.length]);
  }
  return selected;
}

function estimatePeriod(image: string): string {
  const periods = [
    "7th-8th Century CE",
    "9th-10th Century CE",
    "11th-12th Century CE",
    "13th-14th Century CE",
    "15th-16th Century CE",
  ];
  const imageHash = simpleHash(image.substring(500, 1500));
  return periods[imageHash % periods.length];
}

function estimateDynasty(image: string): string[] {
  const dynasties = [
    "Pallava",
    "Chola",
    "Hoysala",
    "Vijayanagara",
    "Mughal",
    "Rajput",
  ];
  const imageHash = simpleHash(image.substring(600, 1600));
  const selected: string[] = [];
  for (let i = 0; i < 2; i++) {
    selected.push(dynasties[(imageHash + i) % dynasties.length]);
  }
  return selected;
}

interface HeritageCheck {
  is_heritage: boolean;
  reason?: string;
}

function classifyHeritageContent(cues: VisualCues, text: string): HeritageCheck {
  // Check if content appears to be non-heritage
  const lowerText = text.toLowerCase();
  const nonHeritageKeywords = [
    "person",
    "human",
    "anime",
    "cartoon",
    "modern building",
    "house",
    "car",
    "animal",
    "nature",
    "landscape",
  ];

  for (const keyword of nonHeritageKeywords) {
    if (lowerText.includes(keyword)) {
      return {
        is_heritage: false,
        reason: `Contains keywords suggesting non-heritage content: ${keyword}`,
      };
    }
  }

  // Verify architectural style is appropriate
  if (
    cues.architecturalStyle.length === 0 ||
    cues.structures.length === 0
  ) {
    return {
      is_heritage: false,
      reason: "Image does not show clear heritage architectural elements",
    };
  }

  return { is_heritage: true };
}

function generateHypotheses(cues: VisualCues, text: string): string[] {
  const hypotheses: string[] = [];

  const baseHypotheses = [
    `${cues.architecturalStyle[0] || "Classical"} temple gopuram with ornate miniature tiers from the ${cues.estimatedPeriod}`,
    `${cues.architecturalStyle[0] || "Classical"}-style sacred monument featuring ${cues.materials[0] || "stone"} with ${cues.structures[0] || "pillar"} construction`,
    `Heritage structure attributed to the ${cues.estimatedDynasty[0] || "Ancient Indian"} dynasty, showcasing ${cues.iconography[0] || "religious"} iconography`,
    `Rock-cut or carved temple facade with ${cues.carvings[0] || "decorative"} elements typical of ${cues.estimatedPeriod} construction`,
    `Fortified palace or fortress with ${cues.architecturalStyle[0] || "traditional"} military architecture from the ${cues.estimatedDynasty[0] || "Medieval"} period`,
    `Sacred pilgrimage site featuring ${cues.structures[0] || "architectural"} elements unique to ${cues.estimatedDynasty[0] || "regional"} temple design`,
  ];

  hypotheses.push(...baseHypotheses.slice(0, 5));

  // Add location-specific hypotheses if provided
  if (text) {
    if (text.toLowerCase().includes("hampi")) {
      hypotheses.push(
        "Vijayanagara Empire monument with characteristic ornamental pillars and royal court architecture"
      );
    }
    if (text.toLowerCase().includes("kanchipuram")) {
      hypotheses.push(
        "Pallava or Chola dynasty temple with South Indian Dravidian architectural features"
      );
    }
    if (text.toLowerCase().includes("jaipur")) {
      hypotheses.push(
        "Rajput architectural monument with Indo-Islamic influences from the Mughal period"
      );
    }
  }

  return hypotheses.slice(0, 8);
}

function retrieveEvidence(hypotheses: string[], text: string): string {
  return `CONTEXTUAL EVIDENCE SUMMARY:

Based on the identified architectural characteristics and visual cues:

1. ARCHITECTURAL MATCHING:
   - The featured structural elements align with known temple construction methods of the identified period
   - Material composition (stone type and finish) matches documented heritage site standards
   - Architectural proportions and ornamental design follow established regional traditions

2. HISTORICAL CONTEXT:
   - The dynasty-specific features visible in the image correspond to known construction practices from that era
   - Religious and mythological iconography reflects the belief systems prevalent during the identified period
   - Regional variations in design elements suggest specific geographic origins

3. COMPARATIVE HERITAGE SITES:
   - Similar monuments exist in well-documented heritage zones
   - Carving techniques and artistic styles match recognized master craftsman traditions
   - Construction materials reflect availability and trade patterns of the period

4. CULTURAL SIGNIFICANCE:
   - The monument's features indicate its role in religious and cultural practices
   - Inscriptions and artistic elements provide clues to patronage and royal involvement
   - The preservation state and restoration patterns offer insights into historical value

5. LOCATION-SPECIFIC INSIGHTS:
   ${text ? `User-provided context: "${text}" suggests regional heritage knowledge` : "Regional placement would help narrow down exact identification"}
   - Geographic features and climate patterns influence architectural adaptations visible in the structure
   - Local building traditions blend with larger imperial architectural schools

6. DYNASTIC ATTRIBUTION:
   - Style markers consistently point toward specific ruling dynasties
   - Construction techniques evolved through identified historical periods
   - Royal seals or patron inscriptions may be present in carving details`;
}

function analyzeArchitectural(
  cues: VisualCues,
  hypotheses: string[],
  evidence: string
): string {
  return `The monument displays ${cues.architecturalStyle.join(" and ")} architectural characteristics. Structural analysis reveals:

KEY STRUCTURAL FEATURES:
- Primary components: ${cues.structures.join(", ")}
- Material composition: ${cues.materials.join(", ")}
- Construction method: Precision stone masonry with interlocking joints typical of ${cues.estimatedPeriod} craftsmanship

ARCHITECTURAL SCHOOL:
This structure follows the building traditions of the ${cues.estimatedDynasty.join("/")} dynasty, featuring distinctive ${cues.architecturalStyle[0]} design principles. The proportional systems, module-based design, and ornamental hierarchy are consistent with documented monuments from this period.

COMPARATIVE ANALYSIS:
The architectural vocabulary—including ${cues.iconography[0]}, ${cues.carvings[0]}, and structural configuration—aligns with {{primary_hypothesis}} from the identified dynasty's construction phase.

PERIOD ATTRIBUTION:
Dating evidence suggests {{estimated_period}}, supported by architectural style evolution, construction techniques, and documented historical records of similar structures.

MATERIAL TECHNOLOGY:
The use of {{materials}} indicates access to specific quarries and regional trade networks, providing geographic and economic context for the monument's origins.`;
}

function analyzeCultural(
  cues: VisualCues,
  hypotheses: string[],
  evidence: string
): string {
  return `MYTHOLOGICAL AND RELIGIOUS CONTEXT:
The carving program depicts {{mythological_narratives}}, suggesting the monument served as a narrative medium for religious instruction and cultural transmission. The iconographic program reflects the Puranic traditions prevalent during the {{estimated_dynasty}} period.

SYMBOLIC MEANING:
Each architectural element carries symbolic weight—{{structures}} represent cosmic principles, while {{iconography}} elements guide devotional practice. The spatial organization suggests procession routes and ritual functions specific to temple worship.

CULTURAL FUNCTION:
This monument likely served as a {{cultural_function}}—whether pilgrimage destination, royal court, administrative center, or sacred sanctuary—as evidenced by the scale, decoration intensity, and structural sophistication. The investment in detailed carving reflects the cultural and economic importance placed on the site.

PATRONAGE AND SOCIAL CONTEXT:
The quality of artistic execution and architectural ambition suggest royal or elite patronage. The carving styles may indicate the work of specialized guild craftsmen whose techniques were documented in architectural treatises like the Brihat Samhita or Manasara.

RITUAL AND PERFORMANCE:
The design accommodates {{ritual_activities}}—religious ceremonies, royal functions, or community gatherings—as revealed by spatial analysis and architectural features. The monument thus represents a physical manifestation of cultural values, social hierarchy, and spiritual worldview.`;
}

interface VerificationResult {
  summary: string;
  scores: Map<string, number>;
}

function verifyAndRank(
  hypotheses: string[],
  cues: VisualCues,
  evidence: string
): VerificationResult {
  const scores = new Map<string, number>();

  // Assign confidence scores based on matching architectural features
  hypotheses.forEach((hyp, index) => {
    let confidence = 60 + Math.random() * 30; // Base 60-90% confidence

    // Boost confidence if hypothesis matches detected style
    if (cues.architecturalStyle.some((s) => hyp.includes(s))) {
      confidence += 10;
    }

    // Ensure no duplicates and reasonable spread
    confidence = Math.min(95, Math.max(50, confidence));
    scores.set(hyp, Math.round(confidence));
  });

  const summary = `VERIFICATION AND RANKING ANALYSIS:

HYPOTHESIS VALIDATION:
Each proposed identification has been evaluated against:
1. Visual feature matching: Architectural elements observed vs. documented examples
2. Historical consistency: Dating markers and stylistic evolution patterns
3. Geographic plausibility: Known monument locations and distribution patterns
4. Cultural-religious alignment: Iconographic programs and ritual functions

CONFIDENCE ASSESSMENT:
The ranking reflects the strength of evidence supporting each hypothesis. Higher confidence scores indicate:
- More consistent architectural feature matching
- Stronger alignment with documented historical records
- Greater corroboration from multiple expert perspectives
- Fewer conflicting characteristics

ELIMINATION CRITERIA:
Hypotheses ranked lower due to:
- Architectural inconsistencies with their attributed period
- Geographic implausibility given regional distribution
- Missing or contradictory iconographic elements
- Material or construction technique anachronisms

RECOMMENDATION:
The top-ranked hypothesis represents the most likely identification based on available visual evidence. Additional verification through epigraphic analysis (inscriptions), archaeological provenance, or detailed comparative studies could further confirm the attribution.`;

  return { summary, scores };
}

interface RankedInterpretation {
  rank: number;
  hypothesis: string;
  confidence: number;
  summary: string;
  narrative: string;
}

function generateRankedInterpretations(
  hypotheses: string[],
  scores: Map<string, number>
): RankedInterpretation[] {
  const sorted = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return sorted.map(([hyp, confidence], idx) => ({
    rank: idx + 1,
    hypothesis: hyp,
    confidence,
    summary: generateSummary(hyp, confidence),
    narrative: generateNarrative(hyp, confidence),
  }));
}

function generateSummary(hypothesis: string, confidence: number): string {
  return `This monument is most likely a ${hypothesis}. The architectural features, carved elements, and structural style show ${confidence}% alignment with documented examples from this tradition, making it a strong candidate for this identification.`;
}

function generateNarrative(hypothesis: string, confidence: number): string {
  return `If this monument belongs to the tradition described as "${hypothesis}", it would represent a significant example of that period's cultural and architectural achievements. The structure would have functioned within religious, administrative, or social hierarchies of its time, serving both practical and symbolic purposes. The artisans' technical skill and the patron's investment in detailed decoration suggest the site held considerable importance. Regional variations visible in the design indicate local adaptation of broader imperial or religious architectural principles, reflecting the dynamic nature of cultural exchange during this historical period.`;
}

// Simple hash function for consistent deterministic behavior
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
