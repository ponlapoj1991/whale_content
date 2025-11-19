'use client';

import { useState } from 'react';

type Step = 'input' | 'content' | 'image' | 'result';

interface GeneratedData {
  rawContent: string;
  generatedContent: string;
  imagePrompt: string;
  imageUrl?: string;
  imageBase64?: string;
}

export default function Home() {
  const [step, setStep] = useState<Step>('input');
  const [rawContent, setRawContent] = useState('');
  const [data, setData] = useState<Partial<GeneratedData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Generate Content
  const handleGenerateContent = async () => {
    if (!rawContent.trim()) {
      setError('กรุณากรอกเนื้อหาดิบ');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawContent }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'เกิดข้อผิดพลาด');
      }

      setData({ ...data, rawContent, generatedContent: result.content });
      setStep('content');
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการสร้างเนื้อหา');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Regenerate Content
  const handleRegenerateContent = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawContent: data.rawContent }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'เกิดข้อผิดพลาด');
      }

      setData({ ...data, generatedContent: result.content });
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการสร้างเนื้อหา');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Generate Image
  const handleGenerateImage = async () => {
    setLoading(true);
    setError('');

    try {
      // สร้าง image prompt ก่อน
      const promptResponse = await fetch('/api/generate-image-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawContent: data.rawContent }),
      });

      const promptResult = await promptResponse.json();

      if (!promptResponse.ok || !promptResult.success) {
        throw new Error(promptResult.error || 'เกิดข้อผิดพลาดในการสร้าง Image Prompt');
      }

      setData({ ...data, imagePrompt: promptResult.imagePrompt });

      // สร้างภาพ
      const imageResponse = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagePrompt: promptResult.imagePrompt }),
      });

      const imageResult = await imageResponse.json();

      if (!imageResponse.ok || !imageResult.success) {
        throw new Error(imageResult.error || 'เกิดข้อผิดพลาดในการสร้างภาพ');
      }

      setData({
        ...data,
        imagePrompt: promptResult.imagePrompt,
        imageUrl: imageResult.imageUrl,
        imageBase64: imageResult.imageBase64,
      });
      setStep('image');
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการสร้างภาพ');
    } finally {
      setLoading(false);
    }
  };

  // Regenerate Image
  const handleRegenerateImage = async () => {
    setLoading(true);
    setError('');

    try {
      const imageResponse = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagePrompt: data.imagePrompt }),
      });

      const imageResult = await imageResponse.json();

      if (!imageResponse.ok || !imageResult.success) {
        throw new Error(imageResult.error || 'เกิดข้อผิดพลาดในการสร้างภาพ');
      }

      setData({
        ...data,
        imageUrl: imageResult.imageUrl,
        imageBase64: imageResult.imageBase64,
      });
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการสร้างภาพ');
    } finally {
      setLoading(false);
    }
  };

  // Download functions
  const downloadContent = () => {
    const blob = new Blob([data.generatedContent || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whale-content-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadImage = () => {
    if (data.imageBase64) {
      const a = document.createElement('a');
      a.href = `data:image/png;base64,${data.imageBase64}`;
      a.download = `whale-image-${Date.now()}.png`;
      a.click();
    } else if (data.imageUrl) {
      window.open(data.imageUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">🐳 AI Content Whale</h1>
          <p className="text-gray-600">เครื่องมือสร้างคอนเทนต์และภาพอัตโนมัติสำหรับเพจ พลังวาฬบางอย่าง</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            <StepIndicator active={step === 'input'} completed={step !== 'input'} number={1} label="กรอกข้อมูล" />
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <StepIndicator active={step === 'content'} completed={step === 'image' || step === 'result'} number={2} label="สร้างเนื้อหา" />
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <StepIndicator active={step === 'image'} completed={step === 'result'} number={3} label="สร้างภาพ" />
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <StepIndicator active={step === 'result'} completed={false} number={4} label="ผลลัพธ์" />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            ⚠️ {error}
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Step 1: Input */}
          {step === 'input' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📝 กรอกเนื้อหาดิบ (Raw Content)</h2>
              <p className="text-gray-600 mb-4">กรอกข้อมูลหรือเนื้อหาที่ต้องการให้ AI เขียนเป็นคอนเทนต์</p>

              <textarea
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                placeholder="วางเนื้อหาดิบที่ต้องการสร้างคอนเทนต์ที่นี่..."
                className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                disabled={loading}
              />

              <button
                onClick={handleGenerateContent}
                disabled={loading || !rawContent.trim()}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    กำลังสร้างเนื้อหา...
                  </span>
                ) : (
                  'สร้างเนื้อหา →'
                )}
              </button>
            </div>
          )}

          {/* Step 2: Content Review */}
          {step === 'content' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">✨ เนื้อหาที่สร้างแล้ว</h2>

              <div className="bg-gray-50 p-6 rounded-lg mb-4 max-h-96 overflow-y-auto border border-gray-200">
                <pre className="whitespace-pre-wrap font-sans text-gray-800">{data.generatedContent}</pre>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleRegenerateContent}
                  disabled={loading}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg disabled:bg-gray-400 transition-colors"
                >
                  {loading ? '⏳ กำลังสร้างใหม่...' : '🔄 เขียนใหม่'}
                </button>
                <button
                  onClick={handleGenerateImage}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg disabled:bg-gray-400 transition-colors"
                >
                  {loading ? '⏳ กำลังสร้างภาพ...' : 'ถัดไป: สร้างภาพ →'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Image Review */}
          {step === 'image' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🎨 ภาพที่สร้างแล้ว</h2>

              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                {data.imageBase64 ? (
                  <img
                    src={`data:image/png;base64,${data.imageBase64}`}
                    alt="Generated"
                    className="w-full h-auto rounded"
                  />
                ) : data.imageUrl ? (
                  <img src={data.imageUrl} alt="Generated" className="w-full h-auto rounded" />
                ) : (
                  <div className="text-center text-gray-500 py-12">ไม่มีภาพ</div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleRegenerateImage}
                  disabled={loading}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg disabled:bg-gray-400 transition-colors"
                >
                  {loading ? '⏳ กำลังสร้างใหม่...' : '🔄 สร้างภาพใหม่'}
                </button>
                <button
                  onClick={() => setStep('result')}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg disabled:bg-gray-400 transition-colors"
                >
                  ถัดไป: ดูผลลัพธ์ →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Final Result */}
          {step === 'result' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🎉 ผลลัพธ์สุดท้าย</h2>

              {/* Content Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-700">📄 เนื้อหา</h3>
                  <button
                    onClick={downloadContent}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors text-sm"
                  >
                    ⬇️ ดาวน์โหลดเนื้อหา
                  </button>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto border border-gray-200">
                  <pre className="whitespace-pre-wrap font-sans text-gray-800 text-sm">{data.generatedContent}</pre>
                </div>
              </div>

              {/* Image Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-700">🖼️ ภาพ</h3>
                  <button
                    onClick={downloadImage}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors text-sm"
                  >
                    ⬇️ ดาวน์โหลดภาพ
                  </button>
                </div>
                <div className="bg-gray-100 rounded-lg p-4">
                  {data.imageBase64 ? (
                    <img
                      src={`data:image/png;base64,${data.imageBase64}`}
                      alt="Generated"
                      className="w-full h-auto rounded"
                    />
                  ) : data.imageUrl ? (
                    <img src={data.imageUrl} alt="Generated" className="w-full h-auto rounded" />
                  ) : (
                    <div className="text-center text-gray-500 py-12">ไม่มีภาพ</div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={() => {
                  setStep('input');
                  setRawContent('');
                  setData({});
                  setError('');
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                🔄 สร้างใหม่อีกครั้ง
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>Made for พลังวาฬบางอย่าง 🐳</p>
        </div>
      </div>
    </div>
  );
}

// Step Indicator Component
function StepIndicator({ active, completed, number, label }: { active: boolean; completed: boolean; number: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
          completed
            ? 'bg-green-500 text-white'
            : active
            ? 'bg-blue-600 text-white'
            : 'bg-gray-300 text-gray-600'
        }`}
      >
        {completed ? '✓' : number}
      </div>
      <span className={`text-xs mt-1 ${active ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  );
}
