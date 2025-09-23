-- Schéma pour l'historique des communications WhatsApp et Email
-- À ajouter à votre base de données Supabase/PostgreSQL

-- Table pour l'historique des messages WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  client_id TEXT NOT NULL,
  phone TEXT NOT NULL,
  content TEXT NOT NULL,
  template_used TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_by TEXT,
  message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table pour l'historique des emails
CREATE TABLE IF NOT EXISTS email_history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  recipient_id TEXT NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  template TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed', 'bounced')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_by TEXT,
  email_provider TEXT DEFAULT 'resend',
  message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table unifiée pour l'historique des communications (alternative)
CREATE TABLE IF NOT EXISTS communication_history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  client_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('whatsapp', 'email', 'sms')),
  content TEXT NOT NULL,
  subject TEXT,
  template_used TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed', 'bounced')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_by TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_whatsapp_history_client_id ON whatsapp_history(client_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_history_sent_at ON whatsapp_history(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_history_recipient_id ON email_history(recipient_id);
CREATE INDEX IF NOT EXISTS idx_email_history_sent_at ON email_history(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_communication_history_client_id ON communication_history(client_id);
CREATE INDEX IF NOT EXISTS idx_communication_history_sent_at ON communication_history(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_communication_history_type ON communication_history(type);

-- Ajouter des colonnes aux réservations pour tracer les communications
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS confirmation_email_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS reminder_email_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS confirmation_whatsapp_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS reminder_whatsapp_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS last_communication_at TIMESTAMP WITH TIME ZONE;

-- Vue pour un historique unifié des communications
CREATE OR REPLACE VIEW client_communications AS
SELECT 
  'whatsapp' as type,
  client_id,
  content,
  template_used,
  status,
  sent_at,
  sent_by,
  NULL as subject
FROM whatsapp_history
UNION ALL
SELECT 
  'email' as type,
  recipient_id as client_id,
  content,
  template,
  status,
  sent_at,
  sent_by,
  subject
FROM email_history
ORDER BY sent_at DESC;

-- Trigger pour mettre à jour last_communication_at dans les réservations
CREATE OR REPLACE FUNCTION update_last_communication()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE reservations 
  SET last_communication_at = NEW.sent_at
  WHERE client_id = NEW.client_id 
  AND date >= CURRENT_DATE - INTERVAL '30 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_last_communication_whatsapp
  AFTER INSERT ON whatsapp_history
  FOR EACH ROW
  EXECUTE FUNCTION update_last_communication();

CREATE TRIGGER trigger_update_last_communication_email
  AFTER INSERT ON email_history
  FOR EACH ROW
  EXECUTE FUNCTION update_last_communication();

-- Données de test (optionnel)
-- INSERT INTO whatsapp_history (client_id, phone, content, template_used, status)
-- VALUES 
--   ('user-id-1', '+33123456789', 'Bonjour, votre rendez-vous est confirmé', 'Confirmation RDV', 'delivered'),
--   ('user-id-1', '+33123456789', 'Rappel: votre RDV est demain', 'Rappel RDV', 'read');

-- INSERT INTO email_history (recipient_id, subject, content, template, status)
-- VALUES 
--   ('user-id-1', 'Confirmation de rendez-vous', 'Votre rendez-vous est confirmé...', 'confirmation', 'read'),
--   ('user-id-1', 'Merci pour votre visite', 'Nous espérons que vous avez apprécié...', 'followup', 'sent');