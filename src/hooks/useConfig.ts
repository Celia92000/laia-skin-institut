import { useState, useEffect } from 'react';

interface SiteConfig {
  id?: string;
  siteName: string;
  siteTagline?: string;
  siteDescription?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  whatsapp?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  logoUrl?: string;
  faviconUrl?: string;
  businessHours?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  aboutText?: string;
  termsAndConditions?: string;
  privacyPolicy?: string;
  legalNotice?: string;
  emailSignature?: string;
  welcomeEmailText?: string;
}

const defaultConfig: SiteConfig = {
  siteName: 'Laia Skin Institut',
  siteTagline: 'Institut de Beauté & Bien-être',
  email: 'contact@laiaskin.com',
  phone: '+33 6 XX XX XX XX',
  primaryColor: '#d4b5a0',
  secondaryColor: '#2c3e50',
  accentColor: '#20b2aa'
};

export function useConfig() {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/config');
      if (response.ok) {
        const data = await response.json();
        setConfig({ ...defaultConfig, ...data });

        // Appliquer les couleurs CSS
        if (data.primaryColor) {
          document.documentElement.style.setProperty('--color-primary', data.primaryColor);
        }
        if (data.secondaryColor) {
          document.documentElement.style.setProperty('--color-secondary', data.secondaryColor);
        }
        if (data.accentColor) {
          document.documentElement.style.setProperty('--color-accent', data.accentColor);
        }

        // Appliquer la typographie
        if (data.fontFamily) {
          document.documentElement.style.setProperty('--font-family', data.fontFamily);
          document.body.style.fontFamily = data.fontFamily;
        }
        if (data.headingFont) {
          document.documentElement.style.setProperty('--font-heading', data.headingFont);
        }
        if (data.baseFontSize) {
          document.documentElement.style.setProperty('--font-size-base', data.baseFontSize);
          document.documentElement.style.fontSize = data.baseFontSize;
        }
        if (data.headingSize) {
          document.documentElement.style.setProperty('--font-size-heading', data.headingSize);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  return { config, loading, refresh: fetchConfig };
}
