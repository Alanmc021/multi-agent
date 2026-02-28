import * as Icons from 'tabler-icons-react';
import HkBadge from '@/components/@hk-badge/@hk-badge';

export const SidebarMenu = [
   {
        group: '',
        contents: [
            // {
            //     name: 'Dashboard',
            //     icon: <Icons.Template />,
            //     path: '/dashboard',
            //     badge: <HkBadge size="sm" bg="pink" soft className="ms-auto" >hot</HkBadge>
            // },
            {
                name: 'Relatórios',
                icon: <Icons.ChartBar />,
                path: '/dashboard-analytics',
                // badge: <HkBadge size="sm" bg="success" soft className="ms-auto" >new</HkBadge>
            },
        ]
    },

    // ðŸ” ADMIN - GestÃ£o & Conformidade
    {
        group: 'ADMIN',
        contents: [
            {
                id: "dash_users",
                name: 'Usuários',
                icon: <Icons.UserCheck />,
                path: '/apps/users/list',
                grp_name: "admin",
                permission: { module: 'admin', action: 'read' }, // â† PermissÃ£o adicionada
            },
            // {
            //     id: "dash_permissions",
            //     name: 'PermissÃµes',
            //     icon: <Icons.Shield />,
            //     path: '/apps/admin/permissions',
            //     grp_name: "admin",
            //     permission: { module: 'admin', action: 'read' }, // â† PermissÃ£o adicionada
            // },
            {
                id: "dash_documents",
                name: 'Documentos',
                icon: <Icons.FileText />,
                path: '/apps/documents/list-view',
                grp_name: "admin",
                permission: { module: 'admin', action: 'read' }, // â† PermissÃ£o adicionada
            },
            // {
            //     id: "dash_reports",
            //     name: 'Relatórios',
            //     icon: <Icons.ChartBar />,
            //     path: '/apps/admin/reports',
            //     grp_name: "admin",
            //     permission: { module: 'admin', action: 'read' }, // â† PermissÃ£o adicionada
            // },
            {
                id: "dash_settings",
                name: 'Configurações',
                icon: <Icons.Settings />,
                path: '/apps/admin/settings',
                grp_name: "admin",
                permission: { module: 'admin', action: 'read' }, // â† PermissÃ£o adicionada
            },
            {
                id: "dash_monitoring",
                name: 'Monitor',
                icon: <Icons.Activity />,
                path: '/apps/monitoring',
                grp_name: "admin",
                permission: { module: 'admin', action: 'read' }, // â† PermissÃ£o adicionada
            },
         
        ]
    },

    // ðŸ’° FINANCEIRO - GestÃ£o Financeira & TSE
    {
        group: 'FINANCEIRO',
        contents: [
            {
                id: "dash_financial_overview",
                name: 'Visão Geral',
                icon: <Icons.Dashboard />,
                path: '/apps/financial/overview',
                grp_name: "financial",
                permission: { module: 'financial', action: 'read' }, // â† PermissÃ£o adicionada
            },
            {
                id: "dash_expenses",
                name: 'Despesas',
                icon: <Icons.Receipt />,
                path: '/apps/financial/expenses',
                grp_name: "financial",
                permission: { module: 'financial', action: 'read' }, // â† PermissÃ£o adicionada
            },
            {
                id: "dash_revenues",
                name: 'Receitas',
                icon: <Icons.Cash />,
                path: '/apps/financial/revenues',
                grp_name: "financial",
                permission: { module: 'financial', action: 'read' }, // â† PermissÃ£o adicionada
            },
            {
                id: "dash_invoices",
                name: 'Notas Fiscais',
                icon: <Icons.FileInvoice />,
                path: '/apps/financial/invoices',
                grp_name: "financial",
                permission: { module: 'financial', action: 'read' }, // â† PermissÃ£o adicionada
            },
            {
                id: "dash_tse_reports",
                name: 'Prestação de Contas',
                icon: <Icons.ReportAnalytics />,
                path: '/apps/financial/tse-reports',
                grp_name: "financial",
                permission: { module: 'financial', action: 'read' }, // â† PermissÃ£o adicionada
            },
        ]
    },

    // ðŸ“¢ MARKETING - Campanhas & CRM
    {
        group: 'MARKETING',
        contents: [
            {
                id: "dash_campaigns",
                name: 'Campanhas',
                icon: <Icons.Speakerphone />,
                path: '/apps/campaigns/list',
                activePathPrefix: '/apps/campaigns',
                grp_name: "marketing",
                permission: { module: 'marketing', action: 'read' }, // â† PermissÃ£o adicionada
            },
            {
                id: "dash_leads",
                name: 'Leads',
                icon: <Icons.Target />,
                path: '/apps/leads/list',
                grp_name: "marketing",
                permission: { module: 'marketing', action: 'read' }, // â† PermissÃ£o adicionada
            },
            {
                id: "dash_opportunities",
                name: 'Oportunidades',
                icon: <Icons.CurrencyDollar />,
                path: '/apps/opportunities/list',
                grp_name: "marketing",
                permission: { module: 'marketing', action: 'read' }, // â† PermissÃ£o adicionada
            },
            {
                id: "dash_assistants",
                name: 'Assistentes',
                icon: <Icons.Cpu />,
                path: '/apps/assistants',
                grp_name: "marketing",
                permission: { module: 'marketing', action: 'read' },
            },
            {
                id: "dash_agents",
                name: 'Agentes (CRUD)',
                icon: <Icons.Code />,
                path: '/apps/agents',
                grp_name: "marketing",
                permission: { module: 'marketing', action: 'read' },
            },
        ]
    },

    // ðŸ‘¥ CITIZEN - Engajamento
    {
        group: 'CITIZEN',
        contents: [
            {
                id: 'dash_sentiment',
                name: 'Análise de Sentimento',
                icon: <Icons.ChartBar />,
                path: '/apps/sentiment-analysis',
                grp_name: "citizen",
                permission: { module: 'citizen', action: 'read' }, // â† PermissÃ£o adicionada
            },
            {
                id: 'dash_crisis',
                name: 'Monitoramento de Crise',
                icon: <Icons.AlertTriangle />,
                path: '/apps/crisis-monitoring',
                grp_name: "citizen",
                permission: { module: 'citizen', action: 'read' }, // â† PermissÃ£o adicionada
            },
            {
                id: 'dash_vote',
                name: 'Intenção de Voto',
                icon: <Icons.ChartPie />,
                path: '/apps/vote-survey',
                grp_name: "citizen",
                permission: { module: 'citizen', action: 'read' }, // â† PermissÃ£o adicionada
            },
            
            {
                id: 'dash_social_monitoring',
                name: 'Monitoramento Social',
                icon: <Icons.MessageCircle />,
                path: '/apps/social-monitoring',
                grp_name: "citizen",
                permission: { module: 'citizen', action: 'read' },
            },
        ]
    },

    // ðŸŽ¨ STUDIO - ProduÃ§Ã£o
    {
        group: 'STUDIO',
        contents: [
            {
                id: "dash_avatar_generator",
                name: 'Gerador de Avatares',
                icon: <Icons.User />,
                path: '/apps/studio/avatar-generator',
                grp_name: "studio",
                permission: { module: 'studio', action: 'write' }, // â† PermissÃ£o adicionada (WRITE pois gera conteÃºdo)
            },
            {
                id: "dash_image_generator",
                name: 'Gerador de Imagens',
                icon: <Icons.Photo />,
                path: '/apps/studio/image-generator',
                grp_name: "studio",
                permission: { module: 'studio', action: 'write' }, // â† PermissÃ£o adicionada (WRITE pois gera conteÃºdo)
            },
            {
                id: "dash_video_generator",
                name: 'Gerador de Vídeos',
                icon: <Icons.Video />,
                path: '/apps/studio/video-generator',
                grp_name: "studio",
                permission: { module: 'studio', action: 'write' }, // â† PermissÃ£o adicionada (WRITE pois gera conteÃºdo)
            },
            // {
            //     id: "dash_banner_generator",
            //     name: 'Gerador de Banners',
            //     icon: <Icons.Layout />,
            //     path: '/apps/studio/banner-generator',
            //     grp_name: "studio",
            //     permission: { module: 'studio', action: 'write' }, // â† PermissÃ£o adicionada (WRITE pois gera conteÃºdo)
            // },
            {
                id: "dash_jingle_generator",
                name: 'Gerador de Jingles',
                icon: <Icons.Music />,
                path: '/apps/studio/jingle-generator',
                grp_name: "studio",
                permission: { module: 'studio', action: 'write' }, // â† PermissÃ£o adicionada (WRITE pois gera conteÃºdo)
            },
            {
                id: "dash_social_post_generator",
                name: 'Posts e Banners',
                icon: <Icons.Share />,
                path: '/apps/studio/social-post-generator',
                grp_name: "studio",
                permission: { module: 'studio', action: 'write' }, // â† PermissÃ£o adicionada (WRITE pois gera conteÃºdo)
            },
        ]
    },

    // Itens antigos mantidos (comentados, mas disponÃ­veis se precisar)
    // {
    //     group: 'Apps',
    //     contents: [
    //         // {
    //         //     id: 'dash_chat',
    //         //     name: 'Chat',
    //         //     icon: <Icons.MessageDots />,
    //         //     path: '/apps/chat/',
    //         //     childrens: [
    //         //         {
    //         //             name: 'Chats',
    //         //             path: '/apps/chat/chats',
    //         //             grp_name: "apps",
    //         //         },
    //         //         {
    //         //             name: 'Groups',
    //         //             path: '/apps/chat/groups',
    //         //             grp_name: "apps",
    //         //         },
    //         //         {
    //         //             name: 'Contacts',
    //         //             path: '/apps/chat/contact',
    //         //             grp_name: "apps",
    //         //         },
    //         //     ]
    //         // },
    //         // {
    //         //     id: 'dash_chatpop',
    //         //     name: 'Chat Popup',
    //         //     icon: <Icons.MessageCircle />,
    //         //     path: '/apps/chat-popup/',
    //         //     childrens: [
    //         //         {
    //         //             name: 'Direct Message',
    //         //             path: '/apps/chat-popup/direct-message',
    //         //             grp_name: "apps",
    //         //         },
    //         //         {
    //         //             name: 'Chatbot',
    //         //             path: '/apps/chat-popup/chat-bot',
    //         //             grp_name: "apps",
    //         //         },
    //         //     ]
    //         // },
    //         // {
    //         //     id: 'dash_chatpop', 
    //         //     name: 'Calendar',
    //         //     icon: <Icons.CalendarTime />,
    //         //     path: '/apps/calendar',
    //         //     grp_name: "apps",
    //         // },
    //         // {
    //         //     name: 'Email',
    //         //     icon: <Icons.Inbox />,
    //         //     path: '/apps/email',
    //         //     grp_name: "apps",
    //         // },
    //         // {
    //         //     id: "dash_scrumboard",
    //         //     name: 'Scrumboard',
    //         //     icon: <Icons.LayoutKanban />,
    //         //     path: '/apps/scrumboard/',
    //         //     iconBadge: <HkBadge bg="primary" size="sm" pill className="position-top-end-overflow">3</HkBadge>,
    //         //     childrens: [
    //         //         {
    //         //             name: 'All Boards',
    //         //             path: '/apps/scrumboard/project-board',
    //         //             grp_name: "apps",
    //         //         },
    //         //         {
    //         //             name: 'Project Kanban',
    //         //             path: '/apps/scrumboard/kanban-board',
    //         //             grp_name: "apps",
    //         //         },
    //         //         {
    //         //             name: 'Pipeline Kanban',
    //         //             path: '/apps/scrumboard/pipeline',
    //         //             grp_name: "apps",
    //         //         },
    //         //     ]
    //         // },
    //         // {
    //         //     id: "dash_contact",
    //         //     name: 'Contact',
    //         //     icon: <Icons.Notebook />,
    //         //     path: '/apps/contact/',
    //         //     childrens: [
    //         //         {
    //         //             name: 'Contact List',
    //         //             path: '/apps/contact/contact-list',
    //         //             grp_name: "apps",
    //         //         },
    //         //         {
    //         //             name: 'Contact Cards',
    //         //             path: '/apps/contact/contact-cards',
    //         //             grp_name: "apps",
    //         //         },
    //         //         {
    //         //             name: 'Edit Contact',
    //         //             path: '/apps/contact/edit-contact',
    //         //             grp_name: "apps",
    //         //         },
    //         //     ]
    //         // },
    //         // {
    //         //     id: "dash_file",
    //         //     name: 'File Manager',
    //         //     icon: <Icons.FileCheck />,
    //         //     path: '/apps/file-manager/',
    //         //     childrens: [
    //         //         {
    //         //             name: 'List View',
    //         //             path: '/apps/file-manager/list-view',
    //         //             grp_name: "apps",
    //         //         },
    //         //         {
    //         //             name: 'Grid View',
    //         //             path: '/apps/file-manager/grid-view',
    //         //             grp_name: "apps",
    //         //         },
    //         //     ]
    //         // },
    //         // {
    //         //     name: 'Gallery',
    //         //     icon: <Icons.Photo />,
    //         //     path: '/apps/gallery',
    //         //     grp_name: "apps",
    //         // },
    //         // {
    //         //     id: "dash_task",
    //         //     name: 'Todo',
    //         //     icon: <Icons.ListDetails />,
    //         //     path: '/apps/todo/',
    //         //     badge: <HkBadge bg="success" soft className="ms-2">2</HkBadge>,
    //         //     childrens: [
    //         //         {
    //         //             name: 'Tasklist',
    //         //             path: '/apps/todo/task-list',
    //         //             grp_name: "apps",
    //         //         },
    //         //         {
    //         //             name: 'Gantt',
    //         //             path: '/apps/todo/gantt',
    //         //             grp_name: "apps",
    //         //         },
    //         //     ]
    //         // },
    //         // {
    //         //     id: "dash_blog",
    //         //     name: 'Blog',
    //         //     icon: <Icons.Browser />,
    //         //     path: '/apps/blog/',
    //         //     childrens: [
    //         //         {
    //         //             name: 'Posts',
    //         //             path: '/apps/blog/posts',
    //         //             grp_name: "apps",
    //         //         },
    //         //         {
    //         //             name: 'Add New Post',
    //         //             path: '/apps/blog/add-new-post',
    //         //             grp_name: "apps",
    //         //         },
    //         //         {
    //         //             name: 'Post Detail',
    //         //             path: '/apps/blog/post-detail',
    //         //             grp_name: "apps",
    //         //         },
    //         //     ]
    //         // },
    //         // {
    //         //     id: "dash_invoice",
    //         //     name: 'Invoices',
    //         //     icon: <Icons.FileDigit />,
    //         //     path: '/apps/invoices/',
    //         //     childrens: [
    //         //         {
    //         //             name: 'Invoice List',
    //         //             path: '/apps/invoices/invoice-list',
    //         //             grp_name: "apps",
    //         //         },
    //         //         {
    //         //             name: 'Invoice Templates',
    //         //             path: '/apps/invoices/invoice-templates',
    //         //             grp_name: "apps",
    //         //         },
    //         //         {
    //         //             name: 'Create Invoice',
    //         //             path: '/apps/invoices/create-invoice',
    //         //             grp_name: "apps",
    //         //         },
    //         //         {
    //         //             name: 'Invoice Preview',
    //         //             path: '/apps/invoices/invoice-preview',
    //         //             grp_name: "apps",
    //         //         },
    //         //     ]
    //         // },
    //         // {
    //         //     id: "dash_integ",
    //         //     name: 'Integrations',
    //         //     icon: <Icons.Code />,
    //         //     path: '/apps/integrations/',
    //         //     childrens: [
    //         //         {
    //         //             name: 'All Apps',
    //         //             path: '/apps/integrations/all-apps',
    //         //             grp_name: "apps",
    //         //         },
    //         //         {
    //         //             name: 'App Detail',
    //         //             path: '/apps/integrations/app-detail',
    //         //             grp_name: "apps",
    //         //         },
    //         //         {
    //         //             name: 'Integrations',
    //         //             path: '/apps/integrations/integration',
    //         //             grp_name: "apps",
    //         //         },
    //         //     ]
    //         // },
    //     ]
    // },

    // //Pages group
    // {
    //     group: 'Pages',
    //     contents: [
    //         // {
    //         //     id: "dash_pages",
    //         //     name: 'Authentication',
    //         //     icon: <Icons.UserPlus />,
    //         //     path: '/auth/',
    //         //     childrens: [
    //         //         {
    //         //             id: "dash_log",
    //         //             name: 'Log In',
    //         //             path: '/auth/login/',
    //         //             childrens: [
    //         //                 {
    //         //                     name: 'Login',
    //         //                     path: '/auth/login',
    //         //                 },
    //         //                 {
    //         //                     name: 'Login Simple',
    //         //                     path: '/auth/login/simple',
    //         //                 },
    //         //                 {
    //         //                     name: 'Login Classic',
    //         //                     path: '/auth/login/classic',
    //         //                 },
    //         //             ]
    //         //         },
    //         //         {
    //         //             id: "dash_sign",
    //         //             name: 'Sign Up',
    //         //             path: '/auth/signup/',
    //         //             childrens: [
    //         //                 {
    //         //                     name: 'Signup',
    //         //                     path: '/auth/signup',
    //         //                 },
    //         //                 {
    //         //                     name: 'Signup Simple',
    //         //                     path: '/auth/signup/simple',
    //         //                 },
    //         //                 {
    //         //                     name: 'Signup Classic',
    //         //                     path: '/auth/signup/classic',
    //         //                 },
    //         //             ]
    //         //         },
    //         //         {
    //         //             name: 'Lock Screen',
    //         //             path: '/auth/lock-screen',
    //         //         },
    //         //         {
    //         //             name: 'Reset Password',
    //         //             path: '/auth/reset-password',
    //         //         },
    //         //         {
    //         //             name: 'Error 404',
    //         //             path: '/error-404',
    //         //         },
    //         //         {
    //         //             name: 'Error 503',
    //         //             path: '/error-503',
    //         //         },
    //         //     ]
    //         // },
    //         // {
    //         //     id: "dash_profile",
    //         //     name: 'Profile',
    //         //     icon: <Icons.UserSearch />,
    //         //     path: '/profile/',
    //         //     badgeIndicator: <HkBadge bg="danger" indicator className="position-absolute top-0 start-100" />,
    //         //     childrens: [
    //         //         {
    //         //             name: 'Profile',
    //         //             path: '/profile',
    //         //             grp_name: "apps",
    //         //         },
    //         //         {
    //         //             name: 'Edit Profile',
    //         //             path: '/profile/edit-profile',
    //         //             grp_name: "apps",
    //         //         },
    //         //         {
    //         //             name: 'Account',    
    //         //             path: '/profile/account',
    //         //             grp_name: "apps",
    //         //         },
    //         //     ]
    //         // },

    //     ]
    // },

    // {
    //     group: 'Documentation',
    //     contents: [
    //         {
    //             name: 'Documentation',
    //             icon: <Icons.FileCode2 />,
    //             path: 'https://next-nubra-ui.vercel.app/introduction',
    //         },
    //         {
    //             name: 'Components',
    //             icon: <Icons.Layout />,
    //             path: 'https://next-nubra-ui.vercel.app/avatar',
    //         },
    //     ]
    // },

]

