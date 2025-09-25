import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const campaigns = await prisma.whatsAppCampaign.findMany({
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\n📊 DEBUG Campagnes WhatsApp:`);
    console.log(`Total: ${campaigns.length} campagnes`);
    
    campaigns.forEach(campaign => {
      console.log(`\n📢 ${campaign.name}:`);
      console.log(`  - ID: ${campaign.id}`);
      console.log(`  - Status: ${campaign.status}`);
      console.log(`  - Template ID: ${campaign.templateId || 'NON DÉFINI'}`);
      console.log(`  - Destinataires: ${campaign.recipientCount}`);
      console.log(`  - Créée: ${campaign.createdAt}`);
    });

    return NextResponse.json({
      success: true,
      count: campaigns.length,
      campaigns: campaigns.map(c => ({
        id: c.id,
        name: c.name,
        status: c.status,
        templateId: c.templateId,
        templateName: null,
        recipientCount: c.recipientCount,
        createdAt: c.createdAt
      }))
    });

  } catch (error) {
    console.error('Erreur debug campagnes:', error);
    return NextResponse.json({ 
      error: 'Erreur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}