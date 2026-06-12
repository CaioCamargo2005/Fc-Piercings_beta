export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;        // se tiver desconto
  category: string;
  subcategory: string;
  material: string;
  description: string;
  details: string[];             // lista de características
  images: string[];              // URLs — por enquanto vazias, placeholder no componente
  stock: number;
  sizes?: string[];              // ex: ["6mm","8mm","10mm"]
  colors?: string[];             // ex: ["Natural","PVD Gold"]
  featured: boolean;             // aparece em "Destaques"
  isNew: boolean;                // aparece em "Lançamentos"
  onSale: boolean;               // aparece em "Ofertas"
  active: boolean;               // visível no site
  createdAt: string;
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Argola Titânio Natural Cravejada",
    slug: "argola-titanio-natural-cravejada",
    price: 99.90,
    originalPrice: undefined,
    category: "Titânio Natural",
    subcategory: "Argolas",
    material: "Titânio ASTM F136",
    description: "Argola cravejada em titânio grau cirúrgico ASTM F136, hipoalergênica e segura para piercings recém-feitos. Acabamento polido de alta qualidade.",
    details: [
      "Titânio ASTM F136 grau cirúrgico",
      "Hipoalergênico — seguro para pele sensível",
      "Fecho clicker de encaixe",
      "Garantia de 1 ano contra manchas",
    ],
    images: [],
    stock: 42,
    sizes: ["6mm", "8mm", "10mm", "12mm"],
    featured: true,
    isNew: false,
    onSale: false,
    active: true,
    createdAt: "2024-03-01",
  },
  {
    id: "2",
    name: "Argola Titânio PVD Gold",
    slug: "argola-titanio-pvd-gold",
    price: 129.90,
    originalPrice: undefined,
    category: "Titânio PVD Gold",
    subcategory: "Argolas",
    material: "Titânio PVD Gold",
    description: "Argola banhada em ouro via processo PVD (Physical Vapor Deposition), resistente a manchas e desbotamento por anos de uso.",
    details: [
      "Titânio com banho PVD Gold",
      "Resistência superior ao banho convencional",
      "Fecho clicker",
      "Garantia de 1 ano",
    ],
    images: [],
    stock: 28,
    sizes: ["6mm", "8mm", "10mm"],
    featured: true,
    isNew: true,
    onSale: false,
    active: true,
    createdAt: "2024-04-10",
  },
  {
    id: "3",
    name: "Labret Titânio CZ Cristal",
    slug: "labret-titanio-cz-cristal",
    price: 65.00,
    originalPrice: 80.00,
    category: "Titânio Natural",
    subcategory: "Labret",
    material: "Titânio ASTM F136",
    description: "Labret com pedra CZ (zircônia cúbica) de alto brilho, haste em titânio cirúrgico. Ideal para piercing de lábio, hélix e trágus.",
    details: [
      "Titânio ASTM F136",
      "Pedra zircônia cúbica 2mm",
      "Rosca interna",
      "Disponível em vários comprimentos",
    ],
    images: [],
    stock: 55,
    sizes: ["6mm", "8mm", "10mm", "12mm", "14mm"],
    featured: false,
    isNew: false,
    onSale: true,
    active: true,
    createdAt: "2024-02-15",
  },
  {
    id: "4",
    name: "Septo Titânio Cravejado",
    slug: "septo-titanio-cravejado",
    price: 149.90,
    originalPrice: undefined,
    category: "Titânio Natural",
    subcategory: "Septo",
    material: "Titânio ASTM F136",
    description: "Septo clicker totalmente cravejado em zircônia cúbica. Design elegante para uso no septo nasal.",
    details: [
      "Titânio ASTM F136",
      "Cravação com CZ em toda a extensão",
      "Fecho clicker",
      "Diâmetro interno 8mm",
    ],
    images: [],
    stock: 18,
    sizes: ["8mm", "10mm"],
    featured: true,
    isNew: true,
    onSale: false,
    active: true,
    createdAt: "2024-05-01",
  },
  {
    id: "5",
    name: "Nostril Aço PVD Gold Bolinha",
    slug: "nostril-aco-pvd-gold-bolinha",
    price: 29.90,
    originalPrice: 39.90,
    category: "Aço PVD Gold",
    subcategory: "Nostril",
    material: "Aço 316L PVD Gold",
    description: "Nostril com bolinha dourada em aço cirúrgico 316L com banho PVD Gold. Leve, discreto e elegante.",
    details: [
      "Aço 316L com banho PVD Gold",
      "Pino em L para fácil encaixe",
      "Bolinha 2mm",
      "Indicado para uso diário",
    ],
    images: [],
    stock: 120,
    featured: false,
    isNew: false,
    onSale: true,
    active: true,
    createdAt: "2024-01-20",
  },
  {
    id: "6",
    name: "Argola Aço Natural Clicker",
    slug: "argola-aco-natural-clicker",
    price: 49.90,
    originalPrice: undefined,
    category: "Aço Natural",
    subcategory: "Argolas",
    material: "Aço 316L",
    description: "Argola clicker em aço cirúrgico 316L polido. Clássica e versátil para septo, hélix ou tragus.",
    details: [
      "Aço cirúrgico 316L",
      "Acabamento polido espelhado",
      "Fecho clicker",
      "Leve e resistente",
    ],
    images: [],
    stock: 75,
    sizes: ["8mm", "10mm", "12mm"],
    featured: false,
    isNew: false,
    onSale: false,
    active: true,
    createdAt: "2024-01-05",
  },
  {
    id: "7",
    name: "Umbigo Titânio PVD Gold Pendente",
    slug: "umbigo-titanio-pvd-gold-pendente",
    price: 89.90,
    originalPrice: undefined,
    category: "Titânio PVD Gold",
    subcategory: "Umbigo",
    material: "Titânio PVD Gold",
    description: "Piercing de umbigo com pendente em titânio PVD Gold. Design delicado com acabamento dourado premium.",
    details: [
      "Titânio com banho PVD Gold",
      "Pendente com pedra CZ",
      "Haste curva 10mm",
      "Rosca interna",
    ],
    images: [],
    stock: 33,
    featured: true,
    isNew: true,
    onSale: false,
    active: true,
    createdAt: "2024-05-15",
  },
  {
    id: "8",
    name: "Hélix Titânio Natural Tridente",
    slug: "helix-titanio-natural-tridente",
    price: 55.00,
    originalPrice: 70.00,
    category: "Titânio Natural",
    subcategory: "Hélix",
    material: "Titânio ASTM F136",
    description: "Labret com topo em formato de tridente para hélix e cartilagem. Design moderno em titânio cirúrgico.",
    details: [
      "Titânio ASTM F136",
      "Topo flat em formato tridente",
      "Rosca interna",
      "Comprimentos: 6mm a 12mm",
    ],
    images: [],
    stock: 22,
    sizes: ["6mm", "8mm", "10mm", "12mm"],
    featured: false,
    isNew: false,
    onSale: true,
    active: true,
    createdAt: "2024-03-20",
  },
];

/* ── helpers para filtrar ── */
export function getFeatured()  { return MOCK_PRODUCTS.filter(p => p.featured && p.active); }
export function getNew()       { return MOCK_PRODUCTS.filter(p => p.isNew && p.active); }
export function getOnSale()    { return MOCK_PRODUCTS.filter(p => p.onSale && p.active); }
export function getAll()       { return MOCK_PRODUCTS.filter(p => p.active); }
export function getBySlug(slug: string) { return MOCK_PRODUCTS.find(p => p.slug === slug) ?? null; }
// getByCategory moved below with getAllProducts

/* ── produtos extras para popular o catálogo ── */
export const EXTRA_PRODUCTS: Product[] = [
  {
    id: "9",  name: "Septo Aço Cirúrgico Trançado", slug: "septo-aco-cirurgico-trancado",
    price: 39.90, category: "Aço Natural", subcategory: "Septo", material: "Aço 316L",
    description: "Septo clicker com design trançado em aço cirúrgico polido.", details: ["Aço 316L","Fecho clicker","Design trançado"],
    images: [], stock: 60, sizes: ["8mm","10mm"], featured: false, isNew: true, onSale: false, active: true, createdAt: "2024-06-01",
  },
  {
    id: "10", name: "Labret Aço PVD Gold Flat", slug: "labret-aco-pvd-gold-flat",
    price: 24.90, originalPrice: 34.90, category: "Aço PVD Gold", subcategory: "Labret", material: "Aço 316L PVD Gold",
    description: "Labret com topo flat dourado, discreto e elegante.", details: ["Aço 316L PVD Gold","Topo flat 3mm","Rosca interna"],
    images: [], stock: 80, sizes: ["6mm","8mm","10mm"], featured: false, isNew: false, onSale: true, active: true, createdAt: "2024-02-10",
  },
  {
    id: "11", name: "Argola Titânio Natural Tridente", slug: "argola-titanio-natural-tridente",
    price: 85.00, category: "Titânio Natural", subcategory: "Argolas", material: "Titânio ASTM F136",
    description: "Argola clicker com charm de tridente em titânio cirúrgico.", details: ["Titânio ASTM F136","Charm tridente","Fecho clicker"],
    images: [], stock: 25, sizes: ["8mm","10mm"], featured: true, isNew: false, onSale: false, active: true, createdAt: "2024-03-15",
  },
  {
    id: "12", name: "Nostril Titânio PVD Gold Coração", slug: "nostril-titanio-pvd-gold-coracao",
    price: 45.00, category: "Titânio PVD Gold", subcategory: "Nostril", material: "Titânio PVD Gold",
    description: "Nostril com charm de coração dourado em titânio PVD.", details: ["Titânio PVD Gold","Charm coração 2mm","Pino em L"],
    images: [], stock: 40, featured: false, isNew: true, onSale: false, active: true, createdAt: "2024-05-20",
  },
  {
    id: "13", name: "Hélix Aço Natural Lua", slug: "helix-aco-natural-lua",
    price: 32.90, originalPrice: 44.90, category: "Aço Natural", subcategory: "Hélix", material: "Aço 316L",
    description: "Flat back com topo em lua crescente para hélix e cartilagem.", details: ["Aço 316L","Topo lua crescente","Rosca interna"],
    images: [], stock: 55, sizes: ["6mm","8mm"], featured: false, isNew: false, onSale: true, active: true, createdAt: "2024-04-05",
  },
  {
    id: "14", name: "Septo Titânio PVD Gold Serpente", slug: "septo-titanio-pvd-gold-serpente",
    price: 159.90, category: "Titânio PVD Gold", subcategory: "Septo", material: "Titânio PVD Gold",
    description: "Septo clicker em formato de serpente com zircônias cúbicas.", details: ["Titânio PVD Gold","Design serpente","CZ cravejado"],
    images: [], stock: 12, sizes: ["10mm","12mm"], featured: true, isNew: true, onSale: false, active: true, createdAt: "2024-06-05",
  },
  {
    id: "15", name: "Umbigo Aço PVD Gold Estrela", slug: "umbigo-aco-pvd-gold-estrela",
    price: 34.90, category: "Aço PVD Gold", subcategory: "Umbigo", material: "Aço 316L PVD Gold",
    description: "Piercing de umbigo com charm de estrela dourada.", details: ["Aço 316L PVD Gold","Charm estrela","Haste curva 10mm"],
    images: [], stock: 50, featured: false, isNew: false, onSale: false, active: true, createdAt: "2024-01-30",
  },
  {
    id: "16", name: "Labret Titânio Natural Flor CZ", slug: "labret-titanio-natural-flor-cz",
    price: 72.00, category: "Titânio Natural", subcategory: "Labret", material: "Titânio ASTM F136",
    description: "Labret com topo em flor cravejado de zircônias coloridas.", details: ["Titânio ASTM F136","Topo flor CZ","Rosca interna"],
    images: [], stock: 30, sizes: ["6mm","8mm","10mm"], featured: true, isNew: false, onSale: false, active: true, createdAt: "2024-04-22",
  },
];

/* helper atualizado que inclui os extras */
export function getAllProducts() {
  return [...MOCK_PRODUCTS, ...EXTRA_PRODUCTS].filter(p => p.active);
}

export function getByCategory(cat: string) {
  return getAllProducts().filter(p =>
    p.category.toLowerCase().replace(/ /g,"-") === cat.toLowerCase()
  );
}

export function getSubcategories(cat: string) {
  const prods = getByCategory(cat);
  return [...new Set(prods.map(p => p.subcategory))].filter(Boolean);
}

export function getAllSizes(products: Product[]) {
  return [...new Set(products.flatMap(p => p.sizes ?? []))].sort();
}
