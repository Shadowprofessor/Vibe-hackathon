import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Sparkles, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Index() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setUploadedImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!uploadedImage) {
      toast.error("Please upload an image");
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: uploadedImage,
          text: textInput,
        }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const analysisResult = await response.json();
      navigate("/results", { state: { analysis: analysisResult } });
    } catch (error) {
      toast.error("Failed to analyze image. Please try again.");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-600 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Heritage Explorer</h1>
              <p className="text-slate-400 text-sm">AI-powered Indian monument analysis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left Column - Upload Area */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Explore Indian Heritage
              </h2>
              <p className="text-slate-300">
                Upload an image of a monument, temple, sculpture, or artifact. Our AI will analyze it using multi-agent reasoning to provide detailed historical and cultural insights.
              </p>
            </div>

            {/* Image Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative border-2 border-dashed border-slate-500 rounded-xl p-8 cursor-pointer hover:border-amber-400 transition-colors bg-slate-800/30"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {uploadedImage ? (
                <div className="space-y-4">
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedImage(null);
                    }}
                    className="w-full"
                  >
                    Change Image
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="p-3 bg-slate-700 rounded-lg">
                      <ImageIcon className="w-8 h-8 text-amber-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Drop image here or click to browse</p>
                    <p className="text-slate-400 text-sm">Supports JPG, PNG, WebP (Max 5MB)</p>
                  </div>
                </div>
              )}
            </div>

            {/* Text Input */}
            <div className="space-y-2">
              <label className="text-white font-semibold">Additional Context (Optional)</label>
              <Textarea
                placeholder="Add region hints, GPS coordinates, or details about the monument (e.g., 'Found near Hampi', 'Dravidian temple with ornate carvings')"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white placeholder-slate-500 resize-none"
                rows={4}
              />
            </div>
          </div>

          {/* Right Column - Info & CTA */}
          <div className="space-y-8">
            {/* Feature Cards */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">How It Works</h3>
              
              <div className="space-y-3">
                {[
                  {
                    icon: "🔍",
                    title: "Visual Analysis",
                    desc: "Extract architectural styles, materials, and iconography",
                  },
                  {
                    icon: "🧭",
                    title: "Generate Hypotheses",
                    desc: "Create 3-8 search hypotheses based on visual cues",
                  },
                  {
                    icon: "🌐",
                    title: "Evidence Retrieval",
                    desc: "Retrieve contextual information from heritage databases",
                  },
                  {
                    icon: "🤖",
                    title: "Multi-Agent Analysis",
                    desc: "3 expert agents analyze from different perspectives",
                  },
                  {
                    icon: "📊",
                    title: "Ranked Results",
                    desc: "Get confidence scores and interpretive narratives",
                  },
                ].map((feature, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
                  >
                    <div className="flex gap-3">
                      <span className="text-2xl">{feature.icon}</span>
                      <div>
                        <p className="font-semibold text-white">{feature.title}</p>
                        <p className="text-sm text-slate-400">{feature.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <Button
              onClick={handleAnalyze}
              disabled={!uploadedImage || isAnalyzing}
              size="lg"
              className="w-full bg-gradient-to-r from-amber-400 to-orange-600 hover:from-amber-500 hover:to-orange-700 text-white font-semibold h-12 rounded-lg"
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⚙️</span>
                  Analyzing Heritage...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Analyze with AI
                </span>
              )}
            </Button>

            {/* Info Box */}
            <div className="p-4 bg-blue-900/30 border border-blue-700/50 rounded-lg">
              <p className="text-sm text-blue-200">
                <strong>Smart Detection:</strong> Our system automatically identifies heritage structures and provides detailed analysis. It filters out non-heritage content for accurate results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
