const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

// Configuration de la connexion
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

console.log('🔌 Connexion à la base de données...');

const sql = postgres(connectionString, {
  max: 1,
  ssl: 'require'
});

async function runMigration() {
  try {
    console.log('📖 Lecture du fichier migration.sql...');
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '..', 'migration.sql'),
      'utf8'
    );

    console.log('🚀 Exécution de la migration...\n');

    // Séparer les commandes SQL
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('SELECT'));

    for (const command of commands) {
      if (command.trim()) {
        console.log(`Exécution: ${command.substring(0, 80)}...`);
        await sql.unsafe(command);
      }
    }

    console.log('\n✅ Migration terminée avec succès!');

    // Vérification
    console.log('\n🔍 Vérification des colonnes ajoutées...');

    const serviceCheck = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Service' AND column_name = 'imageSettings'
    `;
    console.log('Service.imageSettings:', serviceCheck.length > 0 ? '✓' : '✗');

    const formationCheck = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Formation' AND column_name = 'imageSettings'
    `;
    console.log('Formation.imageSettings:', formationCheck.length > 0 ? '✓' : '✗');

    const reviewCheck = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Review' AND column_name IN ('orderId', 'itemType', 'itemId', 'itemName')
    `;
    console.log(`Review (nouvelles colonnes): ${reviewCheck.length}/4 ✓`);

    const loyaltyCheck = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'LoyaltyHistory' AND column_name = 'orderId'
    `;
    console.log('LoyaltyHistory.orderId:', loyaltyCheck.length > 0 ? '✓' : '✗');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
    console.log('\n🔒 Connexion fermée');
  }
}

runMigration();
