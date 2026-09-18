# API Specification — Aurora

> **Global API Prefix:** `/api/v1`  
> **Authentication:** Bearer Token JWT (`Authorization: Bearer <accessToken>`)  
> **Response Format:** Standard JSON Response Wrapper  
> **Pagination Strategy:** Cursor-based Pagination (`?cursor=<id>&limit=20`)  
> **Media Upload Flow:** Presigned Signature (Mobile upload trực tiếp Cloudinary)  
> **Ngày khởi tạo:** 18/09/2026  

---

## 1. Standard Response Format

Tất cả các REST API responses của Aurora đều tuân theo cấu trúc JSON đồng nhất:

### 1.1. Success Response
```json
{
  "success": true,
  "statusCode": 200,
  "data": { ... },
  "timestamp": "2026-09-18T15:00:00.000Z"
}
```

### 1.2. Cursor Paginated Response
```json
{
  "success": true,
  "statusCode": 200,
  "data": [ ... ],
  "meta": {
    "nextCursor": "d3b07384-d113-40e4-a123-123456789abc",
    "hasMore": true,
    "limit": 20
  },
  "timestamp": "2026-09-18T15:00:00.000Z"
}
```

### 1.3. Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed / Invalid credentials",
  "error": "Bad Request",
  "timestamp": "2026-09-18T15:00:00.000Z"
}
```

---

## 2. Authentication Module (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Đăng ký tài khoản bằng email & password | No |
| `POST` | `/auth/login` | Đăng nhập tài khoản Local | No |
| `POST` | `/auth/google` | Đăng nhập / Đăng ký qua Google OAuth | No |
| `POST` | `/auth/apple` | Đăng nhập / Đăng ký qua Apple Sign-In | No |
| `POST` | `/auth/refresh` | Làm mới Access Token bằng Refresh Token | No |
| `POST` | `/auth/logout` | Đăng xuất (Hủy Refresh Token) | **Yes** |

---

## 3. Users Module (`/api/v1/users`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/users/me` | Lấy thông tin cá nhân & cài đặt hiện tại | **Yes** |
| `PATCH` | `/users/me` | Cập nhật Profile (displayName, bio, avatarUrl) | **Yes** |
| `PATCH` | `/users/me/fcm-token` | Cập nhật FCM Push Token | **Yes** |
| `GET` | `/users/search?q=` | Tìm kiếm người dùng theo Username / Display Name | **Yes** |
| `DELETE`| `/users/me` | Yêu cầu xóa tài khoản (Account Deletion) | **Yes** |

---

## 4. Media Upload Module (`/api/v1/media`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/media/presigned-url` | Lấy Signature & Timestamp để Mobile upload ảnh trực tiếp lên Cloudinary | **Yes** |

---

## 5. Moments Module (`/api/v1/moments`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/moments` | Tạo Moment mới (`PHOTO`, `NOTE`, hoặc `MOOD`) | **Yes** |
| `GET` | `/moments/today` | Lấy danh sách Moment trong ngày của User & Bạn bè | **Yes** |
| `GET` | `/moments/calendar?month=09&year=2026` | Lấy danh sách tổng hợp Mood theo từng ngày trong tháng | **Yes** |
| `GET` | `/moments/history` | Lấy lịch sử Moments (Cursor paginated) | **Yes** |
| `GET` | `/moments/:id` | Xem chi tiết 1 Moment | **Yes** |
| `DELETE`| `/moments/:id` | Xóa Moment (Soft delete) | **Yes** |

---

## 6. Friends Module (`/api/v1/friends`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/friends` | Danh sách bạn bè hiện tại | **Yes** |
| `POST` | `/friends/request` | Gửi lời mời kết bạn (`receiverId`) | **Yes** |
| `PATCH` | `/friends/accept/:friendshipId` | Chấp nhận lời mời kết bạn | **Yes** |
| `DELETE`| `/friends/:friendshipId` | Hủy kết bạn hoặc từ chối lời mời | **Yes** |
| `PATCH` | `/friends/close-friend/:friendshipId` | Bật/Tắt chế độ Bạn Thân (`isCloseFriend`) | **Yes** |

---

## 7. Reactions & Comments Module (`/api/v1/moments/:momentId/...`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/moments/:momentId/reactions` | Thả/Đổi Reaction (`LOVE`, `FUNNY`, `RELATABLE`...) | **Yes** |
| `DELETE`| `/moments/:momentId/reactions` | Gỡ Reaction | **Yes** |
| `GET` | `/moments/:momentId/comments` | Lấy danh sách Bình luận (Tác giả xem được tất cả, bạn bè chỉ xem được cuộc hội thoại comment riêng của chính mình) | **Yes** |
| `POST` | `/moments/:momentId/comments` | Đăng bình luận mới | **Yes** |
| `DELETE`| `/comments/:commentId` | Xóa bình luận | **Yes** |

---

## 8. Master Data Module (`/api/v1/emotions`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/emotions` | Lấy danh sách các Emotion/Mood khả dụng (Code, Label, Icon, Color) | **Yes** |
