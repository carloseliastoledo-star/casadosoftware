-- Create ChatConversation table
CREATE TABLE `ChatConversation` (
  `id` VARCHAR(25) NOT NULL,
  `customerName` VARCHAR(255) NULL,
  `customerEmail` VARCHAR(255) NULL,
  `orderNumber` VARCHAR(255) NULL,
  `status` ENUM('AI', 'HUMAN', 'CLOSED') NOT NULL DEFAULT 'AI',
  `sourcePage` TEXT NULL,
  `userIp` VARCHAR(255) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `ChatConversation_status_idx` (`status`),
  INDEX `ChatConversation_createdAt_idx` (`createdAt`),
  INDEX `ChatConversation_updatedAt_idx` (`updatedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create ChatMessage table
CREATE TABLE `ChatMessage` (
  `id` VARCHAR(25) NOT NULL,
  `conversationId` VARCHAR(25) NOT NULL,
  `sender` ENUM('CUSTOMER', 'AI', 'AGENT', 'SYSTEM') NOT NULL,
  `content` TEXT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `ChatMessage_conversationId_idx` (`conversationId`),
  INDEX `ChatMessage_createdAt_idx` (`createdAt`),
  CONSTRAINT `ChatMessage_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `ChatConversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
