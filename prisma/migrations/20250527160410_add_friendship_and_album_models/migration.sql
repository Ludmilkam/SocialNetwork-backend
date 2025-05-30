-- CreateTable
CREATE TABLE "Album" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    CONSTRAINT "Album_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserFriend" (
    "fromUserId" INTEGER NOT NULL,
    "toUserId" INTEGER NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("fromUserId", "toUserId"),
    CONSTRAINT "UserFriend_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserFriend_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_MediaToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_MediaToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Media" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_MediaToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_AlbumToMedia" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_AlbumToMedia_A_fkey" FOREIGN KEY ("A") REFERENCES "Album" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AlbumToMedia_B_fkey" FOREIGN KEY ("B") REFERENCES "Media" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_MediaToUser_AB_unique" ON "_MediaToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_MediaToUser_B_index" ON "_MediaToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AlbumToMedia_AB_unique" ON "_AlbumToMedia"("A", "B");

-- CreateIndex
CREATE INDEX "_AlbumToMedia_B_index" ON "_AlbumToMedia"("B");
