"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Calendar, Clock, Gift, User, LogOut, Star,
  ChevronRight, Award, Heart, Settings, Package, ShoppingBag
} from "lucide-react";

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState("appointments");
  const [orders, setOrders] = useState<any[]>([]);

  const clientInfo = {
    name: "Marie Dupont",
    email: "marie.dupont@email.com",
    phone: "06 12 34 56 78",
    loyaltyPoints: 250,
    memberSince: "Janvier 2024"
  };

  const upcomingAppointments = [
    {
      id: 1,
      date: "15 Décembre 2024",
      time: "14:00",
      service: "LAIA Hydro'Cleaning",
      price: "70€",
      status: "confirmé"
    },
    {
      id: 2,
      date: "22 Décembre 2024",
      time: "10:30",
      service: "BB Glow",
      price: "150€",
      status: "confirmé"
    }
  ];

  const pastAppointments = [
    {
      id: 3,
      date: "1 Décembre 2024",
      service: "LAIA Renaissance",
      price: "120€"
    },
    {
      id: 4,
      date: "15 Novembre 2024",
      service: "LED Thérapie",
      price: "70€"
    },
    {
      id: 5,
      date: "2 Novembre 2024",
      service: "Éclat Suprême",
      price: "65€"
    }
  ];

  // Charger les commandes du client
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/admin/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const allOrders = await response.json();
          // Filtrer pour ne garder que les commandes du client actuel
          // (Dans un vrai cas, on utiliserait l'ID du client connecté)
          setOrders(allOrders.filter((o: any) => o.customerEmail === clientInfo.email));
        }
      } catch (error) {
        console.error('Erreur chargement commandes:', error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <>
      <Header />
      <main className="pt-32 pb-20 min-h-screen bg-gradient-to-b from-white to-secondary">
        <div className="max-w-6xl mx-auto px-4">
          {/* Welcome Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-3xl font-serif text-primary mb-2">
                  Bienvenue, {clientInfo.name}
                </h1>
                <p className="text-muted">Membre depuis {clientInfo.memberSince}</p>
              </div>
              <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-4">
                <div className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Gift size={20} />
                    <div>
                      <p className="text-sm opacity-90">Points fidélité</p>
                      <p className="text-2xl font-bold">{clientInfo.loyaltyPoints}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link
              href="/reservation"
              className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Calendar className="text-primary" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold">Réserver un soin</h3>
                  </div>
                  <p className="text-muted">Prenez rendez-vous pour votre prochain soin</p>
                </div>
                <ChevronRight className="text-primary" size={24} />
              </div>
            </Link>

            <Link
              href="/carte-cadeau"
              className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Gift className="text-primary" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold">Offrir une carte cadeau</h3>
                  </div>
                  <p className="text-muted">Le cadeau idéal pour faire plaisir</p>
                </div>
                <ChevronRight className="text-primary" size={24} />
              </div>
            </Link>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab("appointments")}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                      activeTab === "appointments"
                        ? "bg-primary text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar size={20} />
                      <span>Mes RDV</span>
                    </div>
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => setActiveTab("loyalty")}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                      activeTab === "loyalty"
                        ? "bg-primary text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Award size={20} />
                      <span>Fidélité</span>
                    </div>
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => setActiveTab("purchases")}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                      activeTab === "purchases"
                        ? "bg-primary text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingBag size={20} />
                      <span>Mes achats</span>
                    </div>
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => setActiveTab("favorites")}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                      activeTab === "favorites"
                        ? "bg-primary text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Heart size={20} />
                      <span>Favoris</span>
                    </div>
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                      activeTab === "profile"
                        ? "bg-primary text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <User size={20} />
                      <span>Mon profil</span>
                    </div>
                    <ChevronRight size={16} />
                  </button>
                  <hr className="my-4" />
                  <Link
                    href="/"
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut size={20} />
                    <span>Déconnexion</span>
                  </Link>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-3">
              {activeTab === "appointments" && (
                <div className="space-y-6">
                  {/* Upcoming Appointments */}
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <Calendar className="mr-2 text-primary" size={24} />
                      Prochains rendez-vous
                    </h2>
                    {upcomingAppointments.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingAppointments.map((apt) => (
                          <div key={apt.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold">{apt.service}</p>
                                <p className="text-sm text-muted mt-1">
                                  <Clock className="inline mr-1" size={14} />
                                  {apt.date} à {apt.time}
                                </p>
                                <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  {apt.status}
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold text-primary">{apt.price}</p>
                                <button className="text-sm text-red-500 hover:text-red-700 mt-2">
                                  Annuler
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted">Aucun rendez-vous à venir</p>
                    )}
                  </div>

                  {/* Past Appointments */}
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h2 className="text-xl font-semibold mb-4">Historique</h2>
                    <div className="space-y-3">
                      {pastAppointments.map((apt) => (
                        <div key={apt.id} className="flex justify-between items-center py-3 border-b border-gray-100">
                          <div>
                            <p className="font-medium">{apt.service}</p>
                            <p className="text-sm text-muted">{apt.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{apt.price}</p>
                            <button className="text-sm text-primary hover:text-primary-dark">
                              Réserver à nouveau
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "loyalty" && (
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <Award className="mr-2 text-primary" size={24} />
                    Programme de fidélité
                  </h2>
                  <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl p-6 mb-6">
                    <p className="text-sm opacity-90 mb-2">Vos points actuels</p>
                    <p className="text-4xl font-bold mb-4">{clientInfo.loyaltyPoints} points</p>
                    <div className="bg-white/20 rounded-lg p-3">
                      <p className="text-sm">Plus que 50 points pour un soin offert !</p>
                      <div className="w-full bg-white/30 rounded-full h-2 mt-2">
                        <div className="bg-white rounded-full h-2" style={{width: '83%'}}></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold mb-3">Comment gagner des points ?</h3>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Star className="text-primary" size={20} />
                      <div>
                        <p className="font-medium">1€ dépensé = 1 point</p>
                        <p className="text-sm text-muted">Sur tous les soins</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Gift className="text-primary" size={20} />
                      <div>
                        <p className="font-medium">50 points bonus</p>
                        <p className="text-sm text-muted">Pour votre anniversaire</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <User className="text-primary" size={20} />
                      <div>
                        <p className="font-medium">100 points</p>
                        <p className="text-sm text-muted">Pour chaque parrainage</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "purchases" && (
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <ShoppingBag className="mr-2 text-primary" size={24} />
                    Mes achats
                  </h2>

                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => {
                        let items = [];
                        try {
                          items = JSON.parse(order.items || '[]');
                        } catch (e) {
                          console.error('Erreur parsing items:', e);
                        }

                        return (
                          <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <p className="font-mono text-sm text-primary font-semibold mb-1">
                                  {order.orderNumber}
                                </p>
                                <p className="text-sm text-muted">
                                  {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
                                  order.orderType === 'product'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {order.orderType === 'product' ? 'Produit' : 'Formation'}
                                </span>
                              </div>
                            </div>

                            <div className="mb-3">
                              <p className="text-sm font-medium mb-2">Articles :</p>
                              <ul className="space-y-1">
                                {items.map((item: any, idx: number) => (
                                  <li key={idx} className="text-sm text-gray-700 flex justify-between">
                                    <span>{item.name} (x{item.quantity})</span>
                                    <span className="font-medium">{item.price}€</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="flex justify-between items-center pt-3 border-t">
                              <div>
                                <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                                  order.paymentStatus === 'paid'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-orange-100 text-orange-800'
                                }`}>
                                  {order.paymentStatus === 'paid' ? 'Payé' : 'En attente'}
                                </span>
                              </div>
                              <p className="text-xl font-bold text-primary">
                                {order.totalAmount?.toFixed(2)}€
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-muted">Aucun achat pour le moment</p>
                      <Link
                        href="/boutique"
                        className="inline-block mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        Découvrir nos produits
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "profile" && (
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <Settings className="mr-2 text-primary" size={24} />
                    Mon profil
                  </h2>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nom complet</label>
                      <input
                        type="text"
                        value={clientInfo.name}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        value={clientInfo.email}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Téléphone</label>
                      <input
                        type="tel"
                        value={clientInfo.phone}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Enregistrer les modifications
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}