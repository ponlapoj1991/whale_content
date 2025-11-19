# 🐳 AI Content Whale Generator

ระบบสร้างคอนเทนต์และภาพอัตโนมัติสำหรับเพจ **พลังวาฬบางอย่าง** โดยใช้ AI

แปลงจาก n8n workflow เป็น Web Application ที่ทำงานบน Next.js และ deploy บน Vercel

---

## ✨ Features

- 📝 **สร้างเนื้อหา**: เขียนคอนเทนต์สไตล์ "พี่วาฬ" โดยใช้ Gemini AI
- 🎨 **สร้างภาพ**: สร้างภาพ Social Media พร้อม mascot โดยใช้ Banana Nano / Imagen API
- 🔄 **Regenerate**: สร้างเนื้อหาหรือภาพใหม่ได้ทันทีถ้าไม่พอใจ
- ⬇️ **Download**: ดาวน์โหลดเนื้อหา (.txt) และภาพ (.png)
- 🎯 **UI ง่ายๆ**: Wizard แบบ 4 ขั้นตอน ใช้งานง่าย

---

## 🚀 Workflow

```
1. กรอกข้อมูลดิบ (Raw Content)
   ↓
2. AI สร้างเนื้อหา (Gemini) → รีวิว/เขียนใหม่
   ↓
3. AI สร้างภาพ (Banana Nano + Reference Images) → รีวิว/สร้างใหม่
   ↓
4. ดูผลลัพธ์และ Download
```

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI APIs**:
  - Google Gemini API (Content generation)
  - Banana Nano API (Image generation)
  - Google Drive API (Reference images)

---

## 📦 Installation

### 1. Clone repository

```bash
git clone <repository-url>
cd whale_content
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup Environment Variables

สร้างไฟล์ `.env.local`:

```env
# Gemini API Key (สำหรับ content generation)
GEMINI_API_KEY=your_gemini_api_key_here

# Banana Nano API (สำหรับ image generation)
BANANA_API_KEY=your_banana_api_key_here
BANANA_MODEL_KEY=your_model_key_here

# Google Drive API (ถ้าไฟล์ไม่เป็น public)
GOOGLE_DRIVE_API_KEY=your_google_drive_api_key_here
```

### 4. Run Development Server

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploy to Vercel

### วิธีที่ 1: Deploy ผ่าน Vercel Dashboard

1. Push code ขึ้น GitHub
2. ไปที่ [vercel.com](https://vercel.com)
3. Import repository
4. ตั้งค่า Environment Variables (GEMINI_API_KEY, BANANA_API_KEY, etc.)
5. Deploy!

### วิธีที่ 2: Deploy ผ่าน CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## ⚙️ Configuration

### Google Drive Reference Images

ไฟล์ภาพ reference (9 ไฟล์) ถูก hard-code ใน `lib/google-drive.ts`:

- 3 Mascot images
- 6 Example images

**หากต้องการเปลี่ยนภาพ**: แก้ไข `REFERENCE_FILES` ใน `lib/google-drive.ts`

### Prompts

Prompts ทั้งหมดอยู่ใน `lib/prompts.ts`:

- `CONTENT_WRITING_PROMPT` - สไตล์การเขียนของพี่วาฬ
- `IMAGE_PROMPT_GENERATION` - Visual Director prompt
- `IMAGE_GENERATION_PROMPT` - คำสั่งสร้างภาพ

---

## 🔧 Banana Nano API Setup

**⚠️ สำคัญ**: ไฟล์ `lib/banana.ts` เป็น **placeholder** ต้องแก้ไขตาม API จริง

แก้ไขที่:
- Line 21: API endpoint URL
- Line 30-37: Request body format
- Line 56-58: Response parsing

ดู documentation ของ Banana Nano แล้วปรับแก้ให้ตรง

---

## 📁 Project Structure

```
whale_content/
├── app/
│   ├── api/
│   │   ├── generate-content/route.ts     # API: Generate content
│   │   ├── generate-image-prompt/route.ts # API: Generate image prompt
│   │   └── generate-image/route.ts        # API: Generate image
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                           # Main UI
├── lib/
│   ├── gemini.ts              # Gemini API wrapper
│   ├── banana.ts              # Banana Nano API (placeholder)
│   ├── google-drive.ts        # Google Drive helper
│   └── prompts.ts             # All prompts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.mjs
```

---

## 🐛 Troubleshooting

### ปัญหา: Google Drive images ดาวน์โหลดไม่ได้

**แก้ไข**: ตรวจสอบว่าไฟล์เป็น **public** (Anyone with link can view)

หรือใช้ Google Drive API authentication:
1. สร้าง Service Account ใน Google Cloud Console
2. Share ไฟล์กับ service account email
3. เพิ่ม credentials ใน `.env.local`

### ปัญหา: Banana Nano API error

**แก้ไข**: ตรวจสอบ `lib/banana.ts` และแก้ไข request/response format ให้ตรงกับ API documentation

### ปัญหา: Gemini API error

**แก้ไข**:
- ตรวจสอบ API key
- ตรวจสอบ quota/billing
- ลอง model อื่น (`gemini-1.5-flash` เร็วและถูกกว่า)

---

## 📄 License

MIT

---

## 👨‍💻 Author

Created for **พลังวาฬบางอย่าง** 🐳

---

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Gemini API](https://ai.google.dev/)
- [Vercel Deploy Guide](https://vercel.com/docs)
