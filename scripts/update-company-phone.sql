-- Atualizar telefone institucional no SiteSettings
UPDATE SiteSettings 
SET companyPhone = '+55 11 910512647' 
WHERE companyPhone = '+55 11 91069-1485' 
   OR companyPhone IS NULL;
