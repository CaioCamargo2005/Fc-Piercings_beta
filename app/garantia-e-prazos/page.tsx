import InstitucionalLayout from "@/app/components/ui/InstitucionalLayout";

export const metadata = { title: "Garantia e Prazos — FC Piercing e Semi Joias" };

export default function GarantiaPrazosPage() {
  return (
    <InstitucionalLayout title="Garantia e Prazos" breadcrumb="Garantia e Prazos" sections={[
      {
        title: "Nossa Garantia", icon: "🛡️",
        content: (
          <p>Todos os nossos produtos passam por controle de qualidade antes de serem enviados. Acreditamos na durabilidade dos materiais que trabalhamos e por isso oferecemos garantia estendida.</p>
        ),
      },
      {
        title: "Semi Joias — 1 ano de garantia", icon: "💛",
        content: (
          <>
            <p>Todos os produtos da linha de semi joias possuem <strong style={{ color: "var(--black)" }}>garantia de 1 ano</strong> contra:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>Manchas e oxidação</li>
              <li>Deformações no banho</li>
              <li>Defeitos de fabricação</li>
            </ul>
            <p style={{ marginTop: 10, fontSize: 12, color: "var(--gray-mid)" }}>
              * A garantia não cobre danos causados por mau uso, contato com produtos químicos (perfume, cloro, sabonete), ou desgaste natural.
            </p>
          </>
        ),
      },
      {
        title: "Piercings de Titânio — 2 anos de garantia", icon: "⚪",
        content: (
          <>
            <p>Os piercings em titânio cirúrgico ASTM F136 possuem <strong style={{ color: "var(--black)" }}>garantia de 2 anos</strong> contra:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>Manchas, corrosão e oxidação</li>
              <li>Defeitos no fecho ou sistema de encaixe</li>
              <li>Defeitos de fabricação</li>
            </ul>
            <p style={{ marginTop: 10 }}>O titânio ASTM F136 é o padrão ouro para piercings — hipoalergênico, biocompatível e resistente a qualquer condição de uso diário.</p>
          </>
        ),
      },
      {
        title: "Como acionar a garantia?", icon: "📞",
        content: (
          <>
            <p>Entre em contato pelo WhatsApp{" "}
              <a href="https://wa.me/5519997103023" style={{ color: "var(--gold)", textDecoration: "none" }}>
                (19) 99710-3023
              </a>{" "}informando:
            </p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
              <li>Número do pedido</li>
              <li>Foto do produto com o defeito</li>
              <li>Descrição do problema</li>
            </ul>
            <p style={{ marginTop: 10 }}>Nossa equipe avaliará o caso e retornará em até 2 dias úteis.</p>
          </>
        ),
      },
    ]} />
  );
}
