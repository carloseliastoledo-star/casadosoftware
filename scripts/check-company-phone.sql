-- Verificar todos os telefones no SiteSettings
SELECT id, storeSlug, companyPhone FROM SiteSettings;

-- Atualizar todos os registros
UPDATE SiteSettings 
SET companyPhone = '+55 11 910512647' 
WHERE companyPhone != '+55 11 910512647' 
   OR companyPhone IS NULL;
