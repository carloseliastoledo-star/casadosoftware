-- AlterTable
ALTER TABLE Affiliate ADD COLUMN storeSlug VARCHAR(100) NOT NULL DEFAULT 'casadosoftware';

-- Drop the old unique constraint on email
ALTER TABLE Affiliate DROP INDEX Affiliate_email_key;

-- Add the new unique constraint on (storeSlug, email)
ALTER TABLE Affiliate ADD UNIQUE INDEX Affiliate_storeSlug_email_key(storeSlug, email);
