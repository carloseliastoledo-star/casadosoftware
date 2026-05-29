-- Fix NULL storeSlug in Produto table
UPDATE Produto SET storeSlug = 'casadosoftware' WHERE storeSlug IS NULL;
