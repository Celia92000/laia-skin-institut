'use client';

import React from 'react';
import { SocialQRCodes } from './SocialQRCodes';

export function SocialSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-[#f9f5f2] to-[#fef8f3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2c3e50] mb-4">
            Suivez-nous et Restez Connecté
          </h2>
          <p className="text-xl text-[#2c3e50]/70 max-w-2xl mx-auto">
            Scannez nos QR codes pour nous suivre sur les réseaux sociaux et ne manquez aucune nouveauté
          </p>
        </div>
        
        <SocialQRCodes showTitle={false} size="small" />
        
        <div className="mt-12 text-center">
          <div className="inline-block bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-[#2c3e50] mb-2">
              Programme de Parrainage
            </h3>
            <p className="text-[#2c3e50]/70 mb-4">
              Recommandez-nous et bénéficiez de 15€ de réduction !
            </p>
            <a
              href="/login"
              className="inline-block px-6 py-3 bg-gradient-to-r from-[#d4b5a0] to-[#c4a590] text-white rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Rejoindre le programme
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}