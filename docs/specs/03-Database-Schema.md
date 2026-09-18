# Database Schema Specification — Aurora

> **Database System:** PostgreSQL  
> **ORM:** Prisma ORM  
> **Primary Key Standard:** UUID v4  
> **Deletion Strategy:** Soft Delete (`deletedAt DateTime?`) kết hợp Cascade Cleanup Workflow  
> **Ngày khởi tạo:** 18/09/2026  

---

## 1. Entity Relationship Overview (ERD)

```text
       ┌──────────────┐
       │   Emotions   │
       └──────┬───────┘
              │ 1
              │ N
┌─────────────┴┐ 1          N ┌──────────────┐
│    Users     ├──────────────┤ RefreshToken │
└──────┬───────┘              └──────────────┘
       │ 1
       ├─────────────────┬─────────────────┐
       │ N               │ N               │ N
┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴───────┐
│   Moments    │  │ Friendship   │  │ Notification │
└──────┬───────┘  └──────────────┘  └──────────────┘
       │ 1
       ├─────────────────┐
       │ N               │ N
┌──────┴───────┐  ┌──────┴───────┐
│  Reactions   │  │   Comments   │
└──────────────┘  └──────────────┘
```

---

## 2. Prisma Schema Definition (`schema.prisma`)

Below is the complete reference `schema.prisma` definition for Aurora:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ------------------------------------------------------
// ENUMS
// ------------------------------------------------------

enum AuthProvider {
  LOCAL
  GOOGLE
  APPLE
}

enum MomentType {
  PHOTO
  NOTE
  MOOD
}

enum Visibility {
  ONLY_ME
  FRIENDS
  CLOSE_FRIENDS
}

enum FriendshipStatus {
  PENDING
  ACCEPTED
  BLOCKED
}

enum NotificationType {
  FRIEND_REQUEST
  FRIEND_ACCEPT
  NEW_MOMENT
  REACTION
  COMMENT
}

// ------------------------------------------------------
// MODELS
// ------------------------------------------------------

model User {
  id            String        @id @default(uuid()) @db.Uuid
  email         String        @unique
  password      String?       // Nullable nếu dùng OAuth
  username      String        @unique
  displayName   String
  avatarUrl     String?
  bio           String?
  provider      AuthProvider  @default(LOCAL)
  providerId    String?       // Subject ID từ Google/Apple OAuth
  fcmToken      String?       // Token cho Push Notification

  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  deletedAt     DateTime?     // Soft delete

  // Relations
  tokens        RefreshToken[]
  moments       Moment[]
  reactions     Reaction[]
  comments      Comment[]
  
  // Friendships
  sentRequests     Friendship[] @relation("SentFriendships")
  receivedRequests Friendship[] @relation("ReceivedFriendships")

  notifications    Notification[] @relation("UserNotifications")

  @@map("users")
  @@index([username])
  @@index([email])
}

model RefreshToken {
  id        String   @id @default(uuid()) @db.Uuid
  token     String   @unique
  userId    String   @db.Uuid
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@map("refresh_tokens")
  @@index([userId])
}

model Emotion {
  id        String   @id @default(uuid()) @db.Uuid
  code      String   @unique // e.g., "HAPPY", "PEACEFUL", "TIRED"
  label     String   // e.g., "Happy", "Peaceful"
  icon      String   // Emoji hoac Icon key (e.g., "😊", "😌")
  color     String?  // Hex color code cho UI (e.g., "#FFD700")
  order     Int      @default(0)
  isActive  Boolean  @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  moments   Moment[]

  @@map("emotions")
  @@index([code])
}

model Moment {
  id          String      @id @default(uuid()) @db.Uuid
  userId      String      @db.Uuid
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  type        MomentType
  content     String?     @db.Text // Text note hoac photo caption
  imageUrl    String?     // Cloudinary image URL (chi 1 anh duy nhat cho PHOTO)
  
  emotionId   String?     @db.Uuid
  emotion     Emotion?    @relation(fields: [emotionId], references: [id], onDelete: SetNull)

  visibility  Visibility  @default(ONLY_ME)

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  deletedAt   DateTime?   // Soft delete

  // Relations
  reactions   Reaction[]
  comments    Comment[]

  @@map("moments")
  @@index([userId, createdAt])
  @@index([visibility])
}

model Friendship {
  id           String           @id @default(uuid()) @db.Uuid
  requesterId  String           @db.Uuid
  requester    User             @relation("SentFriendships", fields: [requesterId], references: [id], onDelete: Cascade)
  
  receiverId   String           @db.Uuid
  receiver     User             @relation("ReceivedFriendships", fields: [receiverId], references: [id], onDelete: Cascade)

  status       FriendshipStatus @default(PENDING)
  isCloseFriend Boolean         @default(false) // Danh dau Close Friends

  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  @@unique([requesterId, receiverId])
  @@map("friendships")
  @@index([requesterId])
  @@index([receiverId])
}

model Reaction {
  id        String   @id @default(uuid()) @db.Uuid
  momentId  String   @db.Uuid
  moment    Moment   @relation(fields: [momentId], references: [id], onDelete: Cascade)

  userId    String   @db.Uuid
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  type      String   // e.g., "LOVE", "FUNNY", "RELATABLE", "NICE", "SUPPORT"

  createdAt DateTime @default(now())

  @@unique([momentId, userId]) // 1 user chi react 1 lan tren 1 moment
  @@map("reactions")
  @@index([momentId])
}

model Comment {
  id        String    @id @default(uuid()) @db.Uuid
  momentId  String    @db.Uuid
  moment    Moment    @relation(fields: [momentId], references: [id], onDelete: Cascade)

  userId    String    @db.Uuid
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  content   String    @db.Text
  
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime? // Soft delete

  @@map("comments")
  @@index([momentId, createdAt])
}

model Notification {
  id        String           @id @default(uuid()) @db.Uuid
  userId    String           @db.Uuid
  user      User             @relation("UserNotifications", fields: [userId], references: [id], onDelete: Cascade)

  type      NotificationType
  title     String
  body      String
  data      Json?            // Payload linh hoat (momentId, friendId...)
  isRead    Boolean          @default(false)

  createdAt DateTime         @default(now())

  @@map("notifications")
  @@index([userId, isRead])
}
```

---

## 3. Account Deletion Workflow (Cloud Cleanup)

Mặc định Prisma áp dụng `onDelete: Cascade` trong Database để dọn sạch bản ghi khi Xóa Tài khoản (`User`). Tuy nhiên, đối với tài nguyên lưu ở Cloud (như **Cloudinary Images**):
- Backend NestJS sẽ có `UserCleanupService` thực hiện lệnh xóa các file media trên Cloudinary dựa trên `imageUrl` của User trước khi hoàn tất lệnh xóa record khỏi Database.
