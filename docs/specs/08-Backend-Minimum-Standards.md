# Backend NestJS Minimum Standards & Code Conventions — Aurora

> **Mục đích:** Quy định các tiêu chuẩn tối thiểu (Minimum Standards) cho dự án NestJS Backend (`apps/api`) nhằm đảm bảo mã nguồn nhất quán, bảo mật, type-safe tuyệt đối và dễ bảo trì trong suốt quá trình phát triển lâu dài.

---

## 1. Directory Structure Standard (Cấu trúc Thư mục chuẩn)

Tất cả các Feature Modules thuộc `apps/api/src/modules/` bắt buộc phải tuân theo cấu trúc phân lớp sau:

```text
src/modules/<feature-name>/
├── dto/                        # Data Transfer Objects
│   ├── create-<feature>.dto.ts
│   └── update-<feature>.dto.ts
├── entities/                   # Local Entities / Models (nếu có)
├── <feature-name>.controller.ts # Route handling & Swagger Decorators
├── <feature-name>.service.ts    # Business logic & Prisma DB Queries
├── <feature-name>.module.ts     # Module declaration & Providers
└── <feature-name>.service.spec.ts # Unit tests
```

---

## 2. API Response & Error Handling Standards

### 2.1. Standard Response Format

Tất cả các API responses thành công đều phải đi qua **Global Interceptor** để đóng gói theo chuẩn JSON:

```json
{
  "success": true,
  "statusCode": 200,
  "data": { ... },
  "timestamp": "2026-09-18T17:00:00.000Z"
}
```

### 2.2. Error Handling & Exception Filters

- **Không bao giờ nuốt exception (No swallowing exceptions):** Không dùng `try-catch` rỗng hoặc trả về fallback ẩn lỗi.
- **Dùng NestJS Built-in Exceptions:** Sử dụng `BadRequestException`, `UnauthorizedException`, `NotFoundException`, `ForbiddenException` đi kèm key dịch `i18n`.
- **Global Exception Filter:** Tất cả lỗi runtime chưa xử lý phải được bắt bởi `HttpExceptionFilter` và định dạng trả về thống nhất:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Thông tin đăng nhập không chính xác",
  "error": "Bad Request",
  "timestamp": "2026-09-18T17:00:00.000Z"
}
```

---

## 3. Data Validation & DTO Standards

1. **Bắt buộc dùng `ValidationPipe`:** Mọi DTO gửi lên qua `@Body()`, `@Query()`, `@Param()` đều phải được validate bằng `class-validator`.
2. **Cấu hình Global Pipe:** Bật `whitelist: true` (tự động loại bỏ thuộc tính lạ không khai báo trong DTO) và `forbidNonWhitelisted: true` (chống ghi đè dữ liệu độc hại).
3. **Swagger Integration:** Tất cả các trường trong DTO phải gắn decorator `@ApiProperty()` hoặc `@ApiPropertyOptional()` đi kèm mô tả rõ ràng để Swagger tự động sinh tài liệu API `/api/docs`.

---

## 4. Prisma ORM & Database Query Rules

1. **Strict Soft Delete Querying:** Với các bảng có hỗ trợ Soft Delete (`User`, `Moment`, `Comment`), mọi câu truy vấn `findMany`, `findFirst`, `findUnique` phải luôn kèm điều kiện `deletedAt: null`.
2. **No N+1 Query Problem:** Sử dụng câu lệnh `include` hoặc `select` của Prisma hợp lý để lấy dữ liệu liên quan trong 1 truy vấn duy nhất.
3. **Password Security:** Trường `password` của bảng `User` **tuyệt đối không bao giờ** được bao gồm (`select: { password: false }`) trong kết quả trả về cho Client.

---

## 5. Security & Authentication Rules

1. **Password Hashing:** Bắt buộc mã hóa mật khẩu bằng `bcrypt` với `saltRounds = 10` hoặc `12` trước khi lưu vào PostgreSQL.
2. **JWT Security:**
   - **Access Token:** Hạn ngắn (15 phút), chứa `sub` (userId) và `email`.
   - **Refresh Token:** Hạn dài (30 ngày), lưu dạng Hash trong DB (`RefreshToken` table) và hủy bỏ ngay khi Logout hoặc Refresh.
3. **Auth Guard:** Tất cả các Controllers/Endpoints ngoại trừ Public (được gắn `@Public()`) phải mặc định yêu cầu `JwtAuthGuard`.

---

## 6. Internationalization (i18n) Rules

- **Không Hardcode Chuỗi Tiếng Việt / Tiếng Anh trong Code:**
- Mọi thông báo lỗi hoặc nhãn Master Data phải sử dụng `I18nService` để tra cứu từ file bản dịch `src/i18n/` thông qua `Accept-Language` header.

---

## 8. Unit Testing & Code Coverage Standards

1. **Target Coverage cho Backend (`apps/api`):**
   - **Service Layer (Business Logic):** Tối thiểu **80% Code Coverage** (các hàm AuthService, MomentsService, Prisma queries...).
   - **Controllers & Guards:** Tối thiểu **70% Code Coverage**.
2. **Không Viết Test Hình Thức:** Test phải bao quát cả case thành công (Happy Path) và các case lỗi (Edge Cases / Exception throwing).
3. **Chạy Kiểm Tra Coverage:** Sử dụng lệnh `pnpm --filter api test:cov` để xuất báo cáo coverage trước khi merge code quan trọng.

---

## 9. Naming Conventions (Quy chuẩn Đặt tên)

- **Files & Folders:** `kebab-case` (VD: `create-moment.dto.ts`, `auth.service.ts`).
- **Classes & Interfaces:** `PascalCase` (VD: `CreateMomentDto`, `MomentsService`).
- **Variables & Methods:** `camelCase` (VD: `findUserByEmail`, `createMoment`).
- **DB Tables & Columns:** `snake_case` cho DB mapping (`@map("moments")`) và `camelCase` cho Prisma Model properties.
