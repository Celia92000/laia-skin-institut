export interface InvoiceData {
  invoiceNumber: string;
  date: Date;
  client: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  services: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    vatRate: number;
  }>;
  totalHT: number;
  totalVAT: number;
  totalTTC: number;
  paymentMethod?: string;
  paymentStatus: 'paid' | 'pending';
  notes?: string;
}

export function generateInvoiceNumber(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `LAIA-${year}${month}${day}-${random}`;
}

export function calculateInvoiceTotals(services: InvoiceData['services']) {
  let totalHT = 0;
  let totalVAT = 0;

  services.forEach(service => {
    const serviceHT = service.quantity * service.unitPrice;
    const serviceVAT = serviceHT * (service.vatRate / 100);
    totalHT += serviceHT;
    totalVAT += serviceVAT;
  });

  return {
    totalHT: Math.round(totalHT * 100) / 100,
    totalVAT: Math.round(totalVAT * 100) / 100,
    totalTTC: Math.round((totalHT + totalVAT) * 100) / 100
  };
}

export function formatInvoiceHTML(invoice: InvoiceData): string {
  const formattedDate = new Intl.DateTimeFormat('fr-FR').format(invoice.date);
  
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Facture ${invoice.invoiceNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .company-info { text-align: left; }
    .invoice-info { text-align: right; }
    .client-info { margin: 30px 0; padding: 20px; background: #f5f5f5; }
    table { width: 100%; border-collapse: collapse; margin: 30px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #d4b5a0; color: white; }
    .totals { text-align: right; margin-top: 30px; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; }
    .paid-stamp { color: green; font-weight: bold; font-size: 18px; }
    .pending-stamp { color: orange; font-weight: bold; font-size: 18px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      <h2>LAIA SKIN INSTITUT</h2>
      <p>123 Rue de la Beauté<br>75000 Paris<br>
      Tél: 01 23 45 67 89<br>
      Email: contact@laiaskin.com<br>
      SIRET: 123 456 789 00000<br>
      TVA: FR12 345678900</p>
    </div>
    <div class="invoice-info">
      <h1>FACTURE</h1>
      <p><strong>N°:</strong> ${invoice.invoiceNumber}<br>
      <strong>Date:</strong> ${formattedDate}<br>
      <span class="${invoice.paymentStatus === 'paid' ? 'paid-stamp' : 'pending-stamp'}">
        ${invoice.paymentStatus === 'paid' ? 'PAYÉE' : 'EN ATTENTE'}
      </span></p>
    </div>
  </div>

  <div class="client-info">
    <h3>Client</h3>
    <p><strong>${invoice.client.name}</strong><br>
    ${invoice.client.email}<br>
    ${invoice.client.phone || ''}<br>
    ${invoice.client.address || ''}</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>Désignation</th>
        <th>Quantité</th>
        <th>Prix unitaire HT</th>
        <th>TVA</th>
        <th>Total HT</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.services.map(service => `
        <tr>
          <td>${service.name}</td>
          <td>${service.quantity}</td>
          <td>${service.unitPrice.toFixed(2)}€</td>
          <td>${service.vatRate}%</td>
          <td>${(service.quantity * service.unitPrice).toFixed(2)}€</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals">
    <table style="width: auto; margin-left: auto;">
      <tr>
        <td><strong>Total HT:</strong></td>
        <td style="text-align: right; padding-left: 20px;">${invoice.totalHT.toFixed(2)}€</td>
      </tr>
      <tr>
        <td><strong>TVA 20%:</strong></td>
        <td style="text-align: right; padding-left: 20px;">${invoice.totalVAT.toFixed(2)}€</td>
      </tr>
      <tr style="font-size: 1.2em; font-weight: bold;">
        <td><strong>Total TTC:</strong></td>
        <td style="text-align: right; padding-left: 20px;">${invoice.totalTTC.toFixed(2)}€</td>
      </tr>
    </table>
  </div>

  ${invoice.paymentMethod ? `
  <div style="margin-top: 30px;">
    <p><strong>Mode de paiement:</strong> ${invoice.paymentMethod}</p>
  </div>
  ` : ''}

  ${invoice.notes ? `
  <div style="margin-top: 30px; padding: 15px; background: #f9f9f9;">
    <p><strong>Notes:</strong><br>${invoice.notes}</p>
  </div>
  ` : ''}

  <div class="footer">
    <p><strong>Conditions de paiement:</strong> Paiement à réception de facture<br>
    <strong>Pénalités de retard:</strong> 3 fois le taux d'intérêt légal<br>
    <strong>Indemnité forfaitaire pour frais de recouvrement:</strong> 40€<br>
    <small>TVA sur les encaissements - Auto-entrepreneur dispensé d'immatriculation au RCS</small></p>
  </div>
</body>
</html>
  `;
}

export function generateCSVExport(data: any[], headers: string[]): string {
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      // Échapper les guillemets et encapsuler si nécessaire
      if (value && value.toString().includes(',')) {
        return `"${value.toString().replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}