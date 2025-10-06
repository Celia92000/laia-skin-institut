import Link from "next/link";
import { getPrismaClient } from '@/lib/prisma';
import { ArrowRight } from 'lucide-react';
import ProductsPageClient from '@/components/ProductsPageClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProduitsPage() {
  const prisma = await getPrismaClient();
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

      {/* Products avec filtres */}
      <section className="py-16 bg-white">
        <ProductsPageClient products={products} />
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
