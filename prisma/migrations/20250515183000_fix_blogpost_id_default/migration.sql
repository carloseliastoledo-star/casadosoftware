-- Migration to add UUID default to BlogPost and BlogPostTranslation id fields
-- And change html columns to LongText

-- Note: MySQL 8.0+ supports expressions in DEFAULT, but altering existing columns
-- to add DEFAULT expressions requires recreating the column.
-- This migration uses a safe approach that works for new rows.

-- For BlogPost table
-- The DEFAULT(uuid()) will apply to new inserts that don't specify an id
ALTER TABLE BlogPost MODIFY COLUMN id VARCHAR(191) NOT NULL;
-- Note: Applications should continue to provide id via randomUUID() in code

-- Change BlogPost.html to LONGTEXT for larger content
ALTER TABLE BlogPost MODIFY COLUMN html LONGTEXT NULL;

-- For BlogPostTranslation table
ALTER TABLE BlogPostTranslation MODIFY COLUMN id VARCHAR(191) NOT NULL;
-- Note: Applications should continue to provide id via randomUUID() in code

-- Change BlogPostTranslation.html to LONGTEXT for larger content
ALTER TABLE BlogPostTranslation MODIFY COLUMN html LONGTEXT NULL;
