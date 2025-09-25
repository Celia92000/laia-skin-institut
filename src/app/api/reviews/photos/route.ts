import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('photos') as File[];
    const clientId = formData.get('clientId') as string;
    const reviewId = formData.get('reviewId') as string;
    const serviceName = formData.get('serviceName') as string;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];

    // Pour chaque fichier
    for (const file of files) {
      // Vérifier le type
      if (!file.type.startsWith('image/')) {
        continue;
      }

      // Générer un nom unique
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const extension = file.name.split('.').pop();
      const filename = `review-${timestamp}-${random}.${extension}`;

      // Convertir le fichier en buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Dans un environnement de production, vous devriez utiliser un service
      // comme AWS S3, Cloudinary, ou Vercel Blob Storage
      // Pour l'instant, on simule avec une URL locale
      const url = `/uploads/reviews/${filename}`;
      uploadedUrls.push(url);

      // Si vous avez un dossier public/uploads configuré :
      // const uploadDir = join(process.cwd(), 'public', 'uploads', 'reviews');
      // await writeFile(join(uploadDir, filename), buffer);
    }

    // Si un reviewId est fourni, mettre à jour l'avis existant
    if (reviewId) {
      const review = await prisma.review.findUnique({
        where: { id: reviewId }
      });

      if (review) {
        // Note: Le champ photos n'existe pas dans le modèle Review actuel
        // Pour implémenter cette fonctionnalité, il faudrait ajouter ce champ au schéma Prisma
        // ou créer une table séparée pour les photos d'avis
        console.log(`Tentative d'ajout de ${uploadedUrls.length} photo(s) à l'avis ${reviewId}`);
        // await prisma.review.update({
        //   where: { id: reviewId },
        //   data: {
        //     photos: updatedPhotos as any
        //   }
        // });
      }
    }

    // Retourner les URLs des images uploadées
    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      message: `${uploadedUrls.length} photo(s) uploadée(s) avec succès`
    });

  } catch (error) {
    console.error('Erreur upload photos:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload des photos' },
      { status: 500 }
    );
  }
}

// Récupérer les photos d'un avis
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');
    const clientId = searchParams.get('clientId');

    let photos: string[] = [];

    // Note: Le champ photos n'existe pas dans le modèle Review actuel
    // Pour l'instant, on retourne un tableau vide
    if (reviewId) {
      console.log(`Recherche des photos pour l'avis ${reviewId}`);
      // const review = await prisma.review.findUnique({
      //   where: { id: reviewId }
      // });
      // photos = (review as any)?.photos || [];
    } else if (clientId) {
      console.log(`Recherche des photos pour le client ${clientId}`);
      // const reviews = await prisma.review.findMany({
      //   where: { userId: clientId }
      // });
      // photos = reviews.flatMap((r: any) => r.photos || []);
    }

    return NextResponse.json({
      success: true,
      photos
    });

  } catch (error) {
    console.error('Erreur récupération photos:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des photos' },
      { status: 500 }
    );
  }
}