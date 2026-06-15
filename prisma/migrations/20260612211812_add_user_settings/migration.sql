-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL DEFAULT '',
    "businessDesc" TEXT NOT NULL DEFAULT '',
    "telegramToken" TEXT NOT NULL DEFAULT '',
    "telegramChannel" TEXT NOT NULL DEFAULT '',
    "tiktokHandle" TEXT NOT NULL DEFAULT '',
    "contentTone" TEXT NOT NULL DEFAULT 'professional',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");
