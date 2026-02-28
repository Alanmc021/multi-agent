'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Table,
  Button,
  Badge,
  Card,
  Row,
  Col,
  Spinner,
} from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import { MessageSquare, Cpu, Shield, BookOpen, GitBranch, CheckCircle, XCircle, RefreshCw, Database, Upload } from 'react-feather';

const MULTI_AGENT_API = 'http://localhost:8000';

function RagPanel() {
  // ── Indexar pasta ──
  const [indexStatus, setIndexStatus] = useState('idle');
  const [indexed, setIndexed] = useState(null);

  const handleIndex = async () => {
    setIndexStatus('loading');
    setIndexed(null);
    try {
      const res = await fetch(`${MULTI_AGENT_API}/api/docs/load`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setIndexed(data.indexed ?? 0);
      setIndexStatus('success');
    } catch {
      setIndexStatus('error');
    }
  };

  // ── Upload de arquivo ──
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [uploadMsg, setUploadMsg] = useState('');
  const fileRef = useState(null);
  const inputRef = fileRef[1];

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadStatus('loading');
    setUploadMsg('');

    const form = new FormData();
    form.append('file', file);

    try {
      const res = await fetch(`${MULTI_AGENT_API}/api/docs/upload`, {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
      setUploadMsg(data.message);
      setUploadStatus('success');
    } catch (err) {
      setUploadMsg(err.message || 'Erro ao enviar arquivo');
      setUploadStatus('error');
    }
    e.target.value = '';
  };

  return (
    <div className="d-flex flex-wrap gap-4 align-items-start">

      {/* Indexar pasta */}
      <div>
        <div className="text-muted mb-1" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
          Indexar pasta documents/
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Button
            variant={indexStatus === 'success' ? 'success' : indexStatus === 'error' ? 'danger' : 'outline-primary'}
            size="sm"
            onClick={handleIndex}
            disabled={indexStatus === 'loading'}
            style={{ borderRadius: '8px', fontWeight: 500 }}
          >
            {indexStatus === 'loading' ? (
              <><Spinner size="sm" className="me-2" />Indexando...</>
            ) : indexStatus === 'success' ? (
              <><CheckCircle size={14} className="me-2" />{indexed} chunks</>
            ) : indexStatus === 'error' ? (
              <><XCircle size={14} className="me-2" />Erro</>
            ) : (
              <><Database size={14} className="me-2" />Indexar tudo</>
            )}
          </Button>
          {indexStatus === 'success' && (
            <Button variant="link" size="sm" className="p-0 text-muted" onClick={handleIndex}>
              <RefreshCw size={12} className="me-1" />Reindexar
            </Button>
          )}
        </div>
        <small className="text-muted d-block mt-1" style={{ fontSize: '0.72rem' }}>
          {indexStatus === 'idle' && 'Carrega todos os arquivos da pasta documents/'}
          {indexStatus === 'success' && 'Pronto — agente já responde com base nos documentos'}
          {indexStatus === 'error' && 'Verifique se a API está em localhost:8000'}
        </small>
      </div>

      <div style={{ width: 1, backgroundColor: '#dee2e6', alignSelf: 'stretch' }} />

      {/* Upload de novo arquivo */}
      <div>
        <div className="text-muted mb-1" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
          Enviar novo documento
        </div>
        <input
          type="file"
          accept=".txt,.md,.pdf"
          style={{ display: 'none' }}
          id="rag-upload-input"
          onChange={handleUpload}
        />
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Button
            as="label"
            htmlFor="rag-upload-input"
            variant={uploadStatus === 'success' ? 'success' : uploadStatus === 'error' ? 'danger' : 'outline-secondary'}
            size="sm"
            disabled={uploadStatus === 'loading'}
            style={{ borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}
          >
            {uploadStatus === 'loading' ? (
              <><Spinner size="sm" className="me-2" />Enviando...</>
            ) : uploadStatus === 'success' ? (
              <><CheckCircle size={14} className="me-2" />Indexado!</>
            ) : uploadStatus === 'error' ? (
              <><XCircle size={14} className="me-2" />Erro</>
            ) : (
              <><Upload size={14} className="me-2" />Escolher arquivo</>
            )}
          </Button>
          {uploadStatus !== 'idle' && (
            <Button variant="link" size="sm" className="p-0 text-muted"
              onClick={() => { setUploadStatus('idle'); setUploadMsg(''); }}>
              Novo upload
            </Button>
          )}
        </div>
        <small className="d-block mt-1" style={{ fontSize: '0.72rem', color: uploadStatus === 'error' ? '#dc3545' : '#6c757d' }}>
          {uploadStatus === 'idle' && 'Aceita .txt, .md e .pdf — indexado automaticamente'}
          {uploadStatus === 'loading' && 'Salvando e indexando no Qdrant...'}
          {(uploadStatus === 'success' || uploadStatus === 'error') && uploadMsg}
        </small>
      </div>

    </div>
  );
}

const FLOW_STEPS = [
  {
    icon: <Shield size={20} />,
    color: '#6f42c1',
    bg: 'rgba(111,66,193,0.08)',
    title: 'Compliance',
    desc: 'Bloqueia tópicos proibidos: política, religião, violência, drogas e demissões.',
  },
  {
    icon: <GitBranch size={20} />,
    color: '#0d6efd',
    bg: 'rgba(13,110,253,0.08)',
    title: 'Router',
    desc: 'Decide a estratégia: resposta direta, busca em documentos (RAG) ou agente especializado.',
  },
  {
    icon: <BookOpen size={20} />,
    color: '#198754',
    bg: 'rgba(25,135,84,0.08)',
    title: 'RAG + Agentes',
    desc: 'Recupera contexto do Qdrant e usa CrewAI para raciocínio complexo quando necessário.',
  },
];

const EXAMPLE_QUESTIONS = [
  { text: 'Qual é a política de férias da empresa?', type: 'RAG', ok: true },
  { text: 'Como funciona o processo de onboarding?', type: 'RAG', ok: true },
  { text: 'Quais são os benefícios oferecidos?', type: 'RAG', ok: true },
  { text: 'O que é uma API REST?', type: 'Direto', ok: true },
  { text: 'Analise as políticas e sugira melhorias', type: 'Agente', ok: true },
  { text: 'Quem será demitido na reestruturação?', type: 'Bloqueado', ok: false },
];

// Agente fixo do desafio técnico multi-agente
const FIXED_AGENTS = [
  {
    _id: 'multi-agent',
    agentId: 'multi-agent',
    name: 'Assistente Multi-Agente',
    description: 'Assistente inteligente com compliance, RAG e agentes especializados.',
    category: 'multi-agent',
    agentType: 'orchestrated',
    active: true,
    icon: '🤖',
  },
];

const AgentsBody = ({ searchValue }) => {
  const router = useRouter();

  const agents = FIXED_AGENTS.filter((a) =>
    searchValue
      ? a.name.toLowerCase().includes(searchValue.toLowerCase())
      : true
  );

  return (
    <div className="integrations-body">
      <SimpleBar className="nicescroll-bar">
        <div className="p-4">

          {/* ── Cabeçalho do desafio ── */}
          <div
            className="mb-3 p-4 rounded-3 d-flex align-items-start gap-3"
            style={{ backgroundColor: '#f0f4ff', border: '1px solid #d0dcff' }}
          >
            <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>🤖</span>
            <div>
              <h4 className="fw-bold mb-1" style={{ color: '#0d6efd' }}>Plataforma de IA Multi-Agente</h4>
              <p className="mb-1 text-muted" style={{ fontSize: '0.85rem' }}>
                Desafio Técnico — ACT Digital
              </p>
              <p className="mb-0 text-body" style={{ fontSize: '0.95rem', maxWidth: 700 }}>
                Assistente Inteligente que recebe perguntas, verifica compliance, decide como
                responder (diretamente, via RAG ou por agentes especializados) e retorna
                respostas claras, fundamentadas e seguras.
              </p>
            </div>
          </div>

          {/* ── Painel RAG ── */}
          <Card className="card-border mb-4">
            <Card.Body className="py-3">
              <div className="d-flex align-items-center gap-2 mb-3">
                <Database size={15} color="#0d6efd" />
                <span className="fw-semibold" style={{ fontSize: '0.85rem' }}>Gerenciar documentos do RAG</span>
              </div>
              <RagPanel />
            </Card.Body>
          </Card>

          {/* ── Lista de agentes ── */}
          <div className="mb-4">
          {agents.length === 0 ? (
            <Card className="card-border">
              <Card.Body className="text-center py-5">
                <Cpu size={48} className="text-muted mb-3" />
                <h5>Nenhum agente encontrado</h5>
                <p className="text-muted mb-4">Tente ajustar os filtros de busca.</p>
              </Card.Body>
            </Card>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">
                  {agents.length} agente{agents.length !== 1 ? 's' : ''} encontrado{agents.length !== 1 ? 's' : ''}
                </span>
              </div>
              <Card className="card-border">
                <Table responsive hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Agente</th>
                      <th>Status</th>
                      <th>Chat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map((agent) => (
                      <tr
                        key={agent._id}
                        onClick={() => router.push(`/apps/agents/chat/${agent.agentId}`)}
                        style={{ cursor: 'pointer' }}
                        className="align-middle"
                      >
                        <td>
                          <Link
                            href={`/apps/agents/chat/${agent.agentId}`}
                            className="text-decoration-none text-body d-flex align-items-center"
                          >
                            <span className="avatar avatar-sm avatar-logo me-2">
                              <span className="initial-wrap">
                                {agent.icon || '🤖'}
                              </span>
                            </span>
                            <div>
                              <span className="fw-semibold">{agent.name}</span>
                              {agent.description && (
                                <div className="text-muted small text-truncate" style={{ maxWidth: 300 }}>
                                  {agent.description}
                                </div>
                              )}
                            </div>
                          </Link>
                        </td>
                        <td>
                          <Badge bg={agent.active ? 'success' : 'secondary'}>
                            {agent.active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <Button
                            as={Link}
                            href={`/apps/agents/chat/${agent.agentId}`}
                            variant="primary"
                            size="sm"
                          >
                            <MessageSquare size={14} className="me-1" />
                            Conversar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card>
            </>
          )}
          </div>

          {/* ── Fluxo do sistema ── */}
          <Row className="g-3 mb-4">
            {FLOW_STEPS.map((step, i) => (
              <Col key={i} md={4}>
                <Card className="card-border h-100">
                  <Card.Body className="d-flex gap-3 align-items-start">
                    <div
                      className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: 40,
                        height: 40,
                        backgroundColor: step.bg,
                        color: step.color,
                      }}
                    >
                      {step.icon}
                    </div>
                    <div>
                      <div className="fw-semibold mb-1" style={{ color: step.color }}>
                        {i + 1}. {step.title}
                      </div>
                      <div className="text-muted small">{step.desc}</div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* ── Exemplos de perguntas ── */}
          <Card className="card-border mb-4">
            <Card.Header className="bg-transparent border-bottom py-3">
              <h6 className="mb-0 fw-semibold">Exemplos de perguntas para testar</h6>
            </Card.Header>
            <Card.Body className="pb-3">
              <div className="d-flex flex-wrap gap-2">
                {EXAMPLE_QUESTIONS.map((q, i) => (
                  <div
                    key={i}
                    className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
                    style={{
                      backgroundColor: q.ok ? 'rgba(25,135,84,0.07)' : 'rgba(220,53,69,0.07)',
                      border: `1px solid ${q.ok ? 'rgba(25,135,84,0.2)' : 'rgba(220,53,69,0.2)'}`,
                      fontSize: '0.8rem',
                    }}
                  >
                    {q.ok
                      ? <CheckCircle size={13} color="#198754" />
                      : <XCircle size={13} color="#dc3545" />
                    }
                    <span className="text-body">{q.text}</span>
                    <Badge
                      bg={
                        q.type === 'RAG' ? 'primary' :
                        q.type === 'Agente' ? 'purple' :
                        q.type === 'Bloqueado' ? 'danger' : 'secondary'
                      }
                      style={{
                        fontSize: '0.65rem',
                        backgroundColor: q.type === 'Agente' ? '#6f42c1' : undefined,
                      }}
                    >
                      {q.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>

          {/* ── Stack técnica ── */}
          <Card className="card-border mb-4">
            <Card.Header className="bg-transparent border-bottom py-3">
              <h6 className="mb-0 fw-semibold">Stack técnica</h6>
            </Card.Header>
            <Card.Body>
              <Row className="g-2 text-center">
                {[
                  { label: 'Python + FastAPI', sub: 'Backend & API REST' },
                  { label: 'OpenAI GPT-4o-mini', sub: 'LLM + Embeddings' },
                  { label: 'Qdrant', sub: 'Vector Store' },
                  { label: 'CrewAI', sub: 'Agentes especializados' },
                  { label: 'Next.js', sub: 'Interface web' },
                  { label: 'Docker Compose', sub: 'Infraestrutura' },
                ].map((item, i) => (
                  <Col key={i} xs={6} md={2}>
                    <div
                      className="rounded-2 py-2 px-1"
                      style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}
                    >
                      <div className="fw-semibold" style={{ fontSize: '0.75rem' }}>{item.label}</div>
                      <div className="text-muted" style={{ fontSize: '0.65rem' }}>{item.sub}</div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>

        </div>
      </SimpleBar>
    </div>
  );
};

export default AgentsBody;
