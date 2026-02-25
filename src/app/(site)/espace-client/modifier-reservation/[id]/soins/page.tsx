"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, CheckCircle, AlertCircle, Sparkles, Clock } from "lucide-react";
import Link from "next/link";

// Fonctions utilitaires pour les prix
const hasPromotion = (service: any) => {
  return service.promoPrice && service.promoPrice > 0 && service.promoPrice < service.price;
};

const getDisplayPrice = (service: any) => {
  if (hasPromotion(service)) {
    return service.promoPrice;
  }
  return service.price;
};

const getForfaitDisplayPrice = (service: any) => {
  if (service.forfaitPromo && service.forfaitPromo > 0) {
    return service.forfaitPromo;
  }
  return service.forfaitPrice || service.price * 4;
};

const getDiscountPercentage = (originalPrice: number, discountedPrice: number) => {
  if (!originalPrice || originalPrice <= 0) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

export default function ModifierSoins() {
  const params = useParams();
  const router = useRouter();
  const [reservation, setReservation] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<{[key: string]: string}>({});
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchReservation();
    fetchServices();
  }, [params.id]);

  const fetchReservation = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reservations/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReservation(data);
        setSelectedServices(JSON.parse(data.services));
        if (data.packages) {
          setSelectedPackages(JSON.parse(data.packages));
        }
        if (data.options) {
          setSelectedOptions(JSON.parse(data.options));
        }
      }
    } catch (error) {
      setError("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        const formattedServices = data
          .filter((service: any) => service.available)
          .map((service: any) => ({
            ...service,
            forfait: service.forfaitPrice > 0,
            price: service.price,
            promoPrice: service.promoPrice,
            forfaitPrice: service.forfaitPrice,
            forfaitPromo: service.forfaitPromo,
            displayPrice: getDisplayPrice(service),
            forfaitDisplayPrice: getForfaitDisplayPrice(service),
            hasPromo: hasPromotion(service),
            discountPercent: hasPromotion(service) ? getDiscountPercentage(service.price, service.promoPrice) : 0,
            icon: service.slug === 'hydroneedling' ? "👑" :
                  service.slug === 'hydroface' ? "💧" :
                  service.slug === 'nanoneedling' ? "✨" :
                  service.slug === 'led-therapie' ? "💡" : "🌟",
            recommended: service.featured || false,
            order: service.order || 999
          }))
          .sort((a: any, b: any) => {
            if (a.recommended && !b.recommended) return -1;
            if (!a.recommended && b.recommended) return 1;
            return a.order - b.order;
          });
        setServices(formattedServices);
      })
      .catch(err => {
        console.error('Erreur lors du chargement des services:', err);
      });
  };

  const calculateTotal = () => {
    let total = 0;
    
    // Calculer le prix des services sélectionnés
    selectedServices.forEach(serviceId => {
      const service = services.find(s => s.id === serviceId);
      if (service) {
        const packageType = selectedPackages[serviceId] || 'single';
        
        let priceToAdd = 0;
        
        if (packageType === 'forfait') {
          priceToAdd = Number(service.forfaitDisplayPrice) || Number(service.forfaitPrice) || 0;
        } else {
          priceToAdd = Number(service.displayPrice) || Number(service.price) || 0;
        }
        
        total = total + priceToAdd;
      }
    });
    
    // Ajouter le prix des options (50€ chacune)
    if (selectedOptions && selectedOptions.length > 0) {
      selectedOptions.forEach(optionId => {
        if (optionId === "bb-glow" || optionId === "led-therapie") {
          total = total + 50;
        }
      });
    }
    
    return Math.round(total);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reservations/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          services: selectedServices,
          packages: selectedPackages,
          options: selectedOptions,
          date: reservation.date,
          time: reservation.time,
          totalPrice: calculateTotal()
        })
      });

      if (response.ok) {
        setSuccess(true);
        
        // Envoyer notification email
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: reservation.user.email,
            subject: 'Modification de vos soins - LAIA SKIN INSTITUT',
            message: `Bonjour ${reservation.user.name},\n\nVos soins ont été modifiés avec succès.\n\nDate : ${new Date(reservation.date).toLocaleDateString('fr-FR')}\nHeure : ${reservation.time}\nNouveaux soins : ${selectedServices.join(', ')}\nNouveau total : ${calculateTotal()}€\n\nÀ très bientôt !\n\nLAIA SKIN INSTITUT`
          })
        });

        setTimeout(() => {
          router.push('/espace-client');
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de la modification");
      }
    } catch (error) {
      setError("Erreur lors de la modification");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4b5a0]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0] py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/espace-client/modifier-reservation/${params.id}/choix`}
            className="inline-flex items-center text-[#d4b5a0] hover:text-[#c9a084] mb-4"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Retour au choix
          </Link>
          <h1 className="text-4xl font-serif font-bold text-[#2c3e50] mb-3">
            Modifier mes soins
          </h1>
          <p className="text-xl text-[#2c3e50]/70">
            Rendez-vous du {new Date(reservation?.date).toLocaleDateString('fr-FR')} à {reservation?.time}
          </p>
        </div>

        {/* Alertes */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <p className="text-green-800">Soins modifiés avec succès ! Redirection...</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-serif font-bold text-[#2c3e50] mb-6">Choisissez vos soins</h2>
            
            {/* Liste des services */}
            <div className="space-y-4">
              {services.map((service, index) => (
                <div key={service.id}>
                  <div className={`p-6 border-2 rounded-2xl transition-all duration-300 ${
                    selectedServices.includes(service.id)
                      ? 'border-[#d4b5a0] bg-gradient-to-br from-[#fdfbf7] to-white shadow-lg' 
                      : 'border-gray-200 hover:border-[#d4b5a0]/50 hover:shadow-md'
                  }`}>
                    <label className="flex items-start gap-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            let newServices = [...selectedServices];
                            
                            // Logique spéciale pour Hydroneedling
                            if (service.id === "hydroneedling") {
                              newServices = newServices.filter(id => id !== "hydroface" && id !== "nanoneedling");
                            }

                            if (service.id === "hydroface" || service.id === "nanoneedling") {
                              newServices = newServices.filter(id => id !== "hydroneedling");

                              if ((service.id === "hydroface" && newServices.includes("nanoneedling")) ||
                                  (service.id === "nanoneedling" && newServices.includes("hydroface"))) {
                                if (confirm("Vous avez sélectionné Hydroface et Nanoneedling. Voulez-vous plutôt choisir le soin combiné Hydroneedling qui est plus avantageux ?")) {
                                  newServices = ["hydroneedling"];
                                  setSelectedPackages({"hydroneedling": "single"});
                                } else {
                                  newServices.push(service.id);
                                }
                              } else {
                                newServices.push(service.id);
                              }
                            } else {
                              newServices.push(service.id);
                            }
                            
                            setSelectedServices(newServices);
                            const updatedPackages = {...selectedPackages};
                            newServices.forEach(sid => {
                              if (!updatedPackages[sid]) {
                                updatedPackages[sid] = "single";
                              }
                            });
                            setSelectedPackages(updatedPackages);
                          } else {
                            setSelectedServices(selectedServices.filter(id => id !== service.id));
                            const newPackages = {...selectedPackages};
                            delete newPackages[service.id];
                            setSelectedPackages(newPackages);
                          }
                        }}
                        className="mt-1 w-5 h-5 text-[#d4b5a0] focus:ring-[#d4b5a0] rounded"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-serif font-semibold text-xl text-[#2c3e50] mb-1">{service.name} {service.icon}</h3>
                            <p className="text-[#2c3e50]/70 mb-2">{service.description}</p>
                            <p className="text-sm text-[#2c3e50]/60 flex items-center">
                              <Clock className="inline w-4 h-4 mr-1" />
                              {service.duration}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-right">
                              <div className="flex items-baseline gap-2 justify-end">
                                <span className="text-3xl font-bold text-[#d4b5a0]">{service.displayPrice}€</span>
                                {service.hasPromo && (
                                  <>
                                    <span className="text-lg line-through text-gray-400">{service.price}€</span>
                                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">-{service.discountPercent}%</span>
                                  </>
                                )}
                              </div>
                            </div>
                            {selectedServices.includes(service.id) && (
                              <CheckCircle className="w-6 h-6 text-[#d4b5a0] mt-2 ml-auto" />
                            )}
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                  
                  {/* Choix forfait - visible seulement si service sélectionné */}
                  {selectedServices.includes(service.id) && service.forfait && (
                    <div className="px-6 pb-6 -mt-2 animate-fade-in-down">
                      <div className="bg-gradient-to-br from-[#fdfbf7] to-white rounded-xl p-4 border border-[#d4b5a0]/20">
                        <h4 className="font-medium text-[#2c3e50] mb-3 flex items-center">
                          <Sparkles className="w-4 h-4 mr-2 text-[#d4b5a0]" />
                          Choisissez votre formule
                        </h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          <label className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedPackages[service.id] === "single" 
                              ? "border-[#d4b5a0] bg-white shadow-md" 
                              : "border-gray-200 hover:border-[#d4b5a0]/50"
                          }`}>
                            <input
                              type="radio"
                              name={`package-${service.id}`}
                              value="single"
                              checked={selectedPackages[service.id] === "single"}
                              onChange={(e) => setSelectedPackages({...selectedPackages, [service.id]: e.target.value})}
                              className="hidden"
                            />
                            <div className="flex justify-between items-center">
                              <div>
                                <h5 className="font-semibold text-sm text-[#2c3e50]">Séance unique</h5>
                                <p className="text-xs text-[#2c3e50]/60 mt-1">Découvrir le soin</p>
                              </div>
                              <span className="text-lg font-bold text-[#d4b5a0]">
                                {service.displayPrice}€
                              </span>
                            </div>
                          </label>
                          
                          <label className={`p-3 border-2 rounded-lg cursor-pointer transition-all relative ${
                            selectedPackages[service.id] === "forfait" 
                              ? "border-[#d4b5a0] bg-white shadow-md" 
                              : "border-gray-200 hover:border-[#d4b5a0]/50"
                          }`}>
                            {(service.id === "hydroface" || service.id === "nanoneedling") && (
                              <span className="absolute -top-2 right-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white px-2 py-0.5 text-xs rounded-full font-semibold">
                                -20€
                              </span>
                            )}
                            {service.id === "led-therapie" && (
                              <span className="absolute -top-2 right-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white px-2 py-0.5 text-xs rounded-full font-semibold">
                                -40€
                              </span>
                            )}
                            {service.id === "hydroneedling" && (
                              <span className="absolute -top-2 right-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white px-2 py-0.5 text-xs rounded-full font-semibold">
                                Économie
                              </span>
                            )}
                            <input
                              type="radio"
                              name={`package-${service.id}`}
                              value="forfait"
                              checked={selectedPackages[service.id] === "forfait"}
                              onChange={(e) => setSelectedPackages({...selectedPackages, [service.id]: e.target.value})}
                              className="hidden"
                            />
                            <div className="flex justify-between items-center">
                              <div>
                                <h5 className="font-semibold text-sm text-[#2c3e50]">Forfait 4 séances</h5>
                                <p className="text-xs text-[#2c3e50]/60 mt-1">Résultats optimaux</p>
                              </div>
                              <span className="text-lg font-bold text-green-600">
                                {service.forfaitDisplayPrice}€
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Section Options complémentaires */}
            {selectedServices.length > 0 && (
              <div className="mt-8 p-6 bg-gradient-to-br from-[#fdfbf7] to-white rounded-2xl border border-[#d4b5a0]/20">
                <h3 className="text-xl font-serif font-bold text-[#2c3e50] mb-4">
                  Options complémentaires
                </h3>
                <p className="text-sm text-[#2c3e50]/70 mb-4">
                  Ajoutez ces soins pour compléter votre expérience
                </p>
                <div className="space-y-3">
                  {/* LED Thérapie en option */}
                  {!selectedServices.includes("led-therapie") &&
                   !["hydroface", "hydroneedling", "nanoneedling"].some(id => selectedServices.includes(id)) && (
                    <label className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedOptions.includes("led-therapie")
                        ? "border-[#d4b5a0] bg-[#d4b5a0]/5"
                        : "border-gray-200 hover:border-[#d4b5a0]/50"
                    }`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedOptions.includes("led-therapie")}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOptions([...selectedOptions, "led-therapie"]);
                            } else {
                              setSelectedOptions(selectedOptions.filter(opt => opt !== "led-therapie"));
                            }
                          }}
                          className="w-5 h-5 text-[#d4b5a0] rounded"
                        />
                        <div>
                          <h4 className="font-medium text-[#2c3e50]">LED Thérapie 💡</h4>
                          <p className="text-sm text-[#2c3e50]/60">Traitement anti-âge en profondeur</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-[#d4b5a0]">+50€</span>
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* Total et boutons */}
            <div className="mt-8 p-6 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] rounded-xl text-white">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold">Total :</span>
                <span className="text-3xl font-bold">{calculateTotal()}€</span>
              </div>
              {calculateTotal() !== reservation?.totalPrice && (
                <p className="text-sm text-white/80">
                  Ancien total : {reservation?.totalPrice}€
                </p>
              )}
            </div>

            <div className="flex gap-4 mt-8">
              <Link
                href={`/espace-client/modifier-reservation/${params.id}/choix`}
                className="flex-1 py-4 border-2 border-[#d4b5a0] text-[#d4b5a0] rounded-xl text-center hover:bg-[#d4b5a0]/10 transition-all font-semibold"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={saving || selectedServices.length === 0}
                className="flex-1 py-4 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
              >
                {saving ? 'Modification en cours...' : 'Confirmer les nouveaux soins'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}