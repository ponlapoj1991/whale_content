# 🚀 Deployment Guide for Vercel

คู่มือการ deploy AI Content Whale Generator ไปยัง Vercel

---

## ✅ Pre-deployment Checklist

ก่อน deploy ให้ตรวจสอบ:

- [ ] มี Gemini API Key พร้อมใช้งาน
- [ ] มี Banana Nano API Key และ Model Key
- [ ] แก้ไข `lib/banana.ts` ให้ตรง API จริง
- [ ] Google Drive reference images เป็น public (หรือมี credentials)
- [ ] Test ใน local (`npm run dev`) แล้วทำงานได้

---

## 🌐 Deploy to Vercel (แบบละเอียด)

### Step 1: Push Code to GitHub

```bash
# เช็ค git status
git status

# Add ไฟล์ทั้งหมด
git add .

# Commit
git commit -m "Initial setup: AI Content Whale Generator"

# Push to GitHub (branch: claude/app-code-setup-01XwrFTgXApYS4n7fgWQjNqH)
git push -u origin claude/app-code-setup-01XwrFTgXApYS4n7fgWQjNqH
```

### Step 2: เข้า Vercel Dashboard

1. ไปที่ [https://vercel.com](https://vercel.com)
2. Login ด้วย GitHub account
3. คลิก **"Add New..."** → **"Project"**

### Step 3: Import Repository

1. เลือก repository: `ponlapoj1991/whale_content`
2. เลือก branch: `claude/app-code-setup-01XwrFTgXApYS4n7fgWQjNqH`
3. คลิก **"Import"**

### Step 4: Configure Project

**Framework Preset**: Next.js (auto-detected)

**Build Settings**: ใช้ค่า default

```
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### Step 5: Environment Variables

คลิก **"Environment Variables"** แล้วเพิ่ม:

| Name | Value | Environment |
|------|-------|-------------|
| `GEMINI_API_KEY` | `your_actual_gemini_api_key` | Production |
| `BANANA_API_KEY` | `your_banana_api_key` | Production |
| `BANANA_MODEL_KEY` | `your_banana_model_key` | Production |

**Optional** (ถ้าใช้ Google Drive authentication):

| Name | Value | Environment |
|------|-------|-------------|
| `GOOGLE_DRIVE_API_KEY` | `your_drive_api_key` | Production |
| `GOOGLE_DRIVE_CLIENT_EMAIL` | `service-account@...` | Production |
| `GOOGLE_DRIVE_PRIVATE_KEY` | `-----BEGIN PRIVATE KEY-----\n...` | Production |

### Step 6: Deploy

1. คลิก **"Deploy"**
2. รอ 2-3 นาที
3. ✅ เสร็จแล้ว! คุณจะได้ URL: `https://your-project.vercel.app`

---

## 🔄 Re-deploy (Update Code)

หลังจาก deploy แล้ว หากต้องการแก้ไข code:

```bash
# แก้ไข code
# ...

# Commit และ Push
git add .
git commit -m "Update: description of changes"
git push

# Vercel จะ auto-deploy ทันที!
```

---

## ⚙️ Advanced Configuration

### Custom Domain

1. ไปที่ Vercel Dashboard → Project Settings → Domains
2. เพิ่ม domain ของคุณ
3. ตั้งค่า DNS ตาม instructions

### Environment Variables for Development

ถ้าต้องการ test ใน Vercel preview:

1. ไปที่ Project Settings → Environment Variables
2. เลือก Environment: **Preview**
3. เพิ่มตัวแปรเดียวกันกับ Production

### Serverless Function Timeout

API `/api/generate-image` อาจใช้เวลานาน

ใน `app/api/generate-image/route.ts` มีการตั้ง:

```typescript
export const maxDuration = 60; // 60 seconds
```

**หมายเหตุ**: Vercel Free Plan มี timeout 10 วินาที
- ต้อง upgrade เป็น **Pro Plan** ($20/month) เพื่อใช้ timeout 60 วินาที

### Monitoring and Logs

ดู logs ได้ที่:
- Vercel Dashboard → Project → Deployments → คลิก deployment → Logs
- หรือใช้ `vercel logs` ผ่าน CLI

---

## 🐛 Common Deployment Issues

### Issue 1: Build Failed - TypeScript Errors

**แก้ไข**:

```bash
# Check TypeScript locally
npm run build

# Fix errors ตาม output
```

### Issue 2: API Routes Timeout

**อาการ**: `/api/generate-image` timeout

**แก้ไข**:
1. Upgrade Vercel plan
2. หรือใช้ external service (ไม่ใช้ API route)
3. ลด timeout หรือ optimize code

### Issue 3: Environment Variables Not Working

**แก้ไข**:
1. เช็คว่าตัวแปรตั้งถูกต้องใน Vercel Dashboard
2. Re-deploy project (Settings → Deployments → Redeploy)
3. ตรวจสอบว่าใช้ `process.env.VARIABLE_NAME` ถูกต้อง

### Issue 4: Google Drive Images 403 Error

**แก้ไข**:
1. ตรวจสอบว่าไฟล์เป็น **public** (Anyone with link)
2. หรือใช้ Service Account authentication

---

## 💰 Cost Estimation

### Vercel Costs

- **Free Plan**:
  - 100 GB bandwidth/month
  - Serverless execution: 100 hours/month
  - Timeout: 10 seconds

- **Pro Plan** ($20/month):
  - 1 TB bandwidth
  - Serverless execution: 1000 hours
  - Timeout: 60 seconds (สำคัญสำหรับ image generation!)

### API Costs

- **Gemini API**:
  - Free tier: 15 requests/minute
  - Paid: ขึ้นกับ usage

- **Banana Nano**:
  - ตรวจสอบ pricing กับทาง Banana.dev

---

## 📊 Performance Optimization

### 1. Caching Reference Images

แทนที่จะดาวน์โหลดจาก Google Drive ทุกครั้ง:

```typescript
// TODO: Cache images in Vercel Blob Storage or CDN
```

### 2. Use Gemini Flash Model

แก้ใน `lib/gemini.ts`:

```typescript
model: 'gemini-1.5-flash' // เร็วกว่า gemini-1.5-pro
```

### 3. Add Loading States

UI มี loading states แล้ว แต่สามารถเพิ่ม progress bar ได้

---

## 🔐 Security Best Practices

1. **ห้าม commit API keys** ลง git
2. ใช้ Environment Variables เท่านั้น
3. ตรวจสอบ `.gitignore` มี `.env.local`
4. ใช้ Vercel's secret management

---

## 📞 Support

หากมีปัญหา:

1. เช็ค [Vercel Documentation](https://vercel.com/docs)
2. ดู Logs ใน Vercel Dashboard
3. ทดสอบใน local ก่อน (`npm run dev`)

---

## ✅ Post-Deployment Checklist

หลัง deploy แล้ว:

- [ ] Test ทุก step ใน production URL
- [ ] ทดสอบ generate content
- [ ] ทดสอบ generate image
- [ ] ทดสอบ download ทั้ง content และ image
- [ ] เช็ค Vercel usage/billing
- [ ] Setup custom domain (ถ้าต้องการ)
- [ ] Share URL กับทีม!

---

**Done! 🎉 App ของคุณพร้อมใช้งานแล้ว**

URL: `https://your-project.vercel.app`
