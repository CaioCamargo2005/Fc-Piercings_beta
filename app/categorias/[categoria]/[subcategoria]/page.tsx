"use client";

import { useParams } from "next/navigation";
import CategoriaPage from "../page";

// Esta página simplesmente reutiliza a página de categoria
// passando a subcategoria como filtro inicial via URL
export default function SubcategoriaPage() {
  // A página de categoria já lê ambos os params via useParams
  return <CategoriaPage />;
}
