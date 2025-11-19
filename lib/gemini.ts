import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateContent(prompt: string, userContent: string) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 10000,
      }
    });

    const fullPrompt = `${prompt}\n\nเนื้อหาที่ต้องเขียน:\n${userContent}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      content: text,
    };
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate content',
    };
  }
}

export async function generateImagePrompt(systemPrompt: string, userContent: string) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 2000,
      }
    });

    const fullPrompt = `${systemPrompt}\n\nเนื้อหาที่ต้องวิเคราะห์:\n${userContent}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      prompt: text,
    };
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate image prompt',
    };
  }
}
