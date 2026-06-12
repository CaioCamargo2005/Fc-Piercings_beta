import InstitucionalLayout from "@/app/components/ui/InstitucionalLayout";

export const metadata = { title: "Quem Somos — FC Piercing e Semi Joias" };

export default function QuemSomosPage() {
  return (
    <InstitucionalLayout title="Quem Somos" breadcrumb="Quem Somos" sections={[
      {
        title: "Nossa História", icon: "✨",
        content: (
          <p>A FC Piercing e Semi Joias nasceu da paixão por joias e acessórios de qualidade. Somos uma loja especializada em piercings de titânio cirúrgico e semi joias banhadas, com foco em oferecer produtos seguros, bonitos e acessíveis para todos.</p>
        ),
      },
      {
        title: "Nossa Missão", icon: "🎯",
        content: (
          <p>Oferecer piercings e semi joias de alta qualidade, com atendimento humanizado, entrega rápida e total segurança na compra. Queremos que cada cliente se sinta especial — da escolha do produto até o momento em que ele chega na sua porta.</p>
        ),
      },
      {
        title: "Por que escolher a FC?", icon: "💎",
        content: (
          <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            <li>Titânio ASTM F136 — o grau mais seguro para uso em piercings</li>
            <li>Garantia de 1 ano para semi joias e 2 anos para piercings de titânio</li>
            <li>Frete grátis para compras acima de R$ 300</li>
            <li>Atendimento personalizado via WhatsApp</li>
            <li>Entrega para todo o Brasil</li>
          </ul>
        ),
      },
      {
        title: "Informações da Empresa", icon: "📄",
        content: (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { label: "Razão Social", value: "FC Piercing & Semi Joias" },
              { label: "Nome Fantasia", value: "FC Piercings e Semi Joias" },
              { label: "CNPJ", value: "41.090.304/0001-74" },
              { label: "Endereço", value: "Rua Luís Pântano, 606 — CEP 13481-388 — Limeira/SP" },
              { label: "Telefone / WhatsApp", value: "(19) 99710-3023" },
              { label: "Horário de Atendimento", value: "Seg. a Sex. — 9h às 17h" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ color: "var(--gold)", fontWeight: 600, minWidth: 180, flexShrink: 0 }}>{item.label}:</span>
                <span style={{ color: "var(--black)" }}>{item.value}</span>
              </div>
            ))}
          </div>
        ),
      },
    ]} />
  );
}
