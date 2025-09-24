#!/usr/bin/env npx tsx

import { Resend } from 'resend';

const resend = new Resend('re_Mksui53X_CFrkxKtg8YuViZhHmeZNSbmR');

async function getDomainId() {
  const { data: domains } = await resend.domains.list();
  const domainsList = domains?.data || domains || [];
  
  console.log('📋 Domaines Resend:\n');
  
  if (Array.isArray(domainsList)) {
    domainsList.forEach((domain: any) => {
      console.log(`Domaine: ${domain.name}`);
      console.log(`ID: ${domain.id}`);
      console.log(`Status: ${domain.status}\n`);
    });
  }
}

getDomainId();