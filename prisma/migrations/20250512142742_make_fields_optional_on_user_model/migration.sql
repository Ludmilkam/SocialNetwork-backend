/*
  Warnings:

  - You are about to drop the column `phoneNumber` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT,
    "email" TEXT NOT NULL,
    "aboutMe" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "birthDate" DATETIME,
    "isOnline" BOOLEAN NOT NULL DEFAULT true,
    "avatarUrl" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("aboutMe", "avatarUrl", "createdAt", "email", "firstName", "id", "isOnline", "lastName", "password", "updatedAt", "username") SELECT "aboutMe", "avatarUrl", "createdAt", "email", "firstName", "id", "isOnline", "lastName", "password", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
