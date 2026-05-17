ALTER TABLE Cupom ADD COLUMN storeSlug VARCHAR(191) NOT NULL DEFAULT 'casadosoftware';
ALTER TABLE Cupom DROP INDEX code;
CREATE UNIQUE INDEX Cupom_storeSlug_code_key ON Cupom(storeSlug, code);
CREATE INDEX Cupom_storeSlug_idx ON Cupom(storeSlug);
