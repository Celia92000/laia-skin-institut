"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Save, X, Trash2, ChevronDown, ChevronRight, Tag, FolderOpen } from "lucide-react";

interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color: string;
  image?: string;
  order: number;
  active: boolean;
  featured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  subcategories?: ServiceSubcategory[];
  _count?: {
    services: number;
  };
}

interface ServiceSubcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  order: number;
  active: boolean;
  _count?: {
    services: number;
  };
}

export default function AdminCategoriesManager() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<ServiceSubcategory | null>(null);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [showNewSubcategoryForm, setShowNewSubcategoryForm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const saveCategory = async (category: Partial<ServiceCategory>) => {
    try {
      const token = localStorage.getItem('token');
      const url = category.id
        ? `/api/admin/categories/${category.id}`
        : '/api/admin/categories';

      const response = await fetch(url, {
        method: category.id ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(category)
      });

      if (response.ok) {
        await fetchCategories();
        setEditingCategory(null);
        setShowNewCategoryForm(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la catégorie:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchCategories();
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const saveSubcategory = async (subcategory: Partial<ServiceSubcategory>) => {
    try {
      const token = localStorage.getItem('token');
      const url = subcategory.id
        ? `/api/admin/subcategories/${subcategory.id}`
        : '/api/admin/subcategories';

      const response = await fetch(url, {
        method: subcategory.id ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(subcategory)
      });

      if (response.ok) {
        await fetchCategories();
        setEditingSubcategory(null);
        setShowNewSubcategoryForm(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la sous-catégorie:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const deleteSubcategory = async (subcategoryId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette sous-catégorie ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/subcategories/${subcategoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchCategories();
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la sous-catégorie:', error);
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Catégories de services</h2>
        <button
          onClick={() => setShowNewCategoryForm(true)}
          className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Nouvelle catégorie
        </button>
      </div>

      {/* Formulaire nouvelle catégorie */}
      {showNewCategoryForm && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4 border-2 border-rose-500">
          <h3 className="font-bold mb-4">Nouvelle catégorie</h3>
          <CategoryForm
            onSave={(data) => saveCategory(data)}
            onCancel={() => setShowNewCategoryForm(false)}
          />
        </div>
      )}

      {/* Liste des catégories */}
      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category.id} className="border rounded-lg">
            <div className="flex items-center justify-between p-4 bg-gray-50">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  {expandedCategories.has(category.id) ? (
                    <ChevronDown size={20} />
                  ) : (
                    <ChevronRight size={20} />
                  )}
                </button>

                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: category.color }}
                />

                <FolderOpen size={20} className="text-gray-600" />

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{category.name}</span>
                    {!category.active && (
                      <span className="text-xs bg-gray-300 px-2 py-1 rounded">Inactif</span>
                    )}
                    {category.featured && (
                      <span className="text-xs bg-yellow-300 px-2 py-1 rounded">★ Mis en avant</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {category._count?.services || 0} service(s) • {category.subcategories?.length || 0} sous-catégorie(s)
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setEditingCategory(category)}
                  className="text-blue-600 hover:text-blue-800 p-2"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => deleteCategory(category.id)}
                  className="text-red-600 hover:text-red-800 p-2"
                  disabled={(category._count?.services || 0) > 0}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Formulaire édition catégorie */}
            {editingCategory?.id === category.id && (
              <div className="p-4 bg-blue-50 border-t">
                <CategoryForm
                  category={editingCategory}
                  onSave={(data) => saveCategory({ ...data, id: category.id })}
                  onCancel={() => setEditingCategory(null)}
                />
              </div>
            )}

            {/* Sous-catégories */}
            {expandedCategories.has(category.id) && (
              <div className="p-4 bg-white border-t">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-700">Sous-catégories</h4>
                  <button
                    onClick={() => setShowNewSubcategoryForm(category.id)}
                    className="text-rose-600 hover:text-rose-800 flex items-center gap-1 text-sm"
                  >
                    <Plus size={16} />
                    Ajouter une sous-catégorie
                  </button>
                </div>

                {/* Formulaire nouvelle sous-catégorie */}
                {showNewSubcategoryForm === category.id && (
                  <div className="bg-rose-50 p-3 rounded mb-3 border-2 border-rose-300">
                    <SubcategoryForm
                      categoryId={category.id}
                      onSave={(data) => saveSubcategory({ ...data, categoryId: category.id })}
                      onCancel={() => setShowNewSubcategoryForm(null)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  {category.subcategories?.map((subcategory) => (
                    <div key={subcategory.id} className="bg-gray-50 p-3 rounded flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Tag size={16} className="text-gray-600" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span>{subcategory.name}</span>
                            {!subcategory.active && (
                              <span className="text-xs bg-gray-300 px-2 py-1 rounded">Inactif</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-600">
                            {subcategory._count?.services || 0} service(s)
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingSubcategory(subcategory)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteSubcategory(subcategory.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          disabled={(subcategory._count?.services || 0) > 0}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Formulaire édition sous-catégorie */}
                  {editingSubcategory && category.subcategories?.find(s => s.id === editingSubcategory.id) && (
                    <div className="bg-blue-50 p-3 rounded border-2 border-blue-300">
                      <SubcategoryForm
                        categoryId={category.id}
                        subcategory={editingSubcategory}
                        onSave={(data) => saveSubcategory({ ...data, id: editingSubcategory.id, categoryId: category.id })}
                        onCancel={() => setEditingSubcategory(null)}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FolderOpen size={48} className="mx-auto mb-4 opacity-50" />
          <p>Aucune catégorie. Créez-en une pour commencer !</p>
        </div>
      )}
    </div>
  );
}

// Formulaire pour catégorie
function CategoryForm({
  category,
  onSave,
  onCancel
}: {
  category?: ServiceCategory;
  onSave: (data: Partial<ServiceCategory>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    color: category?.color || '#e11d48',
    icon: category?.icon || '',
    featured: category?.featured || false,
    active: category?.active !== undefined ? category.active : true,
  });

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Nom *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full border rounded px-3 py-2"
          placeholder="Ex: Soins du visage"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full border rounded px-3 py-2"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Couleur</label>
          <input
            type="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="w-full h-10 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Icône (optionnel)</label>
          <input
            type="text"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder="FaFaceSmile"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
          />
          <span className="text-sm">Active</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.featured}
            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
          />
          <span className="text-sm">Mise en avant</span>
        </label>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={() => onSave(formData)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
          disabled={!formData.name}
        >
          <Save size={18} />
          Enregistrer
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 flex items-center gap-2"
        >
          <X size={18} />
          Annuler
        </button>
      </div>
    </div>
  );
}

// Formulaire pour sous-catégorie
function SubcategoryForm({
  categoryId,
  subcategory,
  onSave,
  onCancel
}: {
  categoryId: string;
  subcategory?: ServiceSubcategory;
  onSave: (data: Partial<ServiceSubcategory>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: subcategory?.name || '',
    description: subcategory?.description || '',
    icon: subcategory?.icon || '',
    active: subcategory?.active !== undefined ? subcategory.active : true,
  });

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Nom *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full border rounded px-3 py-2"
          placeholder="Ex: Soins anti-âge"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full border rounded px-3 py-2"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Icône (optionnel)</label>
        <input
          type="text"
          value={formData.icon}
          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          className="w-full border rounded px-3 py-2"
          placeholder="FaStar"
        />
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.active}
          onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
        />
        <span className="text-sm">Active</span>
      </label>

      <div className="flex gap-2 pt-2">
        <button
          onClick={() => onSave(formData)}
          className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 flex items-center gap-2 text-sm"
          disabled={!formData.name}
        >
          <Save size={16} />
          Enregistrer
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-400 flex items-center gap-2 text-sm"
        >
          <X size={16} />
          Annuler
        </button>
      </div>
    </div>
  );
}
