// Configuration pour l'envoi d'emails personnalisés avec EmailJS
// IMPORTANT: Pour les emails personnalisés, nous devons créer un template générique dans EmailJS

export async function sendCustomEmail(
  to: string,
  subject: string,
  message: string,
  clientName: string
) {
  // Pour l'instant, on utilise une approche différente
  // On va créer un template HTML simple directement
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">LAIA SKIN Institut</h1>
        </div>
        <div class="content">
          <p>${message.replace(/\n/g, '<br>')}</p>
        </div>
        <div class="footer">
          <p>LAIA SKIN Institut<br>
          contact@laia.skininstitut.fr<br>
          06 12 34 56 78</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Pour les messages personnalisés, on utilise le template de confirmation
  // mais on remplace complètement le contenu
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      service_id: 'default_service',
      template_id: 'template_myu4emv', // Template de confirmation
      user_id: 'QK6MriGN3B0UqkIoS',
      template_params: {
        to_email: to,
        client_name: clientName,
        appointment_date: '', // Vide pour message personnalisé
        appointment_time: '',
        service_name: subject, // Le sujet devient le "service"
        salon_name: 'LAIA SKIN Institut',
        salon_address: message, // Le message complet dans l'adresse
        // Alternative: utiliser un champ message si disponible
        message: message,
        subject: subject,
        from_name: 'LAIA SKIN Institut',
        reply_to: 'contact@laia.skininstitut.fr'
      }
    })
  });

  return response;
}

// Configuration pour les différents types d'emails
export const EMAIL_TEMPLATES = {
  CUSTOM: {
    id: 'custom',
    name: 'Message personnalisé',
    description: 'Email personnalisé sans template prédéfini'
  },
  CONFIRMATION: {
    id: 'template_myu4emv',
    name: 'Confirmation de réservation',
    description: 'Confirmation automatique après réservation',
    fields: ['client_name', 'appointment_date', 'appointment_time', 'service_name']
  },
  REVIEW: {
    id: 'template_36zodeb',
    name: 'Demande d\'avis',
    description: 'Demande d\'avis avec programme fidélité',
    fields: ['client_name', 'service_name', 'review_link', 'loyalty_progress', 'next_reward']
  }
};

// Helper pour déterminer quel template utiliser
export function getTemplateForEmail(type: string) {
  switch (type) {
    case 'confirmation':
      return EMAIL_TEMPLATES.CONFIRMATION;
    case 'review':
      return EMAIL_TEMPLATES.REVIEW;
    case 'custom':
    default:
      return EMAIL_TEMPLATES.CUSTOM;
  }
}