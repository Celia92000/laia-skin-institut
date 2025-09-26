'use client';

import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { Trophy, Star, Gift, Award, Heart } from 'lucide-react';

interface CongratulationsAnimationProps {
  type: 'service_discount' | 'package_discount' | 'birthday' | 'referral';
  amount?: number;
  onClose?: () => void;
}

export function CongratulationsAnimation({ type, amount = 0, onClose }: CongratulationsAnimationProps) {
  const [show, setShow] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    
    const timer = setTimeout(() => {
      setShow(false);
      if (onClose) onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getContent = () => {
    switch (type) {
      case 'service_discount':
        return {
          icon: <Trophy className="w-20 h-20 text-yellow-400" />,
          title: 'Félicitations !',
          subtitle: '5ème soin atteint',
          message: `Vous bénéficiez de ${amount}€ de réduction !`,
          color: 'from-yellow-400 to-orange-400'
        };
      case 'package_discount':
        return {
          icon: <Star className="w-20 h-20 text-purple-400" />,
          title: 'Bravo !',
          subtitle: '3ème forfait démarré',
          message: `${amount}€ de réduction appliquée !`,
          color: 'from-purple-400 to-pink-400'
        };
      case 'birthday':
        return {
          icon: <Gift className="w-20 h-20 text-pink-400" />,
          title: 'Joyeux anniversaire !',
          subtitle: 'Un cadeau pour vous',
          message: `${amount}€ offerts sur votre soin !`,
          color: 'from-pink-400 to-red-400'
        };
      case 'referral':
        return {
          icon: <Heart className="w-20 h-20 text-red-400" />,
          title: 'Merci !',
          subtitle: 'Parrainage validé',
          message: `${amount}€ de récompense !`,
          color: 'from-red-400 to-pink-400'
        };
      default:
        return {
          icon: <Award className="w-20 h-20 text-blue-400" />,
          title: 'Félicitations !',
          subtitle: '',
          message: 'Réduction appliquée !',
          color: 'from-blue-400 to-cyan-400'
        };
    }
  };

  const content = getContent();

  if (!show) return null;

  return (
    <>
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        numberOfPieces={300}
        recycle={false}
        colors={['#d4b5a0', '#f4a261', '#e76f51', '#2a9d8f', '#264653']}
      />
      
      <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl p-8 transform scale-0 animate-bounce-in pointer-events-auto">
          <div className={`bg-gradient-to-br ${content.color} rounded-xl p-6 text-center text-white`}>
            <div className="flex justify-center mb-4 animate-spin-slow">
              {content.icon}
            </div>
            <h2 className="text-3xl font-bold mb-2 animate-pulse">
              {content.title}
            </h2>
            {content.subtitle && (
              <p className="text-xl mb-2 opacity-90">
                {content.subtitle}
              </p>
            )}
            <p className="text-2xl font-bold animate-bounce">
              {content.message}
            </p>
          </div>
          
          <div className="mt-6 flex justify-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-8 h-8 text-yellow-400 fill-yellow-400 animate-twinkle"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.8);
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out forwards;
        }

        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }

        .animate-twinkle {
          animation: twinkle 1.5s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}