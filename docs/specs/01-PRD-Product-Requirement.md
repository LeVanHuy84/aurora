# Product Requirement Document (PRD) — Aurora

> **Tên dự án:** Aurora  
> **Slogan:** *"A little place for your everyday"*  
> **Định vị sản phẩm:** Digital Daily Life / Private Social Diary (Nhật ký cá nhân kết hợp chia sẻ riêng tư với bạn bè thân thiết).  
> **Ngày khởi tạo:** 18/09/2026  
> **Trạng thái:** MVP Specification  

---

## 1. Executive Summary & Core Philosophy

### 1.1. Core Concept
Aurora là một ứng dụng di động dạng **cuốn nhật ký sống**, nơi người dùng ghi lại những khoảnh khắc nhỏ bé trong ngày một cách nhanh chóng (10–15 giây) mà không bị áp lực bởi ảnh chụp bắt buộc hay lượt thích công khai.

### 1.2. Triết lý cốt lõi (Philosophy)
- **Không bắt buộc chụp ảnh:** Moment có thể là **Photo**, **Note** (chữ), hoặc đơn giản chỉ là **Mood** (cảm xúc).
- **Timeline cá nhân làm trung tâm:** Trang chủ là Timeline công việc & cảm xúc trong ngày của chính User (`Today`), không phải là một Social Feed cuộn vô tận.
- **Riêng tư & Thân mật:** Mặc định lưu trữ cá nhân (`Only Me`) hoặc chỉ chia sẻ với nhóm bạn thân (`Close Friends` / `Friends`).
- **Theo dõi sức khỏe tinh thần (Mood Tracking):** Tổng hợp sắc thái cảm xúc theo tuần/tháng, biến ứng dụng thành một công cụ phản chiếu bản thân (Personal Reflection).

---

## 2. Target Audience & Key Use Cases

### 2.1. Target Audience
- Người muốn lưu giữ khoảnh khắc hàng ngày một cách riêng tư, nhẹ nhàng.
- Nhóm bạn thân (2–5 người) muốn cập nhật cuộc sống của nhau hàng ngày mà không muốn đăng lên các Mạng xã hội lớn (Facebook, Instagram).

### 2.2. Key Use Cases
1. **Sáng:** Đăng 1 Note ngắn *"Sáng nay đi học buồn ngủ quá ☕"* + Mood `Tired`.
2. **Trưa:** Chụp 1 tấm ảnh bữa trưa chill + Mood `Happy`, chọn visiblity `Close Friends`.
3. **Tối:** Mở app chọn Mood `Peaceful`, xem lại Timeline ngày hôm nay và thả cảm xúc ❤️ vào Moment của bạn thân.
4. **Cuối tháng:** Xem màn hình **Monthly Mood Summary** để biết tháng qua mình vui/buồn bao nhiêu ngày.

---

## 3. Product Scope & Feature Breakdown

### 3.1. MVP Scope (Tầng 🟢 — Bắt buộc hoàn thiện trước)

#### A. Core Moment System (Hệ thống Moment)
- **Đa dạng hình thức Moment:**
  - `PHOTO`: 1 ảnh duy nhất (chuẩn Locket, tập trung khoảnh khắc tức thì) + caption + mood (tùy chọn).
  - `NOTE`: Văn bản ngắn + mood (tùy chọn).
  - `MOOD`: Chỉ chọn biểu cảm (Happy, Peaceful, Excited, Tired, Sad, Stressed, Angry, Neutral).
- **Tần suất:** Cho phép tạo nhiều Moment trong cùng một ngày (xếp theo mốc thời gian Timeline: 08:15, 12:30, 20:00...).
- **Privacy Control:**
  - `ONLY_ME` (Riêng tư - Mặc định)
  - `FRIENDS` (Bạn bè)
  - `CLOSE_FRIENDS` (Bạn thân)

#### B. UX / UI Views & Navigation (4 Tab chính)
1. **Tab `Today` (Home):**
   - Đỉnh trang: Widget tổng quan cảm xúc ngày hôm nay.
   - Thân trang: Timeline các Moment trong ngày của User.
   - Sub-section nhỏ: *"What your close friends are up to"* (Khoảnh khắc của bạn bè trong ngày).
2. **Tab `Memories` (Calendar & Archive):**
   - Calendar View: Hiển thị các ô ngày kèm theo icon Mood của ngày đó.
   - Feature *"On this day"*: Ôn lại khoảnh khắc 1 năm / vài tháng trước.
3. **Tab `+` (Create Moment):**
   - UX cực gọn (10-15s): Bấm `+` -> Chọn loại (Photo / Note / Mood) -> Save.
4. **Tab `Me` (Profile & Analytics):**
   - Thông tin cá nhân, tổng số Moment đã lưu.
   - Sơ đồ **Monthly Mood** (Tỷ lệ %, sắc thái theo các ngày trong tháng).

#### C. Social & Friends (Tương tác riêng tư)
- Tìm kiếm bạn bè qua Username / QR Code.
- Gửi/Nhận lời mời kết bạn, Hủy kết bạn, Block.
- Đánh dấu bạn thân (`Close Circle / Close Friends`).
- Reactions casual (❤️ Love, 😂 Funny, 🥹 Relatable, 🔥 Nice, 🫂 Support).
- Direct Comments riêng tư (Chỉ hiển thị giữa Tác giả bài viết và Người comment, giống trả lời Story/Locket).

---

### 3.2. Out of Scope for MVP (Khóa không làm ở Phase 1)
- ❌ Public Feed / Algorithm Recommendation / Trending / Hashtags.
- ❌ Followers / Public Likes Count / Story 24h / Reels Video.
- ❌ Chat Direct Messaging (Nhắn tin riêng).
- ❌ AI Chatbot / AI Summary (Sẽ nâng cấp ở Phase 2).

---

## 4. Technical Architecture Overview

### 4.1. Architecture Pattern
- **Repository Structure:** Monorepo (Chứa cả Mobile App và Backend API).
- **Backend:** NestJS (Modular Monolith architecture).
- **Database:** PostgreSQL (Quản lý relational data chính xác).
- **Storage:** Cloudinary (Lưu trữ ảnh Moment & Avatar).

### 4.2. Core Entities
```text
User ───< Moment ───< MomentImage
  │          │
  │          ├───< Reaction
  │          └───< Comment
  └───< Friendship
```

---

## 5. Non-Functional Requirements (NFRs)

- **Performance:** Thời gian tải Tab `Today` và tạo Moment mới < 1.5 giây.
- **Mobile UX:** Mobile-first, giao diện bo góc, mượt mà, tone màu ấm áp (Warm & Minimal).
- **Security:** Mã hóa mật khẩu (Bcrypt), JWT Access/Refresh Token, phân quyền nghiêm ngặt dữ liệu `ONLY_ME`.
