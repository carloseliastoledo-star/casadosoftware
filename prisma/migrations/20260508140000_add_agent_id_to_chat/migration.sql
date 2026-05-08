-- Add agentId field to ChatConversation table
ALTER TABLE `ChatConversation` ADD COLUMN `agentId` VARCHAR(25) NULL AFTER `userIp`;
CREATE INDEX ChatConversation_agentId_idx ON ChatConversation(agentId);
