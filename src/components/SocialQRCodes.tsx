'use client';

import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { Instagram, Facebook, MapPin, Phone, Globe, Share2, X } from 'lucide-react';

interface SocialQRCodesProps {
  showTitle?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function SocialQRCodes({ showTitle = true, size = 'medium' }: SocialQRCodesProps) {
  const [selectedQR, setSelectedQR] = useState<string | null>(null);

  const socialLinks = {
    instagram: {
      url: 'https://instagram.com/laiaskin_institut',
      icon: <Instagram className="w-6 h-6" />,
      name: 'Instagram',
      color: 'from-purple-500 to-pink-500',
      handle: '@laiaskin_institut'
    },
    facebook: {
      url: 'https://facebook.com/laiaskininstitut',
      icon: <Facebook className="w-6 h-6" />,
      name: 'Facebook',
      color: 'from-blue-600 to-blue-500',
      handle: 'LAIA SKIN Institut'
    },
    maps: {
      url: 'https://maps.google.com/?q=LAIA+SKIN+Institut+123+Avenue+de+la+Beaute+75001+Paris',
      icon: <MapPin className="w-6 h-6" />,
      name: 'Google Maps',
      color: 'from-green-500 to-green-600',
      handle: '123 Avenue de la Beauté'
    },
    whatsapp: {
      url: 'https://wa.me/33123456789',
      icon: <Phone className="w-6 h-6" />,
      name: 'WhatsApp',
      color: 'from-green-400 to-green-500',
      handle: '+33 1 23 45 67 89'
    },
    website: {
      url: 'https://laia-skin-institut.vercel.app',
      icon: <Globe className="w-6 h-6" />,
      name: 'Site Web',
      color: 'from-[#d4b5a0] to-[#c4a590]',
      handle: 'laia-skin-institut.fr'
    }
  };

  const qrSizes = {
    small: 100,
    medium: 150,
    large: 200
  };

  const currentSize = qrSizes[size];

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6">
        {showTitle && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Share2 className="w-6 h-6 text-[#d4b5a0]" />
              Suivez-nous sur les réseaux
            </h2>
            <p className="text-gray-600">
              Scannez les QR codes pour nous rejoindre sur vos plateformes préférées
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(socialLinks).map(([key, social]) => (
            <div
              key={key}
              className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setSelectedQR(key)}
            >
              <div className={`bg-gradient-to-r ${social.color} text-white rounded-lg p-3 mb-3 flex items-center justify-center`}>
                {social.icon}
              </div>
              
              <div className="bg-white p-2 rounded-lg mb-2">
                <QRCode
                  value={social.url}
                  size={currentSize}
                  level="H"
                  fgColor="#333333"
                  bgColor="#ffffff"
                  style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                />
              </div>
              
              <div className="text-center">
                <p className="font-semibold text-sm text-gray-900">{social.name}</p>
                <p className="text-xs text-gray-500 mt-1">{social.handle}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Section partageable */}
        <div className="mt-6 bg-gradient-to-r from-[#f9f5f2] to-[#fef8f3] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Partagez notre institut</p>
              <p className="text-sm text-gray-600">
                Recommandez-nous à vos amis et gagnez des réductions
              </p>
            </div>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'LAIA SKIN Institut',
                    text: 'Découvrez LAIA SKIN Institut, votre expert beauté à Paris',
                    url: 'https://laia-skin-institut.vercel.app'
                  });
                } else {
                  navigator.clipboard.writeText('https://laia-skin-institut.vercel.app');
                  alert('Lien copié dans le presse-papier !');
                }
              }}
              className="px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c4a590] transition-colors flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Partager
            </button>
          </div>
        </div>
      </div>

      {/* Modal QR Code agrandi */}
      {selectedQR && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedQR(null)}
        >
          <div 
            className="bg-white rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {socialLinks[selectedQR as keyof typeof socialLinks].name}
              </h3>
              <button
                onClick={() => setSelectedQR(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="bg-white p-4 rounded-lg mb-4 flex justify-center">
              <QRCode
                value={socialLinks[selectedQR as keyof typeof socialLinks].url}
                size={250}
                level="H"
                fgColor="#333333"
                bgColor="#ffffff"
              />
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold">
                {socialLinks[selectedQR as keyof typeof socialLinks].handle}
              </p>
              <p className="text-sm text-gray-600">
                Scannez ce code avec votre téléphone
              </p>
              
              <div className="pt-4">
                <a
                  href={socialLinks[selectedQR as keyof typeof socialLinks].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${socialLinks[selectedQR as keyof typeof socialLinks].color} text-white rounded-lg hover:opacity-90 transition-opacity`}
                >
                  {socialLinks[selectedQR as keyof typeof socialLinks].icon}
                  Ouvrir {socialLinks[selectedQR as keyof typeof socialLinks].name}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}