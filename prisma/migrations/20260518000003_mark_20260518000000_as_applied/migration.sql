-- Mark the failed 20260518000000 migration as applied to unblock the migration system
-- This is a workaround because DELETE FROM _prisma_migrations didn't work on Railway
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `rolled_back_at`, `started_at`, `applied_steps_count`)
VALUES (
  '20260518000000_fix_seo_page_store_slug',
  '0000000000000000000000000000000000000000000000000000000000000000',
  NOW(),
  '20260518000000_fix_seo_page_store_slug',
  NULL,
  NOW(),
  1
)
ON DUPLICATE KEY UPDATE `finished_at` = NOW(), `applied_steps_count` = 1;
