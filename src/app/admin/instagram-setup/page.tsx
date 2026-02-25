"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';

export default function InstagramSetupPage() {
  const [step, setStep] = useState(1);
  const [appId, setAppId] = useState('24084077607882068');
  const [appSecret, setAppSecret] = useState('a81a181a749c678a27849256b425e5ad');
  const [token, setToken] = useState('');
  const [pageId, setPageId] = useState('');
  const [instagramId, setInstagramId] = useState('785663654385417');
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fonction pour obtenir le token via OAuth
  const handleGetToken = () => {
    const redirectUri = encodeURIComponent(window.location.origin + '/admin/instagram-setup');
    const scope = 'pages_show_list,pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish,business_management';
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=token`;

    window.location.href = authUrl;
  };

  // Extraire le token de l'URL après redirection
  const extractTokenFromUrl = () => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        setToken(accessToken);
        setStep(2);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  };

  // Tester le token
  const handleTestToken = async () => {
    setLoading(true);
    try {
      // Test 1: Récupérer les pages
      const pagesResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${token}`);
      const pagesData = await pagesResponse.json();

      if (pagesData.data && pagesData.data.length > 0) {
        setPageId(pagesData.data[0].id);

        // Test 2: Récupérer l'ID Instagram
        const igResponse = await fetch(`https://graph.facebook.com/v18.0/${pagesData.data[0].id}?fields=instagram_business_account&access_token=${token}`);
        const igData = await igResponse.json();

        if (igData.instagram_business_account) {
          setInstagramId(igData.instagram_business_account.id);

          // Test 3: Récupérer les infos du compte Instagram
          const igInfoResponse = await fetch(`https://graph.facebook.com/v18.0/${igData.instagram_business_account.id}?fields=id,username,name&access_token=${token}`);
          const igInfo = await igInfoResponse.json();

          setTestResult({
            success: true,
            page: pagesData.data[0],
            instagram: igInfo
          });
          setStep(3);
        } else {
          setTestResult({
            success: false,
            error: 'Compte Instagram Business non trouvé. Assurez-vous que votre Instagram est lié à votre page Facebook.'
          });
        }
      }
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setLoading(false);
    }
  };

  // Convertir en token longue durée
  const handleConvertToken = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${token}`
      );
      const data = await response.json();

      if (data.access_token) {
        setToken(data.access_token);
        alert('✅ Token converti en longue durée (60 jours) !');
      }
    } catch (error) {
      alert('❌ Erreur lors de la conversion du token');
    } finally {
      setLoading(false);
    }
  };

  // Au chargement, vérifier si on revient de Facebook
  useEffect(() => {
    extractTokenFromUrl();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          🔧 Configuration Instagram pour LAIA SKIN
        </h1>

        {/* Étape 1: Obtenir le token */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Étape 1 : Obtenir le token d'accès</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">App ID (déjà configuré)</label>
              <input
                type="text"
                value={appId}
                readOnly
                className="w-full px-4 py-2 border rounded-lg bg-gray-100"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Instagram Account ID (déjà configuré)</label>
              <input
                type="text"
                value={instagramId}
                readOnly
                className="w-full px-4 py-2 border rounded-lg bg-gray-100"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 mb-2">
                <strong>⚠️ Important :</strong> Assurez-vous que :
              </p>
              <ul className="list-disc ml-6 text-sm text-blue-700 space-y-1">
                <li>Votre compte Instagram est en mode <strong>Business</strong></li>
                <li>Il est lié à votre page Facebook <strong>LAIA SKIN Institut</strong></li>
                <li>Vous êtes connectée avec le bon compte Facebook</li>
              </ul>
            </div>

            <button
              onClick={handleGetToken}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-lg font-bold hover:opacity-90 transition"
            >
              🔐 Se connecter avec Facebook
            </button>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Vous serez redirigée vers Facebook pour autoriser l'accès
            </p>
          </div>
        )}

        {/* Étape 2: Tester le token */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Étape 2 : Vérifier le token</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Token d'accès obtenu ✅</label>
              <textarea
                value={token}
                readOnly
                rows={3}
                className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-xs font-mono"
              />
            </div>

            <button
              onClick={handleTestToken}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? '⏳ Test en cours...' : '🧪 Tester la connexion'}
            </button>

            {testResult && !testResult.success && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-semibold">❌ Erreur :</p>
                <p className="text-red-700 text-sm mt-2">{testResult.error}</p>
              </div>
            )}
          </div>
        )}

        {/* Étape 3: Résultat et configuration */}
        {step === 3 && testResult && testResult.success && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">✅ Configuration réussie !</h2>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="font-semibold text-green-800 mb-2">📄 Page Facebook connectée :</p>
              <p className="text-green-700">{testResult.page.name}</p>
              <p className="text-xs text-green-600">ID: {testResult.page.id}</p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <p className="font-semibold text-purple-800 mb-2">📸 Compte Instagram connecté :</p>
              <p className="text-purple-700">@{testResult.instagram.username}</p>
              <p className="text-xs text-purple-600">ID: {testResult.instagram.id}</p>
            </div>

            <div className="mb-6">
              <button
                onClick={handleConvertToken}
                disabled={loading}
                className="w-full bg-yellow-500 text-white py-3 rounded-lg font-bold hover:bg-yellow-600 transition mb-4"
              >
                🔄 Convertir en token longue durée (60 jours)
              </button>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="font-semibold mb-3">📝 Copiez ces valeurs dans votre .env.local :</p>
              <pre className="bg-gray-800 text-green-400 p-4 rounded text-xs overflow-x-auto">
{`# Meta Social Media (Instagram + Facebook)
META_APP_ID="${appId}"
META_APP_SECRET="${appSecret}"

# Facebook
FACEBOOK_PAGE_ACCESS_TOKEN="${token}"
FACEBOOK_PAGE_ID="${pageId}"

# Instagram
INSTAGRAM_ACCESS_TOKEN="${token}"
INSTAGRAM_ACCOUNT_ID="${instagramId}"`}
              </pre>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(`# Meta Social Media (Instagram + Facebook)
META_APP_ID="${appId}"
META_APP_SECRET="${appSecret}"

# Facebook
FACEBOOK_PAGE_ACCESS_TOKEN="${token}"
FACEBOOK_PAGE_ID="${pageId}"

# Instagram
INSTAGRAM_ACCESS_TOKEN="${token}"
INSTAGRAM_ACCOUNT_ID="${instagramId}"`);
                alert('✅ Configuration copiée !');
              }}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-bold hover:bg-green-700 transition"
            >
              📋 Copier la configuration
            </button>

            <div className="mt-6 text-center">
              <a
                href="/admin/social-media"
                className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg font-bold hover:opacity-90 transition"
              >
                🚀 Aller au calendrier de publication
              </a>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <a href="/admin" className="text-blue-600 hover:underline">
            ← Retour au dashboard admin
          </a>
        </div>
      </div>
    </div>
  );
}
