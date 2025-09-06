"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  User,
  Euro,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail
} from "lucide-react";

// Données simulées
const mockReservations = [
  {
    id: "RES001",
    client: "Sophie Martin",
    telephone: "06 12 34 56 78",
    email: "sophie.martin@email.com",
    service: "LAIA Hydro'Cleaning",
    date: "2024-02-15",
    heure: "10:00",
    duree: 60,
    prix: 90,
    status: "confirmee" as const,
    notes: "Première visite"
  },
  {
    id: "RES002",
    client: "Marie Dubois",
    telephone: "06 98 76 54 32",
    email: "marie.dubois@email.com",
    service: "BB Glow",
    date: "2024-02-15",
    heure: "14:30",
    duree: 90,
    prix: 150,
    status: "confirmee" as const,
    notes: ""
  },
  {
    id: "RES003",
    client: "Julie Moreau",
    telephone: "06 45 67 89 01",
    email: "julie.moreau@email.com",
    service: "LED Thérapie",
    date: "2024-02-16",
    heure: "11:00",
    duree: 45,
    prix: 70,
    status: "en_attente" as const,
    notes: "À confirmer par téléphone"
  },
  {
    id: "RES004",
    client: "Emma Laurent",
    telephone: "06 23 45 67 89",
    email: "emma.laurent@email.com",
    service: "LAIA Renaissance",
    date: "2024-02-14",
    heure: "15:00",
    duree: 75,
    prix: 120,
    status: "terminee" as const,
    notes: "Cliente régulière"
  },
  {
    id: "RES005",
    client: "Léa Bernard",
    telephone: "06 78 90 12 34",
    email: "lea.bernard@email.com",
    service: "Hydroneedling VIP",
    date: "2024-02-13",
    heure: "10:30",
    duree: 120,
    prix: 200,
    status: "annulee" as const,
    notes: "Annulé le 12/02"
  }
];

type Status = "confirmee" | "en_attente" | "terminee" | "annulee";

export default function AdminReservations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const itemsPerPage = 10;

  // Filtrer les réservations
  const filteredReservations = mockReservations.filter(res => {
    const matchesSearch = res.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          res.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          res.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || res.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const paginatedReservations = filteredReservations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Formater la date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status: Status) => {
    switch(status) {
      case 'confirmee': return 'bg-green-100 text-green-800';
      case 'en_attente': return 'bg-orange-100 text-orange-800';
      case 'terminee': return 'bg-gray-100 text-gray-800';
      case 'annulee': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status: Status) => {
    switch(status) {
      case 'confirmee': return <CheckCircle className="w-4 h-4" />;
      case 'en_attente': return <AlertCircle className="w-4 h-4" />;
      case 'terminee': return <Clock className="w-4 h-4" />;
      case 'annulee': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  // Obtenir le label du statut
  const getStatusLabel = (status: Status) => {
    switch(status) {
      case 'confirmee': return 'Confirmée';
      case 'en_attente': return 'En attente';
      case 'terminee': return 'Terminée';
      case 'annulee': return 'Annulée';
      default: return status;
    }
  };

  // Calculer les statistiques
  const stats = {
    total: mockReservations.length,
    confirmees: mockReservations.filter(r => r.status === 'confirmee').length,
    en_attente: mockReservations.filter(r => r.status === 'en_attente').length,
    revenue: mockReservations.filter(r => r.status === 'confirmee' || r.status === 'terminee')
                             .reduce((sum, r) => sum + r.prix, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#d4b5a0]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-serif font-semibold text-[#2c3e50]">LAIA SKIN Admin</span>
              </Link>
            </div>
            
            <nav className="flex items-center gap-6">
              <Link href="/admin/dashboard" className="text-[#2c3e50]/70 hover:text-[#2c3e50]">
                Dashboard
              </Link>
              <Link href="/admin/planning" className="text-[#2c3e50]/70 hover:text-[#2c3e50]">
                Planning
              </Link>
              <Link href="/admin/reservations" className="text-[#d4b5a0] font-semibold">
                Réservations
              </Link>
              <Link href="/admin/clients" className="text-[#2c3e50]/70 hover:text-[#2c3e50]">
                Clients
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#2c3e50]/60">Total réservations</p>
                <p className="text-2xl font-bold text-[#2c3e50]">{stats.total}</p>
              </div>
              <Calendar className="w-8 h-8 text-[#d4b5a0]" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#2c3e50]/60">Confirmées</p>
                <p className="text-2xl font-bold text-green-600">{stats.confirmees}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#2c3e50]/60">En attente</p>
                <p className="text-2xl font-bold text-orange-600">{stats.en_attente}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#2c3e50]/60">Chiffre d'affaires</p>
                <p className="text-2xl font-bold text-[#d4b5a0]">{stats.revenue}€</p>
              </div>
              <Euro className="w-8 h-8 text-[#d4b5a0]" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2c3e50]/40" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, service ou ID..."
                  className="w-full pl-10 pr-4 py-2 border border-[#d4b5a0]/30 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <select
              className="px-4 py-2 border border-[#d4b5a0]/30 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Status | "all")}
            >
              <option value="all">Tous les statuts</option>
              <option value="confirmee">Confirmée</option>
              <option value="en_attente">En attente</option>
              <option value="terminee">Terminée</option>
              <option value="annulee">Annulée</option>
            </select>
            
            <button className="px-4 py-2 bg-[#fdfbf7] text-[#2c3e50] rounded-lg hover:bg-[#f8f6f0] flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Plus de filtres
            </button>
            
            <button className="px-4 py-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
              <Download className="w-5 h-5" />
              Exporter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#fdfbf7]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#2c3e50] uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#2c3e50] uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#2c3e50] uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#2c3e50] uppercase tracking-wider">
                    Date & Heure
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#2c3e50] uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#2c3e50] uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#2c3e50] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedReservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-[#fdfbf7]/50 transition-colors">
                    <td className="px-4 py-4 text-sm font-medium text-[#2c3e50]">
                      {reservation.id}
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-semibold text-[#2c3e50]">{reservation.client}</div>
                        <div className="text-xs text-[#2c3e50]/60 flex items-center gap-2 mt-1">
                          <Phone className="w-3 h-3" />
                          {reservation.telephone}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-[#2c3e50]">{reservation.service}</div>
                      <div className="text-xs text-[#2c3e50]/60">{reservation.duree} min</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-[#2c3e50]">{formatDate(reservation.date)}</div>
                      <div className="text-xs text-[#2c3e50]/60 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {reservation.heure}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold text-[#d4b5a0]">{reservation.prix}€</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(reservation.status)}`}>
                        {getStatusIcon(reservation.status)}
                        {getStatusLabel(reservation.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSelectedReservation(reservation)}
                          className="text-[#d4b5a0] hover:text-[#c9a084]"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-800">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 bg-[#fdfbf7] border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-[#2c3e50]/70">
                  Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, filteredReservations.length)} sur {filteredReservations.length} résultats
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-[#2c3e50] hover:bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded-lg ${
                        currentPage === i + 1
                          ? 'bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white'
                          : 'text-[#2c3e50] hover:bg-white'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-[#2c3e50] hover:bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Détails */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedReservation(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-serif font-semibold text-[#2c3e50]">
                Réservation {selectedReservation.id}
              </h3>
              <button onClick={() => setSelectedReservation(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#2c3e50]/60 mb-1">Client</p>
                  <p className="font-semibold text-[#2c3e50]">{selectedReservation.client}</p>
                </div>
                <div>
                  <p className="text-sm text-[#2c3e50]/60 mb-1">Statut</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedReservation.status)}`}>
                    {getStatusIcon(selectedReservation.status)}
                    {getStatusLabel(selectedReservation.status)}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-[#2c3e50]/60 mb-1">Service</p>
                <p className="font-semibold text-[#2c3e50]">{selectedReservation.service}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#2c3e50]/60 mb-1">Date</p>
                  <p className="font-semibold text-[#2c3e50]">{formatDate(selectedReservation.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-[#2c3e50]/60 mb-1">Heure</p>
                  <p className="font-semibold text-[#2c3e50]">{selectedReservation.heure}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#2c3e50]/60 mb-1">Durée</p>
                  <p className="font-semibold text-[#2c3e50]">{selectedReservation.duree} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-[#2c3e50]/60 mb-1">Prix</p>
                  <p className="font-semibold text-[#d4b5a0] text-xl">{selectedReservation.prix}€</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-[#2c3e50]/60 mb-1">Contact</p>
                <div className="space-y-1">
                  <p className="text-sm flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#d4b5a0]" />
                    {selectedReservation.telephone}
                  </p>
                  <p className="text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#d4b5a0]" />
                    {selectedReservation.email}
                  </p>
                </div>
              </div>
              
              {selectedReservation.notes && (
                <div>
                  <p className="text-sm text-[#2c3e50]/60 mb-1">Notes</p>
                  <p className="text-sm text-[#2c3e50] bg-[#fdfbf7] p-3 rounded-lg">
                    {selectedReservation.notes}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button className="flex-1 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all">
                Modifier
              </button>
              <button className="flex-1 bg-gray-200 text-[#2c3e50] py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}