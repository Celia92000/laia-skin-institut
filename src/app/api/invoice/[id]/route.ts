import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

// Fonction pour obtenir les paramètres de l'entreprise
async function getCompanySettings() {
  try {
    // Essayer de récupérer depuis la base de données
    const settings = await prisma.setting.findFirst({
      where: { key: 'company_info' }
    });
    
    if (settings) {
      return JSON.parse(settings.value);
    }
  } catch (error) {
    console.error('Erreur récupération paramètres entreprise:', error);
  }
  
  // Valeurs par défaut si pas de paramètres sauvegardés
  return {
    name: "LAIA SKIN Institut",
    legalName: "LAIA SKIN SARL",
    address: {
      street: "123 Avenue de la Beauté",
      zipCode: "75001",
      city: "Paris",
      country: "France"
    },
    phone: "01 23 45 67 89",
    email: "contact@laiaskin.fr",
    website: "www.laiaskin.fr",
    siret: "123 456 789 00012",
    siren: "123 456 789",
    tva: "FR 12 123456789",
    ape: "9602B",
    rcs: "Paris 123 456 789",
    capital: "10 000 €",
    legalForm: "SARL",
    insuranceCompany: "AXA France",
    insuranceContract: "1234567",
    legalRepName: "Laïa [Nom]",
    legalRepTitle: "Gérante",
    bankName: "BNP Paribas",
    iban: "FR76 1234 5678 9012 3456 7890 123",
    bic: "BNPAFRPPXXX",
    vatRegime: "franchise",
    vatRate: "20"
  };
}

// Fonction pour calculer la TVA
function calculateVAT(amountTTC: number, vatRate: string) {
  const rate = parseFloat(vatRate) / 100;
  const amountHT = amountTTC / (1 + rate);
  const vat = amountTTC - amountHT;
  return {
    ht: amountHT,
    vat: vat,
    ttc: amountTTC,
    rate: parseFloat(vatRate)
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
  const prisma = await getPrismaClient();
) {
  try {
    const { id } = await params;
    const companyInfo = await getCompanySettings();
    
    // Récupérer la réservation avec les infos utilisateur
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        user: true
      }
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 });
    }

    // Vérifier que la réservation a été payée
    if (reservation.paymentStatus !== 'paid') {
      return NextResponse.json({ error: 'Facture non disponible - Paiement non effectué' }, { status: 400 });
    }

    // Parser les services
    let services = [];
    if (typeof reservation.services === 'string') {
      try {
        services = JSON.parse(reservation.services);
      } catch {
        services = [reservation.services];
      }
    } else if (Array.isArray(reservation.services)) {
      services = reservation.services;
    }

    // Mapper les services avec leurs noms complets
    const serviceNames: Record<string, string> = {
      'hydro-naissance': "Hydro'Naissance",
      'hydro-cleaning': "Hydro'Cleaning",
      'renaissance': 'Renaissance',
      'bb-glow': 'BB Glow',
      'led-therapie': 'LED Thérapie'
    };

    const mappedServices = services.map((s: string) => ({
      name: serviceNames[s] || s,
      price: 70 // Prix par défaut, à adapter selon votre logique
    }));

    // Calculer les montants avec TVA
    const vatCalc = calculateVAT(reservation.totalPrice, companyInfo.vatRate);

    // Générer le HTML de la facture
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Facture ${reservation.invoiceNumber || 'N/A'}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #fdfbf7 0%, #f8f6f0 100%);
      color: #2c3e50;
      padding: 20px;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #d4b5a0 0%, #c9a084 100%);
      color: white;
      padding: 40px;
      text-align: center;
      position: relative;
    }
    
    .header::after {
      content: '';
      position: absolute;
      bottom: -20px;
      left: 0;
      right: 0;
      height: 40px;
      background: white;
      border-radius: 50% 50% 0 0;
    }
    
    .logo {
      font-size: 36px;
      font-weight: 300;
      letter-spacing: 8px;
      margin-bottom: 10px;
      text-transform: uppercase;
    }
    
    .subtitle {
      font-size: 14px;
      letter-spacing: 2px;
      opacity: 0.9;
    }
    
    .invoice-header {
      padding: 40px;
      border-bottom: 2px solid #f0f0f0;
    }
    
    .invoice-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }
    
    .invoice-number {
      font-size: 24px;
      font-weight: bold;
      color: #d4b5a0;
    }
    
    .invoice-date {
      color: #666;
      font-size: 14px;
    }
    
    .parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-top: 30px;
    }
    
    .party {
      padding: 20px;
      background: #fafafa;
      border-radius: 10px;
    }
    
    .party h3 {
      color: #d4b5a0;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 15px;
    }
    
    .party p {
      color: #2c3e50;
      line-height: 1.6;
      font-size: 14px;
    }
    
    .services {
      padding: 40px;
    }
    
    .services-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .services-table th {
      text-align: left;
      padding: 15px;
      background: #f8f8f8;
      color: #666;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 2px solid #e0e0e0;
    }
    
    .services-table td {
      padding: 20px 15px;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .services-table tr:last-child td {
      border-bottom: none;
    }
    
    .totals {
      background: linear-gradient(135deg, #fdfbf7 0%, #f8f6f0 100%);
      padding: 30px 40px;
      border-top: 2px solid #e0e0e0;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 14px;
    }
    
    .total-row.final {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 2px solid #d4b5a0;
      font-size: 20px;
      font-weight: bold;
      color: #d4b5a0;
    }
    
    .footer {
      padding: 30px 40px;
      background: #f8f8f8;
      text-align: center;
      color: #666;
      font-size: 12px;
      line-height: 1.8;
    }
    
    .payment-info {
      margin-top: 20px;
      padding: 15px;
      background: #e8f4e8;
      border-radius: 10px;
      color: #4a774a;
    }
    
    @media print {
      body {
        padding: 0;
        background: white;
      }
      
      .container {
        box-shadow: none;
        border-radius: 0;
      }
      
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">LAIA SKIN</div>
      <div class="subtitle">INSTITUT DE BEAUTÉ</div>
    </div>
    
    <div class="invoice-header">
      <div class="invoice-title">
        <div>
          <h1 style="font-size: 32px; color: #2c3e50;">FACTURE</h1>
          <div class="invoice-date">
            <strong>Date d'émission :</strong> ${new Date(reservation.paymentDate || reservation.date).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}<br>
            <strong>Date d'échéance :</strong> ${new Date(reservation.paymentDate || reservation.date).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })} (comptant)<br>
            <strong>Date de la prestation :</strong> ${new Date(reservation.date).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </div>
        </div>
        <div class="invoice-number">
          <div style="font-size: 14px; color: #666; margin-bottom: 5px;">N° de facture</div>
          ${reservation.invoiceNumber || 'N/A'}
        </div>
      </div>
      
      <div class="parties">
        <div class="party">
          <h3>Émetteur</h3>
          <p>
            <strong>${companyInfo.name}</strong><br>
            ${companyInfo.legalForm ? `(${companyInfo.legalForm})` : ''}<br>
            ${companyInfo.address.street}<br>
            ${companyInfo.address.zipCode} ${companyInfo.address.city}<br>
            Tél: ${companyInfo.phone}<br>
            Email: ${companyInfo.email}<br>
            <strong>SIRET:</strong> ${companyInfo.siret}<br>
            <strong>N° TVA:</strong> ${companyInfo.tva}<br>
            <strong>APE:</strong> ${companyInfo.ape} - Soins de beauté<br>
            <strong>RCS:</strong> ${companyInfo.rcs}<br>
            ${companyInfo.capital ? `<strong>Capital social:</strong> ${companyInfo.capital}<br>` : ''}
          </p>
        </div>
        <div class="party">
          <h3>Client</h3>
          <p>
            <strong>${reservation.user?.name || 'Client'}</strong><br>
            ${reservation.user?.email || ''}<br>
            ${reservation.user?.phone || ''}
          </p>
        </div>
      </div>
    </div>
    
    <div class="services">
      <table class="services-table">
        <thead>
          <tr>
            <th>Prestation</th>
            <th style="text-align: right;">Prix unitaire</th>
            <th style="text-align: center;">Quantité</th>
            <th style="text-align: right;">Total HT</th>
          </tr>
        </thead>
        <tbody>
          ${mappedServices.map((service: any) => `
            <tr>
              <td><strong>${service.name}</strong></td>
              <td style="text-align: right;">${(service.price / 1.20).toFixed(2)}€</td>
              <td style="text-align: center;">1</td>
              <td style="text-align: right;">${(service.price / 1.20).toFixed(2)}€</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    <div class="totals">
      <div class="total-row">
        <span>Sous-total HT</span>
        <span>${vatCalc.ht.toFixed(2)}€</span>
      </div>
      <div class="total-row">
        <span>TVA ${vatCalc.rate}%</span>
        <span>${vatCalc.vat.toFixed(2)}€</span>
      </div>
      <div class="total-row final">
        <span>TOTAL TTC</span>
        <span>${vatCalc.ttc.toFixed(2)}€</span>
      </div>
      
      ${reservation.paymentStatus === 'paid' ? `
        <div class="payment-info">
          <strong>✓ Facture acquittée</strong><br>
          Payée le ${new Date(reservation.paymentDate || reservation.date).toLocaleDateString('fr-FR')}<br>
          Mode de paiement: ${reservation.paymentMethod || 'Non spécifié'}
        </div>
      ` : ''}
    </div>
    
    <div class="footer">
      <p style="margin-bottom: 20px;">
        <strong>Merci pour votre confiance !</strong><br>
        LAIA SKIN Institut - Votre beauté, notre passion
      </p>
      
      <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 20px;">
        <p style="font-size: 11px; line-height: 1.6;">
          <strong>MENTIONS LÉGALES OBLIGATOIRES</strong><br>
          <strong>Conditions de règlement :</strong> Paiement comptant à réception de facture<br>
          <strong>Pénalités de retard :</strong> Taux d'intérêt légal majoré de 10 points<br>
          <strong>Indemnité forfaitaire de recouvrement :</strong> 40 € (art. L441-6 et D441-5 du Code de commerce)<br>
          <strong>Escompte pour paiement anticipé :</strong> Aucun<br>
          ${companyInfo.vatRegime === 'franchise' ? 
            '<strong>TVA :</strong> TVA non applicable, art. 293 B du CGI (franchise en base)<br>' : 
            '<strong>Régime de TVA :</strong> TVA sur les encaissements<br>'
          }
          <strong>RCS :</strong> ${companyInfo.rcs}<br>
          ${companyInfo.insuranceCompany && companyInfo.insuranceContract ? 
            `<strong>Assurance RC Pro :</strong> ${companyInfo.insuranceCompany} - Contrat n°${companyInfo.insuranceContract}<br>` : ''
          }
          ${companyInfo.legalRepName && companyInfo.legalRepTitle ? 
            `<strong>Représentant légal :</strong> ${companyInfo.legalRepName}, ${companyInfo.legalRepTitle}<br>` : ''
          }
          <br>
          <em>En cas de litige, seuls les tribunaux de Paris sont compétents.</em><br>
          <em>Conformément à la loi n° 92-1442 du 31 décembre 1992, les produits cosmétiques ne sont ni repris ni échangés.</em>
        </p>
      </div>
    </div>
  </div>
  
  <div class="no-print" style="text-align: center; margin-top: 30px;">
    <button onclick="window.print()" style="
      padding: 12px 30px;
      background: linear-gradient(135deg, #d4b5a0 0%, #c9a084 100%);
      color: white;
      border: none;
      border-radius: 25px;
      font-size: 16px;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(212, 181, 160, 0.3);
    ">
      🖨️ Imprimer la facture
    </button>
  </div>
</body>
</html>
    `;

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Erreur génération facture:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération de la facture' },
      { status: 500 }
    );
  }
}