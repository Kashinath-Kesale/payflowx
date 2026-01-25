/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `merchants` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "merchants_name_key" ON "merchants"("name");
