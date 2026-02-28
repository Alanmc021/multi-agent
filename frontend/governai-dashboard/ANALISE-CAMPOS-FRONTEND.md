# 📊 Análise dos Campos do Frontend - Campanhas e Leads

## 📋 Índice

1. [Página: Lista de Campanhas](#página-lista-de-campanhas)
2. [Página: Criar Campanha](#página-criar-campanha)
3. [Página: Editar Campanha](#página-editar-campanha)
4. [Página: Lista de Leads](#página-lista-de-leads)
5. [Análise Comparativa](#análise-comparativa)
6. [Recomendações de Melhorias](#recomendações-de-melhorias)

---

## 📄 Página: Lista de Campanhas

**URL:** `http://localhost:3005/apps/campaigns/list`

### Campos Exibidos na Tabela

| Campo | Tipo | Descrição | Status |
|-------|------|-----------|--------|
| `name` | string | Nome da campanha | ✅ Implementado |
| `status` | enum | Status (draft, active, paused, completed, cancelled) | ✅ Implementado |
| `leadCount` | number | Quantidade de leads | ✅ Implementado |
| `sentCount` | number | Quantidade de mensagens enviadas | ✅ Implementado |
| `createdAt` | date | Data de criação | ✅ Implementado |
| `actions` | buttons | Ações (Editar, Iniciar, Pausar, Retomar, Parar, Deletar) | ✅ Implementado |

### Funcionalidades Implementadas

✅ **Listagem de campanhas**
- Carrega todas as campanhas do tenant
- Suporta busca/filtro
- Paginação

✅ **Ações por Status**
- **Draft/Paused:** Botão "Iniciar" (Play)
- **Active:** Botões "Pausar" (Pause) e "Parar" (Square)
- **Paused:** Botões "Retomar" (RotateCw) e "Parar" (Square)
- **Sempre:** Botões "Editar" e "Deletar"

✅ **Feedback Visual**
- Badges de status coloridos
- Botões desabilitados durante processamento
- Confirmações antes de ações destrutivas

### Campos Faltantes (Para Nova Arquitetura)

❌ **WhatsApp Account**
- Não exibe qual conta WhatsApp está sendo usada
- Não mostra número do WhatsApp
- Não indica provider (Evolution vs WhatsApp Business)

**Sugestão:** Adicionar coluna opcional:
```
| WhatsApp Account | +55 11 99999-9999 (Conta Principal) |
```

---

## 📝 Página: Criar Campanha

**URL:** `http://localhost:3005/apps/campaigns/create`

### Campos Atuais

| Campo | Tipo | Obrigatório | Descrição | Status |
|-------|------|-------------|-----------|--------|
| `name` | text | ✅ Sim | Nome da campanha | ✅ OK |
| `description` | textarea | ❌ Não | Descrição da campanha | ✅ OK |
| `message` | textarea | ✅ Sim | Mensagem a ser enviada | ✅ OK |
| `instanceName` | text | ✅ Sim | Nome da instância Evolution API | ⚠️ Precisa mudar |
| `webhookUrl` | url | ❌ Não | URL do webhook n8n | ✅ OK |

### Análise Detalhada

#### ✅ Campos Bem Implementados

1. **Nome da Campanha**
   - Validação: obrigatório
   - Placeholder claro
   - Feedback de erro

2. **Mensagem**
   - Validação: obrigatório
   - Textarea com 6 linhas
   - Dica sobre variáveis `{nome}`

3. **Webhook URL**
   - Campo opcional
   - Validação de URL
   - Placeholder informativo

#### ⚠️ Campo que Precisa Mudar

**`instanceName` (Instância WhatsApp)**

**Problema Atual:**
- Campo de texto livre
- Usuário precisa digitar manualmente
- Não valida se instância existe
- Não mostra contas disponíveis
- Não diferencia Evolution API de WhatsApp Business API

**Solução Proposta:**
```jsx
// Substituir por:
<Form.Group className="mb-3">
  <Form.Label>Conta WhatsApp *</Form.Label>
  <Form.Select
    name="whatsappAccountId"
    value={formData.whatsappAccountId}
    onChange={handleChange}
    required
    disabled={saving || loadingAccounts}
  >
    <option value="">Selecione uma conta...</option>
    {whatsappAccounts.map(account => (
      <option key={account.id} value={account.id}>
        {account.name} - {account.phoneNumber} 
        {account.isDefault && ' (Padrão)'}
        {account.status !== 'active' && ` [${account.status}]`}
      </option>
    ))}
  </Form.Select>
  <Form.Text className="text-muted">
    Selecione a conta WhatsApp que será usada para esta campanha
  </Form.Text>
  {whatsappAccounts.length === 0 && (
    <Alert variant="warning" className="mt-2">
      Nenhuma conta WhatsApp configurada. 
      <Link href="/settings/whatsapp-accounts">Configure uma conta</Link>
    </Alert>
  )}
</Form.Group>
```

### Campos Faltantes

❌ **Seleção de Leads na Criação**
- Atualmente só adiciona leads depois de criar
- Seria útil poder selecionar leads na criação

**Sugestão:** Adicionar seção opcional:
```jsx
<Card className="mb-3">
  <Card.Header>
    <h6>Adicionar Leads (Opcional)</h6>
  </Card.Header>
  <Card.Body>
    <Button variant="outline-primary" onClick={openLeadSelector}>
      Selecionar Leads
    </Button>
    {selectedLeads.length > 0 && (
      <div className="mt-2">
        {selectedLeads.length} lead(s) selecionado(s)
      </div>
    )}
  </Card.Body>
</Card>
```

---

## ✏️ Página: Editar Campanha

**URL:** `http://localhost:3005/apps/campaigns/[id]`

### Campos Atuais

| Campo | Tipo | Obrigatório | Descrição | Status |
|-------|------|-------------|-----------|--------|
| `name` | text | ✅ Sim | Nome da campanha | ✅ OK |
| `description` | textarea | ❌ Não | Descrição da campanha | ✅ OK |
| `message` | textarea | ✅ Sim | Mensagem a ser enviada | ✅ OK |
| `instanceName` | text | ✅ Sim | Nome da instância Evolution API | ⚠️ Precisa mudar |
| `webhookUrl` | url | ❌ Não | URL do webhook n8n | ✅ OK |
| `status` | badge | - | Status da campanha (read-only) | ✅ OK |
| `sentCount` | number | - | Quantidade enviada (read-only) | ✅ OK |
| `createdAt` | date | - | Data de criação (read-only) | ✅ OK |
| `leadIds` | list | - | Lista de leads (read-only) | ✅ OK |

### Funcionalidades Implementadas

✅ **Edição de campos básicos**
✅ **Visualização de status e estatísticas**
✅ **Gerenciamento de leads**
- Lista leads adicionados
- Modal para adicionar novos leads
- Contador de leads

### Melhorias Necessárias

#### 1. Campo `instanceName` → `whatsappAccountId`

**Mesma mudança da página de criação:**
- Substituir input de texto por dropdown
- Carregar contas WhatsApp do tenant
- Mostrar informações da conta selecionada

#### 2. Informações da Conta WhatsApp

**Adicionar card informativo:**
```jsx
{campaign.whatsappAccount && (
  <Card className="mb-3">
    <Card.Header>
      <h6>Conta WhatsApp</h6>
    </Card.Header>
    <Card.Body>
      <div>
        <strong>Nome:</strong> {campaign.whatsappAccount.name}
      </div>
      <div>
        <strong>Número:</strong> {campaign.whatsappAccount.phoneNumber}
      </div>
      <div>
        <strong>Provider:</strong> 
        <Badge bg={campaign.whatsappAccount.provider === 'whatsapp-business' ? 'primary' : 'secondary'}>
          {campaign.whatsappAccount.provider === 'whatsapp-business' ? 'WhatsApp Business' : 'Evolution API'}
        </Badge>
      </div>
      <div>
        <strong>Status:</strong> 
        <Badge bg={campaign.whatsappAccount.status === 'active' ? 'success' : 'warning'}>
          {campaign.whatsappAccount.status}
        </Badge>
      </div>
    </Card.Body>
  </Card>
)}
```

#### 3. Validação ao Editar

**Adicionar validação:**
- Não permitir mudar conta se campanha estiver `active`
- Avisar se conta selecionada não está `active`
- Validar se conta pertence ao tenant

---

## 👥 Página: Lista de Leads

**URL:** `http://localhost:3005/apps/leads/list`

### Campos Exibidos na Tabela

| Campo | Tipo | Descrição | Status |
|-------|------|-----------|--------|
| `name` | string | Nome do lead | ✅ Implementado |
| `emailAddress` | string | Email | ✅ Implementado |
| `phoneNumber` | string | Telefone | ✅ Implementado |
| `status` | enum | Status (New, Contacted, Qualified, Converted) | ✅ Implementado |
| `actions` | buttons | Ações (Editar, Deletar) | ✅ Implementado |

### Funcionalidades Implementadas

✅ **Listagem de leads**
✅ **Busca/filtro**
✅ **Ações de editar e deletar**
✅ **Paginação**

### Campos Faltantes

❌ **Campanhas Relacionadas**
- Não mostra em quais campanhas o lead está
- Não mostra última interação

**Sugestão:** Adicionar coluna opcional:
```
| Campanhas | 2 campanhas ativas |
```

---

## 🔄 Análise Comparativa

### Estado Atual vs. Estado Desejado

| Aspecto | Estado Atual | Estado Desejado |
|----------|--------------|-----------------|
| **Seleção de WhatsApp** | Input texto (`instanceName`) | Dropdown (`whatsappAccountId`) |
| **Validação** | Apenas campo obrigatório | Valida se conta existe e está ativa |
| **Informações** | Não mostra detalhes da conta | Mostra nome, número, status, provider |
| **Flexibilidade** | Apenas Evolution API | Suporta Evolution + WhatsApp Business |
| **UX** | Usuário precisa saber nome da instância | Usuário escolhe de lista clara |

### Impacto das Mudanças

#### ✅ Benefícios

1. **Melhor UX**
   - Usuário não precisa digitar nomes de instâncias
   - Vê todas as contas disponíveis
   - Entende qual conta está usando

2. **Validação Automática**
   - Não permite criar campanha com conta inválida
   - Avisa se conta não está ativa
   - Previne erros

3. **Preparado para Migração**
   - Suporta Evolution API e WhatsApp Business
   - Fácil adicionar novos providers
   - Isolamento por tenant

4. **Manutenibilidade**
   - Código mais limpo
   - Menos erros de digitação
   - Melhor rastreabilidade

#### ⚠️ Considerações

1. **Compatibilidade com Dados Existentes**
   - Campanhas antigas ainda usam `instanceName`
   - Precisa migração gradual
   - Suportar ambos durante transição

2. **Performance**
   - Carregar lista de contas pode ser lento
   - Cache de contas
   - Lazy loading se muitas contas

---

## 💡 Recomendações de Melhorias

### Prioridade Alta 🔴

1. **Substituir `instanceName` por `whatsappAccountId`**
   - Criar endpoint: `GET /api/whatsapp-accounts`
   - Criar service: `whatsappAccounts.js`
   - Atualizar `CreateCampaignBody.jsx`
   - Atualizar `EditCampaignBody.jsx`

2. **Adicionar Validações**
   - Validar se conta existe
   - Validar se conta está ativa
   - Validar se conta pertence ao tenant

3. **Melhorar Feedback Visual**
   - Mostrar informações da conta selecionada
   - Indicar status da conta
   - Avisar se conta não está ativa

### Prioridade Média 🟡

4. **Adicionar Informações na Lista**
   - Coluna opcional mostrando conta WhatsApp
   - Filtro por conta WhatsApp
   - Ordenação por conta

5. **Melhorar Gerenciamento de Leads**
   - Mostrar campanhas relacionadas
   - Adicionar leads na criação da campanha
   - Filtros avançados

6. **Estatísticas e Relatórios**
   - Performance por conta WhatsApp
   - Taxa de entrega por conta
   - Gráficos de uso

### Prioridade Baixa 🟢

7. **Bulk Actions**
   - Selecionar múltiplas campanhas
   - Ações em massa (pausar, retomar, etc.)

8. **Exportação**
   - Exportar lista de campanhas
   - Exportar relatórios

9. **Notificações**
   - Notificar quando campanha termina
   - Notificar quando conta expira

---

## 📝 Checklist de Implementação

### Backend (API)

- [ ] Criar endpoint `GET /api/whatsapp-accounts`
- [ ] Criar endpoint `GET /api/whatsapp-accounts/:id`
- [ ] Atualizar `Campaign` schema (adicionar `whatsappAccountId`)
- [ ] Atualizar `CampaignsController` para buscar conta
- [ ] Validar `whatsappAccountId` ao criar/atualizar campanha
- [ ] Manter compatibilidade com `instanceName` (durante migração)

### Frontend (Services)

- [ ] Criar `whatsappAccounts.js` service
- [ ] Função `listWhatsAppAccounts()`
- [ ] Função `getWhatsAppAccount(id)`
- [ ] Cache de contas (opcional)

### Frontend (Components)

- [ ] Atualizar `CreateCampaignBody.jsx`
  - [ ] Substituir input `instanceName` por dropdown
  - [ ] Carregar contas ao montar componente
  - [ ] Adicionar validações
  - [ ] Mostrar informações da conta selecionada

- [ ] Atualizar `EditCampaignBody.jsx`
  - [ ] Mesmas mudanças da criação
  - [ ] Carregar conta atual da campanha
  - [ ] Validar se pode mudar conta (se campanha ativa)

- [ ] Atualizar `CampaignListBody.jsx`
  - [ ] Adicionar coluna opcional de conta WhatsApp
  - [ ] Filtro por conta (opcional)

### Testes

- [ ] Testar criação com conta válida
- [ ] Testar criação com conta inválida
- [ ] Testar criação sem contas configuradas
- [ ] Testar edição de campanha
- [ ] Testar validações
- [ ] Testar compatibilidade com `instanceName` antigo

---

## 🎯 Próximos Passos Sugeridos

1. **Fase 1: Preparação**
   - Criar endpoints de WhatsApp Accounts no backend
   - Criar service no frontend
   - Testar integração

2. **Fase 2: Implementação**
   - Atualizar formulários de criação/edição
   - Adicionar validações
   - Melhorar feedback visual

3. **Fase 3: Melhorias**
   - Adicionar informações na lista
   - Melhorar gerenciamento de leads
   - Adicionar estatísticas

4. **Fase 4: Migração**
   - Migrar campanhas antigas
   - Deprecar `instanceName`
   - Documentar mudanças

---

**Versão:** 1.0  
**Data:** 2026-01-05  
**Status:** Análise Completa ✅

