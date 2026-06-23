"use client";

import { useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, SearchX } from "lucide-react";
import { searchProducts } from "@/lib/search";
import ProductCard from "@/app/components/ui/ProductCard";
import SearchBar from "@/app/components/ui/SearchBar";

function BuscaContent() {
  const params = useSearchParams();
  const query  = params.get("q") ?? "";

  const results = useMemo(() => searchProducts(query), [query]);

  return (
    <div style={{ background: "var(--white-off)", minHeight: "calc(100vh - 120px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 32px" }}>

        {/* breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 24 }}>
          <Link href="/" style={{ color: "var(--gold)", fontSize: 13, textDecoration: "none" }}>Início</Link>
          <ChevronRight size={12} style={{ color: "var(--gray-mid)" }} />
          <span style={{ color: "var(--gray-mid)", fontSize: 13 }}>Busca</span>
        </div>

        {/* barra de busca no topo da página também */}
        <div style={{ maxWidth: 560, marginBottom: 32 }}>
          <SearchBar placeholder="Buscar novamente..." />
        </div>

        {query ? (
          <>
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--black)", marginBottom: 4 }}>
                Resultados para <span style={{
                  background: "linear-gradient(135deg,#8B6914,#C9A84C)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>&quot;{query}&quot;</span>
              </h1>
              <p style={{ color: "var(--gray-mid)", fontSize: 14 }}>
                {results.length === 0
                  ? "Nenhum produto encontrado"
                  : `${results.length} ${results.length === 1 ? "produto encontrado" : "produtos encontrados"}`}
              </p>
            </div>

            {results.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))", gap: 16 }}>
                {results.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div style={{
                textAlign: "center", padding: "60px 20px",
                background: "var(--white)", borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.07)",
              }}>
                <SearchX size={48} style={{ color: "rgba(201,168,76,0.3)", margin: "0 auto 16px" }} />
                <p style={{ fontSize: 17, fontWeight: 600, color: "var(--black)", marginBottom: 8 }}>
                  Nada encontrado para &quot;{query}&quot;
                </p>
                <p style={{ color: "var(--gray-mid)", fontSize: 14, marginBottom: 24 }}>
                  Tente palavras diferentes ou navegue pelas categorias.
                </p>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  {["Titânio Natural", "Titânio PVD Gold", "Aço Natural", "Aço PVD Gold"].map(cat => (
                    <Link key={cat}
                      href={`/categorias/${cat.toLowerCase().replace(/ /g, "-")}`}
                      style={{
                        padding: "8px 16px", borderRadius: 20, fontSize: 13,
                        border: "1px solid rgba(201,168,76,0.3)", color: "var(--gold)",
                        textDecoration: "none", background: "rgba(201,168,76,0.06)",
                      }}>
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ color: "var(--gray-mid)", fontSize: 15 }}>
              Digite algo na barra de busca acima.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BuscaPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(201,168,76,0.2)", borderTopColor: "var(--gold)", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <BuscaContent />
    </Suspense>
  );
}
