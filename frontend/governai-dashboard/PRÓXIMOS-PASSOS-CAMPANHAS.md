# 🎯 Próximos Passos - Frontend de Campanhas

## ✅ O que já está implementado

### Funcionalidades Core
- ✅ **Lista de Campanhas** - Com melhorias recentes:
  - Cards de estatísticas (Total, Ativas, Leads, Enviadas)
  - Filtro por status
  - Busca por nome e instância
  - Coluna de progresso com barra visual
  - Coluna de Instância WhatsApp
  - Botão de refresh
  - Formatação melhorada de datas

- ✅ **Criar Campanha** - Página completa
  - Formulário com validações
  - Campos: nome, descrição, mensagem, instância, webhook
  - Redirecionamento após criação

- ✅ **Editar Campanha** - Página completa
  - Edição de todos os campos
  - Adicionar leads à campanha (modal)
  - Visualização de informações da campanha
  - Redirecionamento após edição

- ✅ **Ações de Campanha**
  - Iniciar campanha
  - Pausar campanha
  - Retomar campanha
  - Parar campanha
  - Deletar campanha

---

## 🚀 Próximos Passos Priorizados

### 🔴 Prioridade ALTA (Essenciais)

#### 1. **Página de Estatísticas Detalhadas da Campanha**
**Objetivo:** Visualizar métricas completas de uma campanha específica

**O que implementar:**
- Nova rota: `/apps/campaigns/[id]/stats`
- Página com gráficos e métricas:
  - Total de leads
  - Mensagens enviadas
  - Taxa de entrega
  - Taxa de leitura
  - Taxa de resposta
  - Taxa de erro
  - Gráfico de progresso ao longo do tempo
  - Lista de leads com status individual
- Botão "Ver Estatísticas" na lista e na página de edição

**Arquivos a criar:**
- `classic/src/app/(apps layout)/apps/campaigns/[id]/stats/page.jsx`
- `classic/src/app/(apps layout)/apps/campaigns/[id]/stats/CampaignStatsBody.jsx`

**API já disponível:**
- `GET /campaigns/:id/stats` ✅

---

#### 2. **Sistema de WhatsApp Accounts (Substituir instanceName)**
**Objetivo:** Gerenciar contas WhatsApp de forma estruturada

**O que implementar:**

**Backend (se não existir):**
- Endpoints para WhatsApp Accounts:
  - `GET /whatsapp-accounts` - Listar contas
  - `POST /whatsapp-accounts` - Criar conta
  - `GET /whatsapp-accounts/:id` - Obter conta
  - `PUT /whatsapp-accounts/:id` - Atualizar conta
  - `DELETE /whatsapp-accounts/:id` - Deletar conta
  - `POST /whatsapp-accounts/:id/connect` - Conectar WhatsApp
  - `GET /whatsapp-accounts/:id/status` - Status da conexão

**Frontend:**
- Service: `classic/src/lib/api/services/whatsapp-accounts.js`
- Página de gerenciamento: `/apps/whatsapp-accounts/list`
- Página de criação: `/apps/whatsapp-accounts/create`
- Atualizar formulários de campanha:
  - Substituir input `instanceName` por dropdown de contas
  - Mostrar status da conta selecionada
  - Validar se conta está conectada antes de iniciar campanha

**Arquivos a criar/modificar:**
- `classic/src/lib/api/services/whatsapp-accounts.js` (novo)
- `classic/src/app/(apps layout)/apps/whatsapp-accounts/list/page.jsx` (novo)
- `classic/src/app/(apps layout)/apps/whatsapp-accounts/create/page.jsx` (novo)
- `classic/src/app/(apps layout)/apps/campaigns/create/CreateCampaignBody.jsx` (modificar)
- `classic/src/app/(apps layout)/apps/campaigns/[id]/EditCampaignBody.jsx` (modificar)

---

#### 3. **Visualização Detalhada de Leads da Campanha**
**Objetivo:** Ver e gerenciar leads de uma campanha específica

**O que implementar:**
- Nova rota: `/apps/campaigns/[id]/leads`
- Tabela com leads da campanha:
  - Nome, email, telefone
  - Status do envio (pendente, enviado, entregue, lido, respondido, erro)
  - Data/hora do envio
  - Ações: remover da campanha, ver detalhes
- Filtros por status de envio
- Busca por nome/email/telefone
- Exportação para CSV

**Arquivos a criar:**
- `classic/src/app/(apps layout)/apps/campaigns/[id]/leads/page.jsx`
- `classic/src/app/(apps layout)/apps/campaigns/[id]/leads/CampaignLeadsBody.jsx`

---

### 🟡 Prioridade MÉDIA (Melhorias)

#### 4. **Melhorias na Página de Edição**
**O que implementar:**
- Preview da mensagem com variáveis substituídas
- Teste de envio (enviar para número de teste)
- Histórico de alterações
- Logs de execução da campanha
- Botão "Duplicar Campanha"

---

#### 5. **Filtros Avançados na Lista**
**O que implementar:**
- Filtro por data de criação (range)
- Filtro por instância WhatsApp
- Filtro por quantidade de leads
- Ordenação customizada (múltiplas colunas)
- Salvar filtros favoritos

---

#### 6. **Exportação e Relatórios**
**O que implementar:**
- Exportar lista de campanhas para CSV/Excel
- Exportar leads de uma campanha
- Gerar relatório PDF de estatísticas
- Agendar relatórios automáticos

---

#### 7. **Notificações e Alertas**
**O que implementar:**
- Toast notifications para ações (substituir `alert()`)
- Notificações quando campanha termina
- Alertas quando taxa de erro é alta
- Notificações de campanhas pausadas há muito tempo

---

### 🟢 Prioridade BAIXA (Nice to Have)

#### 8. **Templates de Mensagem**
**O que implementar:**
- Biblioteca de templates
- Criar/editar templates
- Usar template ao criar campanha
- Variáveis disponíveis: {nome}, {email}, {telefone}, etc.

---

#### 9. **Agendamento de Campanhas**
**O que implementar:**
- Agendar início de campanha
- Agendar pausa/retomada
- Calendário de campanhas
- Lembretes

---

#### 10. **A/B Testing**
**O que implementar:**
- Criar variações de mensagem
- Dividir leads em grupos
- Comparar performance
- Selecionar melhor variação automaticamente

---

## 📋 Checklist de Implementação Sugerida

### Fase 1: Estatísticas e Visualização (1-2 semanas)
- [ ] Página de estatísticas detalhadas
- [ ] Visualização de leads da campanha
- [ ] Gráficos e métricas visuais

### Fase 2: WhatsApp Accounts (2-3 semanas)
- [ ] Backend: Endpoints de WhatsApp Accounts
- [ ] Frontend: Service e páginas de gerenciamento
- [ ] Atualizar formulários de campanha
- [ ] Validações e feedback visual

### Fase 3: Melhorias e Polimento (1-2 semanas)
- [ ] Filtros avançados
- [ ] Exportação de dados
- [ ] Notificações toast
- [ ] Melhorias na UX

### Fase 4: Features Avançadas (Opcional)
- [ ] Templates de mensagem
- [ ] Agendamento
- [ ] A/B Testing

---

## 🎨 Sugestões de UX/UI

### Componentes a Criar/Reutilizar
- `CampaignStatsCard.jsx` - Card de estatística reutilizável
- `CampaignProgressChart.jsx` - Gráfico de progresso
- `LeadStatusBadge.jsx` - Badge de status de lead
- `WhatsappAccountSelector.jsx` - Dropdown de seleção de conta
- `ToastNotification.jsx` - Sistema de notificações

### Melhorias Visuais
- Loading states mais elegantes
- Empty states informativos
- Skeleton loaders
- Animações suaves
- Dark mode (futuro)

---

## 🔗 Integrações Futuras

1. **Retell AI** - Campanhas de voz
2. **Email Marketing** - Campanhas por email
3. **SMS** - Campanhas por SMS
4. **Analytics** - Integração com Google Analytics
5. **Webhooks** - Webhooks customizados para eventos

---

## 📝 Notas Importantes

- **Compatibilidade:** Manter suporte a `instanceName` antigo durante migração
- **Performance:** Implementar paginação e lazy loading onde necessário
- **Acessibilidade:** Garantir que todos os componentes sejam acessíveis
- **Testes:** Adicionar testes unitários e de integração
- **Documentação:** Documentar novas funcionalidades

---

**Última atualização:** 2026-01-05  
**Status:** Planejamento ✅

