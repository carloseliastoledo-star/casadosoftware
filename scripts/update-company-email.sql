-- Atualizar e-mail institucional no SiteSettings
UPDATE SiteSettings 
SET companyEmail = 'comercial@casadosoftware.com.br' 
WHERE companyEmail = 'sac@mercadosoftwares.com.br' 
   OR companyEmail IS NULL;
