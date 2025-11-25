import type { PlanModel } from '../types/Plan.model';

// Mock plan data for initial implementation
export const mockPlans: PlanModel[] = [
  {
    id: 'plan-basic-001',
    name: 'Bronze',
    service: 'quobo',
    value: 29.90,
    interval: 1,
    repeats: 0,
    description: 'Plano perfeito para pequenos negócios começarem',
    currency: 'BRL',
    status: 'active',
    feature_list: [
      'Até 100 produtos',
      'Até 2 usuários',
      'Suporte por email',
      'Relatórios básicos',
      'Importação Excel',
    ],
    features: {
      product_limits: {
        max_products: 100,
        unlimited: false,
      },
      user_limits: {
        max_users: 2,
        unlimited: false,
      },
      team_features: {
        enabled: false,
        max_teams: 0,
      },
      branch_features: {
        enabled: false,
        max_branches: 1,
      },
      api_access: {
        enabled: false,
        rate_limit: 0,
      },
      import_features: {
        excel_import: true,
        bulk_operations: false,
      },
      reporting: {
        basic_reports: true,
        advanced_reports: false,
        custom_reports: false,
      },
      support: {
        email_support: true,
        priority_support: false,
        phone_support: false,
      },
    },
  },
  {
    id: 'plan-pro-002',
    name: 'Prata',
    service: 'quobo',
    value: 79.90,
    interval: 1,
    repeats: 0,
    description: 'Ideal para empresas em crescimento',
    currency: 'BRL',
    status: 'active',
    feature_list: [
      'Até 500 produtos',
      'Até 5 usuários',
      'Suporte prioritário',
      'Relatórios avançados',
      'Múltiplas filiais',
      'API de integração',
    ],
    features: {
      product_limits: {
        max_products: 500,
        unlimited: false,
      },
      user_limits: {
        max_users: 5,
        unlimited: false,
      },
      team_features: {
        enabled: true,
        max_teams: 3,
      },
      branch_features: {
        enabled: true,
        max_branches: 3,
      },
      api_access: {
        enabled: true,
        rate_limit: 1000,
      },
      import_features: {
        excel_import: true,
        bulk_operations: true,
      },
      reporting: {
        basic_reports: true,
        advanced_reports: true,
        custom_reports: false,
      },
      support: {
        email_support: true,
        priority_support: true,
        phone_support: false,
      },
    },
  },
  {
    id: 'plan-premium-003',
    name: 'Ouro',
    service: 'quobo',
    value: 149.90,
    interval: 1,
    repeats: 0,
    description: 'Solução completa para grandes operações',
    currency: 'BRL',
    status: 'active',
    feature_list: [
      'Produtos ilimitados',
      'Usuários ilimitados',
      'Suporte telefônico 24/7',
      'Relatórios personalizados',
      'Filiais ilimitadas',
      'API com alta taxa',
      'Treinamento personalizado',
    ],
    features: {
      product_limits: {
        max_products: 0,
        unlimited: true,
      },
      user_limits: {
        max_users: 0,
        unlimited: true,
      },
      team_features: {
        enabled: true,
        max_teams: 999,
      },
      branch_features: {
        enabled: true,
        max_branches: 999,
      },
      api_access: {
        enabled: true,
        rate_limit: 10000,
      },
      import_features: {
        excel_import: true,
        bulk_operations: true,
      },
      reporting: {
        basic_reports: true,
        advanced_reports: true,
        custom_reports: true,
      },
      support: {
        email_support: true,
        priority_support: true,
        phone_support: true,
      },
    },
  },
];
