import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Loader2 } from 'lucide-react';

interface GeminiPolisherProps {
  content: string;
  onPolished: (newContent: string) => void;
}

export const GeminiPolisher: React.FC<GeminiPolisherProps> = ({ content, onPolished }) => {
  const [isPolishing, setIsPolishing] = useState(false);

  const handlePolish = async () => {
    if (!process.env.API_KEY) {
      alert("Google API Key is not configured in the environment.");
      return;
    }

    setIsPolishing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Please refine, fix grammar, and improve the flow of the following text while keeping the original meaning. Output only the polished text:\n\n${content}`,
      });
      
      if (response.text) {
        onPolished(response.text);
      }
    } catch (error) {
      console.error("Gemini Polish Error", error);
      alert("Failed to polish content.");
    } finally {
      setIsPolishing(false);
    }
  };

  return (
    <div className="mt-4 flex justify-end">
      <button
        onClick={handlePolish}
        disabled={isPolishing || !content}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
      >
        {isPolishing ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
        {isPolishing ? 'Polishing...' : 'Refine with Gemini'}
      </button>
    </div>
  );
};
