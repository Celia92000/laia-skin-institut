import { getPrismaClient } from '../src/lib/prisma';

const defaultTemplates = [
  {
    name: 'Bienvenue',
    subject: 'Bienvenue chez LAIA SKIN Institut',
    category: 'general',
    content: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #d4b5a0, #c9a084); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 400; letter-spacing: 2px;">LAIA SKIN INSTITUT</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; font-size: 22px;">Bonjour {name},</h2>
          <p style="color: #666; line-height: 1.6;">Bienvenue chez LAIA SKIN Institut ! Je suis ravie de vous accueillir.</p>
          <p style="color: #666; line-height: 1.6;">Notre institut vous propose des soins personnalisés et de haute qualité pour sublimer votre peau.</p>
          <div style="background: #fdfbf7; padding: 20px; border-left: 4px solid #d4b5a0; margin: 20px 0; border-radius: 4px;">
            <p style="color: #d4b5a0; font-weight: bold; margin: 0 0 10px 0;">Votre cadeau de bienvenue</p>
            <p style="color: #2c3e50; font-size: 18px; font-weight: bold; margin: 0;">-15% sur votre premier soin</p>
          </div>
          <p style="color: #666; line-height: 1.6; margin-top: 20px;">N'hésitez pas à prendre rendez-vous dès maintenant.</p>
          <p style="color: #2c3e50; margin-top: 30px;">À très bientôt,<br><strong>Laia</strong></p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">LAIA SKIN INSTITUT<br>Allée Jean de la Fontaine, 92000 Nanterre<br>Tel: 06 83 71 70 50</p>
          </div>
        </div>
      </div>
    `
  },
  {
    name: 'Offre promotionnelle',
    subject: 'Offre spéciale pour vous',
    category: 'promotion',
    content: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #d4b5a0, #c9a084); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 400; letter-spacing: 2px;">LAIA SKIN INSTITUT</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; font-size: 22px;">Bonjour {name},</h2>
          <p style="color: #666; line-height: 1.6;">J'ai le plaisir de vous proposer une offre exclusive !</p>
          <div style="background: linear-gradient(135deg, #fff0e6, #ffe6d9); border: 2px solid #d4b5a0; padding: 25px; margin: 20px 0; border-radius: 8px; text-align: center;">
            <p style="color: #d4b5a0; font-weight: bold; font-size: 18px; margin: 0 0 10px 0;">Offre Exclusive</p>
            <p style="color: #2c3e50; font-size: 24px; font-weight: bold; margin: 10px 0;">-20% sur votre prochain soin</p>
            <p style="color: #666; font-size: 14px; margin: 10px 0 0 0;">Valable jusqu'au [DATE]</p>
          </div>
          <p style="color: #666; line-height: 1.6;">Réservez vite votre rendez-vous au 06 83 71 70 50</p>
          <p style="color: #2c3e50; margin-top: 30px;">À très bientôt,<br><strong>Laia</strong></p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">LAIA SKIN INSTITUT<br>Allée Jean de la Fontaine, 92000 Nanterre<br>Tel: 06 83 71 70 50</p>
          </div>
        </div>
      </div>
    `
  },
  {
    name: 'Anniversaire',
    subject: 'Joyeux anniversaire {name}',
    category: 'special',
    content: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #d4b5a0, #c9a084); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 400; letter-spacing: 2px;">LAIA SKIN INSTITUT</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; font-size: 22px; text-align: center;">Joyeux anniversaire {name} !</h2>
          <p style="color: #666; line-height: 1.6; text-align: center;">En ce jour spécial, toute l'équipe LAIA SKIN vous souhaite un merveilleux anniversaire.</p>
          <div style="background: linear-gradient(135deg, #ffe0f0, #ffc0e0); border: 2px solid #ff69b4; padding: 25px; margin: 20px 0; border-radius: 8px; text-align: center;">
            <p style="color: #e91e63; font-weight: bold; font-size: 18px; margin: 0 0 10px 0;">Votre cadeau d'anniversaire</p>
            <p style="color: #2c3e50; font-size: 24px; font-weight: bold; margin: 10px 0;">-15% sur tous nos soins</p>
            <p style="color: #666; font-size: 14px; margin: 10px 0 0 0;">Valable tout le mois de votre anniversaire</p>
          </div>
          <p style="color: #666; line-height: 1.6; text-align: center;">Venez vous faire chouchouter !</p>
          <p style="color: #2c3e50; margin-top: 30px; text-align: center;">Avec toute ma bienveillance,<br><strong>Laia</strong></p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">LAIA SKIN INSTITUT<br>Allée Jean de la Fontaine, 92000 Nanterre<br>Tel: 06 83 71 70 50</p>
          </div>
        </div>
      </div>
    `
  },
  {
    name: 'Réactivation',
    subject: 'Vous nous manquez {name}',
    category: 'followup',
    content: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #d4b5a0, #c9a084); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 400; letter-spacing: 2px;">LAIA SKIN INSTITUT</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; font-size: 22px;">Chère {name},</h2>
          <p style="color: #666; line-height: 1.6;">Cela fait maintenant quelque temps que nous ne nous sommes pas vues, et vous me manquez !</p>
          <div style="background: linear-gradient(135deg, #e6f3ff, #cce7ff); border: 2px solid #4a90e2; padding: 25px; margin: 20px 0; border-radius: 8px; text-align: center;">
            <p style="color: #4a90e2; font-weight: bold; font-size: 18px; margin: 0 0 10px 0;">Pour vous faire revenir</p>
            <p style="color: #2c3e50; font-size: 24px; font-weight: bold; margin: 10px 0;">-15% sur votre prochain soin</p>
            <p style="color: #666; font-size: 14px; margin: 10px 0 0 0;">+ Diagnostic de peau OFFERT</p>
          </div>
          <p style="color: #666; line-height: 1.6;">N'hésitez pas à me contacter. Je serai ravie d'adapter mes soins à vos attentes.</p>
          <p style="color: #2c3e50; margin-top: 30px;">En espérant vous revoir très bientôt,<br><strong>Laia</strong></p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">LAIA SKIN INSTITUT<br>Allée Jean de la Fontaine, 92000 Nanterre<br>Tel: 06 83 71 70 50</p>
          </div>
        </div>
      </div>
    `
  }
];

async function initTemplates() {
  const prisma = await getPrismaClient();

  try {
    console.log('🚀 Initialisation des templates par défaut...');

    // Vérifier si des templates existent déjà
    const existingTemplates = await prisma.emailTemplate.count();

    if (existingTemplates > 0) {
      console.log(`⚠️  ${existingTemplates} templates déjà présents. Voulez-vous les remplacer ? (Ctrl+C pour annuler)`);
      // Dans un vrai script, on attendrait une confirmation
    }

    // Créer les templates
    for (const template of defaultTemplates) {
      await prisma.emailTemplate.create({
        data: template
      });
      console.log(`✅ Template "${template.name}" créé`);
    }

    console.log('🎉 Tous les templates ont été initialisés !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initTemplates();
