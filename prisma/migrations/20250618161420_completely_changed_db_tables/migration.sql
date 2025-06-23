/*
  Warnings:

  - You are about to drop the `Album` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Link` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Media` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OtpEmail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserFriend` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AlbumToMedia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_MediaToPost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_MediaToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PostToTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserPostLikes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserPostViews` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Album";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Link";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Media";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "OtpEmail";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Post";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Tag";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UserFriend";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_AlbumToMedia";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_MediaToPost";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_MediaToUser";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_PostToTag";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_UserPostLikes";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_UserPostViews";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "post_app_album" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "preview_image" TEXT,
    "shown" BOOLEAN NOT NULL DEFAULT true,
    "topic_id" INTEGER NOT NULL,
    "profile_id" INTEGER NOT NULL,
    CONSTRAINT "post_app_album_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "post_app_tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_app_album_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "user_app_profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "post_app_album_images" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "album_id" INTEGER NOT NULL,
    "image_id" INTEGER NOT NULL,
    CONSTRAINT "post_app_album_images_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "post_app_album" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_app_album_images_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "post_app_image" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "chat_app_chatgroup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "is_personal_chat" BOOLEAN NOT NULL DEFAULT false,
    "admin_id" INTEGER NOT NULL,
    "avatar" TEXT,
    CONSTRAINT "chat_app_chatgroup_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "user_app_profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "chat_app_chatgroup_members" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "chatgroup_id" INTEGER NOT NULL,
    "profile_id" INTEGER NOT NULL,
    CONSTRAINT "chat_app_chatgroup_members_chatgroup_id_fkey" FOREIGN KEY ("chatgroup_id") REFERENCES "chat_app_chatgroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "chat_app_chatgroup_members_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "user_app_profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "chat_app_chatmessage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "author_id" INTEGER NOT NULL,
    "chat_group_id" INTEGER NOT NULL,
    "sent_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attached_image" TEXT,
    "profileId" INTEGER,
    CONSTRAINT "chat_app_chatmessage_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "auth_user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "chat_app_chatmessage_chat_group_id_fkey" FOREIGN KEY ("chat_group_id") REFERENCES "chat_app_chatgroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "chat_app_chatmessage_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "user_app_profile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "post_app_image" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "filename" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "uploaded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "post_id" INTEGER,
    CONSTRAINT "post_app_image_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post_app_post" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "post_app_post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author_id" INTEGER NOT NULL,
    "profileId" INTEGER,
    CONSTRAINT "post_app_post_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "auth_user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_app_post_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "user_app_profile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "post_app_post_views" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "post_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "profileId" INTEGER,
    CONSTRAINT "post_app_post_views_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post_app_post" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_app_post_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_app_post_views_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "user_app_profile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "post_app_post_likes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "post_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "profileId" INTEGER,
    CONSTRAINT "post_app_post_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post_app_post" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_app_post_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_app_post_likes_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "user_app_profile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "post_app_post_tags" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "post_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,
    CONSTRAINT "post_app_post_tags_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post_app_post" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_app_post_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "post_app_tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "post_app_tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "post_app_link" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "post_id" INTEGER NOT NULL,
    CONSTRAINT "post_app_link_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post_app_post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "auth_user" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "password" TEXT NOT NULL,
    "last_login" DATETIME,
    "is_superuser" BOOLEAN NOT NULL DEFAULT false,
    "username" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "is_staff" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "date_joined" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "user_app_profile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "date_of_birth" DATETIME,
    "signature" TEXT,
    CONSTRAINT "user_app_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth_user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_app_avatar" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "image" TEXT NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "shown" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "user_app_avatar_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "user_app_profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_app_friendship" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "profile1_id" INTEGER NOT NULL,
    "profile2_id" INTEGER NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "user_app_friendship_profile1_id_fkey" FOREIGN KEY ("profile1_id") REFERENCES "user_app_profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_app_friendship_profile2_id_fkey" FOREIGN KEY ("profile2_id") REFERENCES "user_app_profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_app_verificationcode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "post_app_album_images_album_id_image_id_key" ON "post_app_album_images"("album_id", "image_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_app_chatgroup_members_chatgroup_id_profile_id_key" ON "chat_app_chatgroup_members"("chatgroup_id", "profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_app_post_views_post_id_user_id_key" ON "post_app_post_views"("post_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_app_post_likes_post_id_user_id_key" ON "post_app_post_likes"("post_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_app_post_tags_post_id_tag_id_key" ON "post_app_post_tags"("post_id", "tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_app_tag_name_key" ON "post_app_tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "auth_user_username_key" ON "auth_user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "auth_user_email_key" ON "auth_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_app_profile_user_id_key" ON "user_app_profile"("user_id");
