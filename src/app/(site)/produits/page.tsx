import Link from "next/link";
import { prisma } from '@/lib/prisma';
import { Clock, ArrowRight, Sparkles, Star, Package } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProduitsPage() {
  let products: any[] = [];

  try {
    products = await prisma.product.findMany({
      where: { active: true },
      orderBy: [
        { featured: 'desc' },
        { order: 'asc' }
      ]
    });
  } catch (error) {
    console.error('Error fetching products:', error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-playfair font-normal text-[#2c3e50] mb-6">
            Nos Produits
          </h1>
          <p className="text-lg md:text-xl text-[#2c3e50]/60 max-w-2xl mx-auto">
            Découvrez notre sélection de produits de beauté professionnels pour sublimer votre peau
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 mx-auto text-[#2c3e50]/20 mb-4" />
              <p className="text-xl text-[#2c3e50]/60">
                Nos produits arrivent bientôt...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <Link
                  key={product.id}
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

                      {/* CTA */}
                      <div className="mt-4">
                        <div className="flex items-center text-[#d4b5a0] font-medium group-hover:gap-2 transition-all">
                          <span>Découvrir</span>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084]">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-playfair text-white mb-6">
            Besoin de conseils ?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Notre équipe est là pour vous guider dans le choix des produits adaptés à votre peau
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-white text-[#2c3e50] px-8 py-4 rounded-full font-semibold hover:shadow-2xl transition-all"
          >
            Contactez-nous
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
