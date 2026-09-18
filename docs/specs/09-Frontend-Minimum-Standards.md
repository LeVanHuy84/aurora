# Frontend Expo & React Native Minimum Standards & Code Conventions — Aurora

> **Mục đích:** Quy định các tiêu chuẩn tối thiểu (Minimum Standards) cho ứng dụng di động Aurora Mobile (`apps/mobile` - Expo SDK 57 + Expo Router v4 + React Native 0.86+) nhằm đảm bảo mã nguồn nhất quán, type-safe tuyệt đối, mượt mà chuẩn 60fps, tương thích 100% Expo Go và dễ mở rộng bảo trì lâu dài.

---

## 1. Directory Structure Standard (Cấu trúc Thư mục chuẩn)

Toàn bộ mã nguồn `apps/mobile/` bắt buộc phải tuân theo cấu trúc phân lớp sau:

```text
apps/mobile/
├── app/                        # Expo Router File-based Routing (Màn hình & Điều hướng)
│   ├── (auth)/                 # Nhóm màn hình xác thực (Splash, Login, Register, OAuth)
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                 # 4 Bottom Tabs chính
│   │   ├── _layout.tsx         # Bottom Tab Bar configuration
│   │   ├── index.tsx           # Tab 1: Today (Timeline & Polaroids)
│   │   ├── memories.tsx        # Tab 2: Memories (Calendar & Emotion History)
│   │   ├── create.tsx          # Tab 3: Create Moment Action (Bottom Sheet Modal)
│   │   └── profile.tsx         # Tab 4: Me / Profile (Streak & Mood Chart)
│   ├── moment/                 # Màn hình chi tiết
│   │   └── [id].tsx            # Dynamic route chi tiết Moment & Bình luận 1-1
│   ├── _layout.tsx             # Root Provider Layout (QueryClient, Theme, i18n, SafeArea)
│   └── +not-found.tsx          # 404 Fallback screen
├── assets/                     # Icons, Splash screens, Fonts tĩnh
├── src/
│   ├── components/             # Reusable UI Primitives & Widgets
│   │   ├── ui/                 # Atomic UI (Button, Input, Avatar, Badge, Card)
│   │   ├── moments/            # Moment UI components (PolaroidCard, MoodPill, ReactionBar)
│   │   └── common/             # Header, EmptyState, LoadingOverlay, ErrorBoundary
│   ├── constants/              # Theme palettes, Spacing, Typography, API endpoints
│   │   └── theme.ts            # Warm Organic Theme (Light & Dark tokens)
│   ├── hooks/                  # Custom React Hooks
│   │   ├── use-theme.ts        # Hook lấy theme active & toggle dark/light
│   │   ├── use-auth.ts         # Hook thao tác login, register, logout, current user
│   │   └── use-moments.ts      # Custom TanStack Query hooks
│   ├── i18n/                   # react-i18next & expo-localization
│   │   ├── locales/
│   │   │   ├── en.json
│   │   │   └── vi.json
│   │   └── index.ts
│   ├── services/               # API Client & Network layer
│   │   ├── api-client.ts       # Axios/Fetch instance + Token Interceptor + Refresh Flow
│   │   └── modules/            # API services (auth.service, moments.service, etc.)
│   ├── stores/                 # Zustand Global Client State (Auth, UI Sheet, Preferences)
│   │   ├── auth.store.ts       # User session state
│   │   └── theme.store.ts      # System/Light/Dark mode state
│   └── types/                  # Local TypeScript types & Navigation types
```

---

## 2. Expo Go Compatibility & Package Standards

1. **Tuyệt đối tương thích Expo Go (Zero Native Linking):**
   - Chỉ sử dụng các thư viện thuộc hệ sinh thái Expo SDK 57 hoặc pure JavaScript/TypeScript.
   - **Nghiêm cấm** cài đặt các thư viện yêu cầu cấu hình Native code `pod install` hoặc `android/` riêng biệt không chạy được trên Expo Go (ví dụ: `react-native-fast-image`, native SQLite raw drivers).
2. **Hình ảnh bắt buộc dùng `expo-image`:**
   - Thay thế hoàn toàn thẻ `<Image />` mặc định của React Native bằng `<Image />` từ `expo-image`.
   - Bắt buộc khai báo `contentFit="cover"`, `placeholder` hoặc `blurhash` khi hiển thị ảnh Moment/Avatar để tránh giật lag layout.
3. **Lưu trữ dữ liệu nhạy cảm bằng `expo-secure-store`:**
   - JWT Access Token, Refresh Token, User Credentials **bắt buộc** lưu trong `expo-secure-store`.
   - Tuyệt đối **không** lưu Access/Refresh Token vào `AsyncStorage` không mã hóa.

---

## 3. Theme & Design System (Warm Organic Light & Dark)

Ứng dụng Aurora được xây dựng trên triết lý màu ấm áp, chữa lành (**Warm Organic**):

1. **Bảng màu chuẩn:**
   - **Light Mode:** Nền `Warm Ivory` (`#FDFBF7`), Thẻ `Card Warm` (`#FFFFFF` / `#F8F5EE`), Chữ `Warm Charcoal` (`#2D2B2A`), Nhấn `Aurora Coral` (`#E87A5D`), `Sage Green` (`#7B9E89`).
   - **Dark Mode:** Nền `Warm Espresso` (`#1A1817`), Thẻ `Dark Card` (`#242120`), Chữ `Warm Beige` (`#F4EFEA`), Nhấn `Soft Coral` (`#F08E74`).
2. **Quy tắc sử dụng Theme:**
   - **Không hardcode mã màu HEX trực tiếp trong component styles:** Luôn sử dụng hook `useAppTheme()` để lấy `colors`, `spacing`, `typography`.
   - Hỗ trợ đầy đủ 3 chế độ: `light`, `dark`, và `system` (theo cài đặt hệ điều hành thiết bị).
3. **Typography & Spacing:**
   - Spacing chuẩn theo thang: `xs: 4`, `sm: 8`, `md: 16`, `lg: 24`, `xl: 32`.
   - Bán kính bo góc (Border Radius): Đậm chất hữu cơ, mềm mại (`sm: 8`, `md: 16`, `lg: 24`, `full: 9999`).

---

## 4. Navigation & Expo Router v4 Standards

1. **Typed Routing:** Mọi chuyển trang (`router.push`, `router.replace`, `<Link href="...">`) phải tuân thủ types của Expo Router.
2. **Safe Area Insets:**
   - Tất cả các màn hình phải bọc trong `SafeAreaView` từ `react-native-safe-area-context` hoặc sử dụng `useSafeAreaInsets()` để tránh tràn tai thỏ (Notch / Dynamic Island) và thanh điều hướng dưới đáy máy (Home Indicator).
3. **Tab Bar & Modal Interactions:**
   - Nút `+` (Create Moment) ở Tab giữa mở giao diện tạo nhanh theo dạng Bottom Sheet / Modal tương tác mượt mà dưới 15 giây.

---

## 5. API Fetching & State Management Standards

### 5.1. Server State với TanStack Query (`@tanstack/react-query`)
1. **Tập trung Query Keys:** Định nghĩa Query Key Factory cho từng module (VD: `momentKeys.all`, `momentKeys.today()`, `momentKeys.detail(id)`).
2. **Optimistic Updates:** Thao tác thả cảm xúc (Reactions) và thêm Moment phải có Optimistic Update để người dùng thấy phản hồi tức thì mà không phải chờ mạng.
3. **Pagination:** Với danh sách Moments hoặc Lịch sử, sử dụng `useInfiniteQuery` kết hợp cursor-based pagination.

### 5.2. Client State với Zustand
1. **Tách biệt Store:** Không nhét toàn bộ dữ liệu vào 1 store khổng lồ. Tách riêng `useAuthStore`, `useThemeStore`, `useCreateMomentStore`.
2. **Không lưu trữ Server Data trùng lặp:** Dữ liệu Moments, Friends, Comments thuộc quyền quản lý của React Query cache, không copy thủ công sang Zustand.

### 5.3. Network Client (`api-client.ts`)
1. Tự động đính kèm `Authorization: Bearer <token>` vào request headers.
2. Tự động đính kèm header `Accept-Language: vi` (hoặc `en`) dựa trên ngôn ngữ hiện tại của app để Backend trả về đúng lỗi bản địa hóa.
3. Bắt mã lỗi `401 Unauthorized`: Tự động gọi API `/auth/refresh` lấy token mới; nếu thất bại thì đăng xuất và chuyển hướng về màn hình `/(auth)/login`.

---

## 6. Internationalization (i18n) Standards

1. **Tuyệt đối không hardcode text tiếng Việt / tiếng Anh trực tiếp trong JSX:**
   - Dùng hook `const { t } = useTranslation();` và gọi `t('namespace.key')`.
2. **Đồng bộ hóa 2 ngôn ngữ:**
   - Mỗi khi thêm 1 key mới vào `src/i18n/locales/vi.json`, bắt buộc phải bổ sung bản dịch tương ứng trong `src/i18n/locales/en.json`.
3. **Tự động nhận diện ngôn ngữ máy:**
   - Sử dụng `expo-localization` để chọn ngôn ngữ mặc định phù hợp với thiết bị của người dùng khi lần đầu mở app.

---

## 7. Component Styling & Performance Rules

1. **Sử dụng `StyleSheet.create`:** Không viết inline style `style={{ ... }}` cho các object tĩnh để tránh re-render sinh rác bộ nhớ.
2. **Kích thước vùng chạm (Touch Target Size):** Mọi nút bấm, icon button phải có kích thước tối thiểu **44x44 dp** (sử dụng `hitSlop` nếu icon nhỏ) để đảm bảo trải nghiệm chạm ngón tay thoải mái.
3. **Tối ưu Danh sách cuộn:**
   - Dùng `FlatList` luôn truyền `keyExtractor={(item) => item.id}`.
   - Thêm `removeClippedSubviews={true}`, `maxToRenderPerBatch={10}`, `initialNumToRender={8}` cho các danh sách Timeline dài.

---

## 8. Naming Conventions (Quy chuẩn Đặt tên)

- **Thư mục & Tệp Router (`app/`):** `kebab-case` hoặc theo chuẩn Expo Router (VD: `[id].tsx`, `_layout.tsx`, `login.tsx`).
- **Components & Screens:** `PascalCase` (VD: `PolaroidCard.tsx`, `EmotionSelector.tsx`).
- **Hooks:** `camelCase` bắt đầu bằng `use` (VD: `useAppTheme.ts`, `useMoments.ts`).
- **Stores & Services:** `camelCase` hoặc `kebab-case` kèm hậu tố (VD: `auth.store.ts`, `moments.service.ts`).
- **TypeScript Types & Interfaces:** `PascalCase` (VD: `MomentDetail`, `CreateMomentInput`).
