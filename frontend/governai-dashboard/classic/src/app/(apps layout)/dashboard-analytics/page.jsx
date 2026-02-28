'use client';
import React, { useState } from 'react';
import { Container, Row, Col, Card, Badge, ProgressBar, Table, Button, Dropdown } from 'react-bootstrap';
import { TrendingUp, Users, Activity, BarChart2, Clock, Download, Search, Calendar, FileText, DollarSign, Shield, Star, Zap, Eye, Check, Instagram } from 'react-feather';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import ChatBotInterface from '../apps/chat-popup/chat-bot/ChatBotInterface';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

/* ============ MOCK DATA ============ */
const producaoTipo = [
    { label: 'Vídeos Gerados', value: 3421, pct: 47, color: '#007D88' },
    { label: 'Imagens Criadas', value: 1893, pct: 82, color: '#FF3366' },
    { label: 'Relatórios Gerados', value: 542, pct: 35, color: '#FF9900' },
    { label: 'Posts Agendados', value: 1120, pct: 68, color: '#25cba1' },
    { label: 'Peças Manuais', value: 311, pct: 22, color: '#6f42c1' },
];

const modulosData = [
    { icon: '📢', name: 'Marketing', users: 87, pct: 36, variant: 'primary', min: 12400, max: null, change: '+12%' },
    { icon: '👥', name: 'Citizen', users: 142, pct: 31, variant: 'success', min: 45200, max: null, change: '+18%' },
    { icon: '🎬', name: 'Studio', users: 65, pct: 23, variant: 'info', min: 8600, max: null, change: '+32%' },
    { icon: '💰', name: 'Financeiro', users: 34, pct: 10, variant: 'warning', min: 5600, max: null, change: '+8%' },
    { icon: '⚙️', name: 'Admin', users: 23, pct: 8, variant: 'secondary', min: 3200, max: null, change: '+5%' },
];

const monitoramentoRedes = [
    { name: 'Carlos Machado', desc: 'Plano de governo com foco em saúde e educação...', followers: '1.243', platform: 'Instagram', img: '/img/monitoramentoSocial/social-post-1.jpg', online: true },
    { name: 'Roberto Lima', desc: 'A atual gestão não entrega resultados...', followers: '878', platform: 'Facebook', img: '/img/monitoramentoSocial/social-post-2.jpg', online: true },
    { name: 'Ana Beatriz', desc: 'Reunião sobre proteção animal com Marcos Almeida...', followers: '654', platform: 'Instagram', img: '/img/monitoramentoSocial/social-post-3.jpg', online: true },
    { name: 'Patricia Souza', desc: '', followers: '', platform: '', img: '/img/monitoramentoSocial/social-post-4.jpg', online: false },
];

const sentimentoData = { positivo: 39.9, neutro: 25, negativo: 35.1, positivoChange: '+2.3%', negativoChange: '+1.5%' };

const temasAlta = [
    { tag: '#SaúdePública', count: 234 },
    { tag: '#EducaçãoParaTodos', count: 189 },
    { tag: '#TransporteUrbano', count: 156 },
];

const intencaoVoto = [
    { name: 'João Silva', partido: 'PMDB', pct: 32, change: '+2.5', color: '#007D88', rank: 15 },
    { name: 'Maria Santos', partido: 'PSDB', pct: 28, change: '+1.2', color: '#0066FF', rank: 45 },
    { name: 'Pedro Costa', partido: 'PT', pct: 22, change: '+0.8', color: '#FF3366', rank: 13 },
    { name: 'Ana Oliveira', partido: 'PDT', pct: 12, change: '+0.5', color: '#FF9900', rank: 12 },
];

const regiaoData = [
    { label: 'Centro', pct: 30, color: '#007D88' },
    { label: 'Zona Norte', pct: 25, color: '#25cba1' },
    { label: 'Zona Sul', pct: 20, color: '#FF9900' },
    { label: 'Z. Leste/Oeste', pct: 25, color: '#6f42c1' },
];

const logsData = [
    { dot: '#25cba1', name: 'Admin Carlos', action: 'Exportou relatório financeiro', dept: 'Financeiro', time: 'Há 12 min' },
    { dot: '#FF9900', name: 'Maria Silva', action: 'Alterou configuração de campanha', dept: 'Marketing', time: 'Há 34 min' },
    { dot: '#0066FF', name: 'Sistema', action: 'Backup automático concluído', dept: 'Admin', time: 'Há 1h' },
    { dot: '#FF3366', name: 'João Santos', action: 'Acesso negado - tentativa de exportação', dept: 'Citizen', time: 'Há 2h' },
    { dot: '#25cba1', name: 'Ana Pereira', action: 'Gerou 15 imagens via Studio', dept: 'Studio', time: 'Há 3h' },
    { dot: '#25cba1', name: 'Sistema', action: 'Alerta de limite orçamentário atingido (80%)', dept: 'Financeiro', time: 'Há 4h' },
    { dot: '#25cba1', name: 'Roberto Alves', action: 'Criou nova campanha WhatsApp', dept: 'Marketing', time: 'Há 5h' },
];

const relatoriosAuto = [
    { icon: <FileText size={18} />, title: 'Relatório Executivo', desc: 'Visão consolidada de todos os módulos' },
    { icon: <Search size={18} />, title: 'Relatório de Campanha', desc: 'Performance detalhada por campanha' },
    { icon: <DollarSign size={18} />, title: 'Relatório Financeiro', desc: 'Receitas, despesas e projeções' },
    { icon: <Activity size={18} />, title: 'Relatório de Engajamento', desc: 'Métricas de interação social' },
    { icon: <Shield size={18} />, title: 'Relatório de Crise', desc: 'Incidentes e ações de resposta' },
];

/* ============ INLINE CHARTS ============ */

const ProgressoRadialChart = () => {
    const options = {
        chart: { type: 'radialBar', height: 120, sparkline: { enabled: true } },
        plotOptions: { radialBar: { hollow: { size: '55%' }, dataLabels: { name: { show: false }, value: { fontSize: '18px', fontWeight: 600, show: true } } } },
        colors: ['#007D88'],
    };
    return <ReactApexChart options={options} series={[72]} type="radialBar" height={120} />;
};

const AtividadeAreaChart = () => {
    const options = {
        chart: { type: 'area', height: 260, toolbar: { show: false }, foreColor: '#646A71', fontFamily: 'DM Sans' },
        grid: { borderColor: '#F4F5F6' },
        stroke: { curve: 'smooth', width: 2 },
        colors: ['#007D88', '#25cba1', '#FF9900'],
        xaxis: { categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'] },
        dataLabels: { enabled: false },
        legend: { show: true, position: 'top', fontSize: '12px', markers: { size: 5, shape: 'circle' } },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05 } },
    };
    const series = [
        { name: 'Marketing', data: [30, 40, 45, 50, 49, 60, 55, 70, 65, 80, 75, 90] },
        { name: 'Citizen', data: [20, 25, 30, 35, 40, 38, 45, 42, 50, 48, 55, 60] },
        { name: 'Studio', data: [10, 15, 18, 20, 22, 25, 28, 30, 32, 35, 38, 40] },
    ];
    return <ReactApexChart options={options} series={series} type="area" height={260} />;
};

const BalancoDonutChart = () => {
    const options = {
        chart: { type: 'donut', height: 200 },
        labels: ['Receitas', 'Despesas'],
        colors: ['#25cba1', '#FF3366'],
        plotOptions: { pie: { donut: { size: '70%', labels: { show: true, total: { show: true, label: 'Total', formatter: () => 'R$ 112k' } } } } },
        dataLabels: { enabled: false },
        legend: { show: false },
    };
    return <ReactApexChart options={options} series={[68500, 30126]} type="donut" height={200} />;
};

const MarketingBarChart = () => {
    const options = {
        chart: { type: 'bar', height: 220, toolbar: { show: false }, foreColor: '#646A71', fontFamily: 'DM Sans', stacked: true },
        plotOptions: { bar: { horizontal: false, columnWidth: '45%', borderRadius: 4, borderRadiusApplication: 'end', borderRadiusWhenStacked: 'last' } },
        grid: { borderColor: '#F4F5F6' },
        colors: ['#007D88', '#25cba1', '#ebf3fe'],
        xaxis: { categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'] },
        dataLabels: { enabled: false },
        legend: { show: true, position: 'top', fontSize: '12px', markers: { size: 5, shape: 'circle' } },
    };
    const series = [
        { name: 'Impressões', data: [420, 530, 380, 620, 510, 580] },
        { name: 'Cliques', data: [180, 280, 240, 200, 190, 310] },
        { name: 'Conversões', data: [80, 120, 90, 140, 110, 130] },
    ];
    return <ReactApexChart options={options} series={series} type="bar" height={220} />;
};

const MarketingDonutChart = () => {
    const options = {
        chart: { type: 'donut', height: 200 },
        labels: ['Instagram Ads', 'Facebook Ads', 'Google Ads'],
        colors: ['#007D88', '#25cba1', '#FF9900'],
        plotOptions: { pie: { donut: { size: '65%' } } },
        dataLabels: { enabled: false },
        legend: { show: true, position: 'bottom', fontSize: '11px' },
    };
    return <ReactApexChart options={options} series={[45, 35, 20]} type="donut" height={200} />;
};

const SentimentoPieChart = () => {
    const options = {
        chart: { type: 'pie', height: 180 },
        labels: ['Positivo', 'Neutro', 'Negativo'],
        colors: ['#25cba1', '#FF9900', '#FF3366'],
        dataLabels: { enabled: true, style: { fontSize: '11px' } },
        legend: { show: true, position: 'bottom', fontSize: '11px' },
    };
    return <ReactApexChart options={options} series={[39, 26, 35]} type="pie" height={180} />;
};

const FinanceiroLineChart = () => {
    const options = {
        chart: { type: 'bar', height: 260, toolbar: { show: false }, foreColor: '#646A71', fontFamily: 'DM Sans' },
        plotOptions: { bar: { columnWidth: '55%', borderRadius: 2 } },
        stroke: { width: [0, 0, 3], curve: 'smooth', dashArray: [0, 0, 6] },
        colors: ['#25cba1', '#FF3366', '#FF9900'],
        xaxis: { categories: ['Set', 'Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr'] },
        yaxis: { labels: { formatter: (v) => `${Math.round(v / 1000)}k` } },
        dataLabels: { enabled: false },
        legend: { show: true, position: 'bottom', fontSize: '12px', markers: { width: 10, height: 10, radius: 2 } },
        grid: { borderColor: '#F4F5F6' },
        tooltip: { y: { formatter: (v) => `R$ ${(v / 1000).toFixed(0)}k` } },
    };
    const series = [
        { name: 'Receita', type: 'bar', data: [380000, 420000, 450000, 400000, 480000, 520000, null, null] },
        { name: 'Despesa', type: 'bar', data: [300000, 280000, 350000, 380000, 400000, 380000, null, null] },
        { name: 'Projeção', type: 'line', data: [null, null, null, null, 480000, 530000, 550000, 500000] },
    ];
    return <ReactApexChart options={options} series={series} type="line" height={260} />;
};

const OrcamentoHorizontalBars = () => {
    const items = [
        { label: 'Mídia Digital', pct: 80, limite: 'R$ 120k', color: '#007D88' },
        { label: 'Eventos', pct: 45, limite: 'R$ 80k', color: '#25cba1' },
        { label: 'Pessoal', pct: 92, limite: 'R$ 200k', color: '#25cba1' },
        { label: 'Logística', pct: 33, limite: 'R$ 50k', color: '#25cba1' },
        { label: 'Comunicação', pct: 67, limite: 'R$ 90k', color: '#25cba1' },
    ];
    return (
        <div>
            {items.map((item, i) => (
                <div key={i} className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                        <div>
                            <span className="small fw-medium d-block">{item.label}</span>
                            <span className="text-muted" style={{ fontSize: 10 }}>Limite: {item.limite}</span>
                        </div>
                        <span className="small fw-bold" style={{ color: item.pct >= 90 ? '#FF3366' : '#25cba1' }}>{item.pct}%</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                        <div className="progress-bar" style={{ width: `${item.pct}%`, backgroundColor: item.color, borderRadius: '4px' }} />
                    </div>
                </div>
            ))}
        </div>
    );
};

/* ============ MODULE SECTIONS CONFIG ============ */
const MODULES_LIST = [
    { key: 'studio', label: 'Studio', icon: '🎨', color: '#6f42c1' },
    { key: 'kpis', label: 'KPIs Principais', icon: '✅', color: '#25cba1' },
    { key: 'atividade', label: 'Atividade do Sistema', icon: '✅', color: '#25cba1' },
    { key: 'modulos', label: 'Uso por Módulo', icon: '✅', color: '#FF9900' },
    { key: 'marketing', label: 'Marketing', icon: '📢', color: '#FF3366' },
    { key: 'citizen', label: 'Citizen', icon: '✅', color: '#25cba1' },
    { key: 'financeiro', label: 'Financeiro', icon: '💰', color: '#FF9900' },
    { key: 'relatoriosAuto', label: 'Relatórios Automatizados', icon: '✅', color: '#6f42c1' },
    { key: 'logs', label: 'Logs e Auditoria', icon: '🔍', color: '#007D88' },
];

const DATE_OPTIONS = ['Hoje', '7 dias', '30 dias', 'Personalizado'];

/* ============ MAIN COMPONENT ============ */
const Relatorios = () => {
    const [visibleModules, setVisibleModules] = useState(
        MODULES_LIST.reduce((acc, m) => ({ ...acc, [m.key]: true }), {})
    );
    const [dateRange, setDateRange] = useState('30 dias');

    const toggleModule = (key) => {
        setVisibleModules(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const activeCount = Object.values(visibleModules).filter(Boolean).length;

    return (
        <>
            <ChatBotInterface show={true} />
            <Container fluid="xxl">
                {/* Page Header */}
                <div className="hk-pg-header pt-7">
                    {/* Top bar: Filters right-aligned */}
                    <div className="d-flex justify-content-end align-items-center gap-2 mb-4 flex-wrap">
                        {/* Dropdown Módulos */}
                        <Dropdown autoClose="outside">
                            <Dropdown.Toggle variant="outline-secondary" size="sm" className="d-flex align-items-center gap-1">
                                <Eye size={14} /> Módulos ({activeCount}/{MODULES_LIST.length})
                            </Dropdown.Toggle>
                            <Dropdown.Menu style={{ minWidth: 240, padding: '8px 0' }}>
                                {MODULES_LIST.map((mod) => (
                                    <Dropdown.Item
                                        key={mod.key}
                                        as="button"
                                        className="d-flex align-items-center gap-2 py-2"
                                        onClick={() => toggleModule(mod.key)}
                                        active={false}
                                        style={{ backgroundColor: visibleModules[mod.key] ? '#f0fdf4' : 'transparent' }}
                                    >
                                        {visibleModules[mod.key] ? (
                                            <Check size={14} className="text-success" />
                                        ) : (
                                            <span style={{ width: 14, display: 'inline-block' }} />
                                        )}
                                        <span>{mod.icon}</span>
                                        <span className="small">{mod.label}</span>
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>

                        <div className="position-relative" style={{ width: 180 }}>
                            <Search size={14} className="text-muted" style={{ position: 'absolute', left: 10, top: 8 }} />
                            <input type="text" className="form-control form-control-sm" placeholder="Buscar..." style={{ paddingLeft: 30 }} />
                        </div>

                        {/* Dropdown Período */}
                        <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" size="sm" className="d-flex align-items-center gap-1">
                                {dateRange}
                            </Dropdown.Toggle>
                            <Dropdown.Menu style={{ minWidth: 160 }}>
                                {DATE_OPTIONS.map((opt) => (
                                    <Dropdown.Item
                                        key={opt}
                                        as="button"
                                        className="d-flex align-items-center gap-2 py-2"
                                        onClick={() => setDateRange(opt)}
                                        style={{ backgroundColor: dateRange === opt ? '#f0fdf4' : 'transparent' }}
                                    >
                                        {dateRange === opt && <Check size={14} className="text-success" />}
                                        <span className="small">{opt}</span>
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>

                        <Button variant="outline-secondary" size="sm">
                            <Download size={14} className="me-1" /> Exportar
                        </Button>
                    </div>

                    {/* Title + Stats on same row */}
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-3" style={{ minHeight: 80 }}>
                        <div className="d-flex flex-column justify-content-center">
                            <h1 className="mb-1" style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2 }}>Relatórios – <strong>GovernAI</strong></h1>
                            <p className="mb-0" style={{ fontSize: '1.15rem', color: '#6c757d' }}>Monitore centralizadamente de todos os módulos da plataforma</p>
                        </div>
                        <div className="d-flex align-items-center gap-4">
                            <div className="text-center">
                                <div className="h3 mb-0 text-dark">189</div>
                                <small className="text-muted">Usuários</small>
                            </div>
                            <div className="text-center">
                                <div className="h3 mb-0 text-dark">56</div>
                                <small className="text-muted">Campanhas</small>
                            </div>
                            <div className="text-center">
                                <div className="h3 mb-0 text-dark">203</div>
                                <small className="text-muted">Projetos</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page Body */}
                <div className="hk-pg-body">

                    {/* === SECTION: Status + Últimos Posts === */}
                    <Row className="mb-4">
                        <Col lg={5} className="mb-3">
                            <Row>
                                <Col sm={6} className="mb-3">
                                    <Card className="card-border h-100">
                                        <Card.Body className="text-center">
                                            <small className="text-muted">Progresso</small>
                                            <div className="h2 mb-0 mt-1">5.6k</div>
                                            <small className="text-muted">de 8k planejado</small>
                                            <ProgressoRadialChart />
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col sm={6} className="mb-3">
                                    <Card className="card-border h-100">
                                        <Card.Body className="text-center">
                                            <small className="text-muted">Créditos</small>
                                            <div className="d-flex align-items-center justify-content-center mt-1">
                                                <span className="h2 mb-0">18.2k</span>
                                            </div>
                                            <Badge bg="success" className="mt-2">+11.5% utilizados</Badge>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                            {/* Produção por Tipo */}
                            <Card className="card-border mt-0">
                                <Card.Body>
                                    <h6 className="mb-3">Produção por Tipo</h6>
                                    {producaoTipo.map((item, i) => (
                                        <div key={i} className="mb-2">
                                            <div className="d-flex justify-content-between mb-1">
                                                <span className="small">{item.label}</span>
                                                <span className="small fw-medium">{item.value.toLocaleString()}</span>
                                            </div>
                                            <div className="progress" style={{ height: '6px' }}>
                                                <div className="progress-bar" style={{ width: `${item.pct}%`, backgroundColor: item.color, borderRadius: '3px' }} />
                                            </div>
                                        </div>
                                    ))}
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={7} className="mb-3">
                            <Card className="card-border h-100">
                                <Card.Header className="card-header-action">
                                    <h6 className="mb-0">Últimos posts gerados</h6>
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        {[1, 2, 3].map((n) => (
                                            <Col md={4} key={n} className="mb-2">
                                                <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', height: 260 }}>
                                                    <Image
                                                        src={`/img/moke/relatorios/relatorio-img-${n}.jpeg`}
                                                        alt={`Post ${n}`}
                                                        fill
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                </div>
                                            </Col>
                                        ))}
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* === SECTION: KPI Cards === */}
                    <Row className="mb-4">
                        {[
                            { icon: <Users size={20} />, label: 'Estudos feitos', value: '189', change: '+19%', up: true, variant: 'primary' },
                            { icon: <Activity size={20} />, label: 'Ações Total', value: '125.4k', change: '+12%', up: true, variant: 'success' },
                            { icon: <TrendingUp size={20} />, label: 'Taxa de Sucesso', value: '99.8%', change: '+10.3%', up: true, variant: 'info' },
                            { icon: <Clock size={20} />, label: 'Tempo Médio', value: '2m 34s', change: '-12%', up: true, variant: 'warning' },
                            { icon: <Zap size={20} />, label: 'Crescimento', value: '+18.7%', change: '+15.2%', up: true, variant: 'danger' },
                        ].map((kpi, i) => (
                            <Col key={i} className="mb-3">
                                <Card className="card-border">
                                    <Card.Body>
                                        <div className="d-flex align-items-center mb-2">
                                            <div className={`avatar avatar-icon avatar-sm avatar-${kpi.variant} avatar-rounded me-2`}>
                                                {kpi.icon}
                                            </div>
                                            <span className="text-muted small">{kpi.label}</span>
                                        </div>
                                        <div className="h3 mb-1">{kpi.value}</div>
                                        <small className="text-success">{kpi.change}</small>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {/* === SECTION: Atividade do Sistema + Balanço === */}
                    <Row className="mb-4">
                        <Col xxl={6} lg={6} className="mb-3">
                            <Card className="card-border h-100">
                                <Card.Header className="card-header-action">
                                    <h6 className="mb-0">Atividade do Sistema</h6>
                                    <div className="card-action-wrap">
                                        <Badge bg="primary">Últimos 12 meses</Badge>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <AtividadeAreaChart />
                                    <div className="separator-full mt-3 mb-2" />
                                    <Row className="text-center">
                                        <Col sm={4}><span className="d-block small text-muted">Marketing</span><span className="fw-medium">36%</span></Col>
                                        <Col sm={4}><span className="d-block small text-muted">Citizen</span><span className="fw-medium">31%</span></Col>
                                        <Col sm={4}><span className="d-block small text-muted">Studio</span><span className="fw-medium">23%</span></Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xxl={6} lg={6} className="mb-3">
                            <Card className="card-border h-100">
                                <Card.Header>
                                    <h6 className="mb-0">Balanço</h6>
                                    <small className="text-muted">Receitas vs Despesas</small>
                                </Card.Header>
                                <Card.Body className="text-center">
                                    <BalancoDonutChart />
                                    <div className="mt-2">
                                        <div className="mb-1"><Badge bg="success" className="me-1">Receitas</Badge><span className="small fw-medium">R$ 68.500</span></div>
                                        <div><Badge bg="danger" className="me-1">Despesas</Badge><span className="small fw-medium">R$ 30.126</span></div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* === SECTION: Uso por Módulo === */}
                    <Row className="mb-4">
                        <Col>
                            <Card className="card-border">
                                <Card.Header>
                                    <h6 className="mb-0">Uso por Módulo</h6>
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        {modulosData.map((mod, i) => (
                                            <Col key={i} className="mb-3">
                                                <div className="text-center p-3 bg-light rounded">
                                                    <div className="display-6 mb-2">{mod.icon}</div>
                                                    <div className="fw-medium">{mod.name}</div>
                                                    <div className={`h4 mb-1 text-${mod.variant}`}>{mod.users}</div>
                                                    <small className="text-muted">usuários</small>
                                                    <ProgressBar now={mod.pct} variant={mod.variant} className="mt-2" style={{ height: '6px' }} />
                                                    <div className="d-flex justify-content-between mt-1">
                                                        <span style={{ fontSize: 10 }} className="text-muted">{mod.min.toLocaleString()}</span>
                                                        <span style={{ fontSize: 10 }} className="text-success">{mod.change}</span>
                                                    </div>
                                                </div>
                                            </Col>
                                        ))}
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* === SECTION: Analytics de Marketing === */}
                    <Row className="mb-4">
                        <Col>
                            <Card className="card-border">
                                <Card.Header>
                                    <h6 className="mb-0">Analytics de Marketing</h6>
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col lg={2}>
                                            <div className="mb-3">
                                                <small className="text-muted">Campanhas</small>
                                                <div className="h3 mb-0">1,247</div>
                                                <Badge bg="success">23.5%</Badge>
                                            </div>
                                            <div>
                                                <small className="text-muted">Publicações</small>
                                                <div className="h3 mb-0">342</div>
                                                <Badge bg="info">14.11%</Badge>
                                            </div>
                                        </Col>
                                        <Col lg={6}>
                                            <MarketingBarChart />
                                        </Col>
                                        <Col lg={4}>
                                            <MarketingDonutChart />
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* === SECTION: Análises de Crises === */}
                    <Row className="mb-4">
                        <Col>
                            <Card className="card-border">
                                <Card.Header>
                                    <h6 className="mb-0">Análises de Crises</h6>
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        {/* Monitoramento de Redes */}
                                        <Col lg={4} className="mb-3">
                                            <div className="p-3 border rounded h-100" style={{ borderColor: '#f0e0e8' }}>
                                                <div className="d-flex justify-content-between align-items-start mb-1">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#fce4ec', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Instagram size={14} style={{ color: '#e1306c' }} />
                                                        </div>
                                                        <h6 className="mb-0" style={{ fontSize: 14 }}>Monitoramento de Redes</h6>
                                                    </div>
                                                    <span style={{ cursor: 'pointer', fontSize: 14, color: '#999' }}>↗</span>
                                                </div>
                                                <small className="text-muted d-block mb-3" style={{ fontSize: 11, paddingLeft: 40 }}>5 perfis · 18 posts hoje</small>

                                                {monitoramentoRedes.map((u, i) => (
                                                    <div key={i} className="d-flex align-items-center mb-3" style={{ minHeight: 48 }}>
                                                        <div style={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, position: 'relative', border: '2px solid #eee' }} className="me-3">
                                                            <Image src={u.img} alt={u.name} fill style={{ objectFit: 'cover' }} />
                                                        </div>
                                                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                                            <div className="d-flex align-items-center gap-1">
                                                                <span style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</span>
                                                                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: u.online ? '#25cba1' : '#ccc', display: 'inline-block', flexShrink: 0 }} />
                                                            </div>
                                                            {u.desc && <div className="text-muted" style={{ fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.desc}</div>}
                                                            {u.followers && (
                                                                <div className="d-flex align-items-center gap-2 mt-1">
                                                                    <span style={{ fontSize: 11, color: '#999' }}>♡ {u.followers}</span>
                                                                    <span style={{ fontSize: 11, color: '#999' }}>{u.platform}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}

                                                <div className="text-center pt-2" style={{ borderTop: '1px solid #f0f0f0' }}>
                                                    <small style={{ color: '#d63384', fontWeight: 500, cursor: 'pointer', fontSize: 12 }}>Ver todos os posts →</small>
                                                </div>
                                            </div>
                                        </Col>
                                        {/* Análise de Sentimento */}
                                        <Col lg={4} className="mb-3">
                                            <div className="p-3 border rounded h-100">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <div className="d-flex align-items-center">
                                                        <span className="me-2" style={{ color: '#25cba1' }}>😊</span>
                                                        <h6 className="mb-0">Análise de Sentimento</h6>
                                                    </div>
                                                    <span style={{ cursor: 'pointer' }}>↗</span>
                                                </div>
                                                <small className="text-muted d-block mb-3">1.247 menções analisadas</small>
                                                {/* Horizontal stacked bar */}
                                                <div className="d-flex rounded overflow-hidden mb-3" style={{ height: 28 }}>
                                                    <div className="d-flex align-items-center justify-content-center text-white fw-medium" style={{ width: `${sentimentoData.positivo}%`, backgroundColor: '#25cba1', fontSize: 11 }}>{sentimentoData.positivo}%</div>
                                                    <div className="d-flex align-items-center justify-content-center text-white fw-medium" style={{ width: `${sentimentoData.neutro}%`, backgroundColor: '#FF9900', fontSize: 11 }}>{sentimentoData.neutro}%</div>
                                                    <div className="d-flex align-items-center justify-content-center text-white fw-medium" style={{ width: `${sentimentoData.negativo}%`, backgroundColor: '#FF3366', fontSize: 11 }}>{sentimentoData.negativo}%</div>
                                                </div>
                                                {/* Sentiment circles */}
                                                <Row className="text-center mb-3">
                                                    <Col>
                                                        <div style={{ fontSize: 24 }}>😊</div>
                                                        <div className="fw-bold" style={{ color: '#25cba1' }}>{sentimentoData.positivo}%</div>
                                                        <div className="text-muted" style={{ fontSize: 10 }}>Positivo</div>
                                                        <small className="text-success" style={{ fontSize: 10 }}>↑ {sentimentoData.positivoChange}</small>
                                                    </Col>
                                                    <Col>
                                                        <div style={{ fontSize: 24 }}>😐</div>
                                                        <div className="fw-bold" style={{ color: '#FF9900' }}>{sentimentoData.neutro}%</div>
                                                        <div className="text-muted" style={{ fontSize: 10 }}>Neutro</div>
                                                    </Col>
                                                    <Col>
                                                        <div style={{ fontSize: 24 }}>😞</div>
                                                        <div className="fw-bold" style={{ color: '#FF3366' }}>{sentimentoData.negativo}%</div>
                                                        <div className="text-muted" style={{ fontSize: 10 }}>Negativo</div>
                                                        <small className="text-danger" style={{ fontSize: 10 }}>↑ {sentimentoData.negativoChange}</small>
                                                    </Col>
                                                </Row>
                                                {/* Temas em Alta */}
                                                <div className="small fw-medium text-muted mb-2">TEMAS EM ALTA</div>
                                                {temasAlta.map((t, i) => (
                                                    <div key={i} className="d-flex justify-content-between align-items-center mb-2">
                                                        <span className="small fw-medium">{t.tag}</span>
                                                        <div className="d-flex align-items-center gap-1">
                                                            <span className="small text-muted">{t.count}</span>
                                                            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#FF3366', display: 'inline-block' }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </Col>
                                        {/* Intenção de Voto */}
                                        <Col lg={4} className="mb-3">
                                            <div className="p-3 border rounded h-100">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <div className="d-flex align-items-center">
                                                        <span className="me-2">📊</span>
                                                        <h6 className="mb-0">Intenção de Voto</h6>
                                                    </div>
                                                    <span style={{ cursor: 'pointer' }}>↗</span>
                                                </div>
                                                <small className="text-muted d-block mb-3">1.000 entrevistados · 1° Turno</small>
                                                {intencaoVoto.map((c, i) => (
                                                    <div key={i} className="d-flex align-items-center justify-content-between mb-3">
                                                        <div className="d-flex align-items-center">
                                                            <div className="avatar avatar-xs avatar-rounded me-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: c.color, color: '#fff', fontSize: 10, fontWeight: 600, width: 28, height: 28 }}>
                                                                {c.rank}
                                                            </div>
                                                            <div>
                                                                <div className="small fw-medium">{c.name}</div>
                                                                <div className="text-muted" style={{ fontSize: 10 }}>{c.partido}</div>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <span className="fw-bold">{c.pct}%</span>
                                                            <small className="text-success">↑{c.change}</small>
                                                        </div>
                                                    </div>
                                                ))}
                                                {/* Por Região */}
                                                <div className="small fw-medium text-muted mb-2 mt-3">POR REGIÃO</div>
                                                <div className="d-flex rounded overflow-hidden mb-2" style={{ height: 8 }}>
                                                    {regiaoData.map((r, i) => (
                                                        <div key={i} style={{ width: `${r.pct}%`, backgroundColor: r.color }} />
                                                    ))}
                                                </div>
                                                <div className="d-flex flex-wrap justify-content-between" style={{ gap: '2px 12px' }}>
                                                    {regiaoData.map((r, i) => (
                                                        <div key={i} className="d-flex align-items-center gap-1">
                                                            <span style={{ fontSize: 11, color: r.color, fontWeight: 600 }}>{r.label}</span>
                                                            <span style={{ fontSize: 11, color: '#999' }}>{r.pct}%</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* === SECTION: Analytics Financeiro === */}
                    <Row className="mb-4">
                        <Col>
                            <Card className="card-border">
                                <Card.Header>
                                    <div className="d-flex align-items-center gap-2">
                                        <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <DollarSign size={14} style={{ color: '#25cba1' }} />
                                        </div>
                                        <h6 className="mb-0">Analytics Financeiro</h6>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col lg={7}>
                                            <small className="text-muted fw-medium">Receita vs Despesa + Projeção</small>
                                            <FinanceiroLineChart />
                                        </Col>
                                        <Col lg={5}>
                                            <small className="text-muted fw-medium">Execução Orçamentária</small>
                                            <div className="mt-3">
                                                <OrcamentoHorizontalBars />
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* === SECTION: Relatórios Automatizados === */}
                    <Row className="mb-4">
                        <Col>
                            <Card className="card-border">
                                <Card.Header className="card-header-action">
                                    <div className="d-flex align-items-center gap-2">
                                        <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#e0f2f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FileText size={14} style={{ color: '#007D88' }} />
                                        </div>
                                        <h6 className="mb-0">Relatórios Automatizados</h6>
                                    </div>
                                    <Button variant="success" size="sm" className="rounded-pill px-3">
                                        <Download size={14} className="me-1" />Gerar Consolidado
                                    </Button>
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        {relatoriosAuto.map((r, i) => (
                                            <Col key={i} className="mb-3">
                                                <div className="text-center p-3 border rounded-3 h-100" style={{ cursor: 'pointer', borderColor: '#e8e8e8' }}>
                                                    <div className="mx-auto mb-2" style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #007D88', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#007D88' }}>
                                                        {r.icon}
                                                    </div>
                                                    <div className="fw-medium small mt-2">{r.title}</div>
                                                    <div className="text-muted" style={{ fontSize: 11 }}>{r.desc}</div>
                                                </div>
                                            </Col>
                                        ))}
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* === SECTION: Logs e Auditoria === */}
                    <Row className="mb-4">
                        <Col>
                            <Card className="card-border">
                                <Card.Header className="card-header-action">
                                    <div className="d-flex align-items-center gap-2">
                                        <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#e0f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Clock size={14} style={{ color: '#007D88' }} />
                                        </div>
                                        <h6 className="mb-0">Logs e Auditoria</h6>
                                    </div>
                                    <Button variant="outline-secondary" size="sm"><Download size={14} className="me-1" />Exportar</Button>
                                </Card.Header>
                                <Card.Body>
                                    {logsData.map((log, i) => (
                                        <div key={i} className="d-flex align-items-center py-3" style={{ borderBottom: i < logsData.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                                            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: log.dot, flexShrink: 0 }} className="me-3" />
                                            <span className="fw-medium me-3" style={{ fontSize: 13, minWidth: 110 }}>{log.name}</span>
                                            <span className="text-muted flex-grow-1" style={{ fontSize: 13 }}>{log.action}</span>
                                            <Badge bg="light" text="dark" className="me-3" style={{ border: '1px solid #e0e0e0', fontWeight: 500, fontSize: 11 }}>{log.dept}</Badge>
                                            <span className="text-muted" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{log.time}</span>
                                        </div>
                                    ))}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                </div>
                {/* /Page Body */}
            </Container>
        </>
    );
};

export default Relatorios;
