import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft, Share2, Heart, BookOpen } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import './blog-article.css';

// Articles de blog avec contenu complet (backup)
const articles_old = {
  'hydrofacial-revolution': {
    id: 'hydrofacial-revolution',
    title: "L'HydroFacial : La Révolution du Nettoyage en Profondeur",
    excerpt: "Découvrez comment cette technologie médicale venue des États-Unis transforme les soins du visage grâce à son système breveté Vortex-Fusion®.",
    category: "Technologies Avancées",
    readTime: "5 min",
    date: "2025-01-15",
    author: "LAIA SKIN Institut",
    content: `
      <h2>Une technologie médicale révolutionnaire</h2>
      <p>L'HydroFacial représente une avancée majeure dans le domaine des soins esthétiques. Cette technologie, développée initialement pour un usage médical, utilise un système breveté de vortex d'eau pour nettoyer, exfolier et hydrater la peau simultanément.</p>

      <h3>Comment fonctionne l'HydroFacial ?</h3>
      <p>Le traitement utilise une technologie Vortex-Fusion® qui crée un tourbillon d'eau permettant de :</p>
      <ul>
        <li>Nettoyer en profondeur les pores</li>
        <li>Exfolier les cellules mortes en douceur</li>
        <li>Extraire les impuretés sans douleur</li>
        <li>Infuser des sérums actifs personnalisés</li>
      </ul>

      <h3>Les bénéfices immédiats</h3>
      <p>Contrairement aux peelings traditionnels, l'HydroFacial offre des résultats visibles immédiatement après le traitement, sans éviction sociale. La peau est instantanément plus lumineuse, hydratée et les pores sont visiblement resserrés.</p>

      <h3>Pour qui est fait ce soin ?</h3>
      <p>L'HydroFacial convient à tous les types de peau, même les plus sensibles. Il est particulièrement recommandé pour :</p>
      <ul>
        <li>Les peaux congestionnées avec pores dilatés</li>
        <li>Les teints ternes manquant d'éclat</li>
        <li>Les peaux déshydratées</li>
        <li>Les premiers signes de l'âge</li>
      </ul>

      <p>Chez LAIA SKIN Institut, nous proposons ce soin sous le nom "Hydro'Cleaning", adapté avec des protocoles personnalisés selon vos besoins spécifiques.</p>
    `
  },
  'microneedling-science': {
    id: 'microneedling-science',
    title: "La Science du Microneedling : Stimuler le Collagène Naturellement",
    excerpt: "Comprendre comment les micro-perforations contrôlées déclenchent le processus de régénération cellulaire pour une peau visiblement rajeunie.",
    category: "Anti-âge",
    readTime: "7 min",
    date: "2025-01-10",
    author: "LAIA SKIN Institut",
    content: `
      <h2>Le principe scientifique du microneedling</h2>
      <p>Le microneedling, ou thérapie d'induction du collagène, repose sur un principe simple mais efficace : créer des micro-lésions contrôlées dans la peau pour déclencher son processus naturel de régénération.</p>

      <h3>La cascade de cicatrisation</h3>
      <p>Lorsque les micro-aiguilles pénètrent dans le derme, elles déclenchent une cascade de réactions biologiques :</p>
      <ol>
        <li><strong>Phase inflammatoire</strong> : Les plaquettes libèrent des facteurs de croissance</li>
        <li><strong>Phase proliférative</strong> : Production de nouveau collagène et d'élastine</li>
        <li><strong>Phase de remodelage</strong> : Organisation et renforcement de la matrice dermique</li>
      </ol>

      <h3>Les résultats cliniquement prouvés</h3>
      <p>Des études scientifiques ont démontré une augmentation de 400% de la production de collagène après une série de traitements. Les améliorations observées incluent :</p>
      <ul>
        <li>Réduction de 45% de la profondeur des rides</li>
        <li>Amélioration de 80% de l'apparence des cicatrices</li>
        <li>Uniformisation du teint dans 90% des cas</li>
      </ul>

      <h3>Notre approche au LAIA SKIN Institut</h3>
      <p>Nous utilisons le microneedling dans plusieurs de nos protocoles, notamment le BB Glow, où nous combinons cette technique avec l'application de pigments cosmétiques pour un effet "bonne mine" durable.</p>
    `
  },
  'bb-glow-coree': {
    id: 'bb-glow-coree',
    title: "BB Glow : L'Innovation Coréenne pour un Teint Parfait",
    excerpt: "Entre mésothérapie et maquillage semi-permanent, découvrez cette technique révolutionnaire venue de Corée du Sud.",
    category: "Innovations",
    readTime: "6 min",
    date: "2025-01-05",
    author: "LAIA SKIN Institut",
    content: `
      <h2>L'origine du BB Glow</h2>
      <p>Le BB Glow est né en Corée du Sud, pays reconnu pour ses innovations en matière de beauté et de soins de la peau. Cette technique combine le microneedling avec l'application de pigments cosmétiques spécialement formulés.</p>

      <h3>Un maquillage qui soigne</h3>
      <p>Contrairement au maquillage traditionnel, le BB Glow agit en profondeur. Les pigments sont déposés dans les couches superficielles de l'épiderme, créant un effet "bonne mine" qui dure plusieurs semaines tout en traitant la peau.</p>

      <h3>La composition des sérums BB Glow</h3>
      <p>Les sérums utilisés contiennent :</p>
      <ul>
        <li>Des pigments minéraux adaptés à chaque carnation</li>
        <li>De l'acide hyaluronique pour l'hydratation</li>
        <li>Des peptides pour stimuler le collagène</li>
        <li>De la niacinamide pour l'éclat</li>
        <li>Des vitamines antioxydantes</li>
      </ul>

      <h3>Les résultats du BB Glow</h3>
      <p>Après une séance, la peau présente :</p>
      <ul>
        <li>Un teint unifié et lumineux</li>
        <li>Une réduction visible des taches pigmentaires</li>
        <li>Un effet "blur" sur les pores</li>
        <li>Une hydratation en profondeur</li>
      </ul>

      <p>Chez LAIA SKIN Institut, nous proposons le BB Glow en cure de 3 à 4 séances pour un résultat optimal qui dure entre 3 et 6 mois.</p>
    `
  },
  'led-therapie-nasa': {
    id: 'led-therapie-nasa',
    title: "La technique LED : De la NASA à Votre Peau",
    excerpt: "Comment la technique LED développée pour les astronautes est devenue l'un des traitements anti-âge les plus efficaces.",
    category: "Technologies",
    readTime: "4 min",
    date: "2024-12-28",
    author: "LAIA SKIN Institut",
    content: `
      <h2>L'histoire fascinante de la LED thérapie</h2>
      <p>Dans les années 1990, la NASA a développé la technologie LED pour accélérer la cicatrisation des astronautes en apesanteur. Cette découverte a révolutionné les soins esthétiques.</p>

      <h3>Le principe de la photobiomodulation</h3>
      <p>Les LED émettent des longueurs d'onde spécifiques qui pénètrent dans les cellules et stimulent les mitochondries, les "centrales énergétiques" cellulaires. Chaque couleur a une action ciblée :</p>
      <ul>
        <li><strong>Rouge (630-700nm)</strong> : Stimule le collagène et l'élastine</li>
        <li><strong>Bleu (415-445nm)</strong> : Action antibactérienne, traite l'acné</li>
        <li><strong>Jaune (570-590nm)</strong> : Améliore la circulation, apaise</li>
        <li><strong>Infrarouge (700-1000nm)</strong> : Régénération profonde</li>
      </ul>

      <h3>Les bénéfices scientifiquement prouvés</h3>
      <p>Des études cliniques ont démontré :</p>
      <ul>
        <li>Augmentation de 200% de la production de collagène</li>
        <li>Réduction de 75% de l'inflammation</li>
        <li>Amélioration de 90% de la texture de la peau</li>
      </ul>

      <h3>Notre protocole LED Thérapie</h3>
      <p>Au LAIA SKIN Institut, nous utilisons des LED médicales de dernière génération dans notre protocole LED Thérapie, souvent en complément d'autres soins pour optimiser les résultats.</p>
    `
  },
  'routine-soins-hiver': {
    id: 'routine-soins-hiver',
    title: "Adapter Sa Routine de Soins en Hiver",
    excerpt: "Mes conseils pour protéger et hydrater votre peau pendant la saison froide.",
    category: "Conseils",
    readTime: "3 min",
    date: "2024-12-20",
    author: "LAIA SKIN Institut",
    content: `
      <h2>Les défis de l'hiver pour votre peau</h2>
      <p>Le froid, le vent et les changements de température agressent quotidiennement votre peau en hiver. Il est essentiel d'adapter votre routine pour maintenir une peau saine et éclatante.</p>

      <h3>Les gestes essentiels</h3>
      <ol>
        <li><strong>Nettoyer en douceur</strong> : Privilégiez les nettoyants doux sans savon</li>
        <li><strong>Hydrater intensément</strong> : Optez pour des textures plus riches</li>
        <li><strong>Protéger</strong> : La protection solaire reste indispensable, même en hiver</li>
        <li><strong>Exfolier avec modération</strong> : Une fois par semaine suffit</li>
      </ol>

      <h3>Les soins professionnels recommandés</h3>
      <p>En hiver, certains soins sont particulièrement bénéfiques :</p>
      <ul>
        <li><strong>Hydro'Naissance</strong> : Pour une hydratation en profondeur</li>
        <li><strong>LED Thérapie</strong> : Pour stimuler la régénération</li>
        <li><strong>BB Glow</strong> : Pour un teint lumineux malgré la grisaille</li>
      </ul>

      <h3>Nos conseils d'experte</h3>
      <p>N'attendez pas que votre peau montre des signes de déshydratation. La prévention est la clé d'une peau belle en toute saison. Venez nous voir pour un diagnostic personnalisé et un protocole adapté à vos besoins hivernaux.</p>
    `
  }
};

// Force dynamic rendering to avoid build-time database queries
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  
  let article: any = null;
  
  try {
    // Récupérer l'article depuis la base de données
    article = await prisma.blogPost.findFirst({
      where: { 
        slug,
        published: true 
      }
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    notFound();
  }

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdfbf7] to-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#d4b5a0]/20 to-[#c9a084]/20 py-24">
        <div className="max-w-4xl mx-auto px-4">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-[#d4b5a0] hover:text-[#c9a084] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au blog
          </Link>
          
          <div className="flex items-center gap-4 text-sm text-[#2c3e50]/60 mb-4">
            <span className="px-3 py-1 bg-[#d4b5a0]/20 text-[#d4b5a0] rounded-full font-medium">
              {article.category}
            </span>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(article.publishedAt).toLocaleDateString('fr-FR', { 
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {article.readTime}
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2c3e50] mb-6">
            {article.title}
          </h1>
          
          <p className="text-xl text-[#2c3e50]/70 leading-relaxed">
            {article.excerpt}
          </p>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        <div 
          className="prose prose-lg max-w-none article-content"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
        
        {/* Author */}
        <div className="mt-12 pt-8 border-t border-[#d4b5a0]/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#2c3e50]/60">Écrit par</p>
              <p className="font-semibold text-[#2c3e50]">{article.author}</p>
            </div>
            
            <div className="flex gap-3">
              <button className="p-3 bg-[#d4b5a0]/10 rounded-full hover:bg-[#d4b5a0]/20 transition-colors">
                <Share2 className="w-5 h-5 text-[#d4b5a0]" />
              </button>
              <button className="p-3 bg-[#d4b5a0]/10 rounded-full hover:bg-[#d4b5a0]/20 transition-colors">
                <Heart className="w-5 h-5 text-[#d4b5a0]" />
              </button>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 p-8 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] rounded-2xl text-white text-center">
          <h3 className="text-2xl font-serif font-bold mb-4">
            Envie d'en savoir plus ?
          </h3>
          <p className="mb-6">
            Découvrez nos soins et réservez votre consultation personnalisée
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/prestations"
              className="px-6 py-3 bg-white text-[#d4b5a0] rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Voir nos soins
            </Link>
            <Link 
              href="/reservation"
              className="px-6 py-3 bg-white/20 backdrop-blur border-2 border-white/40 rounded-full font-semibold hover:bg-white/30 transition-all"
            >
              Réserver
            </Link>
          </div>
        </div>
      </article>

    </div>
  );
}