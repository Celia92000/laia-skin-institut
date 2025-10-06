'use client';

import { useState, useMemo } from 'react';
import { Package, Filter, X } from 'lucide-react';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  category?: string;
  brand?: string;
  mainImage?: string;
  imageSettings?: string;
  active: boolean;
  featured: boolean;
  order: number;
  stock?: number;
}

interface ProductsPageClientProps {
  products: Product[];
}

export default function ProductsPageClient({ products }: ProductsPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Extraire les catégories uniques
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(product => {
      if (product.category) {
        cats.add(product.category);
      }
    });
    return Array.from(cats).sort();
  }, [products]);

  // Filtrer les produits
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Filtre par catégorie
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }

      // Filtre par recherche
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          product.name.toLowerCase().includes(search) ||
          product.description.toLowerCase().includes(search) ||
          (product.shortDescription && product.shortDescription.toLowerCase().includes(search))
        );
      }

      return true;
    });
  }, [products, selectedCategory, searchTerm]);

  // Grouper par catégorie si aucun filtre n'est actif
  const groupedProducts = useMemo(() => {
    if (selectedCategory !== 'all' || searchTerm) {
      return { 'Résultats': filteredProducts };
    }

    const groups: Record<string, Product[]> = {};

    // D'abord les produits sans catégorie
    const uncategorized = filteredProducts.filter(p => !p.category);
    if (uncategorized.length > 0) {
      groups['Nos produits'] = uncategorized;
    }

    // Puis grouper par catégorie
    filteredProducts.forEach(product => {
      if (product.category) {
        if (!groups[product.category]) {
          groups[product.category] = [];
        }
        groups[product.category].push(product);
      }
    });

    return groups;
  }, [filteredProducts, selectedCategory, searchTerm]);

  return (
    <div>
      {/* Barre de filtres */}
      <div className="bg-white shadow-sm sticky top-0 z-40 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Recherche */}
            <div className="w-full sm:w-96">
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
              />
            </div>

            {/* Boutons de catégories (desktop) */}
            {categories.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 overflow-x-auto flex-nowrap whitespace-nowrap max-w-full">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0 ${
                    selectedCategory === 'all'
                      ? 'bg-[#d4b5a0] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tous
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0 ${
                      selectedCategory === category
                        ? 'bg-[#d4b5a0] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}

            {/* Bouton filtre mobile */}
            {categories.length > 0 && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-700"
              >
                <Filter className="w-4 h-4" />
                Filtres
                {selectedCategory !== 'all' && (
                  <span className="bg-[#d4b5a0] text-white px-2 py-0.5 rounded-full text-xs">
                    1
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Filtres mobile */}
          {showFilters && categories.length > 0 && (
            <div className="sm:hidden mt-4 pt-4 border-t">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setShowFilters(false);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-[#d4b5a0] text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Tous
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowFilters(false);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-[#d4b5a0] text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Indicateur de filtre actif */}
          {(selectedCategory !== 'all' || searchTerm) && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-gray-500">Filtres actifs :</span>
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="flex items-center gap-1 px-3 py-1 bg-[#d4b5a0]/10 text-[#d4b5a0] rounded-full hover:bg-[#d4b5a0]/20 transition-colors"
                >
                  {selectedCategory}
                  <X className="w-3 h-3" />
                </button>
              )}
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="flex items-center gap-1 px-3 py-1 bg-[#d4b5a0]/10 text-[#d4b5a0] rounded-full hover:bg-[#d4b5a0]/20 transition-colors"
                >
                  "{searchTerm}"
                  <X className="w-3 h-3" />
                </button>
              )}
              <span className="text-gray-500 ml-2">
                ({filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Affichage des produits */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto text-[#2c3e50]/20 mb-4" />
            <p className="text-xl text-[#2c3e50]/60">
              {searchTerm || selectedCategory !== 'all'
                ? 'Aucun produit trouvé avec ces critères'
                : 'Nos produits arrivent bientôt...'}
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="mt-4 text-[#d4b5a0] hover:text-[#c9a084] transition-colors"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
              <div key={category}>
                {/* Titre de catégorie */}
                {Object.keys(groupedProducts).length > 1 && (
                  <h2 className="text-2xl font-playfair text-[#2c3e50] mb-6 pb-2 border-b border-[#d4b5a0]/20">
                    {category}
                  </h2>
                )}

                {/* Grille de produits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categoryProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}