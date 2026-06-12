export type SubItem = { label: string; href: string };
export type NavCategory = {
  label: string;
  href: string;
  subcategories?: SubItem[];
};

export const navCategories: NavCategory[] = [
  {
    label: "Titânio Natural",
    href: "/categorias/titanio-natural",
    subcategories: [
      { label: "Argolas Titânio", href: "/categorias/titanio-natural/argolas" },
      { label: "Labret Titânio", href: "/categorias/titanio-natural/labret" },
      { label: "Septo Titânio", href: "/categorias/titanio-natural/septo" },
      { label: "Nostril Titânio", href: "/categorias/titanio-natural/nostril" },
      { label: "Umbigo Titânio", href: "/categorias/titanio-natural/umbigo" },
      { label: "Hélix / Cartilagem", href: "/categorias/titanio-natural/helix" },
      { label: "Ver todos", href: "/categorias/titanio-natural" },
    ],
  },
  {
    label: "Titânio PVD Gold",
    href: "/categorias/titanio-pvd-gold",
    subcategories: [
      { label: "Argolas Gold", href: "/categorias/titanio-pvd-gold/argolas" },
      { label: "Labret Gold", href: "/categorias/titanio-pvd-gold/labret" },
      { label: "Septo Gold", href: "/categorias/titanio-pvd-gold/septo" },
      { label: "Nostril Gold", href: "/categorias/titanio-pvd-gold/nostril" },
      { label: "Umbigo Gold", href: "/categorias/titanio-pvd-gold/umbigo" },
      { label: "Ver todos", href: "/categorias/titanio-pvd-gold" },
    ],
  },
  {
    label: "Aço Natural",
    href: "/categorias/aco-natural",
    subcategories: [
      { label: "Argolas Aço", href: "/categorias/aco-natural/argolas" },
      { label: "Labret Aço", href: "/categorias/aco-natural/labret" },
      { label: "Septo Aço", href: "/categorias/aco-natural/septo" },
      { label: "Nostril Aço", href: "/categorias/aco-natural/nostril" },
      { label: "Ver todos", href: "/categorias/aco-natural" },
    ],
  },
  {
    label: "Aço PVD Gold",
    href: "/categorias/aco-pvd-gold",
    subcategories: [
      { label: "Argolas Aço Gold", href: "/categorias/aco-pvd-gold/argolas" },
      { label: "Labret Aço Gold", href: "/categorias/aco-pvd-gold/labret" },
      { label: "Semi Joias", href: "/categorias/aco-pvd-gold/semi-joias" },
      { label: "Ver todos", href: "/categorias/aco-pvd-gold" },
    ],
  },
  { label: "Ofertas", href: "/ofertas" },
  { label: "Lançamentos", href: "/lancamentos" },
];
