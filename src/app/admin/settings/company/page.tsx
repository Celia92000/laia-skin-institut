'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Save, Building, Phone, Mail, Globe, 
  CreditCard, FileText, Shield, AlertCircle
} from 'lucide-react';

export default function CompanySettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // État pour les informations de l'entreprise
  const [companyData, setCompanyData] = useState({
    // Informations de base
    name: "LAIA SKIN Institut",
    legalName: "LAIA SKIN SARL",
    address: {
      street: "123 Avenue de la Beauté",
      zipCode: "75001",
      city: "Paris",
      country: "France"
    },
    
    // Contact
    phone: "01 23 45 67 89",
    email: "contact@laiaskin.fr",
    website: "www.laiaskin.fr",
    
    // Informations légales
    siret: "123 456 789 00012",
    siren: "123 456 789",
    tva: "FR 12 123456789",
    ape: "9602B",
    rcs: "Paris 123 456 789",
    
    // Capital et forme juridique
    capital: "10 000 €",
    legalForm: "SARL",
    
    // Assurances
    insuranceCompany: "AXA France",
    insuranceContract: "1234567",
    
    // Représentant légal
    legalRepName: "Laïa [Nom]",
    legalRepTitle: "Gérante",
    
    // Informations bancaires
    bankName: "BNP Paribas",
    iban: "FR76 1234 5678 9012 3456 7890 123",
    bic: "BNPAFRPPXXX",
    
    // TVA
    vatRegime: "franchise", // "franchise" ou "normal"
    vatRate: "20"
  });

  // Charger les données sauvegardées au démarrage
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings/company', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setCompanyData(data);
        }
      } catch (error) {
        console.error('Erreur chargement paramètres:', error);
        // Charger depuis localStorage en fallback
        const savedData = localStorage.getItem('companySettings');
        if (savedData) {
          setCompanyData(JSON.parse(savedData));
        }
      }
    };
    
    fetchSettings();
  }, []);

  // Sauvegarder les modifications
  const handleSave = async () => {
    setLoading(true);
    
    try {
      // Sauvegarder dans le localStorage pour un accès rapide
      localStorage.setItem('companySettings', JSON.stringify(companyData));
      
      // Sauvegarder dans la base de données via API
      const response = await fetch('/api/admin/settings/company', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(companyData)
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
    
    setLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setCompanyData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setCompanyData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] via-white to-[#f8f6f0] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/settings')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[#2c3e50]">Paramètres de l'entreprise</h1>
                <p className="text-sm text-[#2c3e50]/60">Informations légales pour les factures et documents</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-xl hover:shadow-xl transition-all flex items-center gap-2 font-medium disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
          
          {saved && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Modifications enregistrées avec succès !
            </div>
          )}
        </div>

        {/* Informations de base */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#2c3e50] mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-[#d4b5a0]" />
            Informations de l'entreprise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                Nom commercial
              </label>
              <input
                type="text"
                value={companyData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                Raison sociale
              </label>
              <input
                type="text"
                value={companyData.legalName}
                onChange={(e) => handleInputChange('legalName', e.target.value)}
                className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                Forme juridique
              </label>
              <select
                value={companyData.legalForm}
                onChange={(e) => handleInputChange('legalForm', e.target.value)}
                className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
              >
                <option value="SARL">SARL</option>
                <option value="EURL">EURL</option>
                <option value="SAS">SAS</option>
                <option value="SASU">SASU</option>
                <option value="EI">Entreprise Individuelle</option>
                <option value="MICRO">Micro-entreprise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                Capital social
              </label>
              <input
                type="text"
                value={companyData.capital}
                onChange={(e) => handleInputChange('capital', e.target.value)}
                className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="10 000 €"
              />
            </div>
          </div>
        </div>

        {/* Adresse */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#2c3e50] mb-4">Adresse</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                Rue
              </label>
              <input
                type="text"
                value={companyData.address.street}
                onChange={(e) => handleInputChange('address.street', e.target.value)}
                className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                Code postal
              </label>
              <input
                type="text"
                value={companyData.address.zipCode}
                onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                Ville
              </label>
              <input
                type="text"
                value={companyData.address.city}
                onChange={(e) => handleInputChange('address.city', e.target.value)}
                className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#2c3e50] mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-[#d4b5a0]" />
            Contact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                value={companyData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                Email
              </label>
              <input
                type="email"
                value={companyData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                Site web
              </label>
              <input
                type="text"
                value={companyData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Informations légales */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#2c3e50] mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#d4b5a0]" />
            Informations légales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                SIRET <span className="text-xs text-gray-500">(14 chiffres)</span>
              </label>
              <input
                type="text"
                value={companyData.siret}
                onChange={(e) => handleInputChange('siret', e.target.value)}
                className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="123 456 789 00012"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                N° TVA Intracommunautaire
              </label>
              <input
                type="text"
                value={companyData.tva}
                onChange={(e) => handleInputChange('tva', e.target.value)}
                className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="FR 12 123456789"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                Code APE/NAF
              </label>
              <input
                type="text"
                value={companyData.ape}
                onChange={(e) => handleInputChange('ape', e.target.value)}
                className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="9602B"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                RCS
              </label>
              <input
                type="text"
                value={companyData.rcs}
                onChange={(e) => handleInputChange('rcs', e.target.value)}
                className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="Paris 123 456 789"
              />
            </div>
          </div>
        </div>

        {/* TVA */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#2c3e50] mb-4">Régime TVA</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                Régime de TVA
              </label>
              <select
                value={companyData.vatRegime}
                onChange={(e) => handleInputChange('vatRegime', e.target.value)}
                className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
              >
                <option value="franchise">Franchise en base de TVA</option>
                <option value="normal">Régime normal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                Taux de TVA (%)
              </label>
              <input
                type="text"
                value={companyData.vatRate}
                onChange={(e) => handleInputChange('vatRate', e.target.value)}
                className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="20"
              />
            </div>
          </div>
          {companyData.vatRegime === 'franchise' && (
            <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                En franchise de TVA, la mention "TVA non applicable, art. 293 B du CGI" sera automatiquement ajoutée sur vos factures.
              </p>
            </div>
          )}
        </div>

        {/* Représentant légal */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#2c3e50] mb-4">Représentant légal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                Nom complet
              </label>
              <input
                type="text"
                value={companyData.legalRepName}
                onChange={(e) => handleInputChange('legalRepName', e.target.value)}
                className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                Titre
              </label>
              <input
                type="text"
                value={companyData.legalRepTitle}
                onChange={(e) => handleInputChange('legalRepTitle', e.target.value)}
                className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="Gérante"
              />
            </div>
          </div>
        </div>

        {/* Assurance */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#2c3e50] mb-4">Assurance professionnelle</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                Compagnie d'assurance
              </label>
              <input
                type="text"
                value={companyData.insuranceCompany}
                onChange={(e) => handleInputChange('insuranceCompany', e.target.value)}
                className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                N° de contrat
              </label>
              <input
                type="text"
                value={companyData.insuranceContract}
                onChange={(e) => handleInputChange('insuranceContract', e.target.value)}
                className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Informations bancaires */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-[#2c3e50] mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#d4b5a0]" />
            Informations bancaires
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                Nom de la banque
              </label>
              <input
                type="text"
                value={companyData.bankName}
                onChange={(e) => handleInputChange('bankName', e.target.value)}
                className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                IBAN
              </label>
              <input
                type="text"
                value={companyData.iban}
                onChange={(e) => handleInputChange('iban', e.target.value)}
                className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent font-mono"
                placeholder="FR76 1234 5678 9012 3456 7890 123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                BIC/SWIFT
              </label>
              <input
                type="text"
                value={companyData.bic}
                onChange={(e) => handleInputChange('bic', e.target.value)}
                className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent font-mono"
                placeholder="BNPAFRPPXXX"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}