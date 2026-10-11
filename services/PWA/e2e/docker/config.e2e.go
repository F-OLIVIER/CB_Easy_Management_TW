// Configuration du backend Go pour les tests e2e (remplace internal/config.go dans l'image de test).
// OWNER est relu par e2e/support/env.ts : c'est le Discord ID du compte « propriétaire » de la base de test.
package data

const PORT = "8080"
const SITE_DOMAIN = "localhost"
const ADRESS_DB = "../database/databaseGvG.db"
const OWNER = "900000000000000004"
