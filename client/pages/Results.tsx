import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Download } from "lucide-react";
import { toast } from "sonner";

interface AnalysisResult {
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
  }>;
  nearby_heritage_sites?: Array<{
    name: string;
    location: string;
    distance_km?: number;
    description: string;
    why_visit: string;
    period: string;
  }>;
  is_heritage: boolean;
  is_valid: boolean;
  error?: string;
}

export default function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const analysis = location.state?.analysis as AnalysisResult;

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-white text-lg">No analysis data found</p>
          <Button
            onClick={() => navigate("/")}
            className="bg-amber-500 hover:bg-amber-600"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleDownload = () => {
    const analysisText = formatAnalysisForDownload(analysis);
    const element = document.createElement("a");
    const file = new Blob([analysisText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "heritage-analysis.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Analysis downloaded");
  };

  // If image validation failed
  if (!analysis.is_valid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-slate-300 hover:text-white mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-8 max-w-2xl mx-auto text-center">
            <p className="text-2xl font-bold text-red-200 mb-2">
              Invalid Image
            </p>
            <p className="text-red-300 mb-4">
              {analysis.error ||
                "The uploaded file could not be processed as a valid image."}
            </p>
            <Button
              onClick={() => navigate("/")}
              className="bg-red-600 hover:bg-red-700"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If not heritage content
  if (!analysis.is_heritage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-slate-300 hover:text-white mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-8 max-w-2xl mx-auto text-center">
            <p className="text-2xl font-bold text-yellow-200 mb-2">
              Not Heritage Content
            </p>
            <p className="text-yellow-300 mb-4">
              This image does not appear to contain Indian monuments, temples,
              sculptures, or heritage structures. Please upload an image of an
              actual heritage site or artifact for analysis.
            </p>
            <p className="text-sm text-yellow-200 mb-4">
              The system detected: {analysis.error || "Non-heritage content"}
            </p>
            <Button
              onClick={() => navigate("/")}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Upload Different Image
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="border-slate-600 text-slate-300 hover:text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {/* Analysis Content */}
        <div className="space-y-8">
          {/* Visual Analysis Section */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              🔍 Visual Analysis Summary
            </h2>
            <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
              {analysis.visual_analysis}
            </div>
          </section>

          {/* Hypotheses Section */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              🧭 Initial Hypotheses
            </h2>
            <ul className="space-y-2">
              {analysis.hypotheses.map((hyp, idx) => (
                <li key={idx} className="flex gap-3 text-slate-300">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{hyp}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Evidence Section */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              🌐 Evidence Retrieved
            </h2>
            <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
              {analysis.evidence}
            </div>
          </section>

          {/* Agent Analyses */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Architectural Historian */}
            <section className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                🟦 Architectural Historian
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {analysis.agent_analyses.architectural}
              </p>
            </section>

            {/* Cultural Analyst */}
            <section className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                🟩 Cultural Context Analyst
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {analysis.agent_analyses.cultural}
              </p>
            </section>

            {/* Data Verifier */}
            <section className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                🟧 Data Verifier
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {analysis.agent_analyses.verification}
              </p>
            </section>
          </div>

          {/* Final Ranked Interpretation */}
          <section className="bg-gradient-to-br from-amber-900/30 to-orange-900/20 border border-amber-700/50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              🟫 Judge Model — Final Ranked Interpretation
            </h2>
            <div className="space-y-6">
              {analysis.ranked_interpretations.map((interp) => (
                <div
                  key={interp.rank}
                  className="border-l-4 border-amber-500 pl-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-lg font-bold text-amber-200">
                      {interp.rank}. {interp.hypothesis}
                    </h4>
                    <span className="text-amber-400 font-bold text-lg">
                      {interp.confidence}%
                    </span>
                  </div>
                  <p className="text-slate-300 mb-3">
                    <span className="font-semibold text-white">Summary:</span>{" "}
                    {interp.summary}
                  </p>
                  <p className="text-slate-300 text-sm italic">
                    <span className="font-semibold text-white">Narrative:</span>{" "}
                    {interp.narrative}
                  </p>
                  <button
                    onClick={() => handleCopy(interp.narrative)}
                    className="mt-2 text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copy narrative
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Nearby Heritage Sites */}
          {analysis.nearby_heritage_sites &&
            analysis.nearby_heritage_sites.length > 0 && (
              <section className="bg-gradient-to-br from-green-900/30 to-teal-900/20 border border-green-700/50 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  🗺️ Nearby Heritage Sites to Explore
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {analysis.nearby_heritage_sites.map((site, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-green-600 transition-colors"
                    >
                      <div className="mb-3">
                        <h3 className="text-lg font-bold text-green-200">
                          {site.name}
                        </h3>
                        <p className="text-sm text-slate-400">
                          📍 {site.location}
                          {site.distance_km && ` • ${site.distance_km} km away`}
                        </p>
                        <p className="text-xs text-amber-400 mt-1">
                          Period: {site.period}
                        </p>
                      </div>
                      <p className="text-sm text-slate-300 mb-3">
                        {site.description}
                      </p>
                      <p className="text-sm text-slate-300 italic border-l-2 border-green-500 pl-3">
                        {site.why_visit}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* Refinement Prompt */}
          <section className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-6 text-center">
            <p className="text-blue-200 mb-4">Want to refine these results?</p>
            <Button
              onClick={() => navigate("/")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Upload Another Image or Provide More Details
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}

function formatAnalysisForDownload(analysis: AnalysisResult): string {
  return `
HERITAGE ANALYSIS REPORT
========================

🔍 VISUAL ANALYSIS SUMMARY
${analysis.visual_analysis}

🧭 INITIAL HYPOTHESES
${analysis.hypotheses.map((h, i) => `${i + 1}. ${h}`).join("\n")}

🌐 EVIDENCE RETRIEVED
${analysis.evidence}

🟦 AGENT 1 — ARCHITECTURAL HISTORIAN
${analysis.agent_analyses.architectural}

🟩 AGENT 2 — CULTURAL CONTEXT ANALYST
${analysis.agent_analyses.cultural}

🟧 AGENT 3 — DATA VERIFIER
${analysis.agent_analyses.verification}

🟫 JUDGE MODEL — FINAL RANKED INTERPRETATION
${analysis.ranked_interpretations
  .map(
    (interp) => `
${interp.rank}. ${interp.hypothesis} — ${interp.confidence}%
Summary: ${interp.summary}
Narrative: ${interp.narrative}
`,
  )
  .join("\n")}

🗺️ NEARBY HERITAGE SITES TO EXPLORE
${
  analysis.nearby_heritage_sites && analysis.nearby_heritage_sites.length > 0
    ? analysis.nearby_heritage_sites
        .map(
          (site, idx) => `
${idx + 1}. ${site.name}
   Location: ${site.location}${site.distance_km ? ` (${site.distance_km} km away)` : ""}
   Period: ${site.period}
   Description: ${site.description}
   Why Visit: ${site.why_visit}
`,
        )
        .join("\n")
    : "No nearby heritage sites recommendations available"
}
  `.trim();
}
