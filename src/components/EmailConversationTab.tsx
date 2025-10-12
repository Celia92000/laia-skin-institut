'use client';

import { useState, useEffect } from 'react';
import { Mail, Send, Search, Inbox, Clock, CheckCircle, AlertCircle, Reply, User, Calendar, FileText, ChevronDown, RefreshCw, Download, Trash2, Archive, ArchiveRestore, Settings, Plus, Edit, X } from 'lucide-react';

interface Email {
  id: string;
  to: string;
  from: string;
  subject: string;
  content: string;
  template?: string;
  status: string;
  direction?: string;
  errorMessage?: string;
  userId?: string;
  campaignId?: string;
  openedAt?: string;
  clickedAt?: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  subject: string;
  participants: string[];
  lastMessage: Email;
  emails: Email[];
  unread: boolean;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Bienvenue',
    subject: 'Bienvenue chez LAIA SKIN Institut',
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
    `,
    category: 'general'
  },
  {
    id: 'appointment-reminder',
    name: 'Rappel RDV',
    subject: 'Rappel : Votre rendez-vous chez LAIA SKIN',
    content: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #d4b5a0, #c9a084); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 400; letter-spacing: 2px;">LAIA SKIN INSTITUT</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; font-size: 22px;">Bonjour {name},</h2>
          <p style="color: #666; line-height: 1.6;">Je vous rappelle avec plaisir votre rendez-vous.</p>

          <div style="background: #fdfbf7; padding: 20px; border: 2px solid #d4b5a0; margin: 20px 0; border-radius: 8px; text-align: center;">
            <p style="color: #d4b5a0; font-weight: bold; margin: 0 0 10px 0;">Votre rendez-vous</p>
            <p style="color: #2c3e50; font-size: 16px; margin: 5px 0;"><strong>Date:</strong> {date}</p>
          </div>

          <p style="color: #666; line-height: 1.6;">J'ai hâte de vous retrouver !</p>
          <p style="color: #999; font-size: 14px; margin-top: 20px;">En cas d'empêchement, merci de me prévenir au moins 24h à l'avance au 06 83 71 70 50</p>
          <p style="color: #2c3e50; margin-top: 30px;">À bientôt,<br><strong>Laia</strong></p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">LAIA SKIN INSTITUT<br>Allée Jean de la Fontaine, 92000 Nanterre<br>Tel: 06 83 71 70 50</p>
          </div>
        </div>
      </div>
    `,
    category: 'appointment'
  },
  {
    id: 'thank-you',
    name: 'Remerciement',
    subject: 'Merci pour votre visite',
    content: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #d4b5a0, #c9a084); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 400; letter-spacing: 2px;">LAIA SKIN INSTITUT</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; font-size: 22px;">Bonjour {name},</h2>
          <p style="color: #666; line-height: 1.6;">Merci d'avoir choisi LAIA SKIN Institut pour votre soin.</p>
          <p style="color: #666; line-height: 1.6;">J'espère que vous avez passé un moment agréable et que les résultats répondent à vos attentes.</p>

          <div style="background: #f0f8ff; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <p style="color: #2c3e50; font-weight: bold; margin: 0 0 10px 0;">Votre avis compte</p>
            <p style="color: #666; font-size: 14px; margin: 0;">N'hésitez pas à me faire part de vos retours ou à prendre rendez-vous pour votre prochain soin.</p>
          </div>

          <p style="color: #2c3e50; margin-top: 30px;">À très bientôt,<br><strong>Laia</strong></p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">LAIA SKIN INSTITUT<br>Allée Jean de la Fontaine, 92000 Nanterre<br>Tel: 06 83 71 70 50</p>
          </div>
        </div>
      </div>
    `,
    category: 'followup'
  },
  {
    id: 'promo',
    name: 'Offre promotionnelle',
    subject: 'Offre spéciale pour vous',
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
    `,
    category: 'promotion'
  },
  {
    id: 'birthday',
    name: 'Anniversaire',
    subject: 'Joyeux anniversaire {name}',
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
    `,
    category: 'special'
  }
];

interface Client {
  id: string;
  name: string;
  email: string;
}

export default function EmailConversationTab() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'inbox' | 'sent'>('all');
  const [replyContent, setReplyContent] = useState('');
  const [sending, setSending] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [newEmail, setNewEmail] = useState({ to: '', subject: '', content: '' });
  const [showTemplates, setShowTemplates] = useState(false);
  const [showNewEmailTemplates, setShowNewEmailTemplates] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{success: boolean; message: string} | null>(null);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [showClientList, setShowClientList] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>(EMAIL_TEMPLATES);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({ name: '', subject: '', content: '', category: 'general' });

  useEffect(() => {
    loadEmails();
    loadClients();
  }, []);

  useEffect(() => {
    loadEmails();
  }, [showArchived]);

  const loadClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/clients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data.map((client: any) => ({
          id: client.id,
          name: client.name,
          email: client.email
        })));
      }
    } catch (error) {
      console.error('Erreur chargement clients:', error);
    }
  };

  useEffect(() => {
    // Grouper les emails en conversations
    if (emails.length > 0) {
      const convMap = new Map<string, Conversation>();

      emails.forEach(email => {
        // Normaliser les adresses email pour identifier le client
        const institutEmails = ['contact@laiaskininstitut.fr', 'contact@laia.skininstitut.fr', 'système@laiaskininstitut.fr'];
        const clientEmail = institutEmails.includes(email.from.toLowerCase()) ? email.to : email.from;

        // Créer une clé basée uniquement sur l'email du client
        const key = clientEmail.toLowerCase();

        if (!convMap.has(key)) {
          // Première conversation avec ce client
          convMap.set(key, {
            id: key,
            subject: clientEmail.split('@')[0].replace('.', ' ').replace('_', ' '),
            participants: [clientEmail],
            lastMessage: email,
            emails: [email],
            unread: false
          });
        } else {
          // Ajouter à la conversation existante
          const conv = convMap.get(key)!;
          conv.emails.push(email);
          // Garder le message le plus récent
          if (new Date(email.createdAt) > new Date(conv.lastMessage.createdAt)) {
            conv.lastMessage = email;
            // Mettre à jour le sujet avec le dernier sujet si différent
            conv.subject = `Conversation avec ${clientEmail}`;
          }
        }
      });

      // Trier les emails dans chaque conversation par date
      convMap.forEach(conv => {
        conv.emails.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      });

      // Convertir en array et trier par date du dernier message
      const convArray = Array.from(convMap.values());
      convArray.sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());

      setConversations(convArray);
    }
  }, [emails]);

  // Resélectionner la conversation quand les conversations sont mises à jour
  useEffect(() => {
    if (selectedConvId && conversations.length > 0) {
      const updatedConv = conversations.find(c => c.id === selectedConvId);
      if (updatedConv) {
        setSelectedConversation(updatedConv);
        setSelectedConvId(null); // Réinitialiser
      }
    }
  }, [conversations, selectedConvId]);

  const loadEmails = async () => {
    try {
      const response = await fetch('/api/admin/emails');
      const data = await response.json();

      if (Array.isArray(data)) {
        // Filtrer les emails archivés sauf si showArchived est true
        const filteredEmails = showArchived
          ? data
          : data.filter((email: any) => !email.archived);
        setEmails(filteredEmails);
      } else {
        console.error('Format de données inattendu:', data);
        setEmails([]);
      }
    } catch (error) {
      console.error('Erreur chargement emails:', error);
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  const archiveConversation = async (archived: boolean) => {
    if (!selectedConversation) return;

    setArchiving(true);
    try {
      // Récupérer tous les IDs des emails de la conversation
      const emailIds = selectedConversation.emails.map(e => e.id);

      const response = await fetch('/api/admin/emails/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailIds, archived })
      });

      if (response.ok) {
        // Recharger les emails
        await loadEmails();
        // Fermer la conversation si on archive
        if (archived) {
          setSelectedConversation(null);
        }
      } else {
        alert(`Erreur lors de l'${archived ? 'archivage' : 'désarchivage'}`);
      }
    } catch (error) {
      console.error('Erreur archivage:', error);
      alert(`Erreur lors de l'${archived ? 'archivage' : 'désarchivage'}`);
    } finally {
      setArchiving(false);
    }
  };

  const syncEmailsFromMailbox = async () => {
    setSyncing(true);
    setSyncStatus(null);

    try {
      const response = await fetch('/api/admin/emails/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: 30 }) // Synchroniser les 30 derniers jours
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSyncStatus({
          success: true,
          message: `✅ Synchronisation réussie ! ${data.emailCount || 0} emails dans l'historique.`
        });
        // Recharger les emails
        await loadEmails();
      } else {
        setSyncStatus({
          success: false,
          message: data.message || 'Erreur de synchronisation. Vérifiez que EMAIL_PASSWORD est configuré dans .env.local'
        });
      }
    } catch (error) {
      console.error('Erreur sync:', error);
      setSyncStatus({
        success: false,
        message: 'Erreur de connexion. Vérifiez votre configuration email.'
      });
    } finally {
      setSyncing(false);
      // Masquer le message après 5 secondes
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  const deleteEmail = async (emailId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet email ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/emails/${emailId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Sauvegarder l'ID de la conversation
        if (selectedConversation) {
          setSelectedConvId(selectedConversation.id);
        }
        // Recharger les emails
        await loadEmails();
      } else {
        alert('Erreur lors de la suppression de l\'email');
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const sendReply = async () => {
    if (!selectedConversation || !replyContent.trim()) return;

    setSending(true);
    try {
      const lastEmail = selectedConversation.lastMessage;
      const replyTo = lastEmail.direction === 'incoming' ? lastEmail.from : lastEmail.to;

      const response = await fetch('/api/admin/emails/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          replyContent,
          to: replyTo,
          subject: `Re: ${selectedConversation.subject}`
        })
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Email envoyé avec succès:', responseData);

        setReplyContent('');
        // Sauvegarder l'ID de la conversation actuelle pour la resélectionner
        setSelectedConvId(selectedConversation.id);

        // Recharger les emails - le useEffect se chargera de resélectionner la conversation
        await loadEmails();
      } else {
        alert('Erreur lors de l\'envoi de l\'email');
      }
    } catch (error) {
      console.error('Erreur envoi réponse:', error);
      alert('Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const sendNewEmail = async () => {
    if (!newEmail.to || !newEmail.subject || !newEmail.content) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/emails/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          to: newEmail.to,
          subject: newEmail.subject,
          replyContent: newEmail.content
        })
      });

      if (response.ok) {
        alert('✅ Email envoyé avec succès !');
        setNewEmail({ to: '', subject: '', content: '' });
        setShowCompose(false);
        await loadEmails();
      } else {
        const error = await response.json();
        alert(`❌ Erreur d'envoi : ${error.message || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur envoi email:', error);
      alert('❌ Erreur lors de l\'envoi de l\'email');
    } finally {
      setSending(false);
    }
  };

  const loadTemplateToReply = (template: EmailTemplate) => {
    const clientEmail = selectedConversation?.participants[0] || '';
    const clientName = clientEmail.split('@')[0].replace('.', ' ');
    let content = template.content
      .replace(/{name}/g, clientName)
      .replace(/{date}/g, new Date().toLocaleDateString('fr-FR'))
      .replace(/{points}/g, '0');

    // Convertir le HTML en texte simple pour la zone de réponse
    const textContent = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
    setReplyContent(textContent);
    setShowTemplates(false);
  };

  const loadTemplateToNewEmail = (template: EmailTemplate) => {
    // Convertir le HTML en texte simple pour la zone de texte
    const textContent = template.content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
    setNewEmail({
      ...newEmail,
      subject: template.subject,
      content: textContent
    });
    setShowNewEmailTemplates(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = searchTerm === '' || 
      conv.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.participants.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filter === 'all' || 
      (filter === 'inbox' && conv.lastMessage.direction === 'incoming') ||
      (filter === 'sent' && conv.lastMessage.direction === 'outgoing');
    
    return matchesSearch && matchesFilter;
  });

  // Fonctions de gestion des templates
  const handleSaveTemplate = () => {
    if (!templateForm.name || !templateForm.subject || !templateForm.content) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    if (editingTemplate) {
      // Modifier un template existant
      setTemplates(templates.map(t =>
        t.id === editingTemplate.id
          ? { ...templateForm, id: editingTemplate.id }
          : t
      ));
    } else {
      // Créer un nouveau template
      const newTemplate: EmailTemplate = {
        ...templateForm,
        id: `custom-${Date.now()}`
      };
      setTemplates([...templates, newTemplate]);
    }

    // Réinitialiser le formulaire
    setTemplateForm({ name: '', subject: '', content: '', category: 'general' });
    setEditingTemplate(null);
    alert(editingTemplate ? 'Template modifié avec succès!' : 'Template créé avec succès!');
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      content: template.content,
      category: template.category
    });
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
      setTemplates(templates.filter(t => t.id !== templateId));
      if (editingTemplate?.id === templateId) {
        setEditingTemplate(null);
        setTemplateForm({ name: '', subject: '', content: '', category: 'general' });
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingTemplate(null);
    setTemplateForm({ name: '', subject: '', content: '', category: 'general' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-160px)] flex">
      {/* Sidebar - Liste des conversations */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header avec recherche */}
        <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Inbox className="w-4 h-4 text-purple-600" />
              Messages
            </h2>
            <div className="flex gap-1.5">
              <button
                onClick={() => setShowTemplateManager(true)}
                className="p-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                title="Gérer les templates"
              >
                <Settings className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={syncEmailsFromMailbox}
                disabled={syncing}
                className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                title="Synchroniser avec la boîte mail"
              >
                {syncing ? (
                  <Clock className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                onClick={() => setShowCompose(true)}
                className="p-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                title="Nouveau message"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setShowArchived(!showArchived)}
                className={`p-1.5 rounded-md transition-colors ${
                  showArchived
                    ? 'bg-gray-700 text-white hover:bg-gray-800'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title={showArchived ? 'Masquer les archives' : 'Afficher les archives'}
              >
                {showArchived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Message de statut de synchronisation */}
          {syncStatus && (
            <div className={`mb-2 p-1.5 rounded text-xs ${
              syncStatus.success
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {syncStatus.message}
            </div>
          )}

          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher..."
              className="pl-8 pr-2 py-1.5 w-full border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-1 px-2 text-xs rounded-md font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilter('inbox')}
              className={`flex-1 py-1 px-2 text-xs rounded-md font-medium transition-colors ${
                filter === 'inbox'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Reçus
            </button>
            <button
              onClick={() => setFilter('sent')}
              className={`flex-1 py-1 px-2 text-xs rounded-md font-medium transition-colors ${
                filter === 'sent'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Envoyés
            </button>
          </div>
        </div>

        {/* Liste des conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className={`p-2.5 border-b border-gray-100 cursor-pointer transition-colors ${
                selectedConversation?.id === conv.id
                  ? 'bg-purple-50 border-l-2 border-l-purple-600'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center flex-1 min-w-0">
                  <div className="w-7 h-7 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                    <User className="h-3.5 w-3.5 text-purple-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {conv.participants.find(p => p !== 'contact@laiaskininstitut.fr') || conv.participants[0]}
                    </p>
                    <p className="text-xs text-gray-600 truncate">{conv.subject}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{formatDate(conv.lastMessage.createdAt)}</span>
              </div>
              <p className="text-xs text-gray-500 truncate pl-9">
                {conv.lastMessage.content.replace(/<[^>]*>/g, '').substring(0, 80)}...
              </p>
            </div>
          ))}
          
          {filteredConversations.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <Mail className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Aucun message</p>
            </div>
          )}
        </div>
      </div>

      {/* Zone de conversation */}
      <div className="flex-1 flex flex-col min-h-0">
        {selectedConversation ? (
          <>
            {/* Header de la conversation */}
            <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 truncate">{selectedConversation.subject}</h3>
                  <p className="text-xs text-gray-600 truncate">
                    {selectedConversation.participants.find(p => p !== 'contact@laiaskininstitut.fr') || selectedConversation.participants[0]}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 ml-3">
                  <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded-full">
                    {selectedConversation.emails.length}
                  </span>
                  <button
                    onClick={async () => {
                      setSelectedConvId(selectedConversation.id);
                      await loadEmails();
                    }}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    title="Actualiser la conversation"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      const isArchived = selectedConversation.emails.some(e => (e as any).archived);
                      archiveConversation(!isArchived);
                    }}
                    disabled={archiving}
                    className="p-1.5 text-gray-600 hover:bg-orange-100 rounded-md transition-colors disabled:opacity-50"
                    title={selectedConversation.emails.some(e => (e as any).archived) ? "Désarchiver" : "Archiver"}
                  >
                    {selectedConversation.emails.some(e => (e as any).archived) ? (
                      <ArchiveRestore className="h-3.5 w-3.5" />
                    ) : (
                      <Archive className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
              {selectedConversation.emails.map((email, index) => {
                const isOutgoing = email.direction === 'outgoing' || email.from === 'contact@laiaskininstitut.fr';

                return (
                  <div key={email.id} className={`mb-2.5 ${isOutgoing ? 'flex justify-end' : ''}`}>
                    <div className={`max-w-2xl ${isOutgoing ? 'bg-purple-600 text-white' : 'bg-white'} rounded-lg p-3 shadow-sm relative group`}>
                      <div className={`flex items-center justify-between mb-1.5 ${isOutgoing ? 'text-purple-100' : 'text-gray-500'} text-xs`}>
                        <span className="font-medium text-xs">{isOutgoing ? 'LAIA SKIN' : email.from.split('@')[0]}</span>
                        <div className="flex items-center gap-1.5">
                          {getStatusIcon(email.status)}
                          <span className="text-xs">{new Date(email.createdAt).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteEmail(email.id);
                            }}
                            className={`opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-500/20 ${isOutgoing ? 'text-white hover:text-red-200' : 'text-gray-500 hover:text-red-600'}`}
                            title="Supprimer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <div
                        className={`text-xs leading-relaxed ${isOutgoing ? 'text-white' : 'text-gray-800'}`}
                        dangerouslySetInnerHTML={{ __html: email.content }}
                      />
                      {email.errorMessage && (
                        <div className="mt-1.5 p-1.5 bg-red-100 text-red-700 rounded text-xs">
                          Erreur: {email.errorMessage}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Zone de réponse */}
            <div className="p-3 border-t border-gray-200 bg-white">
              {/* Templates dropdown */}
              {showTemplates && (
                <div className="mb-2 bg-gray-50 border border-gray-200 rounded-md p-2 max-h-40 overflow-y-auto">
                  <div className="text-xs font-semibold text-gray-700 mb-1.5">Templates :</div>
                  <div className="space-y-0.5">
                    {templates.map(template => (
                      <button
                        key={template.id}
                        onClick={() => loadTemplateToReply(template)}
                        className="w-full text-left px-2 py-1.5 text-xs hover:bg-purple-100 rounded transition-colors flex items-center gap-1.5"
                      >
                        <FileText className="w-3 h-3 text-purple-600" />
                        <span className="font-medium">{template.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-1.5">
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  title="Utiliser un template"
                >
                  <FileText className="h-3.5 w-3.5 text-gray-600" />
                </button>
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendReply()}
                  placeholder="Votre réponse..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                  disabled={sending}
                />
                <button
                  onClick={sendReply}
                  disabled={sending || !replyContent.trim()}
                  className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : showCompose ? (
          // Interface de composition d'un nouveau message
          <div className="flex-1 flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white flex-shrink-0">
              <h3 className="text-base font-semibold text-gray-900">📧 Nouveau mail</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3 max-w-3xl mx-auto">
              {/* Bouton pour afficher les templates */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowNewEmailTemplates(!showNewEmailTemplates)}
                  className="px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 flex items-center gap-2 text-sm font-medium"
                >
                  <FileText className="w-4 h-4" />
                  {showNewEmailTemplates ? 'Masquer les templates' : 'Utiliser un template'}
                  <ChevronDown className={`w-3 h-3 transition-transform ${showNewEmailTemplates ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Templates liste */}
              {showNewEmailTemplates && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-sm font-semibold text-purple-900 mb-3">Choisir un template :</div>
                  <div className="grid grid-cols-2 gap-2">
                    {templates.map(template => (
                      <button
                        key={template.id}
                        onClick={() => loadTemplateToNewEmail(template)}
                        className="text-left px-3 py-2 bg-white border border-purple-200 hover:border-purple-400 rounded-lg transition-colors"
                      >
                        <div className="font-medium text-sm text-purple-900">{template.name}</div>
                        <div className="text-xs text-purple-600 truncate">{template.subject}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">À:</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="email"
                      value={newEmail.to}
                      onChange={(e) => setNewEmail({...newEmail, to: e.target.value})}
                      onFocus={() => setShowClientList(true)}
                      onBlur={() => setTimeout(() => setShowClientList(false), 200)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="email@exemple.com ou choisir un client"
                    />
                    {showClientList && clients.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-2">
                          <div className="text-xs font-medium text-gray-500 mb-2 px-2">Clients :</div>
                          {clients
                            .filter(client =>
                              !newEmail.to ||
                              client.name.toLowerCase().includes(newEmail.to.toLowerCase()) ||
                              client.email.toLowerCase().includes(newEmail.to.toLowerCase())
                            )
                            .map(client => (
                              <button
                                key={client.id}
                                onClick={() => {
                                  setNewEmail({...newEmail, to: client.email});
                                  setShowClientList(false);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-purple-50 rounded-lg transition-colors"
                              >
                                <div className="font-medium text-sm">{client.name}</div>
                                <div className="text-xs text-gray-600">{client.email}</div>
                              </button>
                            ))
                          }
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowClientList(!showClientList)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Clients
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sujet:</label>
                <input
                  type="text"
                  value={newEmail.subject}
                  onChange={(e) => setNewEmail({...newEmail, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Objet du message"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message:</label>
                <textarea
                  value={newEmail.content}
                  onChange={(e) => setNewEmail({...newEmail, content: e.target.value})}
                  rows={15}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-y"
                  placeholder="Votre message..."
                  style={{ minHeight: '200px' }}
                />
              </div>

              <div className="flex space-x-3 pt-6 pb-8 sticky bottom-0 bg-white border-t border-gray-200 mt-4 -mx-6 px-6 py-4">
                <button
                  onClick={sendNewEmail}
                  disabled={sending || !newEmail.to || !newEmail.subject || !newEmail.content}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 font-medium"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Envoyer
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowCompose(false);
                    setNewEmail({ to: '', subject: '', content: '' });
                    setShowClientList(false);
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
              </div>
            </div>
          </div>
        ) : (
          // État vide
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Inbox className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Sélectionnez une conversation pour voir les messages</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de gestion des templates */}
      {showTemplateManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Settings className="w-6 h-6 text-purple-600" />
                  Gestion des Templates
                </h2>
                <button
                  onClick={() => {
                    setShowTemplateManager(false);
                    handleCancelEdit();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Liste des templates */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Vos templates</h3>
                    <button
                      onClick={() => {
                        setEditingTemplate(null);
                        setTemplateForm({ name: '', subject: '', content: '', category: 'general' });
                      }}
                      className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Nouveau
                    </button>
                  </div>

                  <div className="space-y-2">
                    {templates.map(template => (
                      <div
                        key={template.id}
                        className={`p-4 border rounded-lg transition-all ${
                          editingTemplate?.id === template.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{template.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{template.subject}</p>
                            <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                              {template.category}
                            </span>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <button
                              onClick={() => handleEditTemplate(template)}
                              className="p-1.5 hover:bg-purple-100 rounded transition-colors"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4 text-purple-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="p-1.5 hover:bg-red-100 rounded transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Formulaire d'édition */}
                <div className="border-l border-gray-200 pl-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {editingTemplate ? 'Modifier le template' : 'Nouveau template'}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom du template
                      </label>
                      <input
                        type="text"
                        value={templateForm.name}
                        onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Ex: Bienvenue, Promotion..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catégorie
                      </label>
                      <select
                        value={templateForm.category}
                        onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="general">Général</option>
                        <option value="appointment">Rendez-vous</option>
                        <option value="followup">Suivi</option>
                        <option value="promotion">Promotion</option>
                        <option value="special">Spécial</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sujet de l'email
                      </label>
                      <input
                        type="text"
                        value={templateForm.subject}
                        onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Ex: Bienvenue chez LAIA SKIN"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Utilisez {'{name}'} pour personnaliser avec le nom du client
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contenu (HTML)
                      </label>
                      <textarea
                        value={templateForm.content}
                        onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                        rows={12}
                        placeholder="Contenu HTML du template..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Variables disponibles : {'{name}'}, {'{date}'}, {'{service}'}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <button
                        onClick={handleSaveTemplate}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                      >
                        {editingTemplate ? 'Modifier' : 'Créer'} le template
                      </button>
                      {editingTemplate && (
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Annuler
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}