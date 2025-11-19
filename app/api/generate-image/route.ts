import { NextRequest, NextResponse } from 'next/server';
import { generateImageWithBanana } from '@/lib/banana';
import { downloadAllReferenceImages } from '@/lib/google-drive';
import { IMAGE_GENERATION_PROMPT } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const { imagePrompt } = await request.json();

    if (!imagePrompt || typeof imagePrompt !== 'string' || imagePrompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'กรุณาระบุ Image Prompt' },
        { status: 400 }
      );
    }

    // ดึง reference images จาก Google Drive
    console.log('Downloading reference images from Google Drive...');
    const referenceImages = await downloadAllReferenceImages();

    // รวม mascots และ examples เป็น array เดียว
    const allReferenceImagesBase64 = [
      ...referenceImages.mascots,
      ...referenceImages.examples,
    ];

    // สร้าง full prompt
    const fullPrompt = IMAGE_GENERATION_PROMPT(imagePrompt);

    // เรียก Banana Nano API
    console.log('Generating image with Banana Nano API...');
    const result = await generateImageWithBanana(fullPrompt, allReferenceImagesBase64);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'เกิดข้อผิดพลาดในการสร้างภาพ' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl: result.imageUrl,
      imageBase64: result.imageBase64,
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// เพิ่ม timeout สำหรับ image generation (ใช้เวลานาน)
export const maxDuration = 60; // 60 seconds
