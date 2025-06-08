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
    "signatureUrl" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "blockedById" INTEGER,
    CONSTRAINT "User_blockedById_fkey" FOREIGN KEY ("blockedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("aboutMe", "avatarUrl", "birthDate", "createdAt", "email", "firstName", "id", "isOnline", "lastName", "password", "signatureUrl", "updatedAt", "username") SELECT "aboutMe", "avatarUrl", "birthDate", "createdAt", "email", "firstName", "id", "isOnline", "lastName", "password", "signatureUrl", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
