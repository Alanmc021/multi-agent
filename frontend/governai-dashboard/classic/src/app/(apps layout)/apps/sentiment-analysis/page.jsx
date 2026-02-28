'use client'
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { Badge, Card, Col, Form, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTiktok, faXTwitter, faYoutube } from '@fortawesome/free-brands-svg-icons';
import * as Icons from 'react-feather';
import classNames from 'classnames';
import SimpleBar from 'simplebar-react';
import SentimentHeader from './SentimentHeader';
import SentimentSidebar from './SentimentSidebar';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const mock = {
    total: 1247,
    cards: [
        { label: 'Positivo', mentions: 498, percent: 39.9, delta: '+2.3%', tone: 'success', icon: Icons.Smile },
        { label: 'Neutro', mentions: 312, percent: 25.0, delta: '-0.8%', tone: 'warning', icon: Icons.Meh },
        { label: 'Negativo', mentions: 437, percent: 35.1, delta: '+1.5%', tone: 'danger', icon: Icons.Frown },
    ],
    evolution: {
        labels: ['25/Jan', '02/Fev', '09/Fev', '16/Fev'],
        series: [
            { name: 'Positivo', data: [36, 33, 35, 38] },
            { name: 'Neutro', data: [28, 25, 27, 24] },
            { name: 'Negativo', data: [34, 41, 36, 35] },
        ],
    },
    history: {
        labels: ['24/Nov', '08/Dez', '22/Dez', '05/Jan', '19/Jan', '02/Fev', '16/Fev'],
        series: [
            { name: 'Total', data: [192, 214, 222, 255, 290, 278, 302] },
            { name: 'Positivo', data: [88, 93, 105, 112, 138, 149, 144] },
            { name: 'Neutro', data: [70, 76, 73, 80, 85, 72, 79] },
            { name: 'Negativo', data: [80, 87, 79, 91, 121, 88, 104] },
        ],
    },
    platforms: [
        { name: 'Instagram', mentions: 423, p: 45, n: 30, ng: 25, icon: Icons.Instagram, tone: 'tone-instagram', iconTone: 'icon-instagram' },
        { name: 'Facebook', mentions: 356, p: 35, n: 25, ng: 40, icon: Icons.Facebook, tone: 'tone-facebook', iconTone: 'icon-facebook' },
        { name: 'TikTok', mentions: 234, p: 50, n: 20, ng: 30, icon: Icons.Music, tone: 'tone-tiktok', iconTone: 'icon-tiktok' },
        { name: 'X (Twitter)', mentions: 178, p: 28, n: 22, ng: 50, icon: Icons.Twitter, tone: 'tone-twitter', iconTone: 'icon-twitter' },
        { name: 'YouTube', mentions: 56, p: 42, n: 28, ng: 30, icon: Icons.Youtube, tone: 'tone-youtube', iconTone: 'icon-youtube' },
    ],
    categories: [
        { name: 'Saude', mentions: 312, p: 32, n: 18, ng: 50, icon: Icons.Activity, iconTone: 'category-pink' },
        { name: 'Educacao', mentions: 278, p: 50, n: 25, ng: 25, icon: Icons.BookOpen, iconTone: 'category-purple' },
        { name: 'Seguranca', mentions: 245, p: 20, n: 15, ng: 65, icon: Icons.Shield, iconTone: 'category-blue' },
        { name: 'Infraestrutura', mentions: 198, p: 50, n: 28, ng: 22, icon: Icons.Tool, iconTone: 'category-orange' },
    ],
    topics: [
        { tag: '#SaudePublica', sentiment: 'Negativo', mentions: 234, delta: '+12%' },
        { tag: '#EducacaoParaTodos', sentiment: 'Positivo', mentions: 189, delta: '+8%' },
        { tag: '#TransporteUrbano', sentiment: 'Negativo', mentions: 156, delta: '-3%' },
    ],
    mentions: [
        { id: 1, name: 'Maria Silva', handle: '@mariasilva', ago: '12 min atras', text: 'Excelente iniciativa do candidato na area de educacao! Finalmente alguem que pensa no futuro das criancas.', category: 'Educacao', sentiment: 'Positivo', platform: 'instagram', likes: 234, comments: 45, shares: 67 },
        { id: 2, name: 'Joao Santos', handle: '@joao.santos', ago: '28 min atras', text: 'Cade o plano de saude que foi prometido? Minha mae esta na fila ha 3 meses esperando cirurgia. Cobrem!', category: 'Saude', sentiment: 'Negativo', platform: 'facebook', likes: 567, comments: 123, shares: 234 },
        { id: 3, name: 'Ana Pereira', handle: '@anapereira', ago: '45 min atras', text: 'Visitei a obra do novo parque e ta ficando bonito sim gente! Nao e propaganda, fui la ver pessoalmente.', category: 'Meio Ambiente', sentiment: 'Positivo', platform: 'tiktok', likes: 1234, comments: 89, shares: 345 },
        { id: 4, name: 'Carlos Mendes', handle: '@cmendes', ago: '1h atras', text: 'Mais um assalto no centro da cidade. A seguranca publica esta um caos. Quando vao resolver isso?', category: 'Seguranca', sentiment: 'Negativo', platform: 'twitter', likes: 432, comments: 98, shares: 187 },
        { id: 5, name: 'Fernanda Lima', handle: '@fernandalima', ago: '1h30 atras', text: 'A proposta de transporte gratuito para estudantes e interessante. Vamos acompanhar se vai sair do papel.', category: 'Infraestrutura', sentiment: 'Neutro', platform: 'instagram', likes: 156, comments: 34, shares: 23 },
        { id: 6, name: 'Roberto Alves', handle: '@roberto.alves', ago: '2h atras', text: 'As escolas municipais melhoraram muito esse ano. Parabens pela gestao na educacao!', category: 'Educacao', sentiment: 'Positivo', platform: 'facebook', likes: 321, comments: 56, shares: 89 },
        { id: 7, name: 'Canal Cidade Viva', handle: '@cidadeviva', ago: '3h atras', text: 'Analise completa: O que mudou na infraestrutura da cidade nos ultimos 6 meses? Resultado surpreendente!', category: 'Infraestrutura', sentiment: 'Neutro', platform: 'youtube', likes: 876, comments: 234, shares: 123 },
        { id: 8, name: 'Lucas Oliveira', handle: '@lucasoliv', ago: '3h30 atras', text: 'URGENTE: posto de saude do meu bairro fechou sem aviso. Pessoas doentes sem atendimento. Isso e um absurdo!', category: 'Saude', sentiment: 'Negativo', platform: 'tiktok', likes: 2345, comments: 456, shares: 789 },
    ],
};

const evolutionByRange = {
    '7': {
        labels: ['16/Fev'],
        max: 40,
        series: [
            { name: 'Positivo', data: [40] },
            { name: 'Neutro', data: [25] },
            { name: 'Negativo', data: [35] },
        ],
    },
    '15': {
        labels: ['09/Fev', '16/Fev'],
        max: 40,
        series: [
            { name: 'Positivo', data: [36, 40] },
            { name: 'Neutro', data: [27, 25] },
            { name: 'Negativo', data: [37, 35] },
        ],
    },
    '30': {
        labels: ['26/Jan', '02/Fev', '09/Fev', '16/Fev'],
        max: 60,
        series: [
            { name: 'Positivo', data: [37, 33, 36, 39] },
            { name: 'Neutro', data: [28, 25, 27, 25] },
            { name: 'Negativo', data: [34, 42, 37, 35] },
        ],
    },
    '90': {
        labels: ['05/Jan', '12/Jan', '19/Jan', '26/Jan', '02/Fev', '09/Fev', '16/Fev'],
        max: 60,
        series: [
            { name: 'Positivo', data: [32, 35, 37, 38, 33, 36, 40] },
            { name: 'Neutro', data: [30, 30, 28, 28, 25, 27, 25] },
            { name: 'Negativo', data: [38, 35, 35, 34, 42, 37, 35] },
        ],
    },
};

const historyByRange = {
    '7': {
        labels: ['16/Fev'],
        max: 380,
        series: [
            { name: 'Total', data: [370] },
            { name: 'Positivo', data: [180] },
            { name: 'Neutro', data: [80] },
            { name: 'Negativo', data: [115] },
        ],
    },
    '15': {
        labels: ['09/Fev', '16/Fev'],
        max: 380,
        series: [
            { name: 'Total', data: [350, 370] },
            { name: 'Positivo', data: [150, 175] },
            { name: 'Neutro', data: [95, 82] },
            { name: 'Negativo', data: [105, 115] },
        ],
    },
    '30': {
        labels: ['26/Jan', '02/Fev', '09/Fev', '16/Fev'],
        max: 380,
        series: [
            { name: 'Total', data: [330, 320, 350, 370] },
            { name: 'Positivo', data: [145, 160, 150, 175] },
            { name: 'Neutro', data: [88, 72, 96, 82] },
            { name: 'Negativo', data: [102, 92, 106, 116] },
        ],
    },
    '90': {
        labels: ['24/Nov', '01/Dez', '08/Dez', '15/Dez', '22/Dez', '29/Dez', '05/Jan', '12/Jan', '19/Jan', '26/Jan', '02/Fev', '09/Fev', '16/Fev'],
        max: 380,
        series: [
            { name: 'Total', data: [210, 235, 240, 246, 249, 280, 295, 320, 330, 320, 320, 350, 370] },
            { name: 'Positivo', data: [92, 100, 95, 105, 110, 115, 120, 135, 110, 145, 160, 150, 175] },
            { name: 'Neutro', data: [60, 65, 72, 70, 73, 78, 82, 75, 90, 85, 72, 96, 82] },
            { name: 'Negativo', data: [83, 86, 90, 88, 82, 90, 95, 110, 130, 100, 90, 105, 115] },
        ],
    },
    custom: {
        labels: ['02/Fev', '09/Fev', '16/Fev', '22/Fev'],
        max: 400,
        series: [
            { name: 'Total', data: [320, 350, 370, 400] },
            { name: 'Positivo', data: [160, 150, 175, 198] },
            { name: 'Neutro', data: [70, 95, 80, 90] },
            { name: 'Negativo', data: [90, 105, 115, 112] },
        ],
    },
};

const lineOptions = (labels, max) => ({
    chart: { type: 'line', toolbar: { show: false }, zoom: { enabled: false }, foreColor: '#646A71', fontFamily: 'DM Sans' },
    stroke: { curve: 'smooth', width: 2.5 },
    markers: { size: 3.5, strokeWidth: 0 },
    grid: { borderColor: '#eceff3' },
    dataLabels: { enabled: false },
    legend: { position: 'bottom', fontSize: '12px' },
    xaxis: { categories: labels, axisBorder: { show: false } },
    yaxis: { min: 0, max },
    colors: ['#0ea46d', '#f59e0b', '#ef4444', '#10b981'],
});

const toneMap = { Positivo: 'success', Neutro: 'warning', Negativo: 'danger' };
const sentimentBadgeMap = {
    Positivo: { cls: 'sentiment-pill-positive', icon: Icons.ThumbsUp },
    Neutro: { cls: 'sentiment-pill-neutral', icon: Icons.Minus },
    Negativo: { cls: 'sentiment-pill-negative', icon: Icons.ThumbsDown },
};
const platformIconMap = {
    instagram: Icons.Instagram,
    facebook: Icons.Facebook,
    tiktok: null,
    twitter: null,
    youtube: null,
};

const SentimentDashboard = () => {
    const [showSidebar, setShowSidebar] = useState(true);
    const [query, setQuery] = useState('');
    const [mentionSentimentFilter, setMentionSentimentFilter] = useState('all');
    const [mentionPlatformFilter, setMentionPlatformFilter] = useState('all');
    const [evolutionRange, setEvolutionRange] = useState('30');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [historyRange, setHistoryRange] = useState('90');
    const [historyCustomStartDate, setHistoryCustomStartDate] = useState('2026-02-01');
    const [historyCustomEndDate, setHistoryCustomEndDate] = useState('2026-02-23');

    const currentEvolution = useMemo(() => {
        if (evolutionRange === 'custom') {
            return evolutionByRange['30'];
        }
        return evolutionByRange[evolutionRange];
    }, [evolutionRange]);

    const evolutionOptions = useMemo(() => lineOptions(currentEvolution.labels, currentEvolution.max), [currentEvolution]);
    const currentHistory = useMemo(() => {
        if (historyRange === 'custom') {
            return historyByRange.custom;
        }
        return historyByRange[historyRange];
    }, [historyRange]);
    const historyOptions = useMemo(() => lineOptions(currentHistory.labels, currentHistory.max), [currentHistory]);
    const filtered = mock.mentions.filter((m) => {
        const matchQuery = `${m.name} ${m.text} ${m.category}`.toLowerCase().includes(query.toLowerCase());
        const matchSentiment = mentionSentimentFilter === 'all' || m.sentiment.toLowerCase() === mentionSentimentFilter;
        const matchPlatform = mentionPlatformFilter === 'all' || m.platform === mentionPlatformFilter;
        return matchQuery && matchSentiment && matchPlatform;
    });

    return (
        <div className="hk-pg-body py-0 sentiment-analysis-page">
            <div className={classNames('fmapp-wrap', { 'fmapp-sidebar-toggle': !showSidebar })}>
                <SentimentSidebar />
                <div className="fmapp-content">
                    <div className="fmapp-detail-wrap">
                        <SentimentHeader toggleSidebar={() => setShowSidebar(!showSidebar)} />
                        <div className="fm-body">
                            <SimpleBar className="nicescroll-bar">
                                <div className="container-fluid px-4 py-4">
                                    <div className="sent-grid mb-3">
                                        {mock.cards.map((c) => (
                                            <Card key={c.label} className={`sent-kpi sent-kpi-${c.tone}`}>
                                                <Card.Body>
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div className={`sent-icon sent-icon-${c.tone}`}><c.icon size={15} /></div>
                                                            <div><div className="fs-8 text-muted">{c.label}</div><h3 className={`mb-0 text-${c.tone}`}>{c.percent}%</h3></div>
                                                        </div>
                                                        <small className={c.delta.startsWith('-') ? 'text-danger' : 'text-success'}>{c.delta}</small>
                                                    </div>
                                                    <small className="text-muted">{c.mentions} mencoes</small>
                                                </Card.Body>
                                            </Card>
                                        ))}
                                    </div>

                                    <Card className="mb-3"><Card.Body>
                                        <h6 className="mb-3"><Icons.BarChart2 size={14} className="me-2 text-success" />Resumo de Sentimento</h6>
                                        <Row className="mb-2"><Col md={4}><div className="text-muted fs-8">Total de mencoes</div><h3>{mock.total}</h3></Col><Col md={8}><div className="d-flex justify-content-between"><h4 className="text-success">{mock.cards[0].mentions}</h4><h4 className="text-warning">{mock.cards[1].mentions}</h4><h4 className="text-danger">{mock.cards[2].mentions}</h4></div></Col></Row>
                                        <div className="sent-bar mb-2"><div className="p" style={{ width: `${mock.cards[0].percent}%` }} /><div className="n" style={{ width: `${mock.cards[1].percent}%` }} /><div className="ng" style={{ width: `${mock.cards[2].percent}%` }} /></div>
                                        <div className="d-flex justify-content-between fs-8 text-muted"><span>Positivo {mock.cards[0].percent}%</span><span>Neutro {mock.cards[1].percent}%</span><span>Negativo {mock.cards[2].percent}%</span></div>
                                    </Card.Body></Card>

                                    <Card className="mb-3"><Card.Body>
                                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                                            <h6 className="mb-0"><Icons.TrendingUp size={14} className="me-2 text-success" />Evolucao do Sentimento</h6>
                                            <div className="d-flex align-items-center gap-2">
                                                <Form.Select
                                                    size="sm"
                                                    style={{ width: 180 }}
                                                    value={evolutionRange}
                                                    onChange={(e) => setEvolutionRange(e.target.value)}
                                                >
                                                    <option value="7">Ultimos 7 dias</option>
                                                    <option value="15">Ultimos 15 dias</option>
                                                    <option value="30">Ultimos 30 dias</option>
                                                    <option value="90">Ultimos 90 dias</option>
                                                    <option value="custom">Personalizado</option>
                                                </Form.Select>
                                                {evolutionRange === 'custom' && (
                                                    <>
                                                        <Form.Control
                                                            size="sm"
                                                            type="date"
                                                            style={{ width: 150 }}
                                                            value={customStartDate}
                                                            onChange={(e) => setCustomStartDate(e.target.value)}
                                                            aria-label="Data inicio"
                                                        />
                                                        <span className="text-muted fs-8">ate</span>
                                                        <Form.Control
                                                            size="sm"
                                                            type="date"
                                                            style={{ width: 150 }}
                                                            value={customEndDate}
                                                            onChange={(e) => setCustomEndDate(e.target.value)}
                                                            aria-label="Data fim"
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <ReactApexChart options={evolutionOptions} series={currentEvolution.series} type="line" height={320} width="100%" />
                                    </Card.Body></Card>

                                    <Card className="mb-3"><Card.Body>
                                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                                            <div>
                                                <h6 className="mb-0"><Icons.Activity size={14} className="me-2 text-success" />Historico de Mencoes</h6>
                                                <small className="text-muted">Volume de mencoes por sentimento ao longo do tempo</small>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <Form.Select
                                                    size="sm"
                                                    style={{ width: 180 }}
                                                    value={historyRange}
                                                    onChange={(e) => setHistoryRange(e.target.value)}
                                                >
                                                    <option value="7">Ultimos 7 dias</option>
                                                    <option value="15">Ultimos 15 dias</option>
                                                    <option value="30">Ultimos 30 dias</option>
                                                    <option value="90">Ultimos 90 dias</option>
                                                    <option value="custom">Personalizado</option>
                                                </Form.Select>
                                                {historyRange === 'custom' && (
                                                    <>
                                                        <Form.Control
                                                            size="sm"
                                                            type="date"
                                                            style={{ width: 150 }}
                                                            value={historyCustomStartDate}
                                                            onChange={(e) => setHistoryCustomStartDate(e.target.value)}
                                                            aria-label="Data inicio historico"
                                                        />
                                                        <span className="text-muted fs-8">ate</span>
                                                        <Form.Control
                                                            size="sm"
                                                            type="date"
                                                            style={{ width: 150 }}
                                                            value={historyCustomEndDate}
                                                            onChange={(e) => setHistoryCustomEndDate(e.target.value)}
                                                            aria-label="Data fim historico"
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <ReactApexChart options={historyOptions} series={currentHistory.series} type="line" height={320} width="100%" />
                                    </Card.Body></Card>

                                    <Card className="mb-3"><Card.Body>
                                        <h6 className="mb-3"><Icons.Grid size={14} className="me-2 text-success" />Sentimento por Plataforma</h6>
                                        <div className="platform-grid">
                                            {mock.platforms.map((p) => (
                                                <Card key={p.name} className={`platform-card ${p.tone}`}><Card.Body className="py-3">
                                                    <div className="d-flex align-items-center gap-2 mb-2">
                                                        <div className={`platform-icon ${p.iconTone}`}><p.icon size={13} /></div>
                                                        <div><div className="fw-semibold">{p.name}</div><small className="text-muted">{p.mentions} mencoes</small></div>
                                                    </div>
                                                    <div className="sent-bar mb-2"><div className="p" style={{ width: `${p.p}%` }} /><div className="n" style={{ width: `${p.n}%` }} /><div className="ng" style={{ width: `${p.ng}%` }} /></div>
                                                    <div className="d-flex justify-content-between align-items-center fs-8">
                                                        <span className="text-success"><Icons.ThumbsUp size={11} className="me-1" />{p.p}%</span>
                                                        <span className="text-warning"><Icons.Minus size={11} className="me-1" />{p.n}%</span>
                                                        <span className="text-danger"><Icons.ThumbsDown size={11} className="me-1" />{p.ng}%</span>
                                                    </div>
                                                </Card.Body></Card>
                                            ))}
                                        </div>
                                    </Card.Body></Card>

                                    <Card className="mb-3"><Card.Body>
                                        <h6 className="mb-3"><Icons.Filter size={14} className="me-2 text-success" />Sentimento por Categoria</h6>
                                        {mock.categories.map((c) => (
                                            <div key={c.name} className="mb-2">
                                                <div className="d-flex justify-content-between fs-8 mb-1">
                                                    <span className="fw-medium d-flex align-items-center gap-2">
                                                        <span className={`category-icon ${c.iconTone}`}><c.icon size={12} /></span>
                                                        {c.name} <Badge bg="light" text="dark">{c.mentions}</Badge>
                                                    </span>
                                                    <span><span className="text-success me-2">{c.p}%</span><span className="text-warning me-2">{c.n}%</span><span className="text-danger">{c.ng}%</span></span>
                                                </div>
                                                <div className="sent-bar"><div className="p" style={{ width: `${c.p}%` }} /><div className="n" style={{ width: `${c.n}%` }} /><div className="ng" style={{ width: `${c.ng}%` }} /></div>
                                            </div>
                                        ))}
                                    </Card.Body></Card>

                                    <Card className="mb-3"><Card.Body>
                                        <h6 className="mb-3"><Icons.Zap size={14} className="me-2 text-success" />Topicos em Alta</h6>
                                        {mock.topics.map((t) => {
                                            const badgeMeta = sentimentBadgeMap[t.sentiment];
                                            const BadgeIcon = badgeMeta?.icon || Icons.Circle;
                                            return (
                                                <div key={t.tag} className="d-flex justify-content-between align-items-center mb-2">
                                                    <div>
                                                        <span className="fw-semibold me-2">{t.tag}</span>
                                                        <span className={`sentiment-pill ${badgeMeta?.cls || ''}`}>
                                                            <BadgeIcon size={10} className="me-1" />
                                                            {t.sentiment}
                                                        </span>
                                                    </div>
                                                    <div className="fs-8"><span className="text-muted me-2">{t.mentions} mencoes</span><span className={t.delta.startsWith('-') ? 'text-danger' : 'text-success'}>{t.delta}</span></div>
                                                </div>
                                            );
                                        })}
                                    </Card.Body></Card>

                                    <Card><Card.Body>
                                        <h6 className="mb-3"><Icons.MessageSquare size={14} className="me-2 text-success" />Mencoes Recentes</h6>
                                        <Row className="g-2 mb-3">
                                            <Col lg={6}>
                                                <Form.Control value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar mencoes..." />
                                            </Col>
                                            <Col sm={6} lg={3}>
                                                <Form.Select value={mentionSentimentFilter} onChange={(e) => setMentionSentimentFilter(e.target.value)}>
                                                    <option value="all">Todos</option>
                                                    <option value="positivo">Positivo</option>
                                                    <option value="neutro">Neutro</option>
                                                    <option value="negativo">Negativo</option>
                                                </Form.Select>
                                            </Col>
                                            <Col sm={6} lg={3}>
                                                <Form.Select value={mentionPlatformFilter} onChange={(e) => setMentionPlatformFilter(e.target.value)}>
                                                    <option value="all">Todas</option>
                                                    <option value="instagram">Instagram</option>
                                                    <option value="facebook">Facebook</option>
                                                    <option value="tiktok">TikTok</option>
                                                    <option value="twitter">X (Twitter)</option>
                                                    <option value="youtube">YouTube</option>
                                                </Form.Select>
                                            </Col>
                                        </Row>
                                        <div className="mentions-grid">
                                            {filtered.map((m) => (
                                                <Card key={m.id} className="mention-card"><Card.Body>
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div className="mention-avatar">{m.name.charAt(0)}</div>
                                                            <div>
                                                                <div className="fw-semibold">{m.name}</div>
                                                                <small className="text-muted">{m.handle} - {m.ago}</small>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <span className="mention-platform-icon">
                                                                {m.platform === 'tiktok' ? (
                                                                    <FontAwesomeIcon icon={faTiktok} style={{ fontSize: 12 }} />
                                                                ) : m.platform === 'twitter' ? (
                                                                    <FontAwesomeIcon icon={faXTwitter} style={{ fontSize: 12 }} />
                                                                ) : m.platform === 'youtube' ? (
                                                                    <FontAwesomeIcon icon={faYoutube} style={{ fontSize: 12 }} />
                                                                ) : (
                                                                    (() => {
                                                                        const PlatformIcon = platformIconMap[m.platform];
                                                                        return PlatformIcon ? <PlatformIcon size={12} /> : null;
                                                                    })()
                                                                )}
                                                            </span>
                                                            <span className={`sentiment-pill ${sentimentBadgeMap[m.sentiment]?.cls || ''}`}>
                                                                {(() => {
                                                                    const SentimentIcon = sentimentBadgeMap[m.sentiment]?.icon || Icons.Circle;
                                                                    return <SentimentIcon size={10} className="me-1" />;
                                                                })()}
                                                                {m.sentiment}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="mb-2 mention-text">{m.text}</p>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <Badge bg="light" text="dark">{m.category}</Badge>
                                                        <small className="text-muted d-flex align-items-center gap-2">
                                                            <span><Icons.Heart size={11} className="me-1" />{m.likes}</span>
                                                            <span><Icons.MessageCircle size={11} className="me-1" />{m.comments}</span>
                                                            <span><Icons.Share2 size={11} className="me-1" />{m.shares}</span>
                                                        </small>
                                                    </div>
                                                </Card.Body></Card>
                                            ))}
                                        </div>
                                    </Card.Body></Card>

                                    <div className="alert alert-info mt-3 mb-0"><Icons.Info size={16} className="me-2" />Dados mockados para demonstracao. Em producao os dados serao coletados em tempo real.</div>
                                </div>
                            </SimpleBar>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .sentiment-analysis-page .sent-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
                .sentiment-analysis-page .sent-kpi { border-radius: 12px; }
                .sentiment-analysis-page .sent-kpi-success { border: 1px solid rgba(14, 164, 109, .35); }
                .sentiment-analysis-page .sent-kpi-warning { border: 1px solid rgba(245, 158, 11, .35); }
                .sentiment-analysis-page .sent-kpi-danger { border: 1px solid rgba(239, 68, 68, .35); }
                .sentiment-analysis-page .sent-icon { width: 30px; height: 30px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; }
                .sentiment-analysis-page .sent-icon-success { color: #0ea46d; background: rgba(14, 164, 109, .12); }
                .sentiment-analysis-page .sent-icon-warning { color: #f59e0b; background: rgba(245, 158, 11, .12); }
                .sentiment-analysis-page .sent-icon-danger { color: #ef4444; background: rgba(239, 68, 68, .12); }
                .sentiment-analysis-page .sent-bar { height: 10px; border-radius: 999px; overflow: hidden; display: flex; background: #edf0f3; }
                .sentiment-analysis-page .sent-bar .p { background: #0ea46d; }
                .sentiment-analysis-page .sent-bar .n { background: #f59e0b; }
                .sentiment-analysis-page .sent-bar .ng { background: #ef4444; }
                .sentiment-analysis-page .platform-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
                .sentiment-analysis-page .platform-card { border-radius: 12px; border: 1px solid rgba(15, 23, 42, .14); }
                .sentiment-analysis-page .platform-icon { width: 34px; height: 34px; border-radius: 10px; color: #fff; display: inline-flex; align-items: center; justify-content: center; }
                .sentiment-analysis-page .icon-instagram { background: linear-gradient(135deg, #c13584, #833ab4); }
                .sentiment-analysis-page .icon-facebook { background: #1877f2; }
                .sentiment-analysis-page .icon-tiktok { background: #1f2937; }
                .sentiment-analysis-page .icon-twitter { background: #111827; }
                .sentiment-analysis-page .icon-youtube { background: #ff3b30; }
                .sentiment-analysis-page .tone-instagram { background: rgba(193, 53, 132, .06); border: 1px solid rgba(193, 53, 132, .2); }
                .sentiment-analysis-page .tone-facebook { background: rgba(37, 99, 235, .05); border: 1px solid rgba(37, 99, 235, .2); }
                .sentiment-analysis-page .tone-tiktok { background: rgba(17, 24, 39, .03); border: 1px solid rgba(17, 24, 39, .12); }
                .sentiment-analysis-page .tone-twitter { background: rgba(17, 24, 39, .02); border: 1px solid rgba(17, 24, 39, .12); }
                .sentiment-analysis-page .tone-youtube { background: rgba(255, 59, 48, .05); border: 1px solid rgba(255, 59, 48, .2); }
                .sentiment-analysis-page .category-icon { width: 18px; height: 18px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; }
                .sentiment-analysis-page .category-pink { color: #c026d3; background: rgba(192, 38, 211, .12); }
                .sentiment-analysis-page .category-purple { color: #7c3aed; background: rgba(124, 58, 237, .12); }
                .sentiment-analysis-page .category-blue { color: #2563eb; background: rgba(37, 99, 235, .12); }
                .sentiment-analysis-page .category-orange { color: #d97706; background: rgba(217, 119, 6, .12); }
                .sentiment-analysis-page .mentions-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
                .sentiment-analysis-page .mention-card { border-radius: 12px; border: 1px solid rgba(15, 23, 42, .12); }
                .sentiment-analysis-page .mention-avatar { width: 30px; height: 30px; border-radius: 999px; background: #f1f5f9; color: #0f172a; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; }
                .sentiment-analysis-page .mention-platform-icon { width: 24px; height: 24px; border-radius: 999px; background: #eef2f6; color: #111827; display: inline-flex; align-items: center; justify-content: center; line-height: 1; }
                .sentiment-analysis-page .mention-text { min-height: 56px; }
                .sentiment-analysis-page .sentiment-pill { display: inline-flex; align-items: center; border-radius: 999px; padding: 3px 9px; font-size: 11px; font-weight: 600; line-height: 1; border: 1px solid transparent; }
                .sentiment-analysis-page .sentiment-pill-positive { color: #0ea46d; background: rgba(14, 164, 109, .12); border-color: rgba(14, 164, 109, .35); }
                .sentiment-analysis-page .sentiment-pill-neutral { color: #d97706; background: rgba(217, 119, 6, .12); border-color: rgba(217, 119, 6, .35); }
                .sentiment-analysis-page .sentiment-pill-negative { color: #ef4444; background: rgba(239, 68, 68, .12); border-color: rgba(239, 68, 68, .35); }
                @media (max-width: 991px) { .sentiment-analysis-page .sent-grid, .sentiment-analysis-page .platform-grid, .sentiment-analysis-page .mentions-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
                @media (max-width: 767px) { .sentiment-analysis-page .sent-grid, .sentiment-analysis-page .platform-grid, .sentiment-analysis-page .mentions-grid { grid-template-columns: 1fr; } }
            `}</style>
        </div>
    );
};

export default SentimentDashboard;
