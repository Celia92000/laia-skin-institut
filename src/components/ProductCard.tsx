'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, Package, ShoppingCart } from 'lucide-react';
import UniversalPaymentModal from './UniversalPaymentModal';

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    name: string;
    description: string;
    shortDescription?: string;
    price: number;
    salePrice?: number;
    stock: number;
    mainImage?: string;
    featured?: boolean;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleBuyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPaymentModal(true);
  };

  return (
    <>
      <Link
        href={`/produits/${product.slug}`}
        className="group block h-full"
      >
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 h-full flex flex-col min-h-[500px]">
          {/* Image */}
          <div className="h-64 bg-gradient-to-br from-[#d4b5a0]/30 to-[#c9a084]/30 relative overflow-hidden">
            {product.featured && (
              <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-full shadow-lg">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-xs font-bold">BEST-SELLER</span>
              </div>
            )}
            {product.mainImage ? (
              <img
                src={product.mainImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-20 h-20 text-[#2c3e50]/20" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 flex-1 flex flex-col">
            <h3 className="text-2xl font-playfair text-[#2c3e50] mb-3 group-hover:text-[#d4b5a0] transition-colors">
              {product.name}
            </h3>
            <p className="text-[#2c3e50]/70 mb-4 flex-1 line-clamp-3">
              {product.shortDescription || product.description}
            </p>

            {/* Price & Stock */}
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
              <div>
                {product.salePrice ? (
                  <div>
                    <span className="text-sm text-gray-400 line-through mr-2">
                      {product.price}€
                    </span>
                    <span className="text-2xl font-bold text-[#d4b5a0]">
                      {product.salePrice}€
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-[#2c3e50]">
                    {product.price}€
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {product.stock > 0 ? (
                  <span className="text-green-600">En stock</span>
                ) : (
                  <span className="text-red-600">Rupture</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleBuyClick}
                disabled={product.stock === 0}
                className="flex-1 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" />
                {product.stock === 0 ? 'Rupture' : 'Acheter'}
              </button>
              <div className="flex items-center text-[#d4b5a0] font-medium group-hover:gap-2 transition-all px-3">
                <span className="text-sm">Détails</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Modal de paiement */}
      {showPaymentModal && (
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
      )}
    </>
  );
}
