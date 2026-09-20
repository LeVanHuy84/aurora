# 🗺️ Lộ Trình Triển Khai Dự Án Aurora (Long-Term Execution Plan)

> **Dự án:** Aurora — Digital Daily Life / Private Social Diary  
> **Mục tiêu:** Xây dựng ứng dụng di động nhật ký cá nhân kết hợp chia sẻ riêng tư (NestJS Backend + Expo SDK 57 Mobile App + PostgreSQL + Prisma).  
> **Định hướng triển khai:** Chia nhỏ thành các Phase & Milestone độc lập, dán tem hoàn thành từng bước (Iterative Development) để dễ theo dõi và duy trì chất lượng lâu dài.

---

## 📌 Phase 1: Khởi Tạo Hạ Tầng Monorepo Base (Infra & Shared Packages)
*Mục tiêu: Dựng xong bộ khung dự án Monorepo chuẩn, kết nối CSDL và sẵn sàng môi trường dev cho cả Backend và Mobile.*

- [x] **Task 1.1:** Khởi tạo Monorepo với `pnpm workspaces` và `turborepo` ở thư mục gốc.
- [x] **Task 1.2:** Tạo gói chia sẻ `packages/types` chứa các Interface, DTOs, Enums TypeScript dùng chung giữa API và Mobile.
- [x] **Task 1.3:** Khởi tạo dự án NestJS Backend tại `apps/api` (Tích hợp Swagger, ValidationPipe, Throttler).
- [x] **Task 1.4:** Khởi tạo dự án Mobile App tại `apps/mobile` (Expo SDK 57 + Expo Router v4).
- [x] **Task 1.5:** Đưa `schema.prisma` từ `docs/specs/03-Database-Schema.md` vào `apps/api/prisma` và chuẩn bị PostgreSQL schema.
- [x] **Task 1.6:** Cấu hình **GitHub Actions CI Workflow** (`.github/workflows/ci.yml`) đảm bảo tự động kiểm tra Type-Check & Build chất lượng code từ đầu.

---

## 🟢 Phase 2: Xây Dựng Backend API MVP Core (`apps/api`)
- [x] **Task 2.1:** **Auth Module:** Register, Login, Refresh Token (JWT Access/Refresh Token) & Google/Apple OAuth Strategy.
- [x] **Task 2.2:** **Users Module:** API Lấy/Cập nhật thông tin cá nhân (`/users/me`), tìm kiếm bạn bè (`/users/search`).
- [x] **Task 2.3:** **Media Module (Cloudinary):** Cấp Presigned Signature cho Mobile upload ảnh trực tiếp lên Cloudinary.
- [x] **Task 2.4:** **Moments Module (Core Entity):** API Tạo Moment (`PHOTO`, `NOTE`, `MOOD`), Timeline `Today`, Calendar Mood theo tháng.
- [x] **Task 2.5:** **Friends Module:** Gửi/Chấp nhận lời mời kết bạn, Hủy kết bạn, Đánh dấu `Close Friends`.
- [x] **Task 2.6:** **Reactions & Private Comments Module:** Thả/Gỡ Reaction, Đăng & Xem Comment riêng tư 1-1.
- [x] **Task 2.7:** **i18n & Exception Filters:** Cấu hình `nestjs-i18n` hỗ trợ thông báo lỗi song ngữ Anh - Việt.

---

## 📱 Phase 3: Phát Triển Mobile App Expo Go (`apps/mobile`)
- [x] **Task 3.1:** **Setup UI Base & i18n:** Cấu hình `i18next` + `expo-localization`, Theme Warm Organic, TanStack Query Provider.
- [x] **Task 3.2:** **Auth Flow Screens:** Màn hình Splash, Login, Register, Google/Apple OAuth Button.
- [x] **Task 3.3:** **Tab 1 — `Today` Screen (Home):** Timeline hiển thị các Moment dưới dạng Polaroid Card & Close Friends Widget.
- [x] **Task 3.4:** **Tab 3 — `+` Create Moment Interactive Bottom Sheet:** Flow tạo Moment 10–15s (1 ảnh / Note / Mood).
- [x] **Task 3.5:** **Tab 2 — `Memories` Screen (Calendar & History):** Lịch tháng hiển thị Emoji Mood & "On This Day".
- [x] **Task 3.6:** **Tab 4 — `Me` Screen (Profile & Monthly Mood):** Profile cá nhân & Biểu đồ Monthly Mood Chart.
- [x] **Task 3.7:** **1-1 Direct Messaging & Moment Quoted Reply (Chat 1-1 & Tương tác Locket-style):** Hệ thống tin nhắn 1-1, trích dẫn Moment, màn hình Inbox (`/inbox`), phòng Chat 1-1 (`/chat/[id]`), hiệu ứng pháo hoa cảm xúc (`FloatingEmojiBurst`) & Bottom Sheet xem phản hồi tương tác.

---

## 🚀 Phase 4: Integration, Production Deployment & Native Credentials
- [x] **Task 4.1:** **CI/CD Pipeline (GitHub Actions):** 
  - Automated Lint, Type-Check & Build test cho cả `apps/api` và `apps/mobile` khi `git push` hoặc `pull_request`.
  - Continuous Deployment (CD) cho Backend API & Expo EAS Build/Preview.
- [x] **Task 4.2:** **Push Notifications Service Base:** Tích hợp `expo-notifications` và cấu hình logic gửi push qua Expo Push Service.
- [x] **Task 4.3:** **Tối ưu hóa hiệu năng Mobile:** Áp dụng `expo-image` để nén và cache ảnh mượt mà, tối ưu re-render và trải nghiệm người dùng.
- [x] **Task 4.4:** **Backend Production Deployment:** 
  - Deploy NestJS API lên môi trường Production (Render / Docker / VPS).
  - Kết nối cơ sở dữ liệu PostgreSQL Cloud (Supabase / Neon / Render Postgres) & cấu hình biến môi trường production.
- [ ] **Task 4.5:** **EAS Build & Native OAuth Verification (Google & Apple):**
  - Cấu hình `eas.json` và tạo bản build Native (EAS Development Build / Preview APK / iOS TestFlight).
  - Lấy mã **SHA-1 Fingerprint** từ bản build và cấu hình **Android Client ID / iOS Client ID** chính thức trên Google Cloud Console.
  - Kiểm thử toàn diện luồng **Google Sign-In & Apple Sign-In** trực tiếp trên thiết bị thật (bản Native Build, không qua Expo Go proxy).
- [ ] **Task 4.6:** **Native Production Push Credentials Setup (FCM v1 & Apple APNs):**
  - Cấu hình Firebase Cloud Messaging v1 (`service-account.json`) cho Android Standalone APK/AAB trên EAS Credentials.
  - Cấu hình Apple Push Notifications Key (`.p8`) cho iOS TestFlight/App Store trên EAS Credentials để chạy thông báo độc lập hoàn toàn trên bản Native Build.
- [ ] **Task 4.7:** **Kiểm thử toàn diện E2E:** Test luồng sử dụng thực tế giữa các thiết bị thật (Đăng ký, Đăng nhập OAuth/Email, Tạo Moment, Thả cảm xúc, Chat 1-1, Push Notifications nền).

---

## 🔮 Phase 5: Nâng Cấp Tương Lai (Future Enhancements - Post-MVP)
- [ ] **AI Weekly/Monthly Reflection:** Tích hợp AI phân tích xu hướng cảm xúc hàng tuần/tháng.
- [ ] **Location & Music Attachment:** Đính kèm vị trí địa lý hoặc bài hát Spotify vào Moment.
- [ ] **Widgets iOS/Android:** Widget ngoài màn hình chính hiển thị khoảnh khắc mới nhất của Bạn thân.
