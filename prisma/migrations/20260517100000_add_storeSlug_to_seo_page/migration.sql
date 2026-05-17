DROP PROCEDURE IF EXISTS add_col_if_not_exists;
CREATE PROCEDURE add_col_if_not_exists() BEGIN IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'SeoPage' AND COLUMN_NAME = 'storeSlug') THEN ALTER TABLE SeoPage ADD COLUMN storeSlug VARCHAR(191) NOT NULL DEFAULT 'casadosoftware'; END IF; END;
CALL add_col_if_not_exists();
DROP PROCEDURE IF EXISTS add_col_if_not_exists;
DROP INDEX IF EXISTS SeoPage_locale_slug_key ON SeoPage;
CREATE UNIQUE INDEX SeoPage_storeSlug_locale_slug_key ON SeoPage(storeSlug, locale, slug);
CREATE INDEX SeoPage_storeSlug_locale_status_idx ON SeoPage(storeSlug, locale, status);
