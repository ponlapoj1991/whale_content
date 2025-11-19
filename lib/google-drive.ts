// Google Drive file IDs จาก workflow เดิม
export const REFERENCE_FILES = {
  mascots: [
    '1RHEuK4yhqm0baUtXUtuqzier1TRPxgii', // Character_mascot1.png
    '1-SZrvhE6herzf0vdG8z7WbACnVPNObnw', // Character_mascot_sad.png
    '1ePl3woHEKX6AM2i0WGjEGM2pWQrrsuC8', // Character_mascot_wow.png
  ],
  examples: [
    '1zIQiWeIgGHk-GFyvIonARQVeEc9qy1T9', // example1.jpg
    '1z0WWet93Pq3kxyo8gCiyBkQj_nQ8zssG', // example2.jpg
    '1cdROcQlWBdgjwyJh5u7pr9T522IT7rlO', // example3.png
    '1auRvEdH7eFyli8mYzmSss7F8YhBmphYy', // example4.png
    '1y6PgzD_y_E9nrj_xK8Mx05HEI6I5Wqjh', // example5.png
    '1roqswTUSWF1qAUox-DI6GVnK10SKMWdA', // example6.png
  ],
};

/**
 * ดึงภาพจาก Google Drive เป็น base64
 * ใช้ Public URL แทนการ authenticate (ถ้าไฟล์เป็น public)
 */
export async function downloadDriveImage(fileId: string): Promise<string> {
  try {
    const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    return base64;
  } catch (error) {
    console.error(`Error downloading file ${fileId}:`, error);
    throw error;
  }
}

/**
 * ดึงภาพ reference ทั้งหมด
 */
export async function downloadAllReferenceImages(): Promise<{
  mascots: string[];
  examples: string[];
}> {
  try {
    const mascotPromises = REFERENCE_FILES.mascots.map(id => downloadDriveImage(id));
    const examplePromises = REFERENCE_FILES.examples.map(id => downloadDriveImage(id));

    const [mascots, examples] = await Promise.all([
      Promise.all(mascotPromises),
      Promise.all(examplePromises),
    ]);

    return { mascots, examples };
  } catch (error) {
    console.error('Error downloading reference images:', error);
    throw error;
  }
}
