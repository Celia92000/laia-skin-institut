// Service d'envoi d'email avec EmailJS (gratuit et simple)

interface EmailJSData {
  to: string;
  clientName: string;
  date: string;
  time: string;
  services: string[];
  totalPrice: number;
  reservationId?: string;
}

export async function sendEmailWithEmailJS(data: EmailJSData): Promise<boolean> {
  try {
    // Configuration EmailJS
    const SERVICE_ID = 'default_service';
    const TEMPLATE_ID = 'template_myu4emv'; // Template de confirmation
    const PUBLIC_KEY = 'QK6MriGN3B0UqkIoS';
    
    // Préparer les données pour EmailJS
    const templateParams = {
      to_email: data.to,
      to_name: data.clientName,
      from_name: 'LAIA SKIN Institut',
      reply_to: 'contact@laia.skin.fr',
      
      // Détails de la réservation
      client_name: data.clientName,
      reservation_date: data.date,
      reservation_time: data.time,
      services_list: data.services.join(', '),
      total_price: `${data.totalPrice}€`,
      
      // Informations de l'institut
      institute_name: 'LAIA SKIN Institut',
      institute_address: '5 allée Jean de la Fontaine, 92000 Nanterre',
      institute_details: 'Bâtiment 5 - 2ème étage - Porte 523',
      institute_phone: '06 83 71 70 50',
      institute_instagram: '@laia.skin',
      
      // Message complet formaté
      message: `
Bonjour ${data.clientName},

Votre rendez-vous est confirmé !

📅 Date : ${data.date}
⏰ Heure : ${data.time}
💆 Soins : ${data.services.join(', ')}
💰 Total : ${data.totalPrice}€

📍 Adresse :
LAIA SKIN Institut
5 allée Jean de la Fontaine
92000 Nanterre
Bâtiment 5 - 2ème étage - Porte 523

À très bientôt !
Laïa
      `.trim()
    };

    // Envoyer via EmailJS
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: SERVICE_ID,
        template_id: TEMPLATE_ID,
        user_id: PUBLIC_KEY,
        template_params: templateParams
      })
    });

    if (response.ok) {
      console.log('✅ Email envoyé avec succès via EmailJS à:', data.to);
      return true;
    } else {
      const error = await response.text();
      console.error('❌ Erreur EmailJS:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    return false;
  }
}

// Configuration pour le navigateur (côté client)
export const emailJSConfig = {
  publicKey: 'QK6MriGN3B0UqkIoS',
  serviceId: 'default_service',
  templateId: 'template_myu4emv' // Template de confirmation
};