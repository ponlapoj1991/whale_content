import { NextRequest, NextResponse } from 'next/server';
import { generateImagePrompt } from '@/lib/gemini';
import { IMAGE_PROMPT_GENERATION } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const { rawContent } = await request.json();

    if (!rawContent || typeof rawContent !== 'string' || rawContent.trim().length === 0) {
      return NextResponse.json(
        { error: 'กรุณากรอกเนื้อหาดิบ (Raw Content)' },
        { status: 400 }
      );
    }

    const result = await generateImagePrompt(IMAGE_PROMPT_GENERATION, rawContent);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'เกิดข้อผิดพลาดในการสร้าง Image Prompt' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imagePrompt: result.prompt,
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
