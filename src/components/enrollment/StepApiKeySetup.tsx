/**
 * StepApiKeySetup.tsx
 * Step 4: Optional Gemini API Key configuration or Cherry Cloud Engine selection
 */
import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  Key,
  Eye,
  EyeOff,
  ExternalLink,
  Zap,
  ArrowRight,
} from "lucide-react";
import {
  addStoredApiKey,
  validateGeminiApiKey,
  getActiveApiKey,
} from "../../utils/geminiKeyStorage";

interface StepApiKeySetupProps {
  onSuccess: () => void;
  onUseCloudEngine: () => void;
  onToast?: (message: string, type?: "info" | "success" | "warning" | "error") => void;
}

export const StepApiKeySetup: React.FC<StepApiKeySetupProps> = ({
  onSuccess,
  onUseCloudEngine,
  onToast,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState(() => getActiveApiKey());
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [apiKeyMessage, setApiKeyMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const handleTestAndSaveApiKey = async () => {
    const cleanKey = apiKeyInput.trim();
    if (!cleanKey) {
      setApiKeyMessage({
        text: "Please enter your Gemini API Key or choose Cloud Engine below.",
        type: "error",
      });
      return;
    }

    setIsValidatingKey(true);
    setApiKeyMessage({ text: "Connecting and verifying Gemini API key...", type: "info" });

    try {
      const res = await validateGeminiApiKey(cleanKey);
      if (res.valid) {
        addStoredApiKey(cleanKey, "Personal Key");
        setApiKeyMessage({ text: "✓ API Key verified and saved successfully! 🚀", type: "success" });
        onToast?.("Gemini API Key connected successfully!", "success");
        setTimeout(() => {
          onSuccess();
        }, 600);
      } else {
        setApiKeyMessage({
          text: `Verification failed: ${res.message || "Invalid API Key"}. Check Google AI Studio.`,
          type: "error",
        });
      }
    } catch (err: any) {
      setApiKeyMessage({
        text: `Validation error: ${err.message || "Could not reach server"}. You can also use Cloud Engine.`,
        type: "error",
      });
    } finally {
      setIsValidatingKey(false);
    }
  };

  return (
    <motion.div
      key="step-api-key-setup"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-4 text-left"
    >
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs space-y-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-[#796AEF] text-[10.5px] font-mono font-bold uppercase">
          <Sparkles className="w-3 h-3 text-[#796AEF]" />
          <span>Step 4 of 5 • AI Brain Connection</span>
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-black text-slate-900 leading-tight">
            Connect Gemini Voice & Vision Brain
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Provide your personal Google Gemini API key or use Cherry AI's managed Cloud Engine for
            zero setup.
          </p>
        </div>

        {/* API Key Input */}
        <div className="space-y-2">
          <div className="relative">
            <input
              type={showApiKey ? "text" : "password"}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full pl-3 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:border-[#796AEF]"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {apiKeyMessage && (
            <p
              className={`text-[11px] font-medium leading-none ${
                apiKeyMessage.type === "success"
                  ? "text-emerald-600"
                  : apiKeyMessage.type === "error"
                  ? "text-rose-500"
                  : "text-slate-500"
              }`}
            >
              {apiKeyMessage.text}
            </p>
          )}

          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-mono text-[#796AEF] hover:underline flex items-center gap-1 pt-0.5"
          >
            <span>Get a free Gemini API key from Google AI Studio</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Verify & Save Key Button */}
        <button
          type="button"
          onClick={handleTestAndSaveApiKey}
          disabled={isValidatingKey || !apiKeyInput.trim()}
          className="w-full py-3 px-4 rounded-xl bg-[#796AEF] hover:bg-[#6858e0] text-white font-bold font-sans text-xs tracking-wide uppercase transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span>{isValidatingKey ? "Testing Key..." : "Save & Verify API Key"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-2 text-[10px] font-mono font-bold text-slate-400 uppercase">
            OR
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Use Cloud Engine Default */}
        <button
          type="button"
          onClick={onUseCloudEngine}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold font-sans text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Use Cherry AI Managed Cloud Engine (Recommended)</span>
        </button>
      </div>
    </motion.div>
  );
};
