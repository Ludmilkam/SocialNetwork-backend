/*
  Warnings:

  - You are about to drop the column `profileId` on the `chat_app_chatmessage` table. All the data in the column will be lost.
  - You are about to drop the column `profileId` on the `post_app_post` table. All the data in the column will be lost.
  - You are about to drop the column `profileId` on the `post_app_post_likes` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `post_app_post_likes` table. All the data in the column will be lost.
  - You are about to drop the column `profileId` on the `post_app_post_views` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `post_app_post_views` table. All the data in the column will be lost.
  - Added the required column `profile_id` to the `post_app_post_likes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_id` to the `post_app_post_views` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_chat_app_chatmessage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "author_id" INTEGER NOT NULL,
    "chat_group_id" INTEGER NOT NULL,
    "sent_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attached_image" TEXT,
    CONSTRAINT "chat_app_chatmessage_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user_app_profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "chat_app_chatmessage_chat_group_id_fkey" FOREIGN KEY ("chat_group_id") REFERENCES "chat_app_chatgroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_chat_app_chatmessage" ("attached_image", "author_id", "chat_group_id", "content", "id", "sent_at") SELECT "attached_image", "author_id", "chat_group_id", "content", "id", "sent_at" FROM "chat_app_chatmessage";
DROP TABLE "chat_app_chatmessage";
ALTER TABLE "new_chat_app_chatmessage" RENAME TO "chat_app_chatmessage";
CREATE TABLE "new_post_app_post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author_id" INTEGER NOT NULL,
    CONSTRAINT "post_app_post_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user_app_profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_post_app_post" ("author_id", "content", "id", "title") SELECT "author_id", "content", "id", "title" FROM "post_app_post";
DROP TABLE "post_app_post";
ALTER TABLE "new_post_app_post" RENAME TO "post_app_post";
CREATE TABLE "new_post_app_post_likes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "post_id" INTEGER NOT NULL,
    "profile_id" INTEGER NOT NULL,
    CONSTRAINT "post_app_post_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post_app_post" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_app_post_likes_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "user_app_profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_post_app_post_likes" ("id", "post_id") SELECT "id", "post_id" FROM "post_app_post_likes";
DROP TABLE "post_app_post_likes";
ALTER TABLE "new_post_app_post_likes" RENAME TO "post_app_post_likes";
CREATE UNIQUE INDEX "post_app_post_likes_post_id_profile_id_key" ON "post_app_post_likes"("post_id", "profile_id");
CREATE TABLE "new_post_app_post_views" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "post_id" INTEGER NOT NULL,
    "profile_id" INTEGER NOT NULL,
    CONSTRAINT "post_app_post_views_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post_app_post" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_app_post_views_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "user_app_profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_post_app_post_views" ("id", "post_id") SELECT "id", "post_id" FROM "post_app_post_views";
DROP TABLE "post_app_post_views";
ALTER TABLE "new_post_app_post_views" RENAME TO "post_app_post_views";
CREATE UNIQUE INDEX "post_app_post_views_post_id_profile_id_key" ON "post_app_post_views"("post_id", "profile_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
