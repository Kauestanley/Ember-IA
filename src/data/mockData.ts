export type ContractType = 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual'
export type ClientStatus = 'Ativo' | 'Inativo' | 'Churned' | 'Trial'

export interface Client {
  id: string
  name: string
  company: string
  email: string
  phone: string
  contractType: ContractType
  revenue: number
  teamSize: number
  status: ClientStatus
  startDate: string
  segment: string
}

export interface OKR {
  id: string
  objective: string
  keyResults: {
    id: string
    description: string
    current: number
    target: number
    unit: string
  }[]
  owner: string
  quarter: string
  progress: number
}

export interface NewsPost {
  id: string
  author: string
  authorRole: string
  authorInitials: string
  authorColor: string
  content: string
  category: 'Atualização' | 'Conquista' | 'Alerta' | 'Novidade' | 'Estratégia'
  timestamp: string
  likes: number
  comments: number
  pinned?: boolean
}

export const clients: Client[] = [
  { id: '1', name: 'Ana Rodrigues', company: 'TechVision SA', email: 'ana@techvision.com', phone: '(11) 91234-5678', contractType: 'Anual', revenue: 18000, teamSize: 45, status: 'Ativo', startDate: '2023-03-15', segment: 'SaaS' },
  { id: '2', name: 'Carlos Mendes', company: 'Inovação Digital', email: 'carlos@inovacaodigital.com.br', phone: '(21) 98765-4321', contractType: 'Semestral', revenue: 9500, teamSize: 12, status: 'Ativo', startDate: '2023-07-01', segment: 'E-commerce' },
  { id: '3', name: 'Fernanda Lima', company: 'HealthPlus', email: 'fernanda@healthplus.med.br', phone: '(31) 97654-3210', contractType: 'Mensal', revenue: 3200, teamSize: 8, status: 'Trial', startDate: '2024-02-10', segment: 'HealthTech' },
  { id: '4', name: 'Roberto Silva', company: 'Construtora Apex', email: 'roberto@apexconstrutora.com', phone: '(41) 96543-2109', contractType: 'Anual', revenue: 24000, teamSize: 120, status: 'Ativo', startDate: '2022-11-20', segment: 'Construção' },
  { id: '5', name: 'Patricia Costa', company: 'EduMaster', email: 'patricia@edumaster.com.br', phone: '(51) 95432-1098', contractType: 'Trimestral', revenue: 6000, teamSize: 25, status: 'Ativo', startDate: '2023-09-05', segment: 'EdTech' },
  { id: '6', name: 'Marcos Oliveira', company: 'FinTech Pro', email: 'marcos@fintechpro.io', phone: '(11) 94321-0987', contractType: 'Anual', revenue: 36000, teamSize: 80, status: 'Ativo', startDate: '2022-06-15', segment: 'FinTech' },
  { id: '7', name: 'Juliana Alves', company: 'RetailMax', email: 'juliana@retailmax.com.br', phone: '(21) 93210-9876', contractType: 'Mensal', revenue: 2800, teamSize: 18, status: 'Inativo', startDate: '2023-04-20', segment: 'Varejo' },
  { id: '8', name: 'Diego Santos', company: 'LogiTrack', email: 'diego@logitrack.com.br', phone: '(31) 92109-8765', contractType: 'Semestral', revenue: 11000, teamSize: 35, status: 'Ativo', startDate: '2023-01-08', segment: 'Logística' },
  { id: '9', name: 'Camila Ferreira', company: 'AgroTech Brasil', email: 'camila@agrotech.agr.br', phone: '(62) 91098-7654', contractType: 'Anual', revenue: 28000, teamSize: 60, status: 'Ativo', startDate: '2022-08-30', segment: 'AgriTech' },
  { id: '10', name: 'Lucas Pereira', company: 'Media Storm', email: 'lucas@mediastorm.com.br', phone: '(11) 90987-6543', contractType: 'Mensal', revenue: 1800, teamSize: 6, status: 'Churned', startDate: '2023-05-12', segment: 'Mídia' },
  { id: '11', name: 'Amanda Xavier', company: 'CloudNet Solutions', email: 'amanda@cloudnet.com.br', phone: '(85) 99876-5432', contractType: 'Trimestral', revenue: 7500, teamSize: 22, status: 'Ativo', startDate: '2023-10-15', segment: 'Cloud' },
  { id: '12', name: 'Bruno Carvalho', company: 'InsureTech', email: 'bruno@insuretech.com.br', phone: '(51) 98765-4321', contractType: 'Anual', revenue: 22000, teamSize: 55, status: 'Ativo', startDate: '2022-12-01', segment: 'InsurTech' },
]

export const okrs: OKR[] = [
  {
    id: '1',
    objective: 'Atingir R$ 500k de MRR até Q4 2024',
    owner: 'Felipe Barros',
    quarter: 'Q4 2024',
    progress: 72,
    keyResults: [
      { id: 'kr1', description: 'Fechar 15 novos contratos anuais', current: 11, target: 15, unit: 'contratos' },
      { id: 'kr2', description: 'Aumentar MRR de R$ 320k para R$ 500k', current: 423, target: 500, unit: 'k' },
      { id: 'kr3', description: 'Reduzir churn rate para abaixo de 2%', current: 2.8, target: 2, unit: '%' },
    ],
  },
  {
    id: '2',
    objective: 'Expandir equipe e capacidade de entrega',
    owner: 'Marina Costa',
    quarter: 'Q4 2024',
    progress: 60,
    keyResults: [
      { id: 'kr4', description: 'Contratar 5 especialistas em IA', current: 3, target: 5, unit: 'pessoas' },
      { id: 'kr5', description: 'Lançar 2 novos produtos/serviços', current: 1, target: 2, unit: 'produtos' },
      { id: 'kr6', description: 'Certificar 100% da equipe em GenAI', current: 68, target: 100, unit: '%' },
    ],
  },
  {
    id: '3',
    objective: 'Maximizar satisfação e retenção de clientes',
    owner: 'Thiago Rocha',
    quarter: 'Q4 2024',
    progress: 85,
    keyResults: [
      { id: 'kr7', description: 'NPS acima de 70', current: 74, target: 70, unit: 'pts' },
      { id: 'kr8', description: 'Tempo médio de resposta < 4h', current: 3.2, target: 4, unit: 'horas' },
      { id: 'kr9', description: '90% de renovações automáticas', current: 87, target: 90, unit: '%' },
    ],
  },
  {
    id: '4',
    objective: 'Consolidar presença de marca e marketing',
    owner: 'Larissa Nunes',
    quarter: 'Q4 2024',
    progress: 45,
    keyResults: [
      { id: 'kr10', description: 'Alcançar 10k seguidores no LinkedIn', current: 4200, target: 10000, unit: 'seguidores' },
      { id: 'kr11', description: 'Gerar 50 leads qualificados/mês', current: 31, target: 50, unit: 'leads' },
      { id: 'kr12', description: 'Publicar 8 cases de sucesso', current: 3, target: 8, unit: 'cases' },
    ],
  },
]

export const monthlyRevenue = [
  { month: 'Jan', faturamento: 280000, despesas: 145000, lucro: 135000 },
  { month: 'Fev', faturamento: 295000, despesas: 152000, lucro: 143000 },
  { month: 'Mar', faturamento: 318000, despesas: 158000, lucro: 160000 },
  { month: 'Abr', faturamento: 342000, despesas: 165000, lucro: 177000 },
  { month: 'Mai', faturamento: 361000, despesas: 171000, lucro: 190000 },
  { month: 'Jun', faturamento: 385000, despesas: 178000, lucro: 207000 },
  { month: 'Jul', faturamento: 398000, despesas: 182000, lucro: 216000 },
  { month: 'Ago', faturamento: 412000, despesas: 188000, lucro: 224000 },
  { month: 'Set', faturamento: 423000, despesas: 195000, lucro: 228000 },
  { month: 'Out', faturamento: 441000, despesas: 201000, lucro: 240000 },
  { month: 'Nov', faturamento: 458000, despesas: 208000, lucro: 250000 },
  { month: 'Dez', faturamento: 476000, despesas: 215000, lucro: 261000 },
]

export const newsPosts: NewsPost[] = [
  {
    id: '1',
    author: 'Felipe Barros',
    authorRole: 'CEO',
    authorInitials: 'FB',
    authorColor: 'bg-indigo-500',
    content: '🚀 Grande conquista! Fechamos hoje o contrato com a FinTech Pro no valor de R$ 36k/ano. É nosso maior contrato até agora! Parabéns ao time de vendas, especialmente ao Thiago e a Amanda pela condução impecável do processo. Isso nos coloca ainda mais próximos da meta de MRR para Q4.',
    category: 'Conquista',
    timestamp: '2024-10-08T09:30:00',
    likes: 18,
    comments: 7,
    pinned: true,
  },
  {
    id: '2',
    author: 'Marina Costa',
    authorRole: 'COO',
    authorInitials: 'MC',
    authorColor: 'bg-emerald-500',
    content: 'Update de RH: Recebi confirmação de mais dois candidatos para as vagas de especialista em IA. Entrevistas técnicas agendadas para quinta e sexta. Qualidade dos candidatos está excelente — ambos com experiência em LLMs e fine-tuning. Ficamos 3/5 nas contratações do OKR de expansão de equipe.',
    category: 'Atualização',
    timestamp: '2024-10-08T10:15:00',
    likes: 9,
    comments: 3,
  },
  {
    id: '3',
    author: 'Larissa Nunes',
    authorRole: 'Head de Marketing',
    authorInitials: 'LN',
    authorColor: 'bg-purple-500',
    content: '📊 Resultados da campanha de outubro: CAC caiu para R$ 2.150 (vs R$ 2.890 em setembro). CPL no LinkedIn reduziu 28% com a nova segmentação de audiência. Estamos testando 3 variações de copy para o webinar de novembro. Taxa de abertura dos emails: 34.2% — acima da média do setor (21%).',
    category: 'Estratégia',
    timestamp: '2024-10-08T11:00:00',
    likes: 14,
    comments: 5,
  },
  {
    id: '4',
    author: 'Thiago Rocha',
    authorRole: 'Head de CS',
    authorInitials: 'TR',
    authorColor: 'bg-amber-500',
    content: '⚠️ Atenção: A RetailMax (Juliana Alves) entrou em contato sinalizando insatisfação com o progresso do projeto. Agendei uma reunião de alinhamento para amanhã às 14h. Preciso de apoio do time técnico para apresentar os entregáveis das últimas 3 semanas. Se puderem, @Diego e @Ana, por favor confirmar participação.',
    category: 'Alerta',
    timestamp: '2024-10-07T17:45:00',
    likes: 4,
    comments: 8,
  },
  {
    id: '5',
    author: 'Diego Santos',
    authorRole: 'Tech Lead',
    authorInitials: 'DS',
    authorColor: 'bg-blue-500',
    content: '🔧 Deploy realizado com sucesso na plataforma da LogiTrack. O pipeline de automação de relatórios com IA está 100% funcional — redução de 6h para 12min no processo de geração de relatórios deles. O cliente ficou impressionado. Documentação técnica já no Notion.',
    category: 'Novidade',
    timestamp: '2024-10-07T15:20:00',
    likes: 22,
    comments: 6,
  },
  {
    id: '6',
    author: 'Felipe Barros',
    authorRole: 'CEO',
    authorInitials: 'FB',
    authorColor: 'bg-indigo-500',
    content: 'Lembrete estratégico: nossa meta de fechar Q4 com R$ 476k de faturamento está bem encaminhada, mas precisamos manter o foco em upsell dos clientes ativos. Cada cliente nosso tem potencial de expansão de pelo menos 30%. Vamos mapear oportunidades na próxima reunião de segunda.',
    category: 'Estratégia',
    timestamp: '2024-10-07T09:00:00',
    likes: 11,
    comments: 4,
  },
  {
    id: '7',
    author: 'Amanda Xavier',
    authorRole: 'Account Manager',
    authorInitials: 'AX',
    authorColor: 'bg-rose-500',
    content: '✅ CloudNet Solutions renovou contrato por mais 1 ano com upgrade de plano! De R$ 7.5k/trimestre para R$ 9.2k/trimestre. Foi a nossa 3ª renovação do mês. NPS deles: 9/10. Eles querem expandir o uso de IA generativa para atendimento ao cliente — já calendei call com o Diego para explorar o projeto.',
    category: 'Conquista',
    timestamp: '2024-10-06T16:30:00',
    likes: 17,
    comments: 5,
  },
]

export const salesMetrics = {
  totalClients: 124,
  activeClients: 98,
  avgContractDuration: 14.2,
  mrr: 423000,
  arr: 5076000,
  ltv: 68400,
  cac: 2150,
  churnRate: 2.8,
  marketingSpend: 45000,
  adSpend: 22000,
  newClientsThisMonth: 8,
  revenueGrowthMoM: 4.3,
}

export const salesBySegment = [
  { segment: 'SaaS', value: 28, color: '#6366f1' },
  { segment: 'FinTech', value: 22, color: '#8b5cf6' },
  { segment: 'AgriTech', value: 15, color: '#10b981' },
  { segment: 'E-commerce', value: 12, color: '#f59e0b' },
  { segment: 'EdTech', value: 10, color: '#3b82f6' },
  { segment: 'Outros', value: 13, color: '#6b7280' },
]

export const funnelData = [
  { stage: 'Leads', value: 320 },
  { stage: 'Qualificados', value: 180 },
  { stage: 'Proposta', value: 85 },
  { stage: 'Negociação', value: 42 },
  { stage: 'Fechados', value: 28 },
]

export const churnTrend = [
  { month: 'Jan', churn: 4.1, newClients: 12 },
  { month: 'Fev', churn: 3.8, newClients: 10 },
  { month: 'Mar', churn: 3.5, newClients: 14 },
  { month: 'Abr', churn: 3.2, newClients: 9 },
  { month: 'Mai', churn: 3.0, newClients: 11 },
  { month: 'Jun', churn: 2.9, newClients: 13 },
  { month: 'Jul', churn: 2.8, newClients: 8 },
  { month: 'Ago', churn: 2.7, newClients: 10 },
  { month: 'Set', churn: 2.8, newClients: 9 },
  { month: 'Out', churn: 2.8, newClients: 8 },
]
