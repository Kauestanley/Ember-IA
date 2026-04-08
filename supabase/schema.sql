-- ============================================================
-- AI Agency Dashboard — Supabase Schema
-- Execute este arquivo no SQL Editor do seu projeto Supabase
-- ============================================================

-- Tabela de clientes
create table if not exists clients (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  company text not null,
  email text not null,
  phone text not null default '',
  contract_type text check (contract_type in ('Mensal', 'Trimestral', 'Semestral', 'Anual')) not null default 'Mensal',
  revenue numeric not null default 0,
  team_size integer not null default 1,
  status text check (status in ('Ativo', 'Inativo', 'Churned', 'Trial')) not null default 'Trial',
  segment text not null default '',
  start_date date not null default current_date,
  created_at timestamptz not null default now()
);

-- Tabela de OKRs
create table if not exists okrs (
  id uuid default gen_random_uuid() primary key,
  objective text not null,
  owner text not null,
  quarter text not null,
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  created_at timestamptz not null default now()
);

-- Tabela de Key Results (filhos dos OKRs)
create table if not exists key_results (
  id uuid default gen_random_uuid() primary key,
  okr_id uuid not null references okrs(id) on delete cascade,
  description text not null,
  current_value numeric not null default 0,
  target_value numeric not null default 100,
  unit text not null default '%',
  created_at timestamptz not null default now()
);

-- Tabela de posts da newsletter
create table if not exists newsletter_posts (
  id uuid default gen_random_uuid() primary key,
  author text not null,
  author_role text not null,
  author_initials text not null,
  author_color text not null default 'bg-indigo-500',
  content text not null,
  category text check (category in ('Atualização', 'Conquista', 'Alerta', 'Novidade', 'Estratégia')) not null default 'Atualização',
  likes integer not null default 0,
  comments integer not null default 0,
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Políticas de acesso (RLS) — desativadas para dev
-- Em produção, configure autenticação e habilite RLS
-- ============================================================
alter table clients disable row level security;
alter table okrs disable row level security;
alter table key_results disable row level security;
alter table newsletter_posts disable row level security;

-- ============================================================
-- Seed — dados iniciais de exemplo
-- ============================================================
insert into clients (name, company, email, phone, contract_type, revenue, team_size, status, segment, start_date) values
  ('Ana Rodrigues',   'TechVision SA',        'ana@techvision.com',           '(11) 91234-5678', 'Anual',      18000, 45,  'Ativo',   'SaaS',        '2023-03-15'),
  ('Carlos Mendes',   'Inovação Digital',     'carlos@inovacaodigital.com',   '(21) 98765-4321', 'Semestral',   9500, 12,  'Ativo',   'E-commerce',  '2023-07-01'),
  ('Fernanda Lima',   'HealthPlus',           'fernanda@healthplus.com',       '(31) 97654-3210', 'Mensal',      3200,  8,  'Trial',   'HealthTech',  '2024-02-10'),
  ('Roberto Silva',   'Construtora Apex',     'roberto@apexconstrutora.com',  '(41) 96543-2109', 'Anual',      24000, 120, 'Ativo',   'Construção',  '2022-11-20'),
  ('Patricia Costa',  'EduMaster',            'patricia@edumaster.com',        '(51) 95432-1098', 'Trimestral',  6000, 25,  'Ativo',   'EdTech',      '2023-09-05'),
  ('Marcos Oliveira', 'FinTech Pro',          'marcos@fintechpro.io',         '(11) 94321-0987', 'Anual',      36000, 80,  'Ativo',   'FinTech',     '2022-06-15'),
  ('Juliana Alves',   'RetailMax',            'juliana@retailmax.com',         '(21) 93210-9876', 'Mensal',      2800, 18,  'Inativo', 'Varejo',      '2023-04-20'),
  ('Diego Santos',    'LogiTrack',            'diego@logitrack.com',          '(31) 92109-8765', 'Semestral',  11000, 35,  'Ativo',   'Logística',   '2023-01-08'),
  ('Camila Ferreira', 'AgroTech Brasil',      'camila@agrotech.com',          '(62) 91098-7654', 'Anual',      28000, 60,  'Ativo',   'AgriTech',    '2022-08-30'),
  ('Lucas Pereira',   'Media Storm',          'lucas@mediastorm.com',         '(11) 90987-6543', 'Mensal',      1800,  6,  'Churned', 'Mídia',       '2023-05-12'),
  ('Amanda Xavier',   'CloudNet Solutions',   'amanda@cloudnet.com',          '(85) 99876-5432', 'Trimestral',  7500, 22,  'Ativo',   'Cloud',       '2023-10-15'),
  ('Bruno Carvalho',  'InsureTech',           'bruno@insuretech.com',         '(51) 98765-4321', 'Anual',      22000, 55,  'Ativo',   'InsurTech',   '2022-12-01');

insert into okrs (id, objective, owner, quarter, progress) values
  ('11111111-1111-1111-1111-111111111111', 'Atingir R$ 500k de MRR até Q4 2024',     'Felipe Barros',  'Q4 2024', 72),
  ('22222222-2222-2222-2222-222222222222', 'Expandir equipe e capacidade de entrega', 'Marina Costa',   'Q4 2024', 60),
  ('33333333-3333-3333-3333-333333333333', 'Maximizar satisfação e retenção de clientes','Thiago Rocha','Q4 2024', 85),
  ('44444444-4444-4444-4444-444444444444', 'Consolidar presença de marca e marketing', 'Larissa Nunes',  'Q4 2024', 45);

insert into key_results (okr_id, description, current_value, target_value, unit) values
  ('11111111-1111-1111-1111-111111111111', 'Fechar 15 novos contratos anuais',         11,   15,    'contratos'),
  ('11111111-1111-1111-1111-111111111111', 'Aumentar MRR de R$320k para R$500k',      423,  500,   'k'),
  ('11111111-1111-1111-1111-111111111111', 'Reduzir churn rate para abaixo de 2%',     2.8,  2,    '%'),
  ('22222222-2222-2222-2222-222222222222', 'Contratar 5 especialistas em IA',           3,    5,   'pessoas'),
  ('22222222-2222-2222-2222-222222222222', 'Lançar 2 novos produtos/serviços',          1,    2,   'produtos'),
  ('22222222-2222-2222-2222-222222222222', 'Certificar 100% da equipe em GenAI',       68,  100,   '%'),
  ('33333333-3333-3333-3333-333333333333', 'NPS acima de 70',                          74,   70,   'pts'),
  ('33333333-3333-3333-3333-333333333333', 'Tempo médio de resposta < 4h',             3.2,  4,   'horas'),
  ('33333333-3333-3333-3333-333333333333', '90% de renovações automáticas',            87,   90,   '%'),
  ('44444444-4444-4444-4444-444444444444', 'Alcançar 10k seguidores no LinkedIn',    4200, 10000, 'seguidores'),
  ('44444444-4444-4444-4444-444444444444', 'Gerar 50 leads qualificados/mês',          31,   50,  'leads'),
  ('44444444-4444-4444-4444-444444444444', 'Publicar 8 cases de sucesso',               3,    8,  'cases');

insert into newsletter_posts (author, author_role, author_initials, author_color, content, category, likes, comments, pinned, created_at) values
  ('Felipe Barros', 'CEO', 'FB', 'bg-indigo-500',
   '🚀 Grande conquista! Fechamos hoje o contrato com a FinTech Pro no valor de R$ 36k/ano. É nosso maior contrato até agora! Parabéns ao time de vendas pela condução impecável do processo.',
   'Conquista', 18, 7, true, now() - interval '2 hours'),
  ('Marina Costa', 'COO', 'MC', 'bg-emerald-500',
   'Update de RH: Recebi confirmação de mais dois candidatos para as vagas de especialista em IA. Entrevistas técnicas agendadas para quinta e sexta. Ficamos 3/5 nas contratações do OKR.',
   'Atualização', 9, 3, false, now() - interval '3 hours'),
  ('Larissa Nunes', 'Head de Marketing', 'LN', 'bg-purple-500',
   '📊 Resultados da campanha de outubro: CAC caiu para R$ 2.150 (vs R$ 2.890 em setembro). CPL no LinkedIn reduziu 28%. Taxa de abertura dos emails: 34.2% — acima da média do setor.',
   'Estratégia', 14, 5, false, now() - interval '5 hours'),
  ('Thiago Rocha', 'Head de CS', 'TR', 'bg-amber-500',
   '⚠️ Atenção: A RetailMax sinalizou insatisfação com o progresso do projeto. Agendei reunião de alinhamento para amanhã às 14h. Preciso de apoio do time técnico.',
   'Alerta', 4, 8, false, now() - interval '1 day'),
  ('Diego Santos', 'Tech Lead', 'DS', 'bg-blue-500',
   '🔧 Deploy realizado com sucesso na plataforma da LogiTrack. O pipeline de automação com IA reduziu de 6h para 12min no processo de geração de relatórios.',
   'Novidade', 22, 6, false, now() - interval '1 day 2 hours');
