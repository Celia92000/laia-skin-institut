import Link from "next/link";
import { prisma } from '@/lib/prisma';
import { ArrowRight, Package } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

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
                <ProductCard key={product.id} product={product} />
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
