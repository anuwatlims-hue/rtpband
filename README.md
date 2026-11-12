# rtpband — เว็บไซต์ดุริยางค์ตำรวจ

เว็บแสดงผลงาน กิจกรรม ภาพนิ่ง และวิดีโอของ [ดุริยางค์ตำรวจ](https://www.facebook.com/ThaiPoliceBand/) (Vite + TypeScript ไม่ใช้ framework, JS+CSS ราว 9 KB gzip)

## คำสั่ง

```bash
npm install
npm run dev        # เปิดเครื่องพัฒนา
npm test           # รันชุดทดสอบ
npm run build      # typecheck + build ไปที่ dist/
npm run preview    # ดูผล build
```

## การเพิ่ม/แก้ไขเนื้อหา

เนื้อหาทั้งหมดอยู่ใน `src/data/content.ts`

- **กิจกรรม** (`activities`): ใส่ชื่อ วันที่ (`YYYY-MM-DD`) สถานที่ หมวด (`ceremony`, `concert`, `community`, `education`) รูป และลิงก์โพสต์ Facebook ต้นทาง — เรียงจากใหม่ไปเก่าอัตโนมัติ
- **ภาพนิ่ง** (`photos`): วางไฟล์ภาพไว้ที่ `public/media/` แล้วอ้างอิงเป็น `/media/ชื่อไฟล์.jpg` (แนะนำ WebP/JPEG กว้างไม่เกิน 1600px)
- **วิดีโอ** (`videos`): ใส่ลิงก์วิดีโอ Facebook (`/videos/…`, `/reel/…`, `fb.watch`), YouTube หรือไฟล์ `.mp4/.webm` พร้อมภาพปก — ตัวเล่นจะโหลดเมื่อผู้ใช้กดเล่นเท่านั้น เพื่อให้หน้าเว็บโหลดเร็ว

ส่วน "ข่าวล่าสุดจาก Facebook" ดึงฟีดสดจากเพจผ่าน Facebook Page Plugin อย่างเป็นทางการ จึงอัปเดตตามเพจอัตโนมัติ

> Facebook ไม่อนุญาตให้ดึงข้อมูลอัตโนมัติ ภาพใน `public/media/` ตอนนี้เป็นภาพประกอบชั่วคราว ควรแทนที่ด้วยภาพจริงจากเพจ (ที่หน่วยงานมีสิทธิ์ใช้)
