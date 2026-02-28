'use client';
import React, { useState } from 'react';
import SimpleBar from 'simplebar-react';
import classNames from 'classnames';
import { Card, Col, Row, Badge, Button, ProgressBar, Alert } from 'react-bootstrap';
import { TrendingUp, Users, Activity, BarChart, Download, Calendar, CheckCircle } from 'react-feather';
import SystemActivityChart from '@/components/shared-charts/SystemActivityChart';
import ModuleDistributionChart from '@/components/shared-charts/ModuleDistributionChart';
import AdminSidebar from '../../users/AdminSidebar';

const AdminReportsPage = () => {
    const [period, setPeriod] = useState('month');
    const [showSidebar, setShowSidebar] = useState(true);

    // Dados mockados
    const reportData = {
        summary: {
            totalUsers: 247,
            activeUsers: 189,
            totalActions: 125430,
            avgResponseTime: '120ms'
        },
        moduleUsage: [
            {
                name: '📢 MARKETING',
                users: 87,
                actions: 45230,
                percent: 36,
                trend: '+12%',
                color: '#0066FF'
            },
            {
                name: '👥 CITIZEN',
                users: 142,
                actions: 38750,
                percent: 31,
                trend: '+18%',
                color: '#00CC66'
            },
            {
                name: '🎨 STUDIO',
                users: 65,
                actions: 28940,
                percent: 23,
                trend: '+25%',
                color: '#FF3366'
            },
            {
                name: '💰 FINANCEIRO',
                users: 34,
                actions: 12510,
                percent: 10,
                trend: '+8%',
                color: '#FF9900'
            }
        ],
        activityByDay: [
            { day: 'Seg', actions: 18500 },
            { day: 'Ter', actions: 22300 },
            { day: 'Qua', actions: 19800 },
            { day: 'Qui', actions: 21200 },
            { day: 'Sex', actions: 20100 },
            { day: 'Sáb', actions: 15200 },
            { day: 'Dom', actions: 8330 }
        ],
        topFeatures: [
            { feature: 'Chat com Cidadãos', uses: 3456, module: 'CITIZEN' },
            { feature: 'Gerador de Imagens', uses: 2341, module: 'STUDIO' },
            { feature: 'Gestão de Campanhas', uses: 2198, module: 'MARKETING' },
            { feature: 'Análise de Sentimento', uses: 1876, module: 'CITIZEN' },
            { feature: 'Notas Fiscais', uses: 1654, module: 'FINANCEIRO' },
            { feature: 'Gerador de Vídeos', uses: 1432, module: 'STUDIO' },
            { feature: 'Gestão de Leads', uses: 1289, module: 'MARKETING' },
            { feature: 'Gerador de Jingles', uses: 987, module: 'STUDIO' }
        ],
        systemHealth: {
            status: 'healthy',
            uptime: '99.8%',
            apiCalls: '125.4k',
            avgLatency: '120ms',
            errorRate: '0.2%'
        }
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('pt-BR').format(num);
    };

    const getMaxActions = () => {
        return Math.max(...reportData.activityByDay.map(d => d.actions));
    };

    return (
        <div className="hk-pg-body py-0">
            <div className={classNames("fmapp-wrap", { "fmapp-sidebar-toggle": !showSidebar })}>
                <AdminSidebar />
                <div className="fmapp-content">
                    <div className="fmapp-detail-wrap">
                        <header className="contact-header">
                            <div className="d-flex align-items-center">
                                <Button 
                                    variant="flush-dark" 
                                    className="btn-icon btn-rounded flush-soft-hover flex-shrink-0 me-3"
                                    onClick={() => setShowSidebar(!showSidebar)}
                                >
                                    <span className="icon">
                                        <span className="feather-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                                <line x1="3" y1="18" x2="21" y2="18"></line>
                                            </svg>
                                        </span>
                                    </span>
                                </Button>
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb mb-0">
                                        <li className="breadcrumb-item">
                                            <a href="/dashboard-analytics">GovernAI</a>
                                        </li>
                                        <li className="breadcrumb-item">
                                            <a href="#">Admin</a>
                                        </li>
                                        <li className="breadcrumb-item active">Relatórios</li>
                                    </ol>
                                </nav>
                            </div>
                            <div className="contact-options-wrap">
                                <Button variant="outline-primary" size="sm" className="me-2">
                                    <Calendar size={16} className="me-2" />
                                    {period === 'week' && 'Última Semana'}
                                    {period === 'month' && 'Último Mês'}
                                    {period === 'year' && 'Último Ano'}
                                </Button>
                                <Button variant="primary" size="sm">
                                    <Download size={16} className="me-2" />
                                    Exportar
                                </Button>
                            </div>
                        </header>

                        <div className="fm-body">
                            <SimpleBar className="nicescroll-bar">
                                <div className="contact-list-view">
                                    <div className="p-4">
                                        {/* Header */}
                                        <Row className="mb-4">
                                            <Col>
                                                <h3 className="mb-2">
                                                    <BarChart size={24} className="me-2" />
                                                    Relatórios Executivos
                                                </h3>
                                                <p className="text-muted mb-0">
                                                    Análise completa de uso da plataforma - Último mês
                                                </p>
                                            </Col>
                                        </Row>

                                        {/* Status do Sistema */}
                                        <Row className="mb-4">
                                            <Col>
                                                <Alert variant="success" className="d-flex align-items-center">
                                                    <CheckCircle size={20} className="me-3" />
                                                    <div className="flex-grow-1">
                                                        <strong>Sistema Operacional</strong>
                                                        <div className="d-flex gap-4 mt-1">
                                                            <small>Uptime: {reportData.systemHealth.uptime}</small>
                                                            <small>API Calls: {reportData.systemHealth.apiCalls}</small>
                                                            <small>Latência: {reportData.systemHealth.avgLatency}</small>
                                                            <small>Taxa de Erro: {reportData.systemHealth.errorRate}</small>
                                                        </div>
                                                    </div>
                                                </Alert>
                                            </Col>
                                        </Row>

                                        {/* Cards de Resumo */}
                                        <Row className="mb-4">
                                            <Col lg={3} sm={6} className="mb-3">
                                                <Card className="card-border">
                                                    <Card.Body>
                                                        <div className="d-flex align-items-center">
                                                            <div className="avatar avatar-icon avatar-lg avatar-primary avatar-rounded me-3">
                                                                <Users size={24} />
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <div className="text-muted small">Usuários Totais</div>
                                                                <div className="h3 mb-0">{formatNumber(reportData.summary.totalUsers)}</div>
                                                                <small className="text-success">
                                                                    {reportData.summary.activeUsers} ativos
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>

                                            <Col lg={3} sm={6} className="mb-3">
                                                <Card className="card-border">
                                                    <Card.Body>
                                                        <div className="d-flex align-items-center">
                                                            <div className="avatar avatar-icon avatar-lg avatar-success avatar-rounded me-3">
                                                                <Activity size={24} />
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <div className="text-muted small">Ações Totais</div>
                                                                <div className="h3 mb-0">{formatNumber(reportData.summary.totalActions)}</div>
                                                                <small className="text-muted">Último mês</small>
                                                            </div>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>

                                            <Col lg={3} sm={6} className="mb-3">
                                                <Card className="card-border">
                                                    <Card.Body>
                                                        <div className="d-flex align-items-center">
                                                            <div className="avatar avatar-icon avatar-lg avatar-info avatar-rounded me-3">
                                                                <TrendingUp size={24} />
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <div className="text-muted small">Tempo Médio</div>
                                                                <div className="h3 mb-0">{reportData.summary.avgResponseTime}</div>
                                                                <small className="text-success">-15% vs mês anterior</small>
                                                            </div>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>

                                            <Col lg={3} sm={6} className="mb-3">
                                                <Card className="card-border">
                                                    <Card.Body>
                                                        <div className="d-flex align-items-center">
                                                            <div className="avatar avatar-icon avatar-lg avatar-warning avatar-rounded me-3">
                                                                <BarChart size={24} />
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <div className="text-muted small">Crescimento</div>
                                                                <div className="h3 mb-0 text-success">+23%</div>
                                                                <small className="text-muted">vs mês anterior</small>
                                                            </div>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        </Row>

                                        {/* Gráfico de Atividade do Sistema (12 dias) */}
                                        <Row className="mb-4">
                                            <Col xxl={9} lg={8} className="mb-3">
                                                <Card className="card-border">
                                                    <Card.Header>
                                                        <h5 className="mb-0">Atividade do Sistema - Últimos 12 Dias</h5>
                                                        <small className="text-muted">Distribuição de uso por módulo ao longo do tempo</small>
                                                    </Card.Header>
                                                    <Card.Body>
                                                        <SystemActivityChart />
                                                        <div className="separator-full mt-4 mb-3" />
                                                        <Row className="text-center">
                                                            <Col sm={3}>
                                                                <span className="d-block fw-medium fs-7">Total de Ações</span>
                                                                <div className="d-flex align-items-center justify-content-center">
                                                                    <span className="d-block fs-4 fw-medium text-dark mb-0">125.4k</span>
                                                                    <Badge bg="success" className="ms-2">
                                                                        +23%
                                                                    </Badge>
                                                                </div>
                                                            </Col>
                                                            <Col sm={3}>
                                                                <span className="d-block fw-medium fs-7">Usuários Ativos</span>
                                                                <div className="d-flex align-items-center justify-content-center">
                                                                    <span className="d-block fs-4 fw-medium text-dark mb-0">189</span>
                                                                    <Badge bg="success" className="ms-2">
                                                                        +15%
                                                                    </Badge>
                                                                </div>
                                                            </Col>
                                                            <Col sm={3}>
                                                                <span className="d-block fw-medium fs-7">Tempo Médio</span>
                                                                <div className="d-flex align-items-center justify-content-center">
                                                                    <span className="d-block fs-4 fw-medium text-dark mb-0">2m 34s</span>
                                                                    <Badge bg="primary" className="ms-2">
                                                                        -12%
                                                                    </Badge>
                                                                </div>
                                                            </Col>
                                                            <Col sm={3}>
                                                                <span className="d-block fw-medium fs-7">Taxa de Sucesso</span>
                                                                <div className="d-flex align-items-center justify-content-center">
                                                                    <span className="d-block fs-4 fw-medium text-dark mb-0">99.8%</span>
                                                                    <Badge bg="success" className="ms-2">
                                                                        +0.3%
                                                                    </Badge>
                                                                </div>
                                                            </Col>
                                                        </Row>
                                                    </Card.Body>
                                                </Card>
                                            </Col>

                                            <Col xxl={3} lg={4} className="mb-3">
                                                <Card className="card-border h-100">
                                                    <Card.Header>
                                                        <h5 className="mb-0">Distribuição de Uso</h5>
                                                        <small className="text-muted">Por módulo</small>
                                                    </Card.Header>
                                                    <Card.Body className="text-center">
                                                        <ModuleDistributionChart totalValue="189" />
                                                        <div className="d-inline-block mt-3">
                                                            <div className="mb-3">
                                                                <span className="d-block badge-status lh-1">
                                                                    <Badge bg="primary" className="badge-indicator badge-indicator-nobdr d-inline-block me-2" />
                                                                    <span className="badge-label d-inline-block">Marketing</span>
                                                                </span>
                                                                <span className="d-block text-dark fs-5 fw-medium mb-0 mt-1">68%</span>
                                                                <small className="text-muted">87 usuários</small>
                                                            </div>
                                                            <div>
                                                                <span className="badge-status lh-1">
                                                                    <Badge bg="success" className="badge-indicator badge-indicator-nobdr me-2" />
                                                                    <span className="badge-label">Citizen</span>
                                                                </span>
                                                                <span className="d-block text-dark fs-5 fw-medium mb-0 mt-1">75%</span>
                                                                <small className="text-muted">142 usuários</small>
                                                            </div>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        </Row>

                                        {/* Uso por Módulo */}
                                        <Row className="mb-4">
                                            <Col>
                                                <Card className="card-border">
                                                    <Card.Header>
                                                        <h5 className="mb-0">Uso por Módulo</h5>
                                                    </Card.Header>
                                                    <Card.Body>
                                                        {reportData.moduleUsage.map((module, index) => (
                                                            <div key={index} className="mb-4">
                                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                                    <div>
                                                                        <strong>{module.name}</strong>
                                                                        <div className="small text-muted">
                                                                            {formatNumber(module.users)} usuários • {formatNumber(module.actions)} ações
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-end">
                                                                        <div className="h5 mb-0">{module.percent}%</div>
                                                                        <small className="text-success">{module.trend}</small>
                                                                    </div>
                                                                </div>
                                                                <ProgressBar 
                                                                    now={module.percent} 
                                                                    style={{ 
                                                                        height: '8px',
                                                                        backgroundColor: '#e9ecef'
                                                                    }}
                                                                >
                                                                    <div 
                                                                        style={{
                                                                            width: `${module.percent}%`,
                                                                            backgroundColor: module.color,
                                                                            height: '100%'
                                                                        }}
                                                                    />
                                                                </ProgressBar>
                                                            </div>
                                                        ))}
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        </Row>

                                        {/* Gráfico de Atividade Semanal */}
                                        <Row className="mb-4">
                                            <Col md={7}>
                                                <Card className="card-border">
                                                    <Card.Header>
                                                        <h5 className="mb-0">Atividade por Dia da Semana</h5>
                                                    </Card.Header>
                                                    <Card.Body>
                                                        <div style={{ height: '300px' }}>
                                                            {reportData.activityByDay.map((day, index) => {
                                                                const maxActions = getMaxActions();
                                                                const heightPercent = (day.actions / maxActions) * 100;
                                                                return (
                                                                    <div 
                                                                        key={index}
                                                                        className="d-inline-block text-center me-3"
                                                                        style={{ width: '12%' }}
                                                                    >
                                                                        <div className="small text-muted mb-2">
                                                                            {formatNumber(day.actions)}
                                                                        </div>
                                                                        <div 
                                                                            className="bg-primary rounded"
                                                                            style={{ 
                                                                                height: `${heightPercent * 2.5}px`,
                                                                                minHeight: '30px',
                                                                                opacity: 0.8
                                                                            }}
                                                                        />
                                                                        <div className="small fw-medium mt-2">{day.day}</div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>

                                            <Col md={5}>
                                                <Card className="card-border">
                                                    <Card.Header>
                                                        <h5 className="mb-0">Top 8 Funcionalidades</h5>
                                                    </Card.Header>
                                                    <Card.Body className="p-0">
                                                        <div className="table-responsive">
                                                            <table className="table table-sm table-hover mb-0">
                                                                <thead>
                                                                    <tr>
                                                                        <th>#</th>
                                                                        <th>Funcionalidade</th>
                                                                        <th className="text-end">Usos</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {reportData.topFeatures.map((feature, index) => (
                                                                        <tr key={index}>
                                                                            <td>
                                                                                <Badge bg={index < 3 ? 'primary' : 'secondary'}>
                                                                                    {index + 1}
                                                                                </Badge>
                                                                            </td>
                                                                            <td>
                                                                                <div>{feature.feature}</div>
                                                                                <small className="text-muted">{feature.module}</small>
                                                                            </td>
                                                                            <td className="text-end">
                                                                                <strong>{formatNumber(feature.uses)}</strong>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        </Row>

                                        {/* Botões de Exportação */}
                                        <Row>
                                            <Col>
                                                <Card className="card-border">
                                                    <Card.Body>
                                                        <h6 className="mb-3">Exportar Relatório</h6>
                                                        <div className="d-flex gap-2">
                                                            <Button variant="outline-danger">
                                                                <Download size={16} className="me-2" />
                                                                PDF
                                                            </Button>
                                                            <Button variant="outline-success">
                                                                <Download size={16} className="me-2" />
                                                                Excel
                                                            </Button>
                                                            <Button variant="outline-primary">
                                                                <Download size={16} className="me-2" />
                                                                CSV
                                                            </Button>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                            </SimpleBar>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminReportsPage;
