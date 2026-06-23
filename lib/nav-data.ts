export type SubItem = { label: string; href: string };
export type NavCategory = {
  label: string;
  href: string;
  subcategories?: SubItem[];
};

// As subcategorias aqui são apenas atalhos de filtro
// O link principal (/categorias/slug) mostra TODOS os produtos da categoria
// Os sub-links (/categorias/slug?sub=argolas) pré-filtram por subcategoria
export const navCategories: NavCategory[] = [
  {
    label: "Titânio Natural",
    href: "/categorias/titanio-natural",
    subcategories: [
      { label: "Argolas",         href: "/categorias/titanio-natural?sub=Argolas"          },
      { label: "Labret",          href: "/categorias/titanio-natural?sub=Labret"           },
      { label: "Septo",           href: "/categorias/titanio-natural?sub=Septo"            },
      { label: "Nostril",         href: "/categorias/titanio-natural?sub=Nostril"          },
      { label: "Umbigo",          href: "/categorias/titanio-natural?sub=Umbigo"           },
      { label: "Hélix",           href: "/categorias/titanio-natural?sub=Hélix"            },
    ],
  },
  {
    label: "Titânio PVD Gold",
    href: "/categorias/titanio-pvd-gold",
    subcategories: [
      { label: "Argolas",         href: "/categorias/titanio-pvd-gold?sub=Argolas"         },
      { label: "Labret",          href: "/categorias/titanio-pvd-gold?sub=Labret"          },
      { label: "Septo",           href: "/categorias/titanio-pvd-gold?sub=Septo"           },
      { label: "Nostril",         href: "/categorias/titanio-pvd-gold?sub=Nostril"         },
      { label: "Umbigo",          href: "/categorias/titanio-pvd-gold?sub=Umbigo"          },
    ],
  },
  {
    label: "Aço Natural",
    href: "/categorias/aco-natural",
    subcategories: [
      { label: "Argolas",         href: "/categorias/aco-natural?sub=Argolas"              },
      { label: "Labret",          href: "/categorias/aco-natural?sub=Labret"               },
      { label: "Septo",           href: "/categorias/aco-natural?sub=Septo"                },
      { label: "Nostril",         href: "/categorias/aco-natural?sub=Nostril"              },
    ],
  },
  {
    label: "Aço PVD Gold",
    href: "/categorias/aco-pvd-gold",
    subcategories: [
      { label: "Argolas",         href: "/categorias/aco-pvd-gold?sub=Argolas"             },
      { label: "Labret",          href: "/categorias/aco-pvd-gold?sub=Labret"              },
      { label: "Semi Joias",      href: "/categorias/aco-pvd-gold?sub=Semi+Joias"          },
    ],
  },
  { label: "Ofertas",      href: "/ofertas"      },
  { label: "Lançamentos",  href: "/lancamentos"  },
];
