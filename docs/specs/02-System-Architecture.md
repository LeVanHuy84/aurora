# System Architecture Specification — Aurora

> **Tên dự án:** Aurora  
> **Kiến trúc:** Monorepo (pnpm workspaces / Turborepo) + Modular Monolith Backend (NestJS)  
> **Ngày khởi tạo:** 18/09/2026  
> **Trạng thái:** Architecture Approved

---

## 1. High-Level Architecture Overview

Hệ thống Aurora được thiết kế theo mô hình **Modular Monolith** kết hợp **Monorepo Structure** nhằm tối ưu hóa việc phát triển tốc độ cao (Vibe Coding), chia sẻ Type định nghĩa giữa Backend & Mobile App, dễ bảo trì và mở rộng trong tương lai mà không phức tạp hóa hạ tầng.

```text
┌─────────────────────────────────────────────────────────┐
│                    Mobile App (Expo)                    │
│           (apps/mobile — iOS & Android)                 │
└────────────────────────────┬────────────────────────────┘
                             │
                             │ HTTPS / REST API / OAuth2
                             ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend API (NestJS)                   │
│                       (apps/api)                        │
│                                                         │
│  ┌──────────────┐   ┌──────────────┐   ┌─────────────┐  │
│  │ Auth Module  │   │ Users Module │   │Moments Mod  │  │
│  └──────────────┘   └──────────────┘   └─────────────┘  │
│  ┌──────────────┐   ┌──────────────┐   ┌─────────────┐  │
│  │ Friends Mod  │   │ ReactionsMod │   │ Noti Module │  │
│  └──────────────┘   └──────────────┘   └─────────────┘  │
└──────────────┬──────────────┬──────────────┬────────────┘
               │              │              │
               ▼              ▼              ▼
       ┌──────────────┐┌──────────────┐┌──────────────┐
       │  PostgreSQL  ││  Cloudinary  ││ Firebase FCM │
       │ (Prisma ORM) ││(Media Storage)││ (Push Noti)  │
       └──────────────┘└──────────────┘└──────────────┘
```

---

## 2. Monorepo Repository Structure

Dự án sử dụng **pnpm workspaces** (kết hợp **Turborepo** để build/dev song song):

```text
aurora/
├── apps/
│   ├── api/                    # NestJS Backend API
│   │   ├── src/
│   │   │   ├── common/         # Guards, Interceptors, Filters, Decorators
│   │   │   ├── config/         # Environment configurations
│   │   │   ├── modules/        # Feature Modules (Auth, Users, Moments, Friends...)
│   │   │   └── app.module.ts
│   │   ├── prisma/             # Prisma Schema & Migrations
│   │   ├── test/               # End-to-End Tests
│   │   └── package.json
│   │
│   └── mobile/                 # React Native / Expo Mobile App
│       ├── app/                # Expo Router pages / screens
│       ├── components/         # UI Components (Cards, Buttons, Modals)
│       ├── hooks/              # Custom React Hooks
│       ├── services/           # API Client Services
│       └── package.json
│
├── packages/
│   └── types/                  # Shared DTOs, Enums, Interfaces cho cả API & Mobile
│       ├── src/
│       │   ├── moments.ts
│       │   ├── users.ts
│       │   └── index.ts
│       └── package.json
│
├── docs/                       # Specifications & Prompts
│   ├── specs/
│   └── prompts/
│
├── package.json                # Root package.json
├── pnpm-workspace.yaml         # Workspace configuration
├── turbo.json                  # Turborepo task pipeline
└── README.md
```

---

## 3. Backend Architecture (NestJS)

### 3.1. Architectural Pattern: Modular Monolith

Backend chia thành các Module tính năng độc lập, giao tiếp thông qua Service Injection hoặc Event Emitter nội bộ:

- **`AuthModule`**: Đăng ký, Đăng nhập (Local JWT Access/Refresh Token + OAuth Google/Apple), Auth Guard.
- **`UsersModule`**: Quản lý Profile, Avatar, Cài đặt cá nhân.
- **`MomentsModule`**: Core Logic tạo & truy vấn Moment (`PHOTO`, `NOTE`, `MOOD`), lọc Timeline theo `Today` / `Calendar`.
- **`FriendsModule`**: Quản lý bạn bè, gửi lời mời kết bạn, danh sách `Close Friends`.
- **`ReactionsModule` & `CommentsModule`**: Tương tác casual trên Moment.
- **`NotificationsModule`**: Gửi Push Notifications qua Firebase FCM / Expo Push Service khi có bạn bè đăng bài hoặc tương tác.
- **`MediaModule`**: Xử lý upload ảnh trực tiếp lên Cloudinary.

### 3.2. Core Technical Components

1. **ORM:** **Prisma ORM** — Đảm bảo Type-Safety tuyệt đối từ DB schema tới TypeScript code.
2. **Authentication & Authorization:**
   - **Local Auth:** JWT Access Token (ngắn hạn: 15 phút) + Refresh Token (dài hạn: 30 ngày, lưu mã hóa trong DB).
   - **OAuth2:** Google / Apple Sign-In (phục vụ đăng nhập mượt trên Mobile).
3. **Data Validation:** `class-validator` & `class-transformer` tự động validate dữ liệu DTO đầu vào.
4. **API Documentation:** NestJS Swagger OpenAPI hỗ trợ giao diện xem và test API tại đường dẫn `/api/docs`.
5. **Security & Rate Limiting:** `@nestjs/throttler` chống spam API requests.

---

## 4. Mobile Architecture (React Native / Expo)

- **Framework:** Expo (React Native) + Expo Router (File-based routing).
- **State Management:** React Query (TanStack Query) quản lý Server State, Caching & Optimistic Updates; Zustand cho Local State nhỏ gọn.
- **Media Capture:** Expo Camera / Image Picker (chụp hoặc chọn 1 ảnh duy nhất cho `PHOTO` Moment).
- **Notifications:** Expo Notifications tích hợp Push Notifications.

---

## 5. Third-Party Services Integration

| Service                      | Purpose                        | Integration Method                                                 |
| :--------------------------- | :----------------------------- | :----------------------------------------------------------------- |
| **PostgreSQL**               | Primary Relational Database    | Connection String via Prisma                                       |
| **Cloudinary**               | Storage & Optimization cho Ảnh | Cloudinary SDK / Direct Upload Signature                           |
| **Firebase FCM / Expo Push** | Push Notifications đến di động | `@nestjs-modules/mailer` / Expo SDK                                |
| **Google / Apple OAuth**     | OAuth2 Social Login            | Passport.js Strategy (`passport-google-oauth20`, `passport-apple`) |

---

## 6. Development Workflow & Scripts

- **`pnpm dev`**: Chạy đồng thời cả NestJS Backend API và Expo Mobile App qua Turborepo.
- **`pnpm db:migrate`**: Chạy Prisma Migration cập nhật PostgreSQL.
- **`pnpm build`**: Build ứng dụng & packages trước khi deploy.
