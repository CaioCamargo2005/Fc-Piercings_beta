import InstitucionalLayout from "@/app/components/ui/InstitucionalLayout";

export const metadata = { title: "Termos de Uso — FC Piercing e Semi Joias" };

export default function TermosPage() {
  return (
    <InstitucionalLayout title="Termos de Uso" breadcrumb="Termos de Uso" sections={[
      {
        title: "Aceitação dos Termos", icon: "📋",
        content: (
          <p>
            Ao acessar e utilizar o site da <strong style={{ color: "var(--black)" }}>FC Piercing & Semi Joias</strong>, você concorda com os presentes Termos de Uso. Caso não concorde com qualquer disposição, não utilize nossos serviços.
          </p>
        ),
      },
      {
        title: "Sobre a Empresa", icon: "🏪",
        content: (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { label: "Razão Social",  value: "FC Piercing & Semi Joias" },
              { label: "Nome Fantasia", value: "FC Piercings e Semi Joias" },
              { label: "CNPJ",          value: "41.090.304/0001-74" },
              { label: "Endereço",      value: "Rua Luís Pântano, 606 — CEP 13481-388 — Limeira/SP" },
              { label: "WhatsApp",      value: "(19) 99710-3023" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ color: "var(--gold)", fontWeight: 600, minWidth: 130, flexShrink: 0 }}>{item.label}:</span>
                <span style={{ color: "var(--black)" }}>{item.value}</span>
              </div>
            ))}
          </div>
        ),
      },
      {
        title: "Uso do Site", icon: "💻",
        content: (
          <>
            <p>Ao utilizar este site, você declara que:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>Tem capacidade legal para celebrar contratos (maior de 18 anos ou assistido por responsável legal)</li>
              <li>As informações fornecidas no cadastro são verdadeiras e atualizadas</li>
              <li>Não utilizará o site para fins ilícitos ou que causem danos a terceiros</li>
              <li>É responsável pela confidencialidade de sua senha de acesso</li>
            </ul>
          </>
        ),
      },
      {
        title: "Produtos e Preços", icon: "🏷️",
        content: (
          <>
            <p>Todos os preços exibidos são em reais (R$) e incluem os impostos aplicáveis. Nos reservamos o direito de alterar preços sem aviso prévio, sendo sempre válido o preço exibido no momento da finalização do pedido.</p>
            <p style={{ marginTop: 8 }}>As imagens dos produtos são meramente ilustrativas. Eventuais variações de cor ou acabamento em relação à foto não constituem defeito de produto.</p>
          </>
        ),
      },
      {
        title: "Pedidos e Pagamentos", icon: "💳",
        content: (
          <>
            <p>O pedido só é confirmado após a confirmação do pagamento. Nos reservamos o direito de cancelar pedidos em caso de:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>Indisponibilidade do produto em estoque</li>
              <li>Dados cadastrais incorretos ou incompletos</li>
              <li>Suspeita de fraude ou uso indevido</li>
              <li>Erro de precificação no sistema</li>
            </ul>
            <p style={{ marginTop: 8 }}>Em caso de cancelamento, o valor pago será estornado integralmente.</p>
          </>
        ),
      },
      {
        title: "Entrega", icon: "🚚",
        content: (
          <p>Os prazos de entrega são estimados e podem variar de acordo com a região e a transportadora. Não nos responsabilizamos por atrasos causados pelos Correios ou transportadoras terceiras. Para detalhes sobre frete, consulte nossa página de <a href="/formas-de-envio" style={{ color: "var(--gold)", textDecoration: "none" }}>Formas de Envio</a>.</p>
        ),
      },
      {
        title: "Trocas e Devoluções", icon: "🔄",
        content: (
          <p>As condições para troca e devolução seguem o Código de Defesa do Consumidor (Lei 8.078/90) e nossa <a href="/politica-de-trocas" style={{ color: "var(--gold)", textDecoration: "none" }}>Política de Trocas</a>. O prazo para desistência da compra é de 7 dias corridos após o recebimento do produto.</p>
        ),
      },
      {
        title: "Propriedade Intelectual", icon: "©️",
        content: (
          <p>Todo o conteúdo deste site — incluindo textos, imagens, logotipos e layout — é de propriedade exclusiva da FC Piercing & Semi Joias. É proibida a reprodução total ou parcial sem autorização prévia por escrito.</p>
        ),
      },
      {
        title: "Privacidade e Dados Pessoais", icon: "🔒",
        content: (
          <p>O tratamento de dados pessoais segue nossa <a href="/privacidade" style={{ color: "var(--gold)", textDecoration: "none" }}>Política de Privacidade</a>, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018).</p>
        ),
      },
      {
        title: "Limitação de Responsabilidade", icon: "⚖️",
        content: (
          <>
            <p>Não nos responsabilizamos por:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>Danos causados pelo uso incorreto dos produtos</li>
              <li>Reações alérgicas decorrentes de sensibilidade individual não informada previamente</li>
              <li>Falhas de acesso ao site por problemas de conexão do usuário</li>
              <li>Danos indiretos ou consequentes decorrentes do uso do site</li>
            </ul>
          </>
        ),
      },
      {
        title: "Alterações nos Termos", icon: "📝",
        content: (
          <p>Podemos atualizar estes Termos de Uso a qualquer momento. As alterações entram em vigor imediatamente após a publicação. O uso continuado do site após as alterações implica na aceitação dos novos termos.</p>
        ),
      },
      {
        title: "Foro e Legislação Aplicável", icon: "🏛️",
        content: (
          <p>Estes Termos são regidos pela legislação brasileira. Fica eleito o foro da comarca de <strong style={{ color: "var(--black)" }}>Limeira/SP</strong> para dirimir quaisquer controvérsias decorrentes deste instrumento.</p>
        ),
      },
    ]} />
  );
}
