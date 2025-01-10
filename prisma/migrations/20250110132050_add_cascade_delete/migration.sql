-- DropForeignKey
ALTER TABLE `urlvisit` DROP FOREIGN KEY `UrlVisit_urlId_fkey`;

-- DropIndex
DROP INDEX `UrlVisit_urlId_fkey` ON `urlvisit`;

-- AddForeignKey
ALTER TABLE `UrlVisit` ADD CONSTRAINT `UrlVisit_urlId_fkey` FOREIGN KEY (`urlId`) REFERENCES `Url`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
