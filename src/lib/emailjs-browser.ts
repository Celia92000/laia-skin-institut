// Fonction pour envoyer des emails depuis le navigateur uniquement
// EmailJS nécessite d'être appelé depuis le navigateur, pas depuis le serveur

export async function sendEmailFromBrowser(
  to: string,
  subject: string,
  message: string,
  clientName: string,
  template: 'custom' | 'confirmation' | 'review' = 'custom'
) {
  // EmailJS doit être appelé côté client
  if (typeof window === 'undefined') {
    throw new Error('EmailJS doit être appelé depuis le navigateur');
  }

  let templateId = 'template_myu4emv'; // Par défaut
  let templateParams: any = {
    to_email: to,
    client_name: clientName,
    from_name: 'LAIA SKIN Institut',
    reply_to: 'contact@laia.skininstitut.fr'
  };

  if (template === 'custom') {
    // Pour un message personnalisé, on utilise le template confirmation
    // mais on met le message dans les bons champs
    templateParams = {
      ...templateParams,
      service_name: subject,
      appointment_date: '',
      appointment_time: '',
      salon_name: message.substring(0, 200), // Limiter la longueur
      salon_address: message.length > 200 ? message.substring(200) : ''
    };
  } else if (template === 'review') {
    templateId = 'template_36zodeb';
    templateParams = {
      ...templateParams,
      service_name: 'votre soin',
      review_link: 'https://laiaskininstitut.fr',
      loyalty_progress: '',
      next_reward: message
    };
  } else {
    // Template confirmation standard
    templateParams = {
      ...templateParams,
      service_name: subject,
      appointment_date: new Date().toLocaleDateString('fr-FR'),
      appointment_time: '',
      salon_name: 'LAIA SKIN Institut',
      salon_address: message
    };
  }

  // Appel direct à EmailJS depuis le navigateur
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': window.location.origin
    },
    body: JSON.stringify({
      service_id: 'default_service',
      template_id: templateId,
      user_id: 'QK6MriGN3B0UqkIoS',
      template_params: templateParams
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erreur EmailJS:', errorText);
    throw new Error(`Erreur envoi email: ${errorText}`);
  }

  return { success: true, message: 'Email envoyé avec succès' };
}

// Fonction pour sauvegarder dans l'historique
export async function saveEmailToHistory(
  to: string,
  subject: string,
  message: string,
  template: string,
  status: 'sent' | 'failed' = 'sent'
) {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    await fetch('/api/admin/email-history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        to,
        subject,
        content: message,
        template,
        status,
        direction: 'outgoing'
      })
    });
  } catch (error) {
    console.error('Erreur sauvegarde historique:', error);
  }
}