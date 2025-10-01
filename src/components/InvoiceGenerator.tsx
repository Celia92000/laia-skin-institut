'use client';

import React from 'react';

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  client: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  services: Array<{
    name: string;
    price: number;
    quantity?: number;
  }>;
  totalPrice: number;
  paymentAmount?: number;
  paymentMethod?: string;
  paymentStatus: string;
  appliedDiscounts?: Array<{
    description: string;
    amount: number;
  }>;
}

export function generateInvoiceHTML(data: InvoiceData): string {
  const subtotal = data.services.reduce((sum, service) => sum + (service.price * (service.quantity || 1)), 0);
  const totalDiscounts = data.appliedDiscounts ? data.appliedDiscounts.reduce((sum, d) => sum + d.amount, 0) : 0;
  const subtotalAfterDiscount = subtotal - totalDiscounts;
  const tva = subtotalAfterDiscount * 0.20;
  const totalTTC = subtotalAfterDiscount + tva;

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>Facture ${data.invoiceNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: white;
          padding: 20px;
        }
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 40px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #d4b5a0;
        }
        .company-info {
          flex: 1;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #d4b5a0;
          margin-bottom: 10px;
        }
        .company-details {
          font-size: 12px;
          color: #666;
          line-height: 1.5;
        }
        .invoice-title {
          text-align: right;
          flex: 1;
        }
        .invoice-title h1 {
          font-size: 32px;
          color: #333;
          margin-bottom: 10px;
        }
        .invoice-number {
          font-size: 14px;
          color: #666;
        }
        .invoice-date {
          font-size: 14px;
          color: #666;
          margin-top: 5px;
        }
        .parties {
          display: flex;
          gap: 40px;
          margin-bottom: 40px;
        }
        .party {
          flex: 1;
        }
        .party-title {
          font-size: 12px;
          text-transform: uppercase;
          color: #999;
          margin-bottom: 10px;
          letter-spacing: 1px;
        }
        .party-details {
          background: #f9f9f9;
          padding: 15px;
          border-radius: 8px;
          min-height: 100px;
        }
        .party-details p {
          margin: 5px 0;
          font-size: 14px;
        }
        .party-details .name {
          font-weight: bold;
          color: #333;
          font-size: 16px;
        }
        .services-table {
          width: 100%;
          margin-bottom: 40px;
          border-collapse: collapse;
        }
        .services-table th {
          background: #d4b5a0;
          color: white;
          padding: 12px;
          text-align: left;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .services-table td {
          padding: 15px 12px;
          border-bottom: 1px solid #eee;
          font-size: 14px;
        }
        .services-table tr:hover {
          background: #f9f9f9;
        }
        .services-table .amount {
          text-align: right;
          font-weight: 500;
        }
        .totals {
          margin-left: auto;
          width: 300px;
          margin-bottom: 40px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }
        .total-row.subtotal {
          border-top: 1px solid #eee;
          padding-top: 15px;
        }
        .total-row.grand-total {
          border-top: 2px solid #d4b5a0;
          margin-top: 10px;
          padding-top: 15px;
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }
        .payment-info {
          background: #f0ebe6;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .payment-info h3 {
          color: #d4b5a0;
          margin-bottom: 10px;
          font-size: 16px;
        }
        .payment-info p {
          font-size: 14px;
          margin: 5px 0;
        }
        .footer {
          margin-top: 60px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          text-align: center;
          font-size: 12px;
          color: #999;
        }
        .footer p {
          margin: 5px 0;
        }
        @media print {
          body {
            padding: 0;
          }
          .invoice-container {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <div class="company-info">
            <div class="company-name">LAIA SKIN INSTITUT</div>
            <div class="company-details">
              <p>123 Avenue de la Beauté</p>
              <p>75001 Paris, France</p>
              <p>Tél: 01 23 45 67 89</p>
              <p>Email: contact@laia.skin.com</p>
              <p>SIRET: 123 456 789 00012</p>
            </div>
          </div>
          <div class="invoice-title">
            <h1>FACTURE</h1>
            <div class="invoice-number">N° ${data.invoiceNumber}</div>
            <div class="invoice-date">Date: ${new Date(data.date).toLocaleDateString('fr-FR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</div>
          </div>
        </div>

        <div class="parties">
          <div class="party">
            <div class="party-title">Facturé à</div>
            <div class="party-details">
              <p class="name">${data.client.name}</p>
              ${data.client.email ? `<p>Email: ${data.client.email}</p>` : ''}
              ${data.client.phone ? `<p>Tél: ${data.client.phone}</p>` : ''}
              ${data.client.address ? `<p>${data.client.address}</p>` : ''}
            </div>
          </div>
          <div class="party">
            <div class="party-title">Informations</div>
            <div class="party-details">
              <p>Date du soin: ${new Date(data.date).toLocaleDateString('fr-FR')}</p>
              ${data.paymentMethod ? `<p>Mode de paiement: ${
                data.paymentMethod === 'cash' ? 'Espèces' :
                data.paymentMethod === 'card' ? 'Carte bancaire' :
                data.paymentMethod === 'transfer' ? 'Virement' :
                data.paymentMethod
              }</p>` : ''}
            </div>
          </div>
        </div>

        <table class="services-table">
          <thead>
            <tr>
              <th style="width: 50%">Description</th>
              <th style="width: 15%">Quantité</th>
              <th style="width: 15%">Prix unitaire</th>
              <th style="width: 20%" class="amount">Montant HT</th>
            </tr>
          </thead>
          <tbody>
            ${data.services.map(service => `
              <tr>
                <td>${service.name}</td>
                <td>${service.quantity || 1}</td>
                <td>${service.price.toFixed(2)}€</td>
                <td class="amount">${(service.price * (service.quantity || 1)).toFixed(2)}€</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row subtotal">
            <span>Sous-total HT</span>
            <span>${subtotal.toFixed(2)}€</span>
          </div>
          ${data.appliedDiscounts && data.appliedDiscounts.length > 0 ? `
            ${data.appliedDiscounts.map(discount => `
              <div class="total-row" style="color: #d4b5a0; font-weight: bold;">
                <span>${discount.description}</span>
                <span>-${discount.amount.toFixed(2)}€</span>
              </div>
            `).join('')}
            <div class="total-row">
              <span>Sous-total après réduction</span>
              <span>${(subtotal - data.appliedDiscounts.reduce((sum, d) => sum + d.amount, 0)).toFixed(2)}€</span>
            </div>
          ` : ''}
          <div class="total-row">
            <span>TVA (20%)</span>
            <span>${tva.toFixed(2)}€</span>
          </div>
          <div class="total-row grand-total">
            <span>Total TTC</span>
            <span>${totalTTC.toFixed(2)}€</span>
          </div>
        </div>

        <div class="payment-info">
          <h3>Modalités de paiement</h3>
          <p>Paiement sur place</p>
          <p>Modes de paiement acceptés: Espèces, Carte bancaire</p>
        </div>

        <div class="footer">
          <p>Merci pour votre confiance !</p>
          <p>LAIA SKIN INSTITUT - Dispensé d'immatriculation au RM et au RCS</p>
          <p>TVA non applicable, art. 293 B du CGI</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
}

export function InvoiceButton({ reservation }: { reservation: any }) {
  const handleGenerateInvoice = () => {
    const invoiceData: InvoiceData = {
      invoiceNumber: reservation.invoiceNumber || `FAC-${Date.now()}`,
      date: reservation.date,
      client: {
        name: reservation.client,
        email: reservation.email,
        phone: reservation.phone,
      },
      services: (() => {
        try {
          const servicesList = JSON.parse(reservation.services);
          if (Array.isArray(servicesList)) {
            return servicesList.map(s => ({
              name: s,
              price: reservation.totalPrice / servicesList.length
            }));
          }
        } catch {}
        return [{
          name: reservation.services,
          price: reservation.totalPrice
        }];
      })(),
      totalPrice: reservation.totalPrice,
      paymentAmount: reservation.paymentAmount,
      paymentMethod: reservation.paymentMethod,
      paymentStatus: reservation.paymentStatus,
      appliedDiscounts: reservation.appliedDiscounts
    };

    const invoiceHTML = generateInvoiceHTML(invoiceData);

    // Ajouter des boutons d'action dans la facture
    const htmlWithActions = invoiceHTML.replace(
      '</body>',
      `
      <div style="position: fixed; top: 20px; right: 20px; display: flex; gap: 10px; z-index: 1000; background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <button onclick="window.print()" style="padding: 10px 20px; background: #d4b5a0; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: 500;">
          🖨️ Imprimer
        </button>
        <button onclick="downloadInvoice()" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: 500;">
          📥 Télécharger
        </button>
        <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: 500;">
          ✕ Fermer
        </button>
      </div>
      <script>
        function downloadInvoice() {
          const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'facture_${invoiceData.invoiceNumber}.html';
          a.click();
          URL.revokeObjectURL(url);
        }
      </script>
      <style>
        @media print {
          button, div[style*="position: fixed"] { display: none !important; }
        }
      </style>
      </body>`
    );

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlWithActions);
      newWindow.document.close();
    }
  };

  return (
    <button
      onClick={handleGenerateInvoice}
      className="px-3 py-1 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c4a590] transition-colors text-sm"
    >
      👁️ Voir facture
    </button>
  );
}