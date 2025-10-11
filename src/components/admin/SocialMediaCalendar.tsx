"use client";

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaInstagram, FaFacebook, FaTiktok, FaSnapchat, FaLinkedin, FaTwitter, FaCheck, FaTimes } from 'react-icons/fa';
import { formatDateLocal } from '@/lib/date-utils';

interface SocialMediaPost {
  id: string;
  title: string;
  content: string;
  platform?: string;
  scheduledDate: string;
  status: 'draft' | 'scheduled' | 'published' | 'cancelled';
  notes?: string;
  links?: string[];
  hashtags?: string;
  mediaUrls?: string[];
  publishedAt?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  posts: SocialMediaPost[];
}

export default function SocialMediaCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<SocialMediaPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingPost, setEditingPost] = useState<SocialMediaPost | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingPost, setViewingPost] = useState<SocialMediaPost | null>(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    platform: '',
    scheduledDate: '',
    scheduledTime: '09:00',
    status: 'draft' as 'draft' | 'scheduled' | 'published' | 'cancelled',
    notes: '',
    links: '',
    hashtags: '',
    mediaUrl: '',
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [currentDate]);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      const response = await fetch(`/api/admin/social-media?month=${month}&year=${year}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des publications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: CalendarDay[] = [];

    // Jours du mois précédent
    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, daysInPrevMonth - i);
      days.push({
        date,
        isCurrentMonth: false,
        posts: getPostsForDate(date)
      });
    }

    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        posts: getPostsForDate(date)
      });
    }

    // Jours du mois suivant
    const remainingDays = 42 - days.length; // 6 lignes × 7 jours
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        posts: getPostsForDate(date)
      });
    }

    return days;
  };

  const getPostsForDate = (date: Date): SocialMediaPost[] => {
    return posts.filter(post => {
      const postDate = new Date(post.scheduledDate);
      return postDate.toDateString() === date.toDateString();
    });
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setEditingPost(null);
    const formattedDate = formatDateLocal(date);
    setFormData({
      title: '',
      content: '',
      platform: '',
      scheduledDate: formattedDate,
      scheduledTime: '09:00',
      status: 'draft',
      notes: '',
      links: '',
      hashtags: '',
      mediaUrl: '',
    });
    setShowModal(true);
  };

  const handleEditPost = (post: SocialMediaPost, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPost(post);
    const postDate = new Date(post.scheduledDate);
    const formattedDate = formatDateLocal(postDate);
    const formattedTime = postDate.toTimeString().slice(0, 5);

    setFormData({
      title: post.title,
      content: post.content,
      platform: post.platform || '',
      scheduledDate: formattedDate,
      scheduledTime: formattedTime,
      status: post.status,
      notes: post.notes || '',
      links: post.links ? post.links.join('\n') : '',
      hashtags: post.hashtags || '',
      mediaUrl: post.mediaUrls && post.mediaUrls.length > 0 ? post.mediaUrls[0] : '',
    });
    setShowModal(true);
  };

  const handleViewPost = (post: SocialMediaPost, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setViewingPost(post);
    setShowViewModal(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFullPostContent = (post: SocialMediaPost) => {
    let content = post.content;
    if (post.hashtags) {
      content += '\n\n' + post.hashtags;
    }
    if (post.links && post.links.length > 0) {
      content += '\n\n' + post.links.join('\n');
    }
    return content;
  };

  const publishNow = async (post: SocialMediaPost) => {
    if (!post.platform) {
      alert('Veuillez sélectionner une plateforme avant de publier');
      return;
    }

    if (!confirm(`Publier maintenant sur ${post.platform} ?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/social-media/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ postId: post.id })
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Publication réussie sur ${post.platform}!`);
        setShowViewModal(false);
        fetchPosts();
      } else {
        alert(`❌ Erreur: ${data.error}`);
      }
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
      alert('❌ Erreur lors de la publication');
    }
  };

  const markAsPublished = async (post: SocialMediaPost) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/social-media', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: post.id,
          ...post,
          status: 'published',
          publishedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        setShowViewModal(false);
        fetchPosts();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette publication ?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/social-media?id=${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      const data = await response.json();

      if (data.url) {
        setFormData({ ...formData, mediaUrl: data.url });
      } else {
        alert('Erreur lors de l\'upload du fichier');
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);

      const payload = {
        title: formData.title,
        content: formData.content,
        platform: formData.platform || null,
        scheduledDate: scheduledDateTime.toISOString(),
        status: formData.status,
        notes: formData.notes || null,
        links: formData.links ? formData.links.split('\n').filter(l => l.trim()) : null,
        hashtags: formData.hashtags || null,
        mediaUrls: formData.mediaUrl ? [formData.mediaUrl] : null,
      };

      let response;
      if (editingPost) {
        response = await fetch('/api/admin/social-media', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ id: editingPost.id, ...payload })
        });
      } else {
        response = await fetch('/api/admin/social-media', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      if (response.ok) {
        setShowModal(false);
        fetchPosts();
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
    }
  };

  const getPlatformIcon = (platform?: string) => {
    switch (platform?.toLowerCase()) {
      case 'instagram':
        return <FaInstagram className="text-pink-600" />;
      case 'facebook':
        return <FaFacebook className="text-blue-600" />;
      case 'snapchat':
      case 'snap':
        return <FaSnapchat className="text-yellow-400" />;
      case 'tiktok':
        return <FaTiktok className="text-black" />;
      case 'linkedin':
        return <FaLinkedin className="text-blue-700" />;
      case 'twitter':
      case 'x':
        return <FaTwitter className="text-blue-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'published':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  if (loading) {
    return <div className="flex justify-center items-center h-96">Chargement...</div>;
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#d4b5a0]">Calendrier de Publication</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handlePreviousMonth}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
            >
              ←
            </button>
            <h3 className="text-xl font-semibold min-w-[200px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button
              onClick={handleNextMonth}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
            >
              →
            </button>
          </div>
        </div>

        {/* Légende */}
        <div className="flex gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-100"></div>
            <span>Brouillon</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-100"></div>
            <span>Planifié</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-100"></div>
            <span>Publié</span>
          </div>
        </div>

        {/* Calendrier */}
        <div className="grid grid-cols-7 gap-2">
          {/* En-têtes des jours */}
          {dayNames.map(day => (
            <div key={day} className="text-center font-semibold py-2 text-gray-600">
              {day}
            </div>
          ))}

          {/* Jours */}
          {getDaysInMonth().map((day, index) => (
            <div
              key={index}
              className={`min-h-[120px] border rounded-lg p-2 cursor-pointer hover:bg-gray-50 ${
                !day.isCurrentMonth ? 'bg-gray-50 opacity-50' : 'bg-white'
              }`}
              onClick={() => handleDayClick(day.date)}
            >
              <div className="font-semibold text-sm mb-2">
                {day.date.getDate()}
              </div>
              <div className="space-y-1">
                {day.posts.slice(0, 2).map(post => (
                  <div
                    key={post.id}
                    className={`text-xs p-1 rounded ${getStatusColor(post.status)} flex items-center justify-between gap-1 cursor-pointer hover:opacity-80 transition-opacity`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewPost(post, e);
                    }}
                  >
                    <div className="flex items-center gap-1 flex-1 overflow-hidden">
                      {getPlatformIcon(post.platform)}
                      <span className="truncate">{post.title}</span>
                    </div>
                  </div>
                ))}
                {day.posts.length > 2 && (
                  <div className="text-xs text-gray-500">+{day.posts.length - 2} autre(s)</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#d4b5a0]">
                  {editingPost ? 'Modifier la publication' : 'Nouvelle publication'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Titre *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Contenu *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full p-2 border rounded h-32"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Plateforme</label>
                    <select
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Snapchat">Snapchat</option>
                      <option value="TikTok">TikTok</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Twitter">Twitter</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Statut</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="draft">Brouillon</option>
                      <option value="scheduled">Planifié</option>
                      <option value="published">Publié</option>
                      <option value="cancelled">Annulé</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date *</label>
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Heure *</label>
                    <input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Hashtags</label>
                  <input
                    type="text"
                    value={formData.hashtags}
                    onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="#beauté #skincare"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Image/Vidéo {(formData.platform === 'TikTok' || formData.platform === 'Snapchat') && '(Média requis pour ' + formData.platform + ')'}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="w-full p-2 border rounded"
                      disabled={uploading}
                    />
                    {uploading && <p className="text-sm text-gray-500">Upload en cours...</p>}
                    {formData.mediaUrl && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-green-600">✓ Fichier uploadé</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, mediaUrl: '' })}
                          className="text-sm text-red-500 hover:underline"
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                    {formData.mediaUrl && formData.mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                      <img
                        src={formData.mediaUrl}
                        alt="Aperçu"
                        className="w-32 h-32 object-cover rounded border"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Liens (un par ligne)</label>
                  <textarea
                    value={formData.links}
                    onChange={(e) => setFormData({ ...formData, links: e.target.value })}
                    className="w-full p-2 border rounded h-20"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notes / Idées</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full p-2 border rounded h-24"
                    placeholder="Notes supplémentaires, idées..."
                  />
                </div>

                <div className="flex justify-between items-center pt-4">
                  {editingPost && (
                    <button
                      type="button"
                      onClick={() => handleDeletePost(editingPost.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2"
                    >
                      <FaTrash /> Supprimer
                    </button>
                  )}
                  <div className="flex gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#d4b5a0] text-white rounded hover:bg-[#c4a590] flex items-center gap-2"
                    >
                      <FaCheck /> Enregistrer
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de visualisation */}
      {showViewModal && viewingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {getPlatformIcon(viewingPost.platform)}
                    <h3 className="text-xl font-bold text-[#d4b5a0]">{viewingPost.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{new Date(viewingPost.scheduledDate).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(viewingPost.status)}`}>
                      {viewingPost.status === 'draft' && 'Brouillon'}
                      {viewingPost.status === 'scheduled' && 'Planifié'}
                      {viewingPost.status === 'published' && 'Publié'}
                      {viewingPost.status === 'cancelled' && 'Annulé'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Contenu complet */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-700">Contenu de la publication</h4>
                    <button
                      onClick={() => copyToClipboard(getFullPostContent(viewingPost))}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        copied
                          ? 'bg-green-500 text-white'
                          : 'bg-[#d4b5a0] text-white hover:bg-[#c4a590]'
                      }`}
                    >
                      {copied ? '✓ Copié !' : '📋 Copier tout'}
                    </button>
                  </div>
                  <div className="whitespace-pre-wrap text-gray-800 bg-white p-4 rounded border">
                    {getFullPostContent(viewingPost)}
                  </div>
                </div>

                {/* Plateforme */}
                {viewingPost.platform && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Plateforme</h4>
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(viewingPost.platform)}
                      <span>{viewingPost.platform}</span>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {viewingPost.notes && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Notes</h4>
                    <p className="text-gray-600 bg-yellow-50 p-3 rounded">{viewingPost.notes}</p>
                  </div>
                )}

                {/* Liens séparés */}
                {viewingPost.links && viewingPost.links.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Liens</h4>
                    <div className="space-y-2">
                      {viewingPost.links.map((link, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex-1 truncate"
                          >
                            {link}
                          </a>
                          <button
                            onClick={() => copyToClipboard(link)}
                            className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs"
                          >
                            Copier
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleEditPost(viewingPost);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-2"
                  >
                    <FaEdit /> Modifier
                  </button>

                  {viewingPost.status !== 'published' && viewingPost.platform && (
                    <button
                      onClick={() => publishNow(viewingPost)}
                      className="flex-1 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center justify-center gap-2"
                    >
                      🚀 Publier maintenant
                    </button>
                  )}

                  {viewingPost.status !== 'published' && (
                    <button
                      onClick={() => markAsPublished(viewingPost)}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center gap-2"
                    >
                      <FaCheck /> Marquer publié
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      if (confirm('Êtes-vous sûr de vouloir supprimer cette publication ?')) {
                        handleDeletePost(viewingPost.id);
                      }
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
