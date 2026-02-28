"use client"
import { Col, Container, Form, InputGroup, Nav, Row, Tab, Card, Badge, ProgressBar } from 'react-bootstrap';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import moment from 'moment';
import { Calendar, TrendingUp, Users, Activity, BarChart2 } from 'react-feather';
import ActiveUserCard from './ActiveUserCard';
import AudienceReviewCard from './AudienceReviewCard';
import ReturningCustomersCard from './ReturningCustomersCard';
import CustomerTable from './CustomerTable';
import ChatBotInterface from '../apps/chat-popup/chat-bot/ChatBotInterface';
import SystemActivityChart from '@/components/shared-charts/SystemActivityChart';
import CampaignPerformanceChart from '@/components/shared-charts/CampaignPerformanceChart';
import CitizenServiceChart from '@/components/shared-charts/CitizenServiceChart';
import RevenueExpenseChart from '@/components/shared-charts/RevenueExpenseChart';

const Dashboard = () => {

    return (
        <>
            <ChatBotInterface show={true} />
            <Container fluid="xxl" >
                <Tab.Container activeKey="overview">
                    {/* Page Header */}
                    <div className="hk-pg-header pg-header-wth-tab pt-7">
                        <div className="d-flex">
                            <div className="d-flex flex-wrap justify-content-between flex-1">
                                <div className="mb-lg-0 mb-2 me-8">
                                    <h1 className="pg-title">Bem Vindo</h1>
                                    <p>Crie páginas usando uma variedade de recursos que aproveitam os componentes do Jampack.</p>
                                </div>
                                <div className="pg-header-action-wrap">
                                    <InputGroup className="w-300p">
                                        <span className="input-affix-wrapper">
                                            <span className="input-prefix">
                                                <span className="feather-icon">
                                                    <Calendar />
                                                </span>
                                            </span>
                                            <DateRangePicker
                                                initialSettings={{
                                                    timePicker: true,
                                                    startDate: moment().startOf('hour').toDate(),
                                                    endDate: moment().startOf('hour').add(32, 'hour').toDate(),
                                                    locale: {
                                                        format: 'M/DD hh:mm A',
                                                    },
                                                }}
                                            >
                                                <Form.Control type="text" name="datetimes" />
                                            </DateRangePicker>
                                        </span>
                                    </InputGroup>
                                </div>
                            </div>
                        </div>
                        <Nav variant="tabs" className="nav-light nav-line">
                            <Nav.Item>
                                <Nav.Link eventKey="overview" >
                                    <span className="nav-link-text">Overview</span>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="demo_nav_1">
                                    <span className="nav-link-text">Analytics</span>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="demo_nav_2">
                                    <span className="nav-link-text">Operations</span>
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </div>
                    {/* /Page Header */}
                    {/* Page Body */}
                    <div className="hk-pg-body">
                        <Tab.Content>
                            <Tab.Pane eventKey="overview" >
                                <Row>
                                    <Col xxl={9} lg={8} md={7} className="mb-md-4 mb-3">
                                        <AudienceReviewCard />
                                    </Col>
                                    <Col xxl={3} lg={4} md={5} className="mb-md-4 mb-3">
                                        <ReturningCustomersCard />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12} className="mb-md-4 mb-3">
                                        <ActiveUserCard />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12} className="mb-md-4 mb-3">
                                        <CustomerTable />
                                    </Col>
                                </Row>
                            </Tab.Pane>
                            
                            <Tab.Pane eventKey="demo_nav_1">
                                {/* Analytics Tab - GovernAI Metrics */}
                                
                                {/* Summary Cards */}
                                <Row className="mb-4">
                                    <Col lg={3} sm={6} className="mb-3">
                                        <Card className="card-border">
                                            <Card.Body>
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar avatar-icon avatar-lg avatar-primary avatar-rounded me-3">
                                                        <Users size={24} />
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <div className="text-muted small">Usuários Ativos</div>
                                                        <div className="h3 mb-0">189</div>
                                                        <small className="text-success">+15% vs mês anterior</small>
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
                                                        <div className="h3 mb-0">125.4k</div>
                                                        <small className="text-success">+23% crescimento</small>
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
                                                        <div className="text-muted small">Taxa de Sucesso</div>
                                                        <div className="h3 mb-0">99.8%</div>
                                                        <small className="text-success">+0.3%</small>
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
                                                        <BarChart2 size={24} />
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <div className="text-muted small">Tempo Médio</div>
                                                        <div className="h3 mb-0">2m 34s</div>
                                                        <small className="text-primary">-12% melhor</small>
                                                    </div>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>

                                {/* System Activity Chart */}
                                <Row className="mb-4">
                                    <Col xxl={9} lg={8} className="mb-3">
                                        <Card className="card-border">
                                            <Card.Header className="card-header-action">
                                                <h6>Atividade do Sistema - GovernAI</h6>
                                                <div className="card-action-wrap">
                                                    <Badge bg="primary">Últimos 12 dias</Badge>
                                                </div>
                                            </Card.Header>
                                            <Card.Body>
                                                <SystemActivityChart />
                                                <div className="separator-full mt-4 mb-3" />
                                                <Row className="text-center">
                                                    <Col sm={4}>
                                                        <span className="d-block fw-medium fs-7 text-muted">Marketing</span>
                                                        <span className="d-block fs-5 fw-medium text-dark">36%</span>
                                                        <small className="text-success">+12%</small>
                                                    </Col>
                                                    <Col sm={4}>
                                                        <span className="d-block fw-medium fs-7 text-muted">Citizen</span>
                                                        <span className="d-block fs-5 fw-medium text-dark">31%</span>
                                                        <small className="text-success">+18%</small>
                                                    </Col>
                                                    <Col sm={4}>
                                                        <span className="d-block fw-medium fs-7 text-muted">Admin</span>
                                                        <span className="d-block fs-5 fw-medium text-dark">23%</span>
                                                        <small className="text-success">+8%</small>
                                                    </Col>
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col xxl={3} lg={4} className="mb-3">
                                        <Card className="card-border h-100">
                                            <Card.Header>
                                                <h6 className="mb-0">Financeiro</h6>
                                                <small className="text-muted">Receitas vs Despesas</small>
                                            </Card.Header>
                                            <Card.Body className="text-center">
                                                <RevenueExpenseChart revenue={500000} expense={387500} />
                                                <div className="mt-3">
                                                    <div className="mb-2">
                                                        <Badge bg="success" className="me-2">Receitas</Badge>
                                                        <span className="fw-medium">R$ 500k</span>
                                                    </div>
                                                    <div>
                                                        <Badge bg="danger" className="me-2">Despesas</Badge>
                                                        <span className="fw-medium">R$ 387.5k</span>
                                                    </div>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>

                                {/* Module Usage */}
                                <Row className="mb-4">
                                    <Col>
                                        <Card className="card-border">
                                            <Card.Header>
                                                <h6 className="mb-0">Uso por Módulo</h6>
                                            </Card.Header>
                                            <Card.Body>
                                                <Row>
                                                    <Col md={3} className="mb-3">
                                                        <div className="text-center p-3 bg-light rounded">
                                                            <div className="display-6 mb-2">📢</div>
                                                            <div className="fw-medium">Marketing</div>
                                                            <div className="h4 mb-1 text-primary">87</div>
                                                            <small className="text-muted">usuários</small>
                                                            <ProgressBar now={36} variant="primary" className="mt-2" style={{ height: '6px' }} />
                                                        </div>
                                                    </Col>
                                                    <Col md={3} className="mb-3">
                                                        <div className="text-center p-3 bg-light rounded">
                                                            <div className="display-6 mb-2">👥</div>
                                                            <div className="fw-medium">Citizen</div>
                                                            <div className="h4 mb-1 text-success">142</div>
                                                            <small className="text-muted">usuários</small>
                                                            <ProgressBar now={31} variant="success" className="mt-2" style={{ height: '6px' }} />
                                                        </div>
                                                    </Col>
                                                    <Col md={3} className="mb-3">
                                                        <div className="text-center p-3 bg-light rounded">
                                                            <div className="display-6 mb-2">🎨</div>
                                                            <div className="fw-medium">Studio</div>
                                                            <div className="h4 mb-1 text-danger">65</div>
                                                            <small className="text-muted">usuários</small>
                                                            <ProgressBar now={23} variant="danger" className="mt-2" style={{ height: '6px' }} />
                                                        </div>
                                                    </Col>
                                                    <Col md={3} className="mb-3">
                                                        <div className="text-center p-3 bg-light rounded">
                                                            <div className="display-6 mb-2">💰</div>
                                                            <div className="fw-medium">Financeiro</div>
                                                            <div className="h4 mb-1 text-warning">34</div>
                                                            <small className="text-muted">usuários</small>
                                                            <ProgressBar now={10} variant="warning" className="mt-2" style={{ height: '6px' }} />
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            </Tab.Pane>
                            
                            <Tab.Pane eventKey="demo_nav_2">
                                {/* Operations Tab - Campaign & Service Charts */}
                                
                                <Row className="mb-4">
                                    <Col lg={12} className="mb-3">
                                        <Card className="card-border">
                                            <Card.Header className="card-header-action">
                                                <h6>📢 Performance de Campanhas</h6>
                                                <div className="card-action-wrap">
                                                    <Badge bg="primary">Marketing</Badge>
                                                </div>
                                            </Card.Header>
                                            <Card.Body>
                                                <CampaignPerformanceChart />
                                                <div className="separator-full mt-4 mb-3" />
                                                <Row className="text-center">
                                                    <Col sm={4}>
                                                        <span className="d-block fw-medium fs-7 text-muted">Facebook Ads</span>
                                                        <span className="d-block fs-5 fw-medium text-dark">5.2k</span>
                                                        <small className="text-success">conversões</small>
                                                    </Col>
                                                    <Col sm={4}>
                                                        <span className="d-block fw-medium fs-7 text-muted">Google Ads</span>
                                                        <span className="d-block fs-5 fw-medium text-dark">2.8k</span>
                                                        <small className="text-success">conversões</small>
                                                    </Col>
                                                    <Col sm={4}>
                                                        <span className="d-block fw-medium fs-7 text-muted">Instagram</span>
                                                        <span className="d-block fs-5 fw-medium text-dark">2.1k</span>
                                                        <small className="text-success">conversões</small>
                                                    </Col>
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>

                                <Row className="mb-4">
                                    <Col lg={12} className="mb-3">
                                        <Card className="card-border">
                                            <Card.Header className="card-header-action">
                                                <h6>👥 Atendimento ao Cidadão</h6>
                                                <div className="card-action-wrap">
                                                    <Badge bg="success">Citizen</Badge>
                                                </div>
                                            </Card.Header>
                                            <Card.Body>
                                                <CitizenServiceChart />
                                                <div className="separator-full mt-4 mb-3" />
                                                <Row className="text-center">
                                                    <Col sm={4}>
                                                        <span className="d-block fw-medium fs-7 text-muted">WhatsApp</span>
                                                        <span className="d-block fs-5 fw-medium text-dark">1.8k</span>
                                                        <small className="text-success">atendimentos</small>
                                                    </Col>
                                                    <Col sm={4}>
                                                        <span className="d-block fw-medium fs-7 text-muted">Chat Web</span>
                                                        <span className="d-block fs-5 fw-medium text-dark">1.1k</span>
                                                        <small className="text-success">atendimentos</small>
                                                    </Col>
                                                    <Col sm={4}>
                                                        <span className="d-block fw-medium fs-7 text-muted">Telefone</span>
                                                        <span className="d-block fs-5 fw-medium text-dark">665</span>
                                                        <small className="text-success">atendimentos</small>
                                                    </Col>
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>

                                {/* Quick Stats */}
                                <Row>
                                    <Col md={4} className="mb-3">
                                        <Card className="card-border">
                                            <Card.Body>
                                                <h6 className="mb-3">📊 Estatísticas Rápidas</h6>
                                                <div className="mb-3">
                                                    <div className="d-flex justify-content-between mb-1">
                                                        <span className="text-muted small">Satisfação</span>
                                                        <strong>96%</strong>
                                                    </div>
                                                    <ProgressBar now={96} variant="success" style={{ height: '6px' }} />
                                                </div>
                                                <div className="mb-3">
                                                    <div className="d-flex justify-content-between mb-1">
                                                        <span className="text-muted small">Resposta em 24h</span>
                                                        <strong>89%</strong>
                                                    </div>
                                                    <ProgressBar now={89} variant="primary" style={{ height: '6px' }} />
                                                </div>
                                                <div>
                                                    <div className="d-flex justify-content-between mb-1">
                                                        <span className="text-muted small">Resolução 1ª Interação</span>
                                                        <strong>72%</strong>
                                                    </div>
                                                    <ProgressBar now={72} variant="info" style={{ height: '6px' }} />
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={4} className="mb-3">
                                        <Card className="card-border">
                                            <Card.Body>
                                                <h6 className="mb-3">🎯 Top Funcionalidades</h6>
                                                <div className="mb-2">
                                                    <div className="d-flex justify-content-between">
                                                        <span className="small">Chat com Cidadãos</span>
                                                        <Badge bg="success">3.4k</Badge>
                                                    </div>
                                                </div>
                                                <div className="mb-2">
                                                    <div className="d-flex justify-content-between">
                                                        <span className="small">Gerador de Imagens</span>
                                                        <Badge bg="primary">2.3k</Badge>
                                                    </div>
                                                </div>
                                                <div className="mb-2">
                                                    <div className="d-flex justify-content-between">
                                                        <span className="small">Gestão de Campanhas</span>
                                                        <Badge bg="info">2.2k</Badge>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="d-flex justify-content-between">
                                                        <span className="small">Análise de Sentimento</span>
                                                        <Badge bg="warning">1.9k</Badge>
                                                    </div>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={4} className="mb-3">
                                        <Card className="card-border">
                                            <Card.Body>
                                                <h6 className="mb-3">⚡ Status do Sistema</h6>
                                                <div className="mb-3">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <span className="small">API Latency</span>
                                                        <span className="text-success fw-medium">120ms</span>
                                                    </div>
                                                </div>
                                                <div className="mb-3">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <span className="small">Uptime</span>
                                                        <span className="text-success fw-medium">99.8%</span>
                                                    </div>
                                                </div>
                                                <div className="mb-3">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <span className="small">Taxa de Erro</span>
                                                        <span className="text-success fw-medium">0.2%</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <span className="small">API Calls</span>
                                                        <span className="text-primary fw-medium">125.4k</span>
                                                    </div>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            </Tab.Pane>
                        </Tab.Content>
                    </div>
                    {/* /Page Body */}
                </Tab.Container>
            </Container>
        </>
    )
}

export default Dashboard
