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
- [ ] **Task 3.7:** **Direct 1-1 Comment UI:** Giao diện xem & phản hồi bình luận riêng tư.

---

## 🚀 Phase 4: Integration, CI/CD, Push Notification & Polishing
- [ ] **Task 4.1:** **CI/CD Pipeline (GitHub Actions):** 
  - Automated Lint, Type-Check & Build test cho cả `apps/api` và `apps/mobile` khi `git push` hoặc `pull_request`.
  - Continuous Deployment (CD) cho Backend API & Expo EAS Build/Preview.
- [ ] **Task 4.2:** **Push Notifications:** Tích hợp `expo-notifications` và Firebase FCM.
- [ ] **Task 4.3:** **Tối ưu hóa hiệu năng Mobile:** Áp dụng `expo-image` để nén và cache ảnh mượt mà.
- [ ] **Task 4.4:** **Kiểm thử toàn diện:** Test luồng sử dụng thực tế giữa 2 máy iPhone qua Expo Go.
- [ ] **Task 4.5:** **Deployment Readiness:** Cấu hình Docker cho NestJS Backend & PostgreSQL Database.

---

## 🔮 Phase 5: Nâng Cấp Tương Lai (Future Enhancements - Post-MVP)
- [ ] **AI Weekly/Monthly Reflection:** Tích hợp AI phân tích xu hướng cảm xúc hàng tuần/tháng.
- [ ] **Location & Music Attachment:** Đính kèm vị trí địa lý hoặc bài hát Spotify vào Moment.
- [ ] **Widgets iOS/Android:** Widget ngoài màn hình chính hiển thị khoảnh khắc mới nhất của Bạn thân.
