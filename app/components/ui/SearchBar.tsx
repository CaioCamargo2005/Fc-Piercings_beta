"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, Tag, LayoutGrid, ShoppingBag } from "lucide-react";
import { getSuggestions, SearchSuggestion } from "@/lib/search";

type Props = {
  placeholder?: string;
  autoFocus?: boolean;
  onClose?: () => void;
};

const TYPE_ICON: Record<SearchSuggestion["type"], React.ReactNode> = {
  produto:      <ShoppingBag size={14} />,
  categoria:    <LayoutGrid size={14} />,
  subcategoria: <Tag size={14} />,
};

const TYPE_COLOR: Record<SearchSuggestion["type"], string> = {
  produto:      "var(--gold)",
  categoria:    "#5B9BD5",
  subcategoria: "#4CAF50",
};

export default function SearchBar({ placeholder = "Buscar produtos...", autoFocus, onClose }: Props) {
  const router   = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef  = useRef<HTMLDivElement>(null);

  const [query,       setQuery]       = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [open,        setOpen]        = useState(false);
  const [highlighted, setHighlighted] = useState(-1);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // fecha ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    setHighlighted(-1);
    if (value.length >= 2) {
      const sugs = getSuggestions(value);
      setSuggestions(sugs);
      setOpen(sugs.length > 0);
    } else {
      setSuggestions([]);
      setOpen(false);
    }
  }

  function handleSubmit(q?: string) {
    const term = (q ?? query).trim();
    if (!term) return;
    setOpen(false);
    router.push(`/busca?q=${encodeURIComponent(term)}`);
    onClose?.();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (e.key === "Enter") handleSubmit();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted(h => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlighted >= 0 && suggestions[highlighted]) {
        const sug = suggestions[highlighted];
        if (sug.type === "produto") {
          router.push(sug.href);
        } else {
          handleSubmit(sug.label);
        }
        setOpen(false);
        onClose?.();
      } else {
        handleSubmit();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function clear() {
    setQuery("");
    setSuggestions([]);
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%" }}>
      {/* campo */}
      <div style={{ position: "relative" }}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
          placeholder={placeholder}
          autoComplete="off"
          style={{
            width: "100%",
            background: "var(--black-mid)",
            border: `1px solid ${open ? "var(--gold)" : "rgba(201,168,76,0.25)"}`,
            borderRadius: open ? "8px 8px 0 0" : 8,
            padding: "10px 80px 10px 16px",
            color: "var(--white)",
            fontSize: 14,
            outline: "none",
            transition: "border-color 0.2s",
          }}
        />
        {/* botão limpar */}
        {query && (
          <button onClick={clear}
            style={{
              position: "absolute", right: 44, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              color: "var(--gray-mid)", display: "flex", padding: 4,
            }}>
            <X size={14} />
          </button>
        )}
        {/* botão buscar */}
        <button onClick={() => handleSubmit()}
          style={{
            position: "absolute", right: 0, top: 0, bottom: 0, width: 44,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "none", border: "none", cursor: "pointer",
            color: "var(--gold)",
            borderLeft: "1px solid rgba(201,168,76,0.15)",
          }}>
          <Search size={17} />
        </button>
      </div>

      {/* dropdown */}
      {open && suggestions.length > 0 && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          background: "var(--black-card)",
          border: "1px solid var(--gold)",
          borderTop: "none",
          borderRadius: "0 0 12px 12px",
          overflow: "hidden",
          boxShadow: "0 16px 40px rgba(0,0,0,0.7)",
          zIndex: 9999,
        }}>
          {/* separadores por tipo */}
          {(["categoria", "subcategoria", "produto"] as SearchSuggestion["type"][]).map(type => {
            const group = suggestions.filter(s => s.type === type);
            if (group.length === 0) return null;

            const groupLabel: Record<string, string> = {
              categoria:    "Categorias",
              subcategoria: "Tipos",
              produto:      "Produtos",
            };

            return (
              <div key={type}>
                <p style={{
                  padding: "8px 16px 4px",
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: TYPE_COLOR[type],
                  borderTop: type !== "categoria" ? "1px solid rgba(201,168,76,0.08)" : "none",
                }}>
                  {groupLabel[type]}
                </p>
                {group.map((sug, i) => {
                  const globalIdx = suggestions.indexOf(sug);
                  const isHighlighted = highlighted === globalIdx;

                  return (
                    <Link
                      key={i}
                      href={sug.href}
                      onClick={() => { setOpen(false); onClose?.(); }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "9px 16px",
                        textDecoration: "none",
                        background: isHighlighted ? "rgba(201,168,76,0.1)" : "transparent",
                        transition: "background 0.1s",
                        cursor: "pointer",
                      }}
                      onMouseEnter={() => setHighlighted(globalIdx)}
                      onMouseLeave={() => setHighlighted(-1)}
                    >
                      {/* ícone do tipo */}
                      <span style={{ color: TYPE_COLOR[type], flexShrink: 0 }}>
                        {TYPE_ICON[type]}
                      </span>

                      {/* foto do produto se tiver */}
                      {sug.type === "produto" && (
                        <div style={{
                          width: 36, height: 36, borderRadius: 6, flexShrink: 0,
                          background: "linear-gradient(135deg,#f0efe8,#e8e6dc)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          overflow: "hidden",
                        }}>
                          {sug.product?.images?.[0]
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={sug.product.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <span style={{ fontSize: 18 }}>💍</span>
                          }
                        </div>
                      )}

                      {/* texto */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          color: "var(--white)", fontSize: 13, fontWeight: 500,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {/* destaca o termo pesquisado */}
                          {highlightMatch(sug.label, query)}
                        </p>
                        {sug.sublabel && (
                          <p style={{ color: "var(--gray-mid)", fontSize: 11, marginTop: 1 }}>
                            {sug.sublabel}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            );
          })}

          {/* ver todos os resultados */}
          <button
            onClick={() => handleSubmit()}
            style={{
              width: "100%", padding: "10px 16px",
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(201,168,76,0.06)",
              borderTop: "1px solid rgba(201,168,76,0.1)",
              border: "none", cursor: "pointer",
              color: "var(--gold)", fontSize: 13, fontWeight: 600,
            }}>
            <Search size={14} />
            Ver todos os resultados para &quot;{query}&quot;
          </button>
        </div>
      )}
    </div>
  );
}

/* destaca o trecho que bate com a busca */
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .indexOf(query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span style={{ color: "var(--gold)", fontWeight: 700 }}>
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}
