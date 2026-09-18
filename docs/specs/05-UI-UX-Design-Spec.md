# UI/UX Design Specification — Aurora

> **Design Theme:** Warm & Organic (Ấm áp, Thân mật, Tối giản)  
> **Typography:** Inter / SF Pro  
> **Primary Layout:** 4-Tab Bottom Navigation  
> **Creation UX:** Interactive Bottom Sheet  
> **Moment Style:** Polaroid Grid Card  
> **Ngày khởi tạo:** 18/09/2026  

---

## 1. Design System & Theme Principles

### 1.1. Color Palette (Tone Ấm & Thân Tinh)
- **Background Main:** `#FDFBF7` (Màu kem/be nhạt, tạo cảm giác như trang giấy nhật ký).
- **Surface / Card Background:** `#FFFFFF` (Trắng tinh tế, có viền mỏng bo góc).
- **Primary Text:** `#2C2C2C` (Xám đen nhẹ, mắt không bị mỏi so với đen tuyền).
- **Secondary Text:** `#757575` (Xám trung tính cho timestamp, location, captions).
- **Accent Color:** `#F4A261` / `#E76F51` (Cam đất pastel ấm áp).
- **Card Radius:** `20px` (Góc bo tròn mềm mại).

### 1.2. Typography (Inter / SF Pro)
- **Title / Headers:** Inter SemiBold (18px - 24px)
- **Body Text:** Inter Regular (14px - 16px, line-height 1.5)
- **Caption / Subtitle:** Inter Regular (12px - 13px)
- **Mood Labels:** Inter Medium (13px)

---

## 2. Navigation Architecture (4 Tabs)

```text
┌────────────────────────────────────────────────────────┐
│                                                        │
│                    MAIN CONTENT VIEW                   │
│                                                        │
├────────────────────────────────────────────────────────┤
│     🏠           📅             ➕           👤         │
│   Today       Memories       Create         Me         │
└────────────────────────────────────────────────────────┘
```

---

## 3. Screen Breakdown

### 3.1. Tab 1: `Today` (Home & Timeline)
- **Header:** Lời chào thân mật (*"Good morning, Huy ☕"* hoặc *"How's your day going?"*).
- **Hero Mood Widget:** Nút nhanh cho phép bấm cập nhật Mood ngay nếu chưa chọn.
- **My Timeline (Today):** Danh sách Moment trong ngày của User theo dạng **Polaroid Cards** xếp dọc.
- **Section "What your close friends are up to":**
  - Thanh cuộn ngang các Avatar của bạn thân có vòng viền Mood.
  - Chạm vào Avatar để xem nhanh Moment hôm nay của bạn bè.

### 3.2. Tab 2: `Memories` (Calendar & History)
- **Monthly Calendar Grid:**
  - Lịch tháng thiết kế dạng ô vuông bo góc.
  - Mỗi ngày đã lưu Moment sẽ hiển thị **Emoji Icon của Mood đại diện ngày đó**.
  - Chạm vào một ngày bất kỳ để mở danh sách Moment đã ghi lại của ngày hôm đó.
- **Section "On This Day":** Thẻ khoảnh khắc kỷ niệm cùng ngày này năm trước.

### 3.3. Tab 3: `+` (Create Moment Bottom Sheet)
Khi bấm nút `+`, một **Bottom Sheet** xuất hiện mượt mà từ dưới lên:

```text
┌────────────────────────────────────────────────────────┐
│                     What's happening?                  │
│                                                        │
│       📷 Photo          ✍️ Note          😊 Mood        │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ [ Camera Preview / Image Picker ]                  │ │
│ │ (1 ảnh duy nhất)                                   │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│  How are you feeling?                                  │
│  😊 Happy   😌 Calm   😴 Tired   😔 Sad   😤 Stressed  │
│                                                        │
│  Visibility: [ 💚 Close Friends ▾ ]                    │
│                                                        │
│                   [  Share Moment  ]                   │
└────────────────────────────────────────────────────────┘
```

- **Flow tạo bài:** 10–15 giây.
- **Lựa chọn nhanh:** Cho phép chọn giữa 3 tab nhỏ: `PHOTO`, `NOTE`, hoặc `MOOD`.

### 3.4. Tab 4: `Me` (Profile & Monthly Mood Summary)
- **Header Profile:** Avatar tròn, Username, Bio ngắn, Tổng số Moment đã lưu.
- **Monthly Mood Chart:**
  - Bảng tổng hợp màu sắc cảm xúc trong tháng (Ví dụ: `😊 Happy 40%`, `😌 Calm 25%`, `😴 Tired 20%`).
  - Biểu đồ thanh ngang hoặc vòng tròn tối giản.
- **Settings Icon:** Truy cập trang cài đặt tài khoản, thông báo & bạn bè.

---

## 4. Component Design: Polaroid Moment Card

Thẻ hiển thị Moment chuẩn phong cách Polaroid:

```text
┌────────────────────────────────────────┐
│  [Avatar] Huy  •  12:30 PM    [ 😊 Happy ]│
│ ┌────────────────────────────────────┐ │
│ │                                    │ │
│ │           📷 PHOTO (1:1)           │ │
│ │                                    │ │
│ └────────────────────────────────────┘ │
│  "Quán cà phê mới mở gần trường chill  │
│   quá..."                              │
│                                        │
│  ❤️ 5    💬 2              🔒 Close Friends │
└────────────────────────────────────────┘
```
