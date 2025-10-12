'use client';

import EmailTemplateManager from '@/components/EmailTemplateManager';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au dashboard
          </Link>
        </div>

        <EmailTemplateManager />
      </div>
    </div>
  );
}
