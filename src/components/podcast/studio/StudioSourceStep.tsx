/**
 * StudioSourceStep.tsx
 * Step 1: Upload document or paste text notes with automatic format detection
 */
import React from "react";
import {
  Upload,
  FileText,
  FileUp,
  Loader2,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { SourceFileState, SourceType } from "./studioTypes";

interface StudioSourceStepProps {
  sourceType: SourceType;
  setSourceType: (type: SourceType) => void;
  sourceFile: SourceFileState | null;
  setSourceFile: (file: SourceFileState | null) => void;
  setTopicName: (topic: string) => void;
  pastedText: string;
  setPastedText: (text: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (file: File) => void;
  onPastedTextChange: (text: string) => void;
}

export const StudioSourceStep: React.FC<StudioSourceStepProps> = ({
  sourceType,
  setSourceType,
  sourceFile,
  setSourceFile,
  setTopicName,
  pastedText,
  setPastedText,
  fileInputRef,
  onFileSelect,
  onPastedTextChange,
}) => {
  return (
    <div id="studio-source-step" className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#796AEF]" />
          <span>1. Add Source (सोर्स जोड़ें):</span>
        </label>
        <span className="text-[10px] text-slate-500 font-medium">
          Upload PDF, paste notes, or select topic
        </span>
      </div>

      {/* Source Tab Selector */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-xl border border-slate-200/80">
        <button
          id="studio-tab-upload-btn"
          type="button"
          onClick={() => setSourceType("upload")}
          className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            sourceType === "upload"
              ? "bg-white text-[#796AEF] shadow-xs border border-slate-200/60"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload File</span>
        </button>

        <button
          id="studio-tab-paste-btn"
          type="button"
          onClick={() => setSourceType("paste")}
          className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            sourceType === "paste"
              ? "bg-white text-[#796AEF] shadow-xs border border-slate-200/60"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Paste Text</span>
        </button>
      </div>

      {/* TAB 1: UPLOAD FILE */}
      {sourceType === "upload" && (
        <div className="space-y-2">
          <input
            id="studio-file-input"
            type="file"
            ref={fileInputRef}
            accept=".pdf,.png,.jpg,.jpeg,.txt,.md"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onFileSelect(e.target.files[0]);
              }
            }}
          />

          {sourceFile ? (
            <div
              id="studio-source-file-card"
              className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-white border border-indigo-200 flex items-center justify-center text-[#796AEF] shrink-0 shadow-2xs">
                    {sourceFile.isExtracting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileUp className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {sourceFile.name}
                    </p>
                    <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{(sourceFile.size / 1024).toFixed(0)} KB</span>
                      <span>•</span>
                      {sourceFile.isExtracting ? (
                        <span className="text-indigo-600 font-semibold animate-pulse">
                          Extracting text & analyzing subject...
                        </span>
                      ) : (
                        <>
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Ready
                          </span>
                          {sourceFile.detectedSubject && (
                            <>
                              <span>•</span>
                              <span className="text-[#796AEF] font-bold">
                                {sourceFile.detectedSubject === "Physics" && "🔬 "}
                                {sourceFile.detectedSubject === "Chemistry" && "🧪 "}
                                {sourceFile.detectedSubject === "Mathematics" && "📐 "}
                                {sourceFile.detectedSubject === "Biology" && "🧬 "}
                                {sourceFile.detectedSubject === "Economics" && "📊 "}
                                {sourceFile.detectedSubject}
                              </span>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 text-[11px] font-bold text-[#796AEF] hover:bg-white rounded-lg transition border border-transparent hover:border-indigo-100 cursor-pointer"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSourceFile(null);
                      setTopicName("");
                    }}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition cursor-pointer"
                    title="Remove source"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              id="studio-dropzone"
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  onFileSelect(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200/90 hover:border-[#796AEF] bg-slate-50/80 hover:bg-indigo-50/30 rounded-xl p-5 text-center transition cursor-pointer group"
            >
              <div className="w-10 h-10 mx-auto rounded-xl bg-white border border-slate-200/80 group-hover:scale-105 transition-transform flex items-center justify-center text-[#796AEF] shadow-2xs">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800 mt-2">
                Drop Chapter PDF or Notes here (या फ़ाइल चुनें)
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Supports PDF, Document, Photo of textbook notes, TXT (up to 15MB)
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PASTE TEXT */}
      {sourceType === "paste" && (
        <div id="studio-paste-container" className="space-y-2">
          <textarea
            id="studio-paste-textarea"
            rows={4}
            value={pastedText}
            onChange={(e) => onPastedTextChange(e.target.value)}
            placeholder="Paste chapter notes, textbook paragraph, questions, or formulas here... (यहाँ अपने नोट्स या चैप्टर टेक्स्ट पेस्ट करें)"
            className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#796AEF] focus:ring-2 focus:ring-indigo-100 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition resize-none leading-relaxed"
          />
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span>
              {pastedText.trim()
                ? `${pastedText.trim().split(/\s+/).length} words entered`
                : "Minimum 20 words recommended"}
            </span>
            {pastedText && (
              <button
                type="button"
                onClick={() => {
                  setPastedText("");
                  setTopicName("");
                }}
                className="text-slate-500 hover:text-rose-500 cursor-pointer"
              >
                Clear text
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
