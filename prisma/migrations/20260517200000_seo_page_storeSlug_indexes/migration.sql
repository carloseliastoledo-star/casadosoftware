DROP INDEX IF EXISTS SeoPage_locale_slug_key ON SeoPage;
CREATE UNIQUE INDEX SeoPage_storeSlug_locale_slug_key ON SeoPage(storeSlug, locale, slug);
CREATE INDEX SeoPage_storeSlug_locale_status_idx ON SeoPage(storeSlug, locale, status);
