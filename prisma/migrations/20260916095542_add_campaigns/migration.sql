-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_restaurantId_headline_key" ON "Campaign"("restaurantId", "headline");

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
