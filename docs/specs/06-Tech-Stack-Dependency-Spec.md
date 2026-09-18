# Tech Stack & Dependency Specification — Aurora

> **Target Platform:** iOS & Android (Dev bằng Expo Go trên iPhone)  
> **Expo SDK Version:** Expo SDK 57 (React Native 0.81+)  
> **Backend Framework:** NestJS v10+  
> **Node.js Target:** >= 20.x  
> **Package Manager:** `pnpm` (v9+)  
> **Internationalization (i18n):** Song ngữ Anh - Việt (`en`, `vi`)  
> **Ngày khởi tạo:** 18/09/2026  

---

## 1. Expo Go Compatibility Guardrail (iPhone / Expo SDK 57)

Để đảm bảo dự án chạy dev mượt mà trên **Expo Go (iPhone / Expo SDK 57)** mà không bị văng app hoặc bắt buộc phải prebuild/custom native code:

1. **CHỈ SỬ DỤNG các thư viện tương thích với Expo Go:**
   - ❌ **KHÔNG DÙNG:** Các thư viện đòi hỏi Native Code tùy chỉnh không hỗ trợ Expo Go (VD: `react-native-fast-image`, `react-native-camera` cũ, `react-native-vector-icons` liên kết thủ công).
   - ✅ **SỬ DỤNG:** Cặp thư viện chính chủ của Expo SDK 57:
     - `expo-camera` / `expo-image-picker` (Chụp & chọn ảnh)
     - `expo-image` (Hiển thị & cache ảnh mượt mà thay cho FastImage)
     - `expo-router` (File-based routing v4+)
     - `expo-font` & `@expo/vector-icons` (Icon & Font)
     - `expo-localization` & `i18next` / `react-i18next` (Đa ngôn ngữ)
     - `expo-secure-store` (Lưu giữ JWT Token an toàn trên iPhone)

---

## 2. Core Dependencies & Versions Matrix

### 2.1. Mobile App (`apps/mobile`) — Expo SDK 57
| Dependency | Version / Package | Purpose |
| :--- | :--- | :--- |
| **Framework** | `expo` (~57.0.0) | Core Expo Platform |
| **React / React Native**| `react` (18.3.x) / `react-native` (0.76.x - 0.81.x) | UI Library |
| **Routing** | `expo-router` (~4.0.0) | Navigation |
| **State & Cache** | `@tanstack/react-query` (^5.x) | Server State |
| **Local State** | `zustand` (^4.x / ^5.x) | Client UI State |
| **Internationalization**| `i18next`, `react-i18next`, `expo-localization` | Đa ngôn ngữ (Anh/Việt) |
| **Media & Camera** | `expo-image-picker`, `expo-image` | Chụp/Chọn/Hiển thị ảnh |
| **Secure Storage** | `expo-secure-store` | Lưu JWT Access/Refresh Token |
| **Icons & UI** | `@expo/vector-icons`, `lucide-react-native` | Icons |

### 2.2. Backend API (`apps/api`) — NestJS v10
| Dependency | Version / Package | Purpose |
| :--- | :--- | :--- |
| **Framework** | `@nestjs/core` (^10.x), `@nestjs/common` | Backend Core |
| **Database ORM** | `prisma` (^5.x / ^6.x), `@prisma/client` | Database ORM |
| **Auth & Passport** | `@nestjs/jwt`, `passport-jwt`, `bcrypt` | JWT Authentication |
| **Validation** | `class-validator`, `class-transformer` | DTO Data Validation |
| **API Docs** | `@nestjs/swagger` (^7.x) | OpenAPI UI Docs |
| **Media Upload** | `cloudinary` (^2.x) | Presigned Upload Cloudinary |
| **Internationalization**| `nestjs-i18n` (^10.x) | Multi-language API Error Responses |

---

## 3. Internationalization (i18n) Strategy (Anh - Việt)

Hệ thống hỗ trợ song ngữ toàn diện ở cả Frontend và Backend:

```text
       ┌─────────────────────────────────────────┐
       │              Mobile App                 │
       │    (i18next + expo-localization)        │
       │   - UI Text, Buttons, Titles, Tabs      │
       │   - Automatic device locale detection   │
       └────────────────────┬────────────────────┘
                            │
                            │ Header: `Accept-Language: vi` (hoặc `en`)
                            ▼
       ┌─────────────────────────────────────────┐
       │              Backend API                │
       │             (nestjs-i18n)               │
       │   - Dynamic Emotion Labels              │
       │   - Error messages, Validations         │
       └─────────────────────────────────────────┘
```

### 3.1. Frontend Structure (`apps/mobile/locales/`)
- `apps/mobile/locales/en.json`: Chứa tất cả bản dịch tiếng Anh.
- `apps/mobile/locales/vi.json`: Chứa tất cả bản dịch tiếng Việt.
- Tự động nhận diện ngôn ngữ thiết bị iOS qua `expo-localization` và cho phép User chuyển đổi thủ công trong màn `Settings`.

### 3.2. Backend Structure (`apps/api/src/i18n/`)
- `apps/api/src/i18n/en/`: Chứa thông báo lỗi và danh mục Emotion tiếng Anh.
- `apps/api/src/i18n/vi/`: Chứa thông báo lỗi và danh mục Emotion tiếng Việt.
- Backend đọc Header `Accept-Language` truyền lên từ Mobile để trả về câu thông báo/lỗi phù hợp.
