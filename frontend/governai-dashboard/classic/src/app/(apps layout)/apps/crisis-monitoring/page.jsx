'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Badge, Button, Card, Col, Form, Row } from 'react-bootstrap';
import * as Icons from 'react-feather';
import classNames from 'classnames';
import SimpleBar from 'simplebar-react';
import CrisisHeader from './CrisisHeader';
import CrisisSidebar from './CrisisSidebar';

const CRISIS_MOCK = {
    status: {
        label: 'ALERTA',
        variant: 'danger',
        subtitle: 'Status do Sistema',
    },
    monitoredSubjects: [
        'Caso Orelha - Maus-tratos animais',
        'Protestos São Paulo',
        'Investigação Praia Brava',
    ],
    stats: [
        { icon: 'Activity', value: '158', label: 'Incidentes Ativos', iconClass: 'text-danger' },
        { icon: 'Clock', value: '2h 34m', label: 'Tempo Médio', iconClass: 'text-success' },
        { icon: 'TrendingUp', value: '100', label: 'Últimas 24h', iconClass: 'text-warning' },
    ],
    crisisTypes: [
        { name: 'Manifestação', dotColor: '#ff8a00' },
        { name: 'Escândalo', dotColor: '#9b5de5' },
        { name: 'Desastre', dotColor: '#3b82f6' },
        { name: 'Violência', dotColor: '#ef4444' },
    ],
    recentTabs: [
        { key: '24h', label: 'Últimas 24 horas', total: 12 },
        { key: '7d', label: 'Últimos 7 dias', total: 47 },
        { key: '30d', label: 'Últimos 30 dias', total: 158 },
    ],
    recentByPeriod: {
        '24h': [
            { title: 'Novo protesto em frente à Câmara de Florianópolis', source: 'G1', age: '2h atrás', tone: 'danger' },
            { title: 'Porteiro divulga áudios sobre agressão ao cão', source: 'CNN Brasil', age: '5h atrás', tone: 'danger' },
            { title: 'Vereadores debatem projeto de lei sobre maus-tratos', source: 'Folha', age: '8h atrás', tone: 'warning' },
            { title: 'ONG protocola pedido de investigação ao MP', source: 'Agência Brasil', age: '12h atrás', tone: 'warning' },
        ],
        '7d': [
            { title: 'Manifestação reúne centenas em São Paulo', source: 'Agência Brasil', age: '2 dias atrás', tone: 'danger' },
            { title: 'Adolescente descartado como suspeito vira testemunha', source: 'G1', age: '3 dias atrás', tone: 'danger' },
            { title: 'Petição online atinge 500 mil assinaturas', source: 'O Globo', age: '4 dias atrás', tone: 'warning' },
            { title: 'Delegacia conclui inquérito parcial do caso', source: 'CNN Brasil', age: '5 dias atrás', tone: 'warning' },
            { title: 'Celebridades se manifestam nas redes sociais', source: 'Band News', age: '6 dias atrás', tone: 'success' },
        ],
        '30d': [
            { title: 'Caso Orelha: cão comunitário é encontrado agonizando', source: 'G1', age: '3 semanas atrás', tone: 'danger' },
            { title: 'Polícia Civil abre inquérito e identifica suspeitos', source: 'CNN Brasil', age: '3 semanas atrás', tone: 'danger' },
            { title: 'Eutanásia é realizada devido à gravidade das lesões', source: 'Agência Brasil', age: '3 semanas atrás', tone: 'danger' },
            { title: 'Primeiros protestos espontâneos em Florianópolis', source: 'Folha', age: '2 semanas atrás', tone: 'warning' },
            { title: 'Caso ganha repercussão nacional na mídia', source: 'O Globo', age: '2 semanas atrás', tone: 'warning' },
            { title: 'Redes sociais viralizam vídeos e depoimentos', source: 'Band News', age: '10 dias atrás', tone: 'success' },
        ],
    },
    monitoringCards: [
        {
            image: '/img/crisis/crisis-news-1.jpg',
            source: 'G1',
            title: 'Caso Orelha: veja linha do tempo com os acontecimentos e o que se sabe',
            age: '1 dia atrás',
            sourceClass: 'danger',
        },
        {
            image: '/img/crisis/crisis-news-2.jpg',
            source: 'G1',
            title: 'Caso Orelha: "Se eu tivesse visto batendo no cachorro, eu diria", diz porteiro',
            age: '1 dia atrás',
            sourceClass: 'danger',
        },
        {
            image: '/img/crisis/crisis-news-3.jpg',
            source: 'G1',
            title: 'Caso Orelha: veja linha do tempo com os acontecimentos e o que se sabe',
            age: '1 dia atrás',
            sourceClass: 'danger',
        },
        {
            image: '/img/crisis/crisis-news-4.jpg',
            source: 'Agência Brasil',
            title: 'Centenas de pessoas em São Paulo pedem justiça pelo cão Orelha',
            age: '1 dia atrás',
            sourceClass: 'success',
        },
        {
            image: '/img/crisis/crisis-news-5.jpg',
            source: 'CNN Brasil',
            title: 'Caso Orelha: porteiro divulga áudios sobre agressão em grupo de vigilantes',
            age: 'há 24 horas',
            sourceClass: 'danger',
        },
        {
            image: '/img/crisis/crisis-news-6.jpg',
            source: 'Agência Brasil',
            title: 'Centenas de pessoas em São Paulo pedem justiça pelo cão Orelha',
            age: '1 dia atrás',
            sourceClass: 'success',
        },
    ],
    sources: ['O Globo', 'Band News', 'CNN Brasil', 'G1', 'Agência Brasil', 'Folha de S.Paulo'],
    socials: [
        {
            image: '/img/crisis/crisis-social-1.jpg',
            platform: 'Facebook',
            text: 'DE QUE LADO VOCÊ ESTÁ?',
            author: 'Tânia Político',
        },
        {
            image: '/img/crisis/crisis-social-2.jpg',
            platform: 'Instagram',
            text: 'Adolescentes e pai são alvos da polícia após morte de cão em SC',
            author: '@jornal_local',
        },
        {
            image: '/img/crisis/crisis-social-3.jpg',
            platform: 'TikTok',
            text: 'ADRIANA ARAÚJO - CASO ORELHA: SE A IMPUNIDADE IMPERA...',
            author: '@portalnoticias',
        },
    ],
    summary: [
        'O caso do cachorro Orelha, um cão comunitário dócil que vivia há 10 anos na Praia Brava, em Florianópolis, gerou enorme comoção nacional e está sob intensa investigação policial neste início de 2026.',
        'A Notícia: O crime. No início de janeiro de 2026, Orelha foi brutalmente espancado na cabeça com instrumentos contundentes. Ele foi encontrado agonizando sob um carro e, devido à gravidade irreversível das lesões, precisou ser submetido à eutanásia.',
        'Suspeitos: A Polícia Civil identificou um grupo de adolescentes como os principais suspeitos das agressões. Recentemente, um dos jovens teve seu envolvimento descartado e passou a colaborar como testemunha.',
        'Repercussão: O caso mobilizou manifestações em diversas cidades, como São Paulo, pedindo justiça e leis mais rígidas contra maus-tratos. Há também alertas sobre redes online que podem estar lucrando com a divulgação de vídeos de tortura animal.',
    ],
    suggestion: {
        title: 'POST INSTAGRAM',
        intro: 'JUSTICA POR ORELHA',
        paragraph1: 'O caso do cãozinho Orelha nos comoveu profundamente. Um animal dócil, amado por toda a comunidade da Praia Brava, teve sua vida tirada de forma brutal e covarde.',
        paragraph2: 'Como pré-candidato a prefeito, eu, Marcos Almeida, me comprometo:',
        commitments: [
            'Fortalecer a fiscalização contra maus-tratos animais',
            'Criar o Programa Municipal de Proteção Animal',
            'Ampliar o atendimento veterinário público gratuito',
            'Apoiar ONGs e protetores independentes',
            'Endurecer as penalidades para crimes contra animais',
        ],
        paragraph3: 'Orelha não será esquecido. Sua história nos impulsiona a lutar por uma cidade mais justa e compassiva para TODOS os seres vivos.',
        paragraph4: 'A causa animal é uma causa de todos nós. Quem maltrata um animal, maltrata a sociedade.',
        hashtags: '#JusticaPorOrelha #CausaAnimal #MarcosAlmeida #Prefeito #ProtejaNossosAnimais #Florianópolis #PraiaBrava #NaoAosMausTratos #DireitosAnimais #OrelhaVive',
        artImage: '/img/crisis/crisis-response-post.jpg',
    },
};
const TikTokIcon = ({ size = 12, className = '' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
    >
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
);

const FacebookIcon = ({ size = 12, className = '' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
    >
        <path d="M14 8h3V4h-3a5 5 0 0 0-5 5v3H6v4h3v4h4v-4h3l1-4h-4V9a1 1 0 0 1 1-1z" />
    </svg>
);

const CrisisDashboard = () => {
    const [showSidebar, setShowSidebar] = useState(true);
    const [activeTab, setActiveTab] = useState('24h');
    const [subjectInput, setSubjectInput] = useState('');
    const [monitoredSubjects, setMonitoredSubjects] = useState([...CRISIS_MOCK.monitoredSubjects]);

    const handleAddSubject = () => {
        const nextSubject = subjectInput.trim();
        if (!nextSubject) return;
        setMonitoredSubjects((prev) => [...prev, nextSubject]);
        setSubjectInput('');
    };

    const handleRemoveSubject = (indexToRemove) => {
        setMonitoredSubjects((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    const getSocialIcon = (platform) => {
        if (platform === 'Facebook') return FacebookIcon;
        if (platform === 'Instagram') return Icons.Instagram;
        if (platform === 'TikTok') return TikTokIcon;
        return Icons.Globe;
    };

    return (
        <>
        <div className="hk-pg-body py-0">
            <div className={classNames('fmapp-wrap', { 'fmapp-sidebar-toggle': !showSidebar })}>
                <CrisisSidebar />
                <div className="fmapp-content">
                    <div className="fmapp-detail-wrap">
                        <CrisisHeader showSidebar={showSidebar} toggleSidebar={() => setShowSidebar(!showSidebar)} />
                        <div className="fm-body">
                            <SimpleBar className="nicescroll-bar">
                                <div className="container-fluid px-4 py-4">
                                    <Row className="mb-3">
                                        <Col xs={12} className="d-flex align-items-start justify-content-between">
                                            <div>
                                                <h4 className="mb-0">Monitoramento de Crise</h4>
                                                <small className="text-muted">24/7 em tempo real</small>
                                            </div>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col lg={12} className="mb-3">
                                            <Card className={`card-border border-${CRISIS_MOCK.status.variant}`}>
                                                <Card.Body>
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div>
                                                            <small className="text-muted d-block">{CRISIS_MOCK.status.subtitle}</small>
                                                            <h2 className={`mb-0 text-${CRISIS_MOCK.status.variant}`}>
                                                                {CRISIS_MOCK.status.label}
                                                            </h2>
                                                        </div>
                                                        <div className="avatar avatar-icon avatar-xxl avatar-rounded">
                                                            <span className="initial-wrap">
                                                                <Icons.AlertTriangle size={36} className={`text-${CRISIS_MOCK.status.variant}`} />
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col lg={12} className="mb-3">
                                            <Card className="card-border">
                                                <Card.Body>
                                                    <div className="d-flex align-items-center mb-2">
                                                        <Icons.Search size={14} className="text-success me-2" />
                                                        <h6 className="mb-0">Assuntos Monitorados</h6>
                                                    </div>
                                                    <div className="d-flex gap-2 flex-wrap mb-2">
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Adicionar assunto de crise..."
                                                            value={subjectInput}
                                                            onChange={(event) => setSubjectInput(event.target.value)}
                                                            onKeyDown={(event) => {
                                                                if (event.key === 'Enter') {
                                                                    event.preventDefault();
                                                                    handleAddSubject();
                                                                }
                                                            }}
                                                            style={{ maxWidth: '720px' }}
                                                        />
                                                        <Button size="sm" variant="primary" onClick={handleAddSubject}>
                                                            <Icons.Plus size={14} className="me-1" />
                                                            Adicionar
                                                        </Button>
                                                    </div>
                                                    <div className="d-flex gap-2 flex-wrap">
                                                        {monitoredSubjects.map((subject, index) => (
                                                            <span key={`${subject}-${index}`} className="badge badge-soft-light border text-dark">
                                                                {subject}
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-link text-muted p-0 ms-2 align-baseline"
                                                                    onClick={() => handleRemoveSubject(index)}
                                                                    aria-label={`Excluir assunto ${subject}`}
                                                                >
                                                                    <Icons.X size={12} />
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>

                                    <Row>
                                        {CRISIS_MOCK.stats.map((stat) => {
                                            const Icon = Icons[stat.icon];
                                            return (
                                                <Col lg={4} key={stat.label} className="mb-3">
                                                    <Card className="card-border">
                                                        <Card.Body>
                                                            <div className="text-center">
                                                                <Icon size={20} className={`mb-2 ${stat.iconClass}`} />
                                                                <h2 className="mb-0">{stat.value}</h2>
                                                                <small className="text-muted">{stat.label}</small>
                                                            </div>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            );
                                        })}
                                    </Row>

                                    <Row>
                                        <Col xs={12} className="mb-3">
                                            <div className="d-flex align-items-center flex-wrap gap-2">
                                                <small className="text-muted fw-medium">TIPOS DE CRISE:</small>
                                                {CRISIS_MOCK.crisisTypes.map((type) => (
                                                    <span
                                                        key={type.name}
                                                        className="d-inline-flex align-items-center px-3 py-1 rounded-pill"
                                                        style={{
                                                            backgroundColor: '#f3f4f6',
                                                            color: '#111827',
                                                            border: '1px solid #d1d5db',
                                                            fontWeight: 600,
                                                            fontSize: '0.875rem',
                                                        }}
                                                    >
                                                        <span
                                                            className="rounded-circle me-2"
                                                            style={{ width: '8px', height: '8px', backgroundColor: type.dotColor }}
                                                        />
                                                        {type.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col lg={12} className="mb-4">
                                            <Card className="card-border">
                                                <Card.Body>
                                                    <div className="d-flex align-items-center mb-2">
                                                        <Icons.Clock size={14} className="text-success me-2" />
                                                        <h6 className="mb-0">Crises Recentes</h6>
                                                    </div>
                                                    <div className="border rounded mb-3 overflow-hidden">
                                                        <div className="row g-0">
                                                        {CRISIS_MOCK.recentTabs.map((tab) => (
                                                            <div key={tab.key} className="col-4">
                                                                <button
                                                                    type="button"
                                                                    className="btn w-100 rounded-0 py-3"
                                                                    onClick={() => setActiveTab(tab.key)}
                                                                    style={{
                                                                        borderBottom: activeTab === tab.key ? '2px solid var(--bs-primary)' : '2px solid transparent',
                                                                        color: activeTab === tab.key ? 'var(--bs-primary)' : '#475569',
                                                                        backgroundColor: '#ffffff',
                                                                        fontWeight: 500,
                                                                    }}
                                                                >
                                                                    {tab.label}
                                                                    <span
                                                                        className="ms-2 badge rounded-pill"
                                                                        style={{
                                                                            backgroundColor: activeTab === tab.key ? 'var(--bs-primary)' : '#e2e8f0',
                                                                            color: activeTab === tab.key ? '#ffffff' : '#334155',
                                                                            fontSize: '0.75rem',
                                                                        }}
                                                                    >
                                                                        {tab.total}
                                                                    </span>
                                                                </button>
                                                            </div>
                                                        ))}
                                                        </div>
                                                    </div>
                                                    <div className="d-flex flex-column gap-2">
                                                        {CRISIS_MOCK.recentByPeriod[activeTab].map((item) => (
                                                            <div
                                                                key={`${item.title}-${item.source}`}
                                                                className="rounded p-3"
                                                                style={{
                                                                    backgroundColor:
                                                                        item.tone === 'danger' ? '#fff7f8' : item.tone === 'warning' ? '#fffdf4' : '#f5fbfa',
                                                                    border:
                                                                        item.tone === 'danger'
                                                                            ? '1px solid #fecdd3'
                                                                            : item.tone === 'warning'
                                                                                ? '1px solid #fde68a'
                                                                                : '1px solid #99f6e4',
                                                                }}
                                                            >
                                                                <div className="d-flex align-items-start">
                                                                    <span
                                                                        className="rounded-circle me-3 mt-1"
                                                                        style={{
                                                                            width: '11px',
                                                                            height: '11px',
                                                                            backgroundColor:
                                                                                item.tone === 'danger'
                                                                                    ? '#ef4444'
                                                                                    : item.tone === 'warning'
                                                                                        ? '#eab308'
                                                                                        : '#0d9488',
                                                                        }}
                                                                    />
                                                                    <div>
                                                                        <div className="fw-medium mb-1">{item.title}</div>
                                                                        <div className="d-flex align-items-center">
                                                                            <span className="badge badge-soft-light text-dark border me-2">
                                                                                {item.source}
                                                                            </span>
                                                                            <small className="text-muted">{item.age}</small>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col lg={12} className="mb-3">
                                            <div className="d-flex align-items-center justify-content-between mb-2">
                                                <div className="d-flex align-items-center">
                                                    <Icons.Zap size={14} className="text-success me-2" />
                                                    <h6 className="mb-0">Monitoramento</h6>
                                                </div>
                                                <span
                                                    className="d-inline-flex align-items-center px-3 py-1 rounded-pill"
                                                    style={{
                                                        backgroundColor: '#f8fafc',
                                                        border: '1px solid #d1d5db',
                                                        color: '#111827',
                                                        fontWeight: 600,
                                                        fontSize: '0.875rem',
                                                        lineHeight: 1.2,
                                                    }}
                                                >
                                                    Automático
                                                </span>
                                            </div>
                                            <Row>
                                                {CRISIS_MOCK.monitoringCards.map((card, idx) => {
                                                    const sourceBg = card.sourceClass === 'danger' ? '#ef4444' : '#10b981';
                                                    return (
                                                        <Col xl={4} md={6} key={`${card.title}-${idx}`} className="mb-3">
                                                        <Card className="card-border h-100 overflow-hidden monitoring-card">
                                                            <div
                                                                className="monitoring-card-media"
                                                                style={{
                                                                    height: '190px',
                                                                    backgroundImage: `url(${card.image})`,
                                                                    backgroundPosition: 'center',
                                                                    backgroundSize: 'cover',
                                                                    }}
                                                                />
                                                                <Card.Body className="pt-3">
                                                                    <span
                                                                        className="badge rounded-pill mb-2"
                                                                        style={{ backgroundColor: sourceBg, color: '#fff', fontSize: '0.75rem' }}
                                                                    >
                                                                        {card.source}
                                                                    </span>
                                                                    <div
                                                                        className="fw-medium"
                                                                        style={{
                                                                            display: '-webkit-box',
                                                                            WebkitLineClamp: 2,
                                                                            WebkitBoxOrient: 'vertical',
                                                                            overflow: 'hidden',
                                                                            minHeight: '48px',
                                                                        }}
                                                                    >
                                                                        {card.title}
                                                                    </div>
                                                                    <small className="text-muted">{card.age}</small>
                                                                </Card.Body>
                                                            </Card>
                                                        </Col>
                                                    );
                                                })}
                                            </Row>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col xs={12} className="mb-4">
                                            <h6 className="mb-2">Fontes</h6>
                                            <div className="d-flex flex-wrap gap-2">
                                                {CRISIS_MOCK.sources.map((source) => (
                                                    <span
                                                        key={source}
                                                        className="d-inline-flex align-items-center px-3 py-1 rounded-pill"
                                                        style={{
                                                            backgroundColor: '#f8fafc',
                                                            border: '1px solid #d1d5db',
                                                            color: '#111827',
                                                            fontWeight: 600,
                                                            fontSize: '0.875rem',
                                                            lineHeight: 1.2,
                                                        }}
                                                    >
                                                        {source}
                                                    </span>
                                                ))}
                                            </div>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col lg={12} className="mb-4">
                                            <h6 className="mb-3">Redes Sociais</h6>
                                            <Row>
                                                {CRISIS_MOCK.socials.map((post, idx) => (
                                                    <Col md={4} key={`${post.platform}-${idx}`} className="mb-3">
                                                        {(() => {
                                                            const SocialIcon = getSocialIcon(post.platform);
                                                            return (
                                                        <Card className="card-border h-100 overflow-hidden monitoring-card">
                                                            <div
                                                                className="monitoring-card-media"
                                                                style={{
                                                                    height: '190px',
                                                                    backgroundImage: `url(${post.image})`,
                                                                    backgroundPosition: 'center',
                                                                    backgroundSize: 'cover',
                                                                }}
                                                            />
                                                            <Card.Body className="pt-3">
                                                                <small className="text-muted d-flex align-items-center mb-1">
                                                                    <SocialIcon size={12} className="me-1" />
                                                                    {post.platform}
                                                                </small>
                                                                <div
                                                                    className="fw-medium"
                                                                    style={{
                                                                        display: '-webkit-box',
                                                                        WebkitLineClamp: 2,
                                                                        WebkitBoxOrient: 'vertical',
                                                                        overflow: 'hidden',
                                                                        minHeight: '48px',
                                                                    }}
                                                                >
                                                                    {post.text}
                                                                </div>
                                                                <small className="text-muted">{post.author}</small>
                                                            </Card.Body>
                                                        </Card>
                                                            );
                                                        })()}
                                                    </Col>
                                                ))}
                                            </Row>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col xs={12} className="mb-4">
                                            <h6 className="mb-2">Resumo dos fatos</h6>
                                            <Card className="card-border">
                                                <Card.Body>
                                                    {CRISIS_MOCK.summary.map((line, idx) => (
                                                        <p key={line} className={idx === CRISIS_MOCK.summary.length - 1 ? 'mb-0' : ''}>
                                                            {line}
                                                        </p>
                                                    ))}
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col xs={12}>
                                            <div className="d-flex align-items-center justify-content-between mb-3">
                                                <div className="d-flex align-items-center">
                                                    <Icons.Zap size={14} className="text-success me-2" />
                                                    <h6 className="mb-0">Sugestão de Resposta</h6>
                                                </div>
                                                <div className="d-flex gap-2">
                                                    <Button variant="primary" size="sm">
                                                        <Icons.RefreshCw size={14} className="me-2" />
                                                        Gerar resposta
                                                    </Button>
                                                    <Button as={Link} href="/apps/studio/social-post-generator" variant="outline-light" size="sm">
                                                        <Icons.ExternalLink size={14} className="me-2" />
                                                        Ir para o Gerador de Posts
                                                    </Button>
                                                </div>
                                            </div>
                                            <Card className="card-border overflow-hidden">
                                                <Card.Body className="p-3">
                                                    <Row className="g-3 align-items-stretch">
                                                        <Col lg={6} className="d-flex flex-column">
                                                            <h6 className="text-uppercase fs-8 mb-3 d-flex align-items-center">
                                                                <Icons.Instagram size={14} className="me-2 text-danger" />
                                                                {CRISIS_MOCK.suggestion.title}
                                                            </h6>
                                                            <Card className="card-border w-100 h-100 mb-0">
                                                                <Card.Body className="p-3 d-flex flex-column" style={{ minHeight: 0 }}>
                                                                    <div className="rounded p-3 w-100 flex-grow-1 mb-3" style={{ backgroundColor: '#f3f4f6', overflowY: 'auto', minHeight: 0 }}>
                                                                        <p className="fw-semibold mb-3">{CRISIS_MOCK.suggestion.intro}</p>
                                                                        <p>{CRISIS_MOCK.suggestion.paragraph1}</p>
                                                                        <p>{CRISIS_MOCK.suggestion.paragraph2}</p>
                                                                        <div className="mb-3">
                                                                            {CRISIS_MOCK.suggestion.commitments.map((line) => (
                                                                                <div key={line} className="d-flex align-items-start mb-1">
                                                                                    <Icons.CheckSquare size={14} className="me-2 text-success mt-1" />
                                                                                    <span>{line}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                        <p>{CRISIS_MOCK.suggestion.paragraph3}</p>
                                                                        <p>{CRISIS_MOCK.suggestion.paragraph4}</p>
                                                                        <p className="mb-0">{CRISIS_MOCK.suggestion.hashtags}</p>
                                                                    </div>
                                                                </Card.Body>
                                                                <Card.Footer className="pt-3">
                                                                    <Button variant="outline-light" size="sm" className="w-100">
                                                                        <Icons.ExternalLink size={14} className="me-2" />
                                                                        Copiar texto
                                                                    </Button>
                                                                </Card.Footer>
                                                            </Card>
                                                        </Col>
                                                        <Col lg={6} className="d-flex flex-column">
                                                            <h6 className="text-uppercase fs-8 mb-3 d-flex align-items-center">
                                                                <Icons.Image size={14} className="me-2 text-primary" />
                                                                Arte para publicação
                                                            </h6>
                                                            <Card className="card-border w-100 mb-0">
                                                                <div
                                                                    style={{
                                                                        borderTopLeftRadius: '12px',
                                                                        borderTopRightRadius: '12px',
                                                                    }}
                                                                >
                                                                    <img
                                                                        src={CRISIS_MOCK.suggestion.artImage}
                                                                        alt="Arte para publicação"
                                                                        style={{
                                                                            width: '100%',
                                                                            height: 'auto',
                                                                            display: 'block',
                                                                            borderTopLeftRadius: '12px',
                                                                            borderTopRightRadius: '12px',
                                                                        }}
                                                                    />
                                                                </div>
                                                                <Card.Footer>
                                                                    <Button variant="outline-light" size="sm" className="w-100">
                                                                        <Icons.ExternalLink size={14} className="me-2" />
                                                                        Baixar imagem
                                                                    </Button>
                                                                </Card.Footer>
                                                            </Card>
                                                        </Col>
                                                    </Row>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                </div>
                            </SimpleBar>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style jsx global>{`
            .monitoring-card .monitoring-card-media {
                transform: scale(1);
                transition: transform 0.35s ease;
                transform-origin: center center;
            }

            .monitoring-card:hover .monitoring-card-media {
                transform: scale(1.06);
            }
        `}</style>
        </>
    );
};

export default CrisisDashboard;
