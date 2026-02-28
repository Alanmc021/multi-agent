'use client';
import React, { useEffect, useRef, useState, useCallback, useImperativeHandle } from 'react';
import { useParams, useRouter } from 'next/navigation';
import classNames from 'classnames';
const MULTI_AGENT_API = 'http://localhost:8000';
import { Spinner, Alert, Button, Form } from 'react-bootstrap';
import { ArrowLeft, Menu, Plus, MessageSquare, X, Paperclip, Send, Upload, UploadCloud, Image } from 'react-feather';
import SimpleBar from 'simplebar-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/** Paleta de cores para Markdown */
const MD = {
  primary: '#0d6efd',
  primaryDark: '#0a58ca',
  accent: '#6f42c1',
  success: '#198754',
  info: '#0dcaf0',
  warning: '#ffc107',
  danger: '#dc3545',
  text: '#212529',
  textMuted: '#6c757d',
  bgCode: '#1e293b',
  bgCodeInline: '#e2e8f0',
  border: '#e2e8f0',
};

/** Componentes customizados para Markdown com formatação rica */
const MarkdownComponents = {
  p: ({ children }) => (
    <p className="mb-3" style={{ lineHeight: 1.7, color: MD.text }}>{children}</p>
  ),
  h1: ({ children }) => (
    <h1
      className="mb-3 mt-4 fw-bold"
      style={{
        fontSize: '1.35rem',
        color: MD.primary,
        borderBottom: `2px solid ${MD.primary}`,
        paddingBottom: '0.35rem',
      }}
    >
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2
      className="mb-2 mt-4 fw-bold"
      style={{
        fontSize: '1.2rem',
        color: MD.primaryDark,
      }}
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3
      className="mb-2 mt-3 fw-semibold"
      style={{
        fontSize: '1.05rem',
        color: MD.accent,
      }}
    >
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-2 mt-2 fw-semibold" style={{ fontSize: '1rem', color: MD.text }}>
      {children}
    </h4>
  ),
  ul: ({ children }) => (
    <ul className="mb-3 ps-3" style={{ lineHeight: 1.8 }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 ps-3" style={{ lineHeight: 1.8 }}>
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="mb-1" style={{ color: MD.text }}>{children}</li>
  ),
  pre: ({ children }) => <>{children}</>,
  code: ({ inline, children, ...props }) => {
    if (inline) {
      return (
        <code
          className="px-1 py-0 rounded"
          style={{
            backgroundColor: MD.bgCodeInline,
            color: MD.danger,
            fontSize: '0.9em',
            fontFamily: 'ui-monospace, monospace',
          }}
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <pre
        className="p-3 rounded mb-3 overflow-auto"
        style={{
          backgroundColor: MD.bgCode,
          color: '#e2e8f0',
          fontSize: '0.85rem',
          maxHeight: '320px',
          border: `1px solid ${MD.border}`,
          fontFamily: 'ui-monospace, monospace',
        }}
      >
        <code {...props}>{children}</code>
      </pre>
    );
  },
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: MD.primary,
        textDecoration: 'underline',
        fontWeight: 500,
      }}
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote
      className="ps-3 py-2 mb-3 rounded-end"
      style={{
        borderLeft: `4px solid ${MD.primary}`,
        backgroundColor: 'rgba(13, 110, 253, 0.06)',
        color: MD.textMuted,
        fontStyle: 'italic',
      }}
    >
      {children}
    </blockquote>
  ),
  strong: ({ children }) => (
    <strong className="fw-bold" style={{ color: MD.text }}>{children}</strong>
  ),
  em: ({ children }) => (
    <em style={{ color: MD.textMuted }}>{children}</em>
  ),
  hr: () => (
    <hr className="my-3" style={{ borderColor: MD.border, opacity: 0.6 }} />
  ),
  table: ({ children }) => (
    <div className="table-responsive mb-3">
      <table
        className="table table-bordered table-sm"
        style={{
          fontSize: '0.9rem',
          borderColor: MD.border,
        }}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead style={{ backgroundColor: 'rgba(13, 110, 253, 0.1)', color: MD.primary }}>
      {children}
    </thead>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 fw-semibold" style={{ borderColor: MD.border }}>
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2" style={{ borderColor: MD.border, color: MD.text }}>
      {children}
    </td>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr style={{ borderColor: MD.border }}>{children}</tr>
  ),
};

const STORAGE_KEY = (agentId) => `agent-chat-${agentId}`;
const ACCEPTED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
];
const ACCEPTED_EXTENSIONS = ['.jpeg', '.jpg', '.png', '.webp', '.gif', '.pdf', '.txt'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const DEFAULT_PROMPTS = [
  { text: 'Qual é a política de férias da empresa?', type: 'RAG', color: '#0d6efd' },
  { text: 'Como funciona o processo de onboarding?', type: 'RAG', color: '#0d6efd' },
  { text: 'Quais são os benefícios oferecidos?', type: 'RAG', color: '#0d6efd' },
  { text: 'O que é uma API REST?', type: 'Direto', color: '#198754' },
  { text: 'Analise as políticas e sugira melhorias para o onboarding', type: 'Agente', color: '#6f42c1' },
  { text: 'Quem será demitido na reestruturação?', type: 'Bloqueado', color: '#dc3545' },
];

/** Mapeia categoria do agente para categoria de documento RAG */
const mapAgentCategoryToDocument = (agentCategory) => {
  const map = {
    finance: 'financeiro',
    financeiro: 'financeiro',
    legal: 'juridico',
    juridico: 'juridico',
    marketing: 'marketing',
    support: 'operacoes',
    analytics: 'operacoes',
    vendas: 'vendas',
    operacoes: 'operacoes',
    rh: 'rh',
    leads: 'leads',
    contratos: 'contratos',
    licitacoes: 'licitacoes',
    decretos: 'decretos',
    processos: 'processos',
    pareceres: 'pareceres',
  };
  const normalized = (agentCategory || '').toLowerCase();
  return map[normalized] || 'financeiro';
};

/**
 * Página de chat com agente (usa API /agents/definitions/:agentId/chat)
 * Com sidebar, prompts de exemplo, anexos e histórico local
 */
const AgentChatPage = () => {
  const params = useParams();
  const router = useRouter();
  const agentId = params.agentId;

  const [agent, setAgent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isDragActive, setIsDragActive] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);
  const dragDepthRef = useRef(0);

  const loadFromStorage = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY(agentId));
      if (!raw) return;
      const data = JSON.parse(raw);
      setConversations(data.conversations || []);
    } catch {
      setConversations([]);
    }
  }, [agentId]);

  const saveToStorage = useCallback(
    (convs, current) => {
      try {
        localStorage.setItem(
          STORAGE_KEY(agentId),
          JSON.stringify({ conversations: convs, currentId: current?.id })
        );
      } catch (e) {
        console.warn('Erro ao salvar conversas:', e);
      }
    },
    [agentId]
  );

  useEffect(() => {
    loadAgent();
    loadFromStorage();
  }, [agentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadAgent = () => {
    setAgent({
      id: 'multi-agente',
      name: 'Assistente Multi-Agente',
      description: 'Responde perguntas com RAG, compliance e agentes especializados.',
      icon: '🤖',
      category: 'geral',
      metadata: {
        examplePrompts: [
          'Quais são os benefícios da empresa?',
          'Como funciona o processo de onboarding?',
          'Qual a política de férias?',
        ],
      },
    });
    setLoading(false);
  };

  const handleNewConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
  };

  const handleSelectConversation = (conv) => {
    setCurrentConversation(conv);
    setMessages(conv.messages || []);
  };

  const handleSendMessage = async (message, files = []) => {
    const text = (message || '').trim();
    if (!text && files.length === 0) return;

    setIsAssistantTyping(true);
    let messageToSend = text;

    const uploadedAttachments = files.map((f) => ({ name: f.name, size: f.size, type: f.type }));

    if (files.length > 0 && !text) {
      messageToSend = `Arquivos enviados: ${files.map((f) => f.name).join(', ')}. Por favor, use as informações para responder minhas perguntas.`;
    } else if (files.length > 0) {
      messageToSend = `Arquivos: ${files.map((f) => f.name).join(', ')}. ${text}`;
    }

    const userMessage = {
      role: 'user',
      content: messageToSend || text || '(arquivo anexado)',
      timestamp: new Date(),
      attachments: uploadedAttachments,
    };

    const assistantPlaceholder = {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };
    const nextMessages = [...messages, userMessage, assistantPlaceholder];
    setMessages(nextMessages);

    try {
      const res = await fetch(`${MULTI_AGENT_API}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: messageToSend || text }),
      });

      if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
      const data = await res.json();

      const { answer = 'Sem resposta', source, blocked } = data;
      let fullContent = answer;
      if (source) fullContent += `\n\n_Fonte: ${source}_`;
      if (blocked) fullContent = `⚠️ ${answer}`;

      const finalMessages = [...nextMessages.slice(0, -1), { ...assistantPlaceholder, content: fullContent }];
      setMessages(finalMessages);

      const title = text.slice(0, 50) + (text.length > 50 ? '...' : '');
      let convs = [...conversations];
      let nextCurrent = currentConversation;
      if (currentConversation) {
        convs = convs.map((c) =>
          c.id === currentConversation.id
            ? { ...c, messages: finalMessages, lastMessage: title, lastMessageAt: new Date() }
            : c
        );
      } else {
        const newConv = {
          id: `conv-${Date.now()}`,
          title: title || 'Nova conversa',
          messages: finalMessages,
          lastMessage: title,
          lastMessageAt: new Date(),
          createdAt: new Date(),
        };
        convs = [newConv, ...convs].slice(0, 50);
        nextCurrent = newConv;
        setCurrentConversation(newConv);
      }
      setConversations(convs);
      saveToStorage(convs, nextCurrent);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      setMessages((prev) => {
        const copy = prev.filter((m) => !(m.role === 'assistant' && m.content === ''));
        return [
          ...copy,
          {
            role: 'assistant',
            content: `Erro: ${err?.message || 'Não foi possível obter resposta.'}`,
            timestamp: new Date(),
          },
        ];
      });
    } finally {
      setIsAssistantTyping(false);
    }
  };

  const handlePromptClick = (prompt) => {
    handleSendMessage(prompt);
  };

  const handleDropFiles = (files) => {
    chatInputRef.current?.addFiles?.(files);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepthRef.current += 1;
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepthRef.current -= 1;
    if (dragDepthRef.current <= 0) {
      dragDepthRef.current = 0;
      setIsDragActive(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepthRef.current = 0;
    setIsDragActive(false);
    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length) handleDropFiles(files);
  };

  if (loading) {
    return (
      <div className="hk-pg-body py-0">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: '80vh' }}
        >
          <Spinner animation="border" variant="primary" />
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="hk-pg-body py-0">
        <div className="container py-5">
          <Alert variant="danger">{error || 'Agente não encontrado'}</Alert>
          <Button variant="light" onClick={() => router.push('/apps/agents')}>
            <ArrowLeft size={18} className="me-2" />
            Voltar aos Agentes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="hk-pg-body py-0">
      <div
        className={classNames('assistant-chat-wrap', {
          'sidebar-collapsed': !showSidebar,
        })}
        style={{
          display: 'flex',
          height: 'calc(100vh - 60px)',
          overflow: 'hidden',
        }}
      >
        {/* Sidebar */}
        <AgentChatSidebar
          agent={agent}
          conversations={conversations}
          currentConversation={currentConversation}
          onNewConversation={handleNewConversation}
          onSelectConversation={handleSelectConversation}
          onUploadClick={() => setShowUploadModal(true)}
          show={showSidebar}
          onToggle={() => setShowSidebar(!showSidebar)}
        />

        {/* Área principal */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'hidden',
            position: 'relative',
            backgroundColor: '#f8f9fa',
          }}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {isDragActive && (
            <>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.55)',
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                  pointerEvents: 'none',
                  zIndex: 4,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: '1.5rem',
                  borderRadius: '18px',
                  border: '2px dashed #0d6efd',
                  backgroundColor: 'rgba(13, 110, 253, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.9rem',
                  color: '#0d6efd',
                  fontWeight: 600,
                  fontSize: '1rem',
                  pointerEvents: 'none',
                  zIndex: 5,
                }}
              >
                <span
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    backgroundColor: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 18px rgba(13, 110, 253, 0.2)',
                    border: '1px solid #e7eaf0',
                    color: '#0d6efd',
                  }}
                >
                  <Upload size={24} />
                </span>
                Arraste arquivo aqui
              </div>
            </>
          )}

          <AgentChatArea
            agent={agent}
            messages={messages}
            onBack={() => router.push('/apps/agents')}
            onToggleSidebar={() => setShowSidebar(!showSidebar)}
            showSidebar={showSidebar}
            isAssistantTyping={isAssistantTyping}
            onPromptClick={handlePromptClick}
            onUploadClick={() => setShowUploadModal(true)}
          />

          <AgentChatInput
            ref={chatInputRef}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>

    </div>
  );
};

/**
 * Sidebar com Nova Conversa e histórico local
 */
const AgentChatSidebar = ({
  agent,
  conversations,
  currentConversation,
  onNewConversation,
  onSelectConversation,
  onUploadClick,
  show,
  onToggle,
}) => {
  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <div
      className={classNames('assistant-chat-sidebar', {
        'd-none d-md-block': !show,
      })}
      style={{
        width: show ? '280px' : '0',
        borderRight: '1px solid #e7eaf0',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '1rem', borderBottom: '1px solid #e7eaf0' }}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center">
            <span style={{ fontSize: '1.5rem' }} className="me-2">
              {agent.icon || '🤖'}
            </span>
            <div>
              <h6 className="mb-0">{agent.name}</h6>
              <small className="text-muted">{agent.category || agent.agentId}</small>
            </div>
          </div>
          <Button variant="link" size="sm" className="btn-icon d-md-none" onClick={onToggle}>
            <X size={18} />
          </Button>
        </div>
        <Button
          variant="primary"
          className="w-100 mb-2"
          onClick={onNewConversation}
          style={{ borderRadius: '8px', fontWeight: 500 }}
        >
          <Plus size={18} className="me-2" />
          Nova Conversa
        </Button>
        {onUploadClick && (
          <Button
            variant="outline-primary"
            className="w-100"
            onClick={onUploadClick}
            style={{ borderRadius: '8px', fontWeight: 500 }}
          >
            <UploadCloud size={18} className="me-2" />
            Enviar documento
          </Button>
        )}
      </div>

      <SimpleBar style={{ flex: 1, padding: '0.5rem', minHeight: 0 }}>
        {conversations.length === 0 ? (
          <div className="text-center text-muted py-5">
            <MessageSquare size={48} className="mb-3 opacity-50" />
            <p className="mb-0">Nenhuma conversa ainda</p>
            <small>Inicie uma nova conversa</small>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectConversation(conv)}
                onKeyPress={(e) => e.key === 'Enter' && onSelectConversation(conv)}
                style={{
                  cursor: 'pointer',
                  borderRadius: '8px',
                  marginBottom: '0.25rem',
                  padding: '0.75rem',
                  backgroundColor:
                    currentConversation?.id === conv.id ? '#f0f4ff' : 'transparent',
                  border: 'none',
                }}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {conv.title || 'Conversa'}
                    </div>
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {conv.lastMessage || '-'}
                    </small>
                  </div>
                  <small className="text-muted ms-2" style={{ fontSize: '0.7rem' }}>
                    {formatDate(conv.lastMessageAt || conv.createdAt)}
                  </small>
                </div>
              </div>
            ))}
          </div>
        )}
      </SimpleBar>

      <div
        style={{
          padding: '1rem',
          borderTop: '1px solid #e7eaf0',
          fontSize: '0.75rem',
          color: '#6c757d',
        }}
      >
        <div className="d-flex align-items-center justify-content-between">
          <span>{conversations.length} conversas</span>
          <span className="badge bg-success rounded-pill">Online</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Área de mensagens com prompts de exemplo clicáveis
 */
const AgentChatArea = ({
  agent,
  messages,
  onBack,
  onToggleSidebar,
  showSidebar,
  isAssistantTyping,
  onPromptClick,
  onUploadClick,
}) => {
  const messagesEndRef = useRef(null);
  const formatFileSize = (size) => {
    if (size == null) return '';
    if (size < 1024) return `${size} B`;
    const kb = size / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const prompts = DEFAULT_PROMPTS;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      <style jsx>{`
        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #6c757d;
          animation: typing 1.4s infinite;
          display: inline-block;
        }
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #e7eaf0',
            backgroundColor: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <Button variant="outline-secondary" size="sm" onClick={onBack}>
            <ArrowLeft size={16} className="me-1" />
            Voltar
          </Button>
          {onUploadClick && (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={onUploadClick}
              title="Enviar documento para RAG"
            >
              <UploadCloud size={16} className="me-1" />
              Enviar documento
            </Button>
          )}
          {!showSidebar && (
            <Button variant="link" size="sm" className="btn-icon" onClick={onToggleSidebar}>
              <Menu size={20} />
            </Button>
          )}
          <div className="d-flex align-items-center">
            <span style={{ fontSize: '1.5rem' }} className="me-2">
              {agent.icon || '🤖'}
            </span>
            <div>
              <h6 className="mb-0">{agent.name}</h6>
              <small className="text-muted">{agent.description || agent.agentId}</small>
            </div>
          </div>
        </div>

        {/* Mensagens */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <SimpleBar style={{ flex: 1, height: '100%', minHeight: 0, padding: '2rem 1.5rem' }}>
            {messages.length === 0 ? (
              <div
                className="d-flex flex-column align-items-center justify-content-center text-center"
                style={{ height: '100%', minHeight: '300px' }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: '#f0f4ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  {agent.icon || '🤖'}
                </div>
                <h5>{agent.name}</h5>
                <p className="text-muted mb-1" style={{ maxWidth: '520px' }}>
                  {agent.description}
                </p>
                <p className="text-muted mb-4" style={{ fontSize: '0.82rem' }}>
                  Clique em uma pergunta abaixo para testar cada camada do sistema.
                </p>

                <div style={{ width: '100%', maxWidth: '620px' }}>
                  {[
                    { label: '📄 RAG — busca em documentos internos', items: prompts.filter(p => p.type === 'RAG') },
                    { label: '💬 Direto — conhecimento geral', items: prompts.filter(p => p.type === 'Direto') },
                    { label: '🤝 Agente — raciocínio especializado', items: prompts.filter(p => p.type === 'Agente') },
                    { label: '🚫 Compliance — tópico bloqueado', items: prompts.filter(p => p.type === 'Bloqueado') },
                  ].map((group, gi) => (
                    <div key={gi} className="mb-3 text-start">
                      <div
                        className="mb-2 fw-semibold"
                        style={{ fontSize: '0.75rem', color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                      >
                        {group.label}
                      </div>
                      <div className="d-flex flex-column gap-2">
                        {group.items.map((p, i) => (
                          <div
                            key={i}
                            role="button"
                            tabIndex={0}
                            onClick={() => onPromptClick?.(p.text)}
                            onKeyPress={(e) => e.key === 'Enter' && onPromptClick?.(p.text)}
                            className="bg-white px-3 py-2 rounded-3 d-flex align-items-center justify-content-between"
                            style={{
                              cursor: 'pointer',
                              border: `1px solid ${p.color}33`,
                              transition: 'all 0.15s',
                              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = p.color;
                              e.currentTarget.style.backgroundColor = `${p.color}08`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = `${p.color}33`;
                              e.currentTarget.style.backgroundColor = '#fff';
                            }}
                          >
                            <span style={{ fontSize: '0.875rem', color: '#212529' }}>{p.text}</span>
                            <span
                              className="ms-3 badge rounded-pill flex-shrink-0"
                              style={{ backgroundColor: p.color, fontSize: '0.65rem' }}
                            >
                              {p.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                {messages
                  .filter(
                    (msg, i) =>
                      !(i === messages.length - 1 && msg.role === 'assistant' && !msg.content)
                  )
                  .map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-4 d-flex ${
                      msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'
                    }`}
                  >
                    <div
                      style={{
                        maxWidth: '70%',
                        display: 'flex',
                        gap: '0.75rem',
                        flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                      }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: msg.role === 'user' ? '#0d6efd' : '#f0f4ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          color: msg.role === 'user' ? '#fff' : '#333',
                          fontSize: '1.2rem',
                        }}
                      >
                        {msg.role === 'user' ? '👤' : agent.icon || '🤖'}
                      </div>
                      <div>
                        <div
                          style={{
                            backgroundColor: msg.role === 'user' ? '#0d6efd' : '#fff',
                            color: msg.role === 'user' ? '#fff' : '#212529',
                            padding: '0.875rem 1.125rem',
                            borderRadius: '12px',
                            boxShadow:
                              msg.role === 'user'
                                ? '0 2px 8px rgba(13, 110, 253, 0.15)'
                                : '0 2px 8px rgba(0, 0, 0, 0.08)',
                          }}
                        >
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                            {msg.content}
                          </ReactMarkdown>
                          {msg.role === 'assistant' && isAssistantTyping && (
                            <span
                              className="d-inline-block ms-1"
                              style={{
                                width: '2px',
                                height: '1em',
                                backgroundColor: '#0d6efd',
                                animation: 'blink 1s step-end infinite',
                                verticalAlign: 'text-bottom',
                              }}
                            />
                          )}
                        </div>
                        {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                          <div
                            style={{
                              marginTop: '0.5rem',
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '0.5rem',
                            }}
                          >
                            {msg.attachments.map((file, fi) => {
                              const isImage = file.type?.startsWith('image/');
                              const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                              const imgUrl = isImage && file.fileUrl
                                ? (file.fileUrl.startsWith('http') ? file.fileUrl : `${base.replace(/\/$/, '')}${file.fileUrl.startsWith('/') ? file.fileUrl : '/' + file.fileUrl}`)
                                : null;
                              return isImage && imgUrl ? (
                                <a
                                  key={fi}
                                  href={imgUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: 'block',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    border: '1px solid #e7eaf0',
                                    maxWidth: '200px',
                                    maxHeight: '200px',
                                  }}
                                >
                                  <img
                                    src={imgUrl}
                                    alt={file.name}
                                    style={{
                                      width: '100%',
                                      height: 'auto',
                                      maxHeight: '200px',
                                      objectFit: 'cover',
                                      display: 'block',
                                    }}
                                  />
                                  <span
                                    className="d-block px-2 py-1 text-muted"
                                    style={{ fontSize: '0.7rem', backgroundColor: '#f8f9fa' }}
                                  >
                                    {file.name}
                                  </span>
                                </a>
                              ) : (
                                <div
                                  key={fi}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.35rem 0.6rem',
                                    borderRadius: '999px',
                                    backgroundColor: msg.role === 'user' ? 'rgba(13,110,253,0.08)' : '#f8f9fa',
                                    border: '1px solid #e7eaf0',
                                    fontSize: '0.75rem',
                                    color: '#495057',
                                  }}
                                >
                                  <span style={{ fontWeight: 600 }}>{file.name}</span>
                                  <span className="text-muted">{formatFileSize(file.size)}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <small
                          className={`d-block mt-1 ${msg.role === 'user' ? 'text-end' : 'text-start'}`}
                          style={{ fontSize: '0.7rem', color: '#6c757d' }}
                        >
                          {msg.timestamp
                            ? new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
                {isAssistantTyping &&
                  messages[messages.length - 1]?.role === 'assistant' &&
                  !messages[messages.length - 1]?.content && (
                  <div className="mb-4 d-flex justify-content-start">
                    <div
                      style={{
                        maxWidth: '70%',
                        display: 'flex',
                        gap: '0.75rem',
                      }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: '#f0f4ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontSize: '1.2rem',
                        }}
                      >
                        {agent.icon || '🤖'}
                      </div>
                      <div
                        style={{
                          backgroundColor: '#fff',
                          padding: '0.875rem 1.125rem',
                          borderRadius: '12px',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                          display: 'flex',
                          gap: '4px',
                          alignItems: 'center',
                        }}
                      >
                        <span className="typing-dot" style={{ animationDelay: '0ms' }} />
                        <span className="typing-dot" style={{ animationDelay: '150ms' }} />
                        <span className="typing-dot" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </SimpleBar>
        </div>
      </div>
    </>
  );
};

/**
 * Input com anexos e textarea
 */
const AgentChatInputInner = ({ onSendMessage }, ref) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileErrors, setFileErrors] = useState([]);
  const [previewUrls, setPreviewUrls] = useState({});
  const fileInputRef = useRef(null);

  const formatFileSize = (size) => {
    if (size == null) return '';
    if (size < 1024) return `${size} B`;
    const kb = size / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const getFileKey = (f) => `${f.name}-${f.size}-${f.lastModified}`;

  const validateFiles = (files) => {
    const next = [];
    const errs = [];
    files.forEach((file) => {
      const ok =
        ACCEPTED_FILE_TYPES.includes(file.type) ||
        ACCEPTED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));
      if (!ok) {
        errs.push(`Tipo inválido: ${file.name}`);
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        errs.push(`Arquivo muito grande (máx. 10 MB): ${file.name}`);
        return;
      }
      next.push(file);
    });
    return { nextFiles: next, errors: errs };
  };

  const addFiles = (incoming) => {
    if (!incoming?.length) return;
    const { nextFiles, errors } = validateFiles(incoming);
    setFileErrors(errors);
    if (!nextFiles.length) return;
    setSelectedFiles((prev) => [...prev, ...nextFiles]);
    setPreviewUrls((prev) => {
      const next = { ...prev };
      nextFiles.forEach((f) => {
        if (f.type.startsWith('image/')) {
          const k = getFileKey(f);
          if (!next[k]) next[k] = URL.createObjectURL(f);
        }
      });
      return next;
    });
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (sending) return;
    if (!message.trim() && selectedFiles.length === 0) return;
    const msg = message.trim();
    const files = [...selectedFiles];
    setMessage('');
    setSelectedFiles([]);
    setPreviewUrls((prev) => {
      Object.values(prev).forEach((u) => URL.revokeObjectURL(u));
      return {};
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSending(true);
    try {
      await onSendMessage(msg, files);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const imageFiles = [];
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) imageFiles.push(file);
      }
    }
    if (imageFiles.length > 0) {
      e.preventDefault();
      addFiles(imageFiles);
    }
  };

  useImperativeHandle(ref, () => ({
    addFiles,
  }));

  return (
    <div
      style={{
        borderTop: '1px solid #e7eaf0',
        backgroundColor: '#fff',
        padding: '1rem 1.5rem',
      }}
    >
      {selectedFiles.length > 0 && (
        <div
          style={{
            maxWidth: '900px',
            margin: '0 auto 0.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          {selectedFiles.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.4rem 0.7rem',
                borderRadius: '12px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #e7eaf0',
                fontSize: '0.75rem',
                color: '#495057',
                minWidth: '140px',
              }}
            >
              {file.type.startsWith('image/') ? (
                <img
                  src={previewUrls[getFileKey(file)]}
                  alt={file.name}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    objectFit: 'cover',
                    border: '1px solid #dee2e6',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    backgroundColor: '#e9ecef',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    color: '#6c757d',
                  }}
                >
                  {file.type === 'application/pdf' ? 'PDF' : 'TXT'}
                </div>
              )}
              <div>
                <span style={{ fontWeight: 600 }}>{file.name}</span>
                <span className="d-block text-muted" style={{ fontSize: '0.7rem' }}>
                  {formatFileSize(file.size)}
                </span>
              </div>
              <Button
                variant="link"
                size="sm"
                className="p-0 ms-auto"
                onClick={() => removeFile(i)}
                style={{ color: '#6c757d' }}
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      )}
      {fileErrors.length > 0 && (
        <div style={{ maxWidth: '900px', margin: '0 auto 0.5rem', fontSize: '0.75rem', color: '#dc3545' }}>
          {fileErrors.map((err, i) => (
            <div key={i}>{err}</div>
          ))}
        </div>
      )}
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-end',
        }}
      >
        <div style={{ flex: 1 }}>
          <Form.Control
            as="textarea"
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onPaste={handlePaste}
            placeholder="Digite sua mensagem ou cole uma imagem (Ctrl+V)..."
            disabled={sending}
            style={{
              resize: 'none',
              borderRadius: '12px',
              padding: '0.875rem 1rem',
              border: '1px solid #e7eaf0',
              fontSize: '0.95rem',
              minHeight: '48px',
              maxHeight: '200px',
            }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
          />
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".jpeg,.jpg,.png,.webp,.gif,.pdf,.txt,image/*"
            onChange={(e) => {
              addFiles(Array.from(e.target.files || []));
              e.target.value = '';
            }}
            style={{ display: 'none' }}
          />
          <Button
            variant="light"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
            aria-label="Anexar imagem ou documento"
            title="Anexar imagem (JPEG, PNG, WebP, GIF) ou documento (PDF, TXT)"
            style={{
              borderRadius: '12px',
              width: '48px',
              height: '48px',
              padding: 0,
              border: '1px solid #e7eaf0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image size={18} />
          </Button>
        </div>
        <Button
          variant="primary"
          onClick={handleSend}
          disabled={sending || (!message.trim() && selectedFiles.length === 0)}
          style={{
            borderRadius: '12px',
            width: '48px',
            height: '48px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Send size={18} />
        </Button>
      </div>
      <div className="text-center mt-2" style={{ fontSize: '0.7rem', color: '#6c757d' }}>
        Pressione Enter para enviar, Shift+Enter para nova linha
      </div>
    </div>
  );
};

const AgentChatInput = React.forwardRef(AgentChatInputInner);
AgentChatInput.displayName = 'AgentChatInput';

export default AgentChatPage;
