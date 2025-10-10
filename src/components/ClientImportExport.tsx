"use client";

import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, X, FileText, Users } from 'lucide-react';
import * as XLSX from 'xlsx';
import { formatDateLocal } from '@/lib/date-utils';

interface Client {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  birthDate?: string;
  skinType?: string;
  allergies?: string;
  medicalNotes?: string;
  preferences?: string;
  adminNotes?: string;
  loyaltyPoints?: number;
  totalSpent?: number;
}

interface ImportResult {
  success: number;
  errors: number;
  duplicates: number;
  details: string[];
}

interface ClientImportExportProps {
  clients: Client[];
  onImport: (clients: Client[]) => Promise<void>;
  onClose?: () => void;
}

export default function ClientImportExport({ clients, onImport, onClose }: ClientImportExportProps) {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [previewData, setPreviewData] = useState<Client[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const exportToCSV = () => {
    const headers = [
      'Nom', 'Email', 'Téléphone', 'Date de naissance', 
      'Type de peau', 'Allergies', 'Notes médicales', 
      'Préférences', 'Notes admin', 'Points fidélité', 'Total dépensé'
    ];

    const csvContent = [
      headers,
      ...clients.map(c => [
        c.name,
        c.email,
        c.phone || '',
        c.birthDate || '',
        c.skinType || '',
        c.allergies || '',
        c.medicalNotes || '',
        c.preferences || '',
        c.adminNotes || '',
        c.loyaltyPoints || 0,
        c.totalSpent || 0
      ])
    ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `clients_laia_skin_${formatDateLocal(new Date())}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(clients.map(c => ({
      'Nom': c.name,
      'Email': c.email,
      'Téléphone': c.phone || '',
      'Date de naissance': c.birthDate || '',
      'Type de peau': c.skinType || '',
      'Allergies': c.allergies || '',
      'Notes médicales': c.medicalNotes || '',
      'Préférences': c.preferences || '',
      'Notes admin': c.adminNotes || '',
      'Points fidélité': c.loyaltyPoints || 0,
      'Total dépensé (€)': c.totalSpent || 0
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');

    const columnWidths = [
      { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 15 },
      { wch: 20 }, { wch: 30 }, { wch: 40 }, { wch: 40 },
      { wch: 40 }, { wch: 15 }, { wch: 15 }
    ];
    worksheet['!cols'] = columnWidths;

    XLSX.writeFile(workbook, `clients_laia_skin_${formatDateLocal(new Date())}.xlsx`);
  };

  const parseFile = async (file: File): Promise<Client[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          let parsedData: Client[] = [];

          if (file.name.endsWith('.csv')) {
            const text = data as string;
            const lines = text.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
            
            parsedData = lines.slice(1).map(line => {
              const values = line.match(/(".*?"|[^,]+)/g) || [];
              const cleanValues = values.map(v => v.trim().replace(/^"|"$/g, ''));
              
              return {
                name: cleanValues[0] || '',
                email: cleanValues[1] || '',
                phone: cleanValues[2] || undefined,
                birthDate: cleanValues[3] || undefined,
                skinType: cleanValues[4] || undefined,
                allergies: cleanValues[5] || undefined,
                medicalNotes: cleanValues[6] || undefined,
                preferences: cleanValues[7] || undefined,
                adminNotes: cleanValues[8] || undefined,
                loyaltyPoints: parseInt(cleanValues[9]) || 0,
                totalSpent: parseFloat(cleanValues[10]) || 0
              };
            });
          } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            const workbook = XLSX.read(data, { type: 'binary' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            parsedData = jsonData.map((row: any) => ({
              name: row['Nom'] || row['Name'] || '',
              email: row['Email'] || '',
              phone: row['Téléphone'] || row['Phone'] || undefined,
              birthDate: row['Date de naissance'] || row['Birth Date'] || undefined,
              skinType: row['Type de peau'] || row['Skin Type'] || undefined,
              allergies: row['Allergies'] || undefined,
              medicalNotes: row['Notes médicales'] || row['Medical Notes'] || undefined,
              preferences: row['Préférences'] || row['Preferences'] || undefined,
              adminNotes: row['Notes admin'] || row['Admin Notes'] || undefined,
              loyaltyPoints: parseInt(row['Points fidélité']) || parseInt(row['Loyalty Points']) || 0,
              totalSpent: parseFloat(row['Total dépensé']) || parseFloat(row['Total dépensé (€)']) || parseFloat(row['Total Spent']) || 0
            }));
          }

          resolve(parsedData.filter(c => c.name && c.email));
        } catch (error) {
          reject(error);
        }
      };

      if (file.name.endsWith('.csv')) {
        reader.readAsText(file, 'UTF-8');
      } else {
        reader.readAsBinaryString(file);
      }
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setImporting(true);
    setImportResult(null);

    try {
      const parsedClients = await parseFile(file);
      setPreviewData(parsedClients);
      setShowPreview(true);
    } catch (error) {
      setImportResult({
        success: 0,
        errors: 1,
        duplicates: 0,
        details: ['Erreur lors de la lecture du fichier. Vérifiez le format.']
      });
    } finally {
      setImporting(false);
    }
  };

  const confirmImport = async () => {
    if (previewData.length === 0) return;

    setImporting(true);
    const result: ImportResult = {
      success: 0,
      errors: 0,
      duplicates: 0,
      details: []
    };

    const existingEmails = new Set(clients.map(c => c.email.toLowerCase()));
    const newClients: Client[] = [];

    for (const client of previewData) {
      if (!client.name || !client.email) {
        result.errors++;
        result.details.push(`Données manquantes pour: ${client.name || 'Sans nom'}`);
        continue;
      }

      if (existingEmails.has(client.email.toLowerCase())) {
        result.duplicates++;
        result.details.push(`Doublon ignoré: ${client.email}`);
        continue;
      }

      newClients.push(client);
      existingEmails.add(client.email.toLowerCase());
      result.success++;
    }

    try {
      if (newClients.length > 0) {
        await onImport(newClients);
      }
      setImportResult(result);
      setShowPreview(false);
      setPreviewData([]);
    } catch (error) {
      result.errors = previewData.length;
      result.success = 0;
      result.details = ['Erreur lors de l\'import dans la base de données'];
      setImportResult(result);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Import/Export Clients
            </h2>
            <p className="text-gray-600 mt-2">Gérez votre base de données clients</p>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100">
            <div className="flex items-center mb-4">
              <Download className="w-6 h-6 text-purple-600 mr-3" />
              <h3 className="text-lg font-semibold">Export des clients</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Exportez votre liste de {clients.length} clients
            </p>
            <div className="space-y-3">
              <button
                onClick={exportToCSV}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center"
              >
                <FileText className="w-5 h-5 mr-2" />
                Exporter en CSV
              </button>
              <button
                onClick={exportToExcel}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center"
              >
                <FileSpreadsheet className="w-5 h-5 mr-2" />
                Exporter en Excel
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100">
            <div className="flex items-center mb-4">
              <Upload className="w-6 h-6 text-purple-600 mr-3" />
              <h3 className="text-lg font-semibold">Import de clients</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Importez une liste de clients depuis un fichier
            </p>
            <div className="space-y-3">
              <label className="w-full">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={importing}
                />
                <div className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all flex items-center justify-center cursor-pointer">
                  <Upload className="w-5 h-5 mr-2" />
                  {importing ? 'Import en cours...' : 'Choisir un fichier'}
                </div>
              </label>
              <p className="text-xs text-gray-500 text-center">
                Formats acceptés: CSV, Excel (.xlsx, .xls)
              </p>
            </div>
          </div>
        </div>

        {showPreview && previewData.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100 mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-600" />
              Aperçu de l'import ({previewData.length} clients)
            </h3>
            <div className="max-h-60 overflow-y-auto mb-4">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left">Nom</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Téléphone</th>
                    <th className="px-4 py-2 text-left">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {previewData.slice(0, 10).map((client, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{client.name}</td>
                      <td className="px-4 py-2">{client.email}</td>
                      <td className="px-4 py-2">{client.phone || '-'}</td>
                      <td className="px-4 py-2">{client.loyaltyPoints || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length > 10 && (
                <p className="text-center text-gray-500 mt-2">
                  ... et {previewData.length - 10} autres clients
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPreview(false);
                  setPreviewData([]);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmImport}
                disabled={importing}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50"
              >
                {importing ? 'Import...' : 'Confirmer l\'import'}
              </button>
            </div>
          </div>
        )}

        {importResult && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100">
            <h3 className="text-lg font-semibold mb-4">Résultat de l'import</h3>
            <div className="space-y-2">
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>{importResult.success} clients importés avec succès</span>
              </div>
              {importResult.duplicates > 0 && (
                <div className="flex items-center text-yellow-600">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span>{importResult.duplicates} doublons ignorés</span>
                </div>
              )}
              {importResult.errors > 0 && (
                <div className="flex items-center text-red-600">
                  <X className="w-5 h-5 mr-2" />
                  <span>{importResult.errors} erreurs</span>
                </div>
              )}
            </div>
            {importResult.details.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
                <p className="text-sm font-medium mb-2">Détails:</p>
                {importResult.details.map((detail, idx) => (
                  <p key={idx} className="text-xs text-gray-600">• {detail}</p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <h4 className="font-semibold text-purple-800 mb-2">Format d'import</h4>
          <p className="text-sm text-purple-700">
            Le fichier doit contenir les colonnes: Nom, Email, Téléphone (optionnel), 
            Date de naissance, Type de peau, Allergies, Notes médicales, Préférences, 
            Notes admin, Points fidélité, Total dépensé.
          </p>
        </div>
      </div>
    </div>
  );
}