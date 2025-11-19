
import React, { useState, useEffect, useRef } from 'react';
import { 
  Fish, ChevronRight, RefreshCw, 
  Sparkles, Image as ImageIcon, Download, Copy, Loader2, Trash2, Plus, Upload, ExternalLink, Link
} from 'lucide-react';
import { WizardState, AssetItem } from './types';
import { loadAllAssets, generateWhaleContent, generateFinalImage, ASSET_CONFIG } from './services/geminiService';

const App: React.FC = () => {
  // --- State ---
  const [state, setState] = useState<WizardState>({
    step: 1,
    rawContent: '',
    generatedDraft: '',
    imagePrompt: '',
    assets: [],
    assetsLoaded: false,
    loadingProgress: '',
    isProcessing: false,
    generatedImage: null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 1. Auto Load Assets on Mount ---
  useEffect(() => {
    const initAssets = async () => {
      setState(prev => ({ ...prev, loadingProgress: 'กำลังเชื่อมต่อคลังภาพ...' }));
      const assets = await loadAllAssets((msg) => {
        setState(prev => ({ ...prev, loadingProgress: msg }));
      });
      setState(prev => ({ 
        ...prev, 
        assets, 
        assetsLoaded: true, 
        loadingProgress: 'พร้อมใช้งาน' 
      }));
    };
    initAssets();
  }, []);

  // --- Logic: Generate Content (Step 1 & Regenerate) ---
  const handleGenerateContent = async () => {
    if (!state.rawContent) return;
    setState(prev => ({ ...prev, isProcessing: true }));
    try {
      const result = await generateWhaleContent(state.rawContent);
      setState(prev => ({ 
        ...prev, 
        generatedDraft: result.draft,
        imagePrompt: result.imagePrompt,
        isProcessing: false,
        step: 2 
      }));
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการสร้างเนื้อหา");
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  // --- Logic: Asset Management ---
  const handleDeleteAsset = (id: string) => {
    setState(prev => ({
      ...prev,
      assets: prev.assets.filter(a => a.id !== id)
    }));
  };

  const handleUploadAsset = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const newAsset: AssetItem = {
          id: `custom-${Date.now()}`,
          name: file.name,
          data: base64,
          url: URL.createObjectURL(file),
          isDefault: false
        };
        setState(prev => ({
          ...prev,
          assets: [newAsset, ...prev.assets] // Add new assets to top
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Logic: Generate Image (Step 3) ---
  const handleGenerateImage = async () => {
    setState(prev => ({ ...prev, isProcessing: true, generatedImage: null }));
    try {
      const imageUrl = await generateFinalImage(state.imagePrompt, state.assets);
      setState(prev => ({ 
        ...prev, 
        generatedImage: imageUrl,
        isProcessing: false
      }));
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการสร้างรูปภาพ");
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const handleFinalize = () => {
    if (state.generatedImage) {
      setState(prev => ({ ...prev, step: 4 }));
    }
  };

  const resetApp = () => {
    setState(prev => ({
      ...prev,
      step: 1,
      rawContent: '',
      generatedDraft: '',
      imagePrompt: '',
      generatedImage: null,
      isProcessing: false
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("คัดลอกเรียบร้อย!");
  };

  // --- Loading Screen ---
  if (!state.assetsLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600">
        <Loader2 className="animate-spin mb-4 text-blue-500" size={48} />
        <p className="text-lg font-medium mb-2">กำลังเตรียมระบบ Whale Content Station...</p>
        <p className="text-sm text-slate-400">{state.loadingProgress}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-blue-100 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-teal-400 p-2 rounded-lg text-white shadow-sm">
            <Fish size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">Whale Content Station</h1>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Assets Loaded ({state.assets.length})
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8 relative max-w-3xl mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
          {[
            { num: 1, label: "Input" },
            { num: 2, label: "Review Plan" },
            { num: 3, label: "Setup & Gen" },
            { num: 4, label: "Final Output" }
          ].map((s) => (
            <div key={s.num} className={`flex flex-col items-center gap-2 bg-slate-50 px-2 ${state.step >= s.num ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                state.step >= s.num ? 'bg-blue-600 text-white shadow-md scale-110' : 'bg-slate-200 text-slate-500'
              }`}>
                {s.num}
              </div>
              <span className="text-xs font-semibold tracking-wide uppercase">{s.label}</span>
            </div>
          ))}
        </div>

        {/* --- STEP 1: INPUT RAW DATA --- */}
        {state.step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="font-semibold text-lg mb-4 text-slate-700">1. ป้อนข้อมูลดิบ (Raw Content)</h2>
              <textarea
                value={state.rawContent}
                onChange={(e) => setState(prev => ({ ...prev, rawContent: e.target.value }))}
                placeholder="ใส่ข้อมูลโปรโมชั่น ข่าวสาร หรือเกร็ดความรู้ที่ต้องการให้พี่วาฬเล่า..."
                className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"
              />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleGenerateContent}
                  disabled={!state.rawContent || state.isProcessing}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-all hover:scale-105"
                >
                  {state.isProcessing ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                  เริ่มกระบวนการผลิต (AI Writing)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 2: REVIEW DRAFT & PROMPT --- */}
        {state.step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left: Content Draft */}
              <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-4 text-blue-800 font-semibold">
                  <Fish size={20} />
                  <span>ร่างเนื้อหา (พี่วาฬ)</span>
                </div>
                <textarea
                  value={state.generatedDraft}
                  onChange={(e) => setState(prev => ({ ...prev, generatedDraft: e.target.value }))}
                  className="flex-1 w-full min-h-[300px] p-4 bg-slate-50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-700 text-sm leading-relaxed"
                />
              </div>

              {/* Right: Image Prompt */}
              <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-4 text-purple-800 font-semibold">
                  <ImageIcon size={20} />
                  <span>แผนการสร้างภาพ (Visual Director)</span>
                </div>
                <textarea
                  value={state.imagePrompt}
                  onChange={(e) => setState(prev => ({ ...prev, imagePrompt: e.target.value }))}
                  className="flex-1 w-full min-h-[300px] p-4 bg-slate-50 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none text-slate-700 text-sm leading-relaxed font-mono"
                />
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-4 bg-slate-100 p-4 rounded-xl sticky bottom-4 shadow-md">
              <button
                onClick={() => setState(prev => ({ ...prev, step: 1 }))}
                className="px-4 py-2 rounded-lg text-slate-500 hover:bg-white font-medium text-sm"
              >
                กลับไปแก้ไข
              </button>
              
              <button
                onClick={handleGenerateContent}
                disabled={state.isProcessing}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 font-medium shadow-sm transition-all"
              >
                {state.isProcessing ? <Loader2 className="animate-spin" size={16}/> : <RefreshCw size={18} />}
                ไม่พอใจ? คิดเนื้อหาใหม่ (Regenerate)
              </button>

              <button
                onClick={() => setState(prev => ({ ...prev, step: 3 }))}
                className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 hover:scale-105 transition-all"
              >
                เนื้อหาผ่านแล้ว! ไปจัดการรูปภาพ <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 3: ASSET MANAGEMENT & GENERATION --- */}
        {state.step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-250px)]">
              
              {/* Left Column: Asset Manager (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden h-full">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <div>
                    <h3 className="font-bold text-slate-700">Reference Assets</h3>
                    <p className="text-xs text-slate-500">{state.assets.length} images active</p>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleUploadAsset}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={14} /> Upload
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {state.assets.map((asset) => (
                    <div key={asset.id} className="flex flex-col gap-2 p-3 bg-white border border-slate-100 rounded-lg hover:shadow-sm transition-shadow group relative">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-md bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                           <img src={asset.data} alt={asset.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate" title={asset.name}>{asset.name}</p>
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 rounded inline-block mt-1">
                            {asset.isDefault ? 'Reference' : 'User Upload'}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleDeleteAsset(asset.id)}
                          className="text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity self-start"
                          title="Remove Asset"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      {/* Full URL Display Input */}
                      <div className="bg-slate-50 rounded border border-slate-200 p-1.5 flex items-center gap-2">
                        <div className="text-slate-400 shrink-0">
                          <Link size={12} />
                        </div>
                        <input 
                          type="text" 
                          readOnly
                          value={asset.url || 'No URL'} 
                          className="text-[10px] text-slate-600 bg-transparent w-full focus:outline-none font-mono"
                        />
                        {asset.url && (
                           <a href={asset.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 shrink-0" title="Open Link">
                             <ExternalLink size={12} />
                           </a>
                        )}
                      </div>
                    </div>
                  ))}
                  {state.assets.length === 0 && (
                    <div className="text-center p-6 text-slate-400 text-sm">
                      No assets loaded. Upload or check configuration.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Image Generator (8 cols) */}
              <div className="lg:col-span-8 flex flex-col gap-4 h-full">
                {/* Preview Area */}
                <div className="flex-1 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group">
                  {state.isProcessing ? (
                    <div className="text-center">
                      <Loader2 className="animate-spin w-12 h-12 text-blue-500 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium animate-pulse">AI กำลังแก้ไขภาพ (Editing Image)...</p>
                      <p className="text-xs text-slate-400 mt-2">Processing {state.assets.length} references as input</p>
                    </div>
                  ) : state.generatedImage ? (
                    <img src={state.generatedImage} alt="Generated Preview" className="w-full h-full object-contain p-4" />
                  ) : (
                    <div className="text-center text-slate-400">
                       <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                       <p className="font-medium">โหมดแก้ไขภาพ (Image-to-Image / Edit)</p>
                       <p className="text-xs mt-1">กดปุ่มด้านล่างเพื่อใช้ Reference ทั้งหมดเป็นต้นแบบ</p>
                    </div>
                  )}
                </div>

                {/* Control Area */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                   <button
                      onClick={() => setState(prev => ({ ...prev, step: 2 }))}
                      className="text-slate-500 hover:text-slate-700 font-medium text-sm"
                   >
                      &larr; ย้อนกลับ
                   </button>

                   <div className="flex gap-3">
                     {/* Generate / Re-Generate Button */}
                     <button
                        onClick={handleGenerateImage}
                        disabled={state.isProcessing}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                           state.generatedImage 
                             ? 'bg-white border border-orange-200 text-orange-600 hover:bg-orange-50' 
                             : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                        }`}
                     >
                        {state.isProcessing ? (
                           <span>Processing...</span>
                        ) : state.generatedImage ? (
                           <><RefreshCw size={18} /> ไม่ชอบ? ลองใหม่ (Re-roll)</>
                        ) : (
                           <><Sparkles size={18} /> เริ่ม Edit ภาพ (Generate Image)</>
                        )}
                     </button>

                     {/* Approve Button */}
                     {state.generatedImage && !state.isProcessing && (
                        <button
                          onClick={handleFinalize}
                          className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-green-700 hover:scale-105 transition-all"
                        >
                           ชอบรูปนี้! (Finalize) <ChevronRight size={18} />
                        </button>
                     )}
                   </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* --- STEP 4: FINAL OUTPUT --- */}
        {state.step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
             <div className="grid md:grid-cols-5 gap-6">
                {/* Image Result (Left - Larger) */}
                <div className="md:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-slate-100 font-bold text-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon size={20} className="text-blue-500" />
                      Final Image
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Banana Nano</span>
                  </div>
                  <div className="flex-1 bg-slate-100 flex items-center justify-center p-2 min-h-[300px]">
                    {state.generatedImage ? (
                      <img src={state.generatedImage} alt="Generated Whale" className="max-w-full rounded-lg shadow-sm" />
                    ) : (
                      <div className="text-slate-400">No image generated</div>
                    )}
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <a 
                      href={state.generatedImage || '#'} 
                      download={`whale-content-${Date.now()}.png`}
                      className={`flex items-center justify-center gap-2 w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-2 rounded-lg transition-colors ${!state.generatedImage ? 'pointer-events-none opacity-50' : ''}`}
                    >
                      <Download size={18} /> Download Image
                    </a>
                  </div>
                </div>

                {/* Text Result (Right - Smaller) */}
                <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full">
                  <div className="p-4 border-b border-slate-100 font-bold text-slate-700 flex items-center gap-2">
                    <Fish size={20} className="text-blue-500" />
                    Final Caption
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto max-h-[500px]">
                    <p className="whitespace-pre-line text-slate-700 text-sm leading-relaxed">
                      {state.generatedDraft}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto">
                    <button 
                      onClick={() => copyToClipboard(state.generatedDraft)}
                      className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
                    >
                      <Copy size={18} /> Copy Caption
                    </button>
                  </div>
                </div>
             </div>

             <div className="text-center pt-8">
                <button 
                  onClick={resetApp}
                  className="px-6 py-2 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 font-medium text-sm transition-colors"
                >
                  เริ่มงานใหม่ (Start New)
                </button>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
