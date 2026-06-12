import InstitucionalLayout from "@/app/components/ui/InstitucionalLayout";

export const metadata = { title: "Privacidade e Segurança — FC Piercing e Semi Joias" };

export default function PrivacidadePage() {
  return (
    <InstitucionalLayout title="Privacidade e Segurança" breadcrumb="Privacidade" sections={[
      {
        title: "Nossa Política de Privacidade", icon: "🔒",
        content: (
          <>
            <p>
              A <strong style={{ color: "var(--black)" }}>FC Piercing & Semi Joias</strong>, inscrita no CNPJ 41.090.304/0001-74, respeita a privacidade e protege os dados pessoais de seus clientes, em conformidade com a <strong style={{ color: "var(--black)" }}>Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD)</strong>.
            </p>
          </>
        ),
      },
      {
        title: "Quais dados coletamos?", icon: "📋",
        content: (
          <>
            <p>Os dados coletados em nosso site — como nome, endereço, e-mail, telefone e informações para pagamento — são utilizados exclusivamente para finalidades relacionadas ao processamento de pedidos, emissão de nota fiscal, envio de produtos, atendimento ao cliente e comunicação sobre a compra realizada.</p>
          </>
        ),
      },
      {
        title: "Compartilhamento de dados", icon: "🤝",
        content: (
          <p>Essas informações podem ser compartilhadas apenas quando necessário para a execução do serviço, como com intermediadores de pagamento, transportadoras e obrigações legais ou fiscais. <strong style={{ color: "var(--black)" }}>Em nenhuma hipótese os dados serão vendidos ou repassados a terceiros para fins comerciais.</strong></p>
        ),
      },
      {
        title: "Segurança", icon: "🛡️",
        content: (
          <p>Adotamos medidas técnicas e administrativas de segurança para proteger os dados pessoais contra acessos não autorizados, perda, alteração ou divulgação indevida, garantindo uma experiência de compra segura.</p>
        ),
      },
      {
        title: "Seus direitos (LGPD)", icon: "⚖️",
        content: (
          <>
            <p>De acordo com a LGPD, o titular dos dados pode solicitar a qualquer momento:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>Acesso aos seus dados pessoais</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados</li>
              <li>Exclusão dos dados pessoais</li>
              <li>Informações sobre o tratamento realizado</li>
            </ul>
          </>
        ),
      },
      {
        title: "Contato para questões de privacidade", icon: "📞",
        content: (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p>Para dúvidas, solicitações ou assuntos relacionados à privacidade e proteção de dados, entre em contato:</p>
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { label: "Empresa", value: "FC Piercing & Semi Joias" },
                { label: "CNPJ", value: "41.090.304/0001-74" },
                { label: "Endereço", value: "Rua Luís Pântano, 606 — CEP 13481-388 — Limeira/SP" },
                { label: "Telefone / WhatsApp", value: "(19) 99710-3023" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ color: "var(--gold)", fontWeight: 600, minWidth: 100, flexShrink: 0 }}>{item.label}:</span>
                  <span style={{ color: "var(--black)" }}>{item.value}</span>
                </div>
              ))}
            </div>
            <p style={{ marginTop: 8 }}>Caso necessário, solicitações relacionadas à proteção de dados também podem ser encaminhadas através dos nossos canais oficiais de atendimento disponíveis no site.</p>
          </div>
        ),
      },
    ]} />
  );
}
