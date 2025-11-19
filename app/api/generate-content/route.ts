import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini';
import { CONTENT_WRITING_PROMPT } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const { rawContent } = await request.json();

    if (!rawContent || typeof rawContent !== 'string' || rawContent.trim().length === 0) {
      return NextResponse.json(
        { error: 'กรุณากรอกเนื้อหาดิบ (Raw Content)' },
        { status: 400 }
      );
    }

    const result = await generateContent(CONTENT_WRITING_PROMPT, rawContent);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'เกิดข้อผิดพลาดในการสร้างเนื้อหา' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      content: result.content,
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
