'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight, Package, Star, Check, Shield, ChevronRight, Tag, Box, ShoppingCart
} from 'lucide-react';
// import UniversalPaymentModal from '@/components/UniversalPaymentModal';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  stock?: number;
  mainImage?: string;
  imageSettings?: string;
  gallery?: string;
  brand?: string;
  ingredients?: string;
  usage?: string;
  benefits?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.slug}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchProduct();
    }
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4b5a0]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl text-[#2c3e50] mb-4">Produit non trouvé</h1>
        <Link href="/produits" className="text-[#d4b5a0] hover:underline">
          Retour aux produits
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-[#d4b5a0]">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href="/produits" className="text-gray-500 hover:text-[#d4b5a0]">
              Produits
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-[#2c3e50] font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Product Info */}
            <div>
              <h1 className="text-4xl md:text-5xl font-playfair text-[#2c3e50] mb-4">
                {product.name}
              </h1>
              <p className="text-xl text-[#2c3e50]/70 mb-6">
                {product.shortDescription}
              </p>

              {product.brand && (
                <div className="flex items-center gap-2 mb-6">
                  <Tag className="w-5 h-5 text-[#d4b5a0]" />
                  <span className="text-[#2c3e50]/70">Marque: {product.brand}</span>
                </div>
              )}

              {/* Price & Stock */}
              <div className="bg-white rounded-2xl p-6 shadow-xl mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    {product.salePrice ? (
                      <>
                        <p className="text-gray-400 line-through text-lg">{product.price}€</p>
                        <p className="text-4xl font-light text-[#2c3e50]">{product.salePrice}€</p>
                        <p className="text-sm text-green-600 font-medium mt-1">
                          Économisez {(product.price - product.salePrice).toFixed(2)}€
                        </p>
                      </>
                    ) : (
                      <p className="text-4xl font-light text-[#2c3e50]">{product.price}€</p>
                    )}
                  </div>
                  <div className="text-right">
                    {product.stock === undefined || product.stock > 0 ? (
                      <>
                        <p className="text-green-600 font-medium">En stock</p>
                        {product.stock !== undefined && (
                          <p className="text-sm text-gray-500">{product.stock} disponible(s)</p>
                        )}
                      </>
                    ) : (
                      <p className="text-red-600 font-medium">Rupture de stock</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={product.stock !== undefined && product.stock === 0}
                  className="w-full bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white py-4 rounded-xl font-medium text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.stock !== undefined && product.stock === 0 ? 'Rupture de stock' : 'Acheter maintenant'}
                  {(product.stock === undefined || product.stock > 0) && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </button>

                <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    Produits professionnels
                  </span>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl">
                {product.mainImage ? (
                  <img
                    src={product.mainImage}
                    alt={product.name}
                    className="w-full h-full"
                    style={(() => {
                      try {
                        if (product.imageSettings) {
                          const settings = JSON.parse(product.imageSettings);
                          return {
                            objectFit: settings.objectFit || 'cover',
                            objectPosition: `${settings.position?.x || 50}% ${settings.position?.y || 50}%`,
                            transform: `scale(${(settings.zoom || 100) / 100})`
                          };
                        }
                      } catch {}
                      return { objectFit: 'cover' as const };
                    })()}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#d4b5a0]/30 to-[#c9a084]/30">
                    <Package className="w-32 h-32 text-[#2c3e50]/20" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Galerie d'images */}
      {product.gallery && (() => {
        try {
          const galleryImages = JSON.parse(product.gallery);
          return galleryImages.length > 0 ? (
            <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
              <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-playfair text-[#2c3e50] mb-4">
                    Galerie
                  </h2>
                  <p className="text-gray-600">
                    Découvrez {product.name} en images
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {galleryImages.map((imageUrl: string, index: number) => (
                    <div
                      key={index}
                      className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                      style={{ height: '300px' }}
                    >
                      <img
                        src={imageUrl}
                        alt={`${product.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#2c3e50]/60 via-[#2c3e50]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="text-white font-medium">{product.name}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null;
        } catch {
          return null;
        }
      })()}

      {/* Description */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-[#2c3e50] mb-8 text-center">
            Description
          </h2>
          <div className="prose prose-lg max-w-none text-[#2c3e50]/80">
            <p className="leading-relaxed text-lg">{product.description}</p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      {product.benefits && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-playfair text-[#2c3e50] mb-8 text-center">
              Bienfaits
            </h2>
            <div className="grid gap-4">
              {product.benefits.split('\n').filter(b => b.trim()).map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-[#d4b5a0]/5 to-transparent rounded-lg">
                  <Check className="w-6 h-6 text-[#d4b5a0] flex-shrink-0 mt-0.5" />
                  <p className="text-[#2c3e50]/80">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Ingredients */}
      {product.ingredients && (
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-playfair text-[#2c3e50] mb-8 text-center">
              Ingrédients
            </h2>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <p className="text-[#2c3e50]/80 leading-relaxed">{product.ingredients}</p>
            </div>
          </div>
        </section>
      )}

      {/* Usage */}
      {product.usage && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-playfair text-[#2c3e50] mb-8 text-center">
              Mode d'emploi
            </h2>
            <div className="bg-gradient-to-br from-[#d4b5a0]/10 to-transparent rounded-2xl p-8">
              <p className="text-[#2c3e50]/80 leading-relaxed">{product.usage}</p>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084]">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-playfair text-white mb-6">
            Prêt à commander ?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Contactez-nous pour passer commande
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-white text-[#2c3e50] px-8 py-4 rounded-full font-semibold hover:shadow-2xl transition-all"
          >
            Nous contacter
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Modal de paiement - temporairement désactivé */}
      {/* {showPaymentModal && product && (
        <UniversalPaymentModal
          item={{
            id: product.id,
            name: product.name,
            price: product.price,
            salePrice: product.salePrice,
            type: 'product',
            image: product.mainImage
          }}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={(orderId) => {
            console.log('Commande créée:', orderId);
            setShowPaymentModal(false);
          }}
        />
      )} */}
    </div>
  );
}
