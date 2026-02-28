'use client';
import { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { apiRequest } from '@/lib/api/client';

const AGENT_TYPES = [
  { value: 'react', label: 'ReAct' },
  { value: 'plan-execute', label: 'Plan-Execute' },
  { value: 'memory', label: 'Memory' },
];

const CATEGORIES = [
  { value: '', label: 'Nenhuma' },
  { value: 'finance', label: 'Financeiro' },
  { value: 'legal', label: 'Jurídico' },
  { value: 'support', label: 'Suporte' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'analytics', label: 'Analytics' },
];

/**
 * Formulário de criação/edição de agente
 */
const AgentForm = ({ agent, onSave, onCancel, isEdit }) => {
  const [form, setForm] = useState({
    agentId: '',
    name: '',
    description: '',
    icon: '🤖',
    category: '',
    agentType: 'react',
    systemPrompt: '',
    llmModel: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 4096,
    toolNames: [],
    useRAG: false,
    useMCP: true,
    useMemory: true,
    useStreaming: true,
    ragCategory: '',
    mcpServers: '',
    active: true,
  });
  const [availableTools, setAvailableTools] = useState([]);
  const [toolsLoading, setToolsLoading] = useState(false);
  const [toolInput, setToolInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (agent) {
      setForm({
        agentId: agent.agentId || '',
        name: agent.name || '',
        description: agent.description || '',
        icon: agent.icon || '🤖',
        category: agent.category || '',
        agentType: agent.agentType || 'react',
        systemPrompt: agent.systemPrompt || '',
        llmModel: agent.llmModel || 'gpt-4o',
        temperature: agent.llmConfig?.temperature ?? 0.7,
        maxTokens: agent.llmConfig?.maxTokens ?? 4096,
        toolNames: agent.toolNames || [],
        useRAG: agent.useRAG ?? !!agent.ragCategory,
        useMCP: agent.useMCP ?? true,
        useMemory: agent.useMemory ?? true,
        useStreaming: agent.useStreaming ?? true,
        ragCategory: agent.ragCategory || '',
        mcpServers: (agent.mcpConfig?.servers || []).join(', '),
        active: agent.active ?? true,
      });
    }
  }, [agent]);

  useEffect(() => {
    loadTools();
  }, [form.useMCP]);

  const loadTools = async () => {
    if (!form.useMCP) return;
    try {
      setToolsLoading(true);
      // GET /tools retorna todas as tools (locais + MCP) via ToolService
      const res = await apiRequest('/tools', { method: 'GET' });
      const tools = res?.tools || [];
      setAvailableTools(tools.map((t) => (typeof t === 'string' ? t : t.name)));
    } catch {
      setAvailableTools([]);
    } finally {
      setToolsLoading(false);
    }
  };

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const addTool = () => {
    const name = toolInput.trim();
    if (!name || form.toolNames.includes(name)) return;
    update('toolNames', [...form.toolNames, name]);
    setToolInput('');
  };

  const removeTool = (name) => {
    update(
      'toolNames',
      form.toolNames.filter((t) => t !== name)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {
        agentId: form.agentId,
        name: form.name,
        description: form.description || undefined,
        icon: form.icon || undefined,
        category: form.category || undefined,
        agentType: form.agentType,
        systemPrompt: form.systemPrompt || undefined,
        llmModel: form.llmModel || undefined,
        llmConfig: {
          temperature: form.temperature,
          maxTokens: form.maxTokens,
        },
        toolNames: form.toolNames,
        useRAG: form.useRAG,
        useMCP: form.useMCP,
        useMemory: form.useMemory,
        useStreaming: form.useStreaming,
        ragCategory: form.ragCategory || null,
        mcpConfig: form.mcpServers
          ? { servers: form.mcpServers.split(',').map((s) => s.trim()).filter(Boolean) }
          : undefined,
        active: form.active,
      };

      if (isEdit && agent?._id) {
        await apiRequest(`/agents/definitions/${agent._id}`, {
          method: 'PUT',
          body: payload,
        });
      } else {
        await apiRequest('/agents/definitions', {
          method: 'POST',
          body: payload,
        });
      }
      onSave?.();
    } catch (err) {
      setError(err?.message || 'Erro ao salvar agente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <Card className="card-border mb-4">
        <Card.Header>
          <h5 className="mb-0">Informações básicas</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>ID do Agente *</Form.Label>
                <Form.Control
                  value={form.agentId}
                  onChange={(e) => update('agentId', e.target.value)}
                  placeholder="ex: financial-advisor"
                  required
                  disabled={isEdit}
                />
                <Form.Text className="text-muted">
                  Identificador único (não editável após criação)
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nome *</Form.Label>
                <Form.Control
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="Assistente Financeiro"
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Ícone / Emoji</Form.Label>
                <Form.Control
                  value={form.icon}
                  onChange={(e) => update('icon', e.target.value)}
                  placeholder="🤖"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Categoria</Form.Label>
                <Form.Select
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Descrição</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Descrição do agente..."
            />
          </Form.Group>
          <Form.Group className="mb-0">
            <Form.Check
              type="switch"
              label="Agente ativo"
              checked={form.active}
              onChange={(e) => update('active', e.target.checked)}
            />
          </Form.Group>
        </Card.Body>
      </Card>

      <Card className="card-border mb-4">
        <Card.Header>
          <h5 className="mb-0">LLM e Estratégia</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tipo de agente</Form.Label>
                <Form.Select
                  value={form.agentType}
                  onChange={(e) => update('agentType', e.target.value)}
                >
                  {AGENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Modelo LLM</Form.Label>
                <Form.Control
                  value={form.llmModel}
                  onChange={(e) => update('llmModel', e.target.value)}
                  placeholder="gpt-4o"
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Temperatura</Form.Label>
                <Form.Range
                  min={0}
                  max={2}
                  step={0.1}
                  value={form.temperature}
                  onChange={(e) => update('temperature', parseFloat(e.target.value))}
                />
                <Form.Text>{form.temperature}</Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Max Tokens</Form.Label>
                <Form.Control
                  type="number"
                  min={256}
                  max={128000}
                  value={form.maxTokens}
                  onChange={(e) => update('maxTokens', parseInt(e.target.value, 10) || 4096)}
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-0">
            <Form.Label>Prompt do sistema</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={form.systemPrompt}
              onChange={(e) => update('systemPrompt', e.target.value)}
              placeholder="Você é um assistente especializado em..."
            />
          </Form.Group>
        </Card.Body>
      </Card>

      <Card className="card-border mb-4">
        <Card.Header>
          <h5 className="mb-0">Tools (ToolService)</h5>
        </Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              label="Usar ToolService (tools locais + MCP)"
              checked={form.useMCP}
              onChange={(e) => update('useMCP', e.target.checked)}
            />
            <Form.Text className="text-muted">
              Permite ao agente usar ferramentas: calculator, web_search, send_email, api_call e tools MCP (quando conectado).
            </Form.Text>
          </Form.Group>
          {form.useMCP && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Tools habilitadas para este agente</Form.Label>
                <Form.Text className="d-block text-muted mb-2">
                  Deixe vazio para usar todas as tools disponíveis. Ou selecione apenas as desejadas:
                </Form.Text>
                <div className="d-flex gap-2 mb-2">
                  <Form.Control
                    value={toolInput}
                    onChange={(e) => setToolInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTool())}
                    placeholder="Nome da tool (ex: calculator)"
                  />
                  <Button variant="primary" onClick={addTool} type="button">
                    Adicionar
                  </Button>
                </div>
                {availableTools.length > 0 && (
                  <div className="mt-2 mb-2">
                    <small className="text-muted d-block mb-1">Clique para adicionar:</small>
                    <div className="d-flex flex-wrap gap-1">
                      {availableTools
                        .filter((t) => !form.toolNames.includes(t))
                        .map((t) => (
                          <Badge
                            key={t}
                            bg="light"
                            text="dark"
                            className="cursor-pointer border"
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              if (!form.toolNames.includes(t)) update('toolNames', [...form.toolNames, t]);
                            }}
                          >
                            + {t}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
                {form.toolNames.length > 0 && (
                  <div className="d-flex flex-wrap gap-1 mt-2">
                    {form.toolNames.map((t) => (
                      <Badge
                        key={t}
                        bg="primary"
                        className="d-inline-flex align-items-center gap-1"
                      >
                        {t}
                        <span
                          role="button"
                          tabIndex={0}
                          className="ms-1"
                          style={{ cursor: 'pointer' }}
                          onClick={() => removeTool(t)}
                          onKeyPress={(e) => e.key === 'Enter' && removeTool(t)}
                          aria-label="Remover"
                        >
                          ×
                        </span>
                      </Badge>
                    ))}
                  </div>
                )}
                {toolsLoading && (
                  <div className="mt-2">
                    <Spinner size="sm" /> Carregando tools disponíveis...
                  </div>
                )}
                {!toolsLoading && availableTools.length > 0 && (
                  <Form.Text className="d-block mt-2">
                    {availableTools.length} tool(s) disponível(is): {availableTools.join(', ')}
                  </Form.Text>
                )}
              </Form.Group>
              <Form.Group className="mb-0">
                <Form.Label>Servidores MCP (IDs separados por vírgula)</Form.Label>
                <Form.Control
                  value={form.mcpServers}
                  onChange={(e) => update('mcpServers', e.target.value)}
                  placeholder="n8n, figma, github"
                />
                <Form.Text className="text-muted">
                  Opcional. Filtra servidores MCP quando usar estratégia multi.
                </Form.Text>
              </Form.Group>
            </>
          )}
        </Card.Body>
      </Card>

      <Card className="card-border mb-4">
        <Card.Header>
          <h5 className="mb-0">RAG e Memória</h5>
        </Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              label="Usar RAG"
              checked={form.useRAG}
              onChange={(e) => update('useRAG', e.target.checked)}
            />
          </Form.Group>
          {form.useRAG && (
            <Form.Group className="mb-3">
              <Form.Label>Categoria RAG</Form.Label>
              <Form.Control
                value={form.ragCategory}
                onChange={(e) => update('ragCategory', e.target.value)}
                placeholder="financeiro"
              />
              <Form.Text className="text-muted">
                Deve coincidir com a categoria dos documentos enviados (ex: financeiro, juridico, marketing).
                Documentos enviados pelo chat usam essa categoria para indexação.
              </Form.Text>
            </Form.Group>
          )}
          <Form.Group className="mb-0">
            <Form.Check
              type="switch"
              label="Usar memória de conversa"
              checked={form.useMemory}
              onChange={(e) => update('useMemory', e.target.checked)}
            />
          </Form.Group>
          <Form.Group className="mb-0 mt-2">
            <Form.Check
              type="switch"
              label="Suportar streaming"
              checked={form.useStreaming}
              onChange={(e) => update('useStreaming', e.target.checked)}
            />
          </Form.Group>
        </Card.Body>
      </Card>

      <div className="d-flex gap-2">
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? (
            <>
              <Spinner size="sm" className="me-2" />
              Salvando...
            </>
          ) : (
            'Salvar'
          )}
        </Button>
        <Button type="button" variant="light" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </Form>
  );
};

export default AgentForm;
