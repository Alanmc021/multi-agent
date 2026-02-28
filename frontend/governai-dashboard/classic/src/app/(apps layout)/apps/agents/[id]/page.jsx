'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Button,
  Card,
  Badge,
  Spinner,
  Alert,
  Tab,
  Tabs,
  Row,
  Col,
} from 'react-bootstrap';
import { ArrowLeft, Edit2, MessageSquare } from 'react-feather';
import { apiRequest } from '@/lib/api/client';
import AgentForm from '../AgentForm';

/**
 * Página de visualização/edição de agente
 */
const AgentDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id;
  const isEdit = searchParams.get('edit') === '1';

  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(isEdit ? 'edit' : 'view');

  useEffect(() => {
    loadAgent();
  }, [id]);

  const loadAgent = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequest(`/agents/definitions/${id}`, { method: 'GET' });
      setAgent(data);
    } catch (err) {
      console.error('Erro ao carregar agente:', err);
      setError('Agente não encontrado.');
    } finally {
      setLoading(false);
    }
  };

  const getAgentTypeLabel = (type) => {
    const labels = { react: 'ReAct', 'plan-execute': 'Plan-Execute', memory: 'Memory' };
    return labels[type] || type;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      finance: 'Financeiro',
      legal: 'Jurídico',
      support: 'Suporte',
      marketing: 'Marketing',
      analytics: 'Analytics',
    };
    return labels[category] || category || '-';
  };

  if (loading) {
    return (
      <div className="hk-pg-body">
        <div className="container-fluid">
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Carregando agente...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="hk-pg-body">
        <div className="container-fluid">
          <Alert variant="danger">{error || 'Agente não encontrado'}</Alert>
          <Button as={Link} href="/apps/agents" variant="light">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="hk-pg-body">
      <div className="container-fluid">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center">
            <Button
              as={Link}
              href="/apps/agents"
              variant="flush-dark"
              className="btn-icon btn-rounded"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="ms-3">
              <div className="d-flex align-items-center gap-2">
                <span className="avatar avatar-sm avatar-logo">
                  <span className="initial-wrap">{agent.icon || '🤖'}</span>
                </span>
                <div>
                  <h4 className="mb-0">{agent.name}</h4>
                  <code className="small text-muted">{agent.agentId}</code>
                </div>
              </div>
            </div>
          </div>
          <div className="d-flex gap-2">
            <Button
              as={Link}
              href={`/apps/agents/chat/${agent.agentId}`}
              variant="primary"
            >
              <MessageSquare size={18} className="me-1" />
              Chat
            </Button>
            <Button
              variant={isEdit ? 'secondary' : 'light'}
              onClick={() => {
                setActiveTab('edit');
                router.push(`/apps/agents/${id}?edit=1`);
              }}
            >
              <Edit2 size={18} className="me-1" />
              Editar
            </Button>
          </div>
        </div>

        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
          <Tab eventKey="view" title="Visualizar">
            <Card className="card-border">
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <strong>Descrição</strong>
                    <p className="text-muted mb-0">{agent.description || '-'}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Categoria</strong>
                    <p className="mb-0">{getCategoryLabel(agent.category)}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Tipo</strong>
                    <p className="mb-0">{getAgentTypeLabel(agent.agentType)}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Status</strong>
                    <p className="mb-0">
                      <Badge bg={agent.active ? 'success' : 'secondary'}>
                        {agent.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </p>
                  </Col>
                  <Col md={6}>
                    <strong>Modelo LLM</strong>
                    <p className="mb-0">{agent.llmModel || '-'}</p>
                  </Col>
                  <Col md={6}>
                    <strong>MCP</strong>
                    <p className="mb-0">{agent.useMCP ? 'Sim' : 'Não'}</p>
                  </Col>
                  <Col xs={12}>
                    <strong>Prompt do sistema</strong>
                    <pre
                      className="bg-light p-3 rounded mt-1 mb-0"
                      style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}
                    >
                      {agent.systemPrompt || '-'}
                    </pre>
                  </Col>
                  {agent.toolNames?.length > 0 && (
                    <Col xs={12}>
                      <strong>Tools</strong>
                      <div className="d-flex flex-wrap gap-1 mt-1">
                        {agent.toolNames.map((t) => (
                          <Badge key={t} bg="primary">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </Col>
                  )}
                  {agent.mcpConfig?.servers?.length > 0 && (
                    <Col xs={12}>
                      <strong>Servidores MCP</strong>
                      <p className="mb-0">{agent.mcpConfig.servers.join(', ')}</p>
                    </Col>
                  )}
                </Row>
              </Card.Body>
            </Card>
          </Tab>
          <Tab eventKey="edit" title="Editar">
            <AgentForm
              agent={agent}
              onSave={() => {
                loadAgent();
                setActiveTab('view');
                router.replace(`/apps/agents/${id}`);
              }}
              onCancel={() => {
                setActiveTab('view');
                router.replace(`/apps/agents/${id}`);
              }}
              isEdit={true}
            />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};

export default AgentDetailPage;
