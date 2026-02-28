'use client';
import React, { useState } from 'react';
import SimpleBar from 'simplebar-react';
import { Card, Col, Row, Badge, Button, Alert, Table, ProgressBar } from 'react-bootstrap';
import { Download, FileText, CheckCircle, AlertTriangle, Calendar } from 'react-feather';
import FinancialHeader from '../FinancialHeader';
import FinancialSidebar from '../FinancialSidebar';

const TSEReportsBody = () => {
    const [generating, setGenerating] = useState(false);

    // Dados mockados
    const tseData = {
        campaign: {
            candidate: 'Marcos Almeida',
            number: '00',
            party: 'PRC - Partido da Renovação Cidadã',
            position: 'Prefeito',
            city: 'São Paulo',
            state: 'SP',
            year: 2026
        },
        financial: {
            totalBudget: 500000,
            totalRevenue: 500000,
            totalExpenses: 387500,
            balance: 112500,
            revenueByType: [
                { type: 'Recursos Próprios', amount: 200000, percent: 40 },
                { type: 'Doações Pessoas Físicas', amount: 150000, percent: 30 },
                { type: 'Doações Pessoas Jurídicas', amount: 100000, percent: 20 },
                { type: 'Fundo Partidário', amount: 50000, percent: 10 }
            ],
            expensesByCategory: [
                { 
                    code: '2',
                    name: 'Propaganda', 
                    limit: 175000, 
                    spent: 155750, 
                    percent: 89,
                    limitPercent: 35,
                    status: 'warning'
                },
                { 
                    code: '1',
                    name: 'Despesas com Pessoal', 
                    limit: 150000, 
                    spent: 108000, 
                    percent: 72,
                    limitPercent: 30,
                    status: 'ok'
                },
                { 
                    code: '4',
                    name: 'Transporte', 
                    limit: 75000, 
                    spent: 73500, 
                    percent: 98,
                    limitPercent: 15,
                    status: 'critical'
                },
                { 
                    code: '5',
                    name: 'Serviços Prestados', 
                    limit: 50000, 
                    spent: 27750, 
                    percent: 55.5,
                    limitPercent: 10,
                    status: 'ok'
                },
                { 
                    code: '3',
                    name: 'Comitê', 
                    limit: 50000, 
                    spent: 22500, 
                    percent: 45,
                    limitPercent: 10,
                    status: 'ok'
                }
            ]
        },
        compliance: {
            overallStatus: 'warning',
            checks: [
                {
                    item: 'Limite de gastos por categoria',
                    status: 'warning',
                    message: '2 categorias próximas do limite'
                },
                {
                    item: 'Documentação fiscal',
                    status: 'success',
                    message: 'Todas as notas fiscais validadas'
                },
                {
                    item: 'Declaração de doadores',
                    status: 'success',
                    message: 'Todos os doadores identificados'
                },
                {
                    item: 'Prestação de contas parcial',
                    status: 'success',
                    message: 'Em dia (última: 15/01/2026)'
                },
                {
                    item: 'Abertura de conta bancária específica',
                    status: 'success',
                    message: 'Banco do Brasil - Ag: 1234-5 / CC: 67890-1'
                }
            ]
        },
        lastReport: {
            period: 'Janeiro/2026',
            generatedAt: '2026-01-15',
            file: 'prestacao-contas-jan2026.zip'
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const getComplianceIcon = (status) => {
        return status === 'success' ? (
            <CheckCircle size={18} className="text-success" />
        ) : (
            <AlertTriangle size={18} className="text-warning" />
        );
    };

    const handleGenerateReport = async () => {
        setGenerating(true);
        await new Promise(resolve => setTimeout(resolve, 3000));
        setGenerating(false);
    };

    return (
        <div className="fm-body">
            <SimpleBar className="nicescroll-bar">
                <div className="container-fluid px-4 py-4">
                        {/* Header da Campanha */}
                        <Row className="mb-4">
                            <Col>
                                <Card className="card-border">
                                    <Card.Body>
                                        <Row>
                                            <Col md={8}>
                                                <h4 className="mb-3">
                                                    📊 Prestação de Contas TSE - {tseData.campaign.year}
                                                </h4>
                                                <div className="mb-2">
                                                    <strong>Candidato:</strong> {tseData.campaign.candidate}
                                                </div>
                                                <div className="mb-2">
                                                    <strong>Número:</strong> {tseData.campaign.number} | 
                                                    <strong className="ms-2">Partido:</strong> {tseData.campaign.party}
                                                </div>
                                                <div className="mb-2">
                                                    <strong>Cargo:</strong> {tseData.campaign.position} | 
                                                    <strong className="ms-2">Município:</strong> {tseData.campaign.city}/{tseData.campaign.state}
                                                </div>
                                            </Col>
                                            <Col md={4} className="text-end">
                                                <div className="mb-2">
                                                    <Badge bg={
                                                        tseData.compliance.overallStatus === 'success' ? 'success' : 
                                                        tseData.compliance.overallStatus === 'warning' ? 'warning' : 'danger'
                                                    } className="p-2">
                                                        {tseData.compliance.overallStatus === 'success' && '✅ Em Conformidade'}
                                                        {tseData.compliance.overallStatus === 'warning' && '⚠️ Atenção Necessária'}
                                                        {tseData.compliance.overallStatus === 'danger' && '🚨 Não Conforme'}
                                                    </Badge>
                                                </div>
                                                <Button 
                                                    variant="primary" 
                                                    size="lg"
                                                    onClick={handleGenerateReport}
                                                    disabled={generating}
                                                >
                                                    {generating ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                                            Gerando...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Download size={18} className="me-2" />
                                                            Gerar Relatório TSE
                                                        </>
                                                    )}
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* Resumo Financeiro */}
                        <Row className="mb-4">
                            <Col lg={3} sm={6} className="mb-3">
                                <Card className="card-border text-center">
                                    <Card.Body>
                                        <div className="text-muted small mb-2">Receitas</div>
                                        <div className="h3 text-success mb-0">
                                            {formatCurrency(tseData.financial.totalRevenue)}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col lg={3} sm={6} className="mb-3">
                                <Card className="card-border text-center">
                                    <Card.Body>
                                        <div className="text-muted small mb-2">Despesas</div>
                                        <div className="h3 text-danger mb-0">
                                            {formatCurrency(tseData.financial.totalExpenses)}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col lg={3} sm={6} className="mb-3">
                                <Card className="card-border text-center">
                                    <Card.Body>
                                        <div className="text-muted small mb-2">Saldo</div>
                                        <div className="h3 text-primary mb-0">
                                            {formatCurrency(tseData.financial.balance)}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col lg={3} sm={6} className="mb-3">
                                <Card className="card-border text-center">
                                    <Card.Body>
                                        <div className="text-muted small mb-2">% Utilizado</div>
                                        <div className="h3 mb-0">
                                            {((tseData.financial.totalExpenses / tseData.financial.totalBudget) * 100).toFixed(1)}%
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* Conformidade TSE */}
                        <Row className="mb-4">
                            <Col>
                                <Card className="card-border">
                                    <Card.Header>
                                        <h5 className="mb-0">
                                            <CheckCircle size={18} className="me-2" />
                                            Checklist de Conformidade TSE
                                        </h5>
                                    </Card.Header>
                                    <Card.Body>
                                        {tseData.compliance.checks.map((check, index) => (
                                            <div key={index} className="d-flex align-items-start mb-3 pb-3 border-bottom">
                                                <div className="me-3">
                                                    {getComplianceIcon(check.status)}
                                                </div>
                                                <div className="flex-grow-1">
                                                    <div><strong>{check.item}</strong></div>
                                                    <small className="text-muted">{check.message}</small>
                                                </div>
                                            </div>
                                        ))}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* Receitas por Tipo */}
                        <Row className="mb-4">
                            <Col md={6}>
                                <Card className="card-border">
                                    <Card.Header>
                                        <h5 className="mb-0">Receitas por Origem</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        {tseData.financial.revenueByType.map((revenue, index) => (
                                            <div key={index} className="mb-3">
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span>{revenue.type}</span>
                                                    <strong>{formatCurrency(revenue.amount)} ({revenue.percent}%)</strong>
                                                </div>
                                                <ProgressBar 
                                                    now={revenue.percent} 
                                                    variant="success"
                                                    style={{ height: '6px' }}
                                                />
                                            </div>
                                        ))}
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* Despesas por Categoria TSE */}
                            <Col md={6}>
                                <Card className="card-border">
                                    <Card.Header>
                                        <h5 className="mb-0">Despesas por Categoria TSE</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <Table size="sm" className="mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Código</th>
                                                    <th>Categoria</th>
                                                    <th className="text-end">Valor</th>
                                                    <th className="text-center">%</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tseData.financial.expensesByCategory.map((category, index) => (
                                                    <tr key={index}>
                                                        <td><Badge bg="secondary">{category.code}</Badge></td>
                                                        <td>{category.name}</td>
                                                        <td className="text-end">
                                                            <strong>{formatCurrency(category.spent)}</strong>
                                                        </td>
                                                        <td className="text-center">
                                                            <Badge bg={
                                                                category.status === 'critical' ? 'danger' :
                                                                category.status === 'warning' ? 'warning' : 'success'
                                                            }>
                                                                {category.percent}%
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td colSpan="2"><strong>Total</strong></td>
                                                    <td className="text-end">
                                                        <strong className="text-primary">
                                                            {formatCurrency(tseData.financial.totalExpenses)}
                                                        </strong>
                                                    </td>
                                                    <td></td>
                                                </tr>
                                            </tfoot>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* Informações sobre Exportação */}
                        <Row>
                            <Col>
                                <Card className="card-border">
                                    <Card.Header>
                                        <h5 className="mb-0">
                                            <FileText size={18} className="me-2" />
                                            Sobre a Exportação para o TSE
                                        </h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <Alert variant="info" className="mb-3">
                                            <strong>Formato de Arquivo:</strong> O sistema gera automaticamente os arquivos no formato exigido pelo TSE (SPCE - Sistema de Prestação de Contas Eleitorais).
                                        </Alert>

                                        <h6 className="mb-3">Arquivos Incluídos no Pacote:</h6>
                                        <ul>
                                            <li>📄 <strong>Receitas.txt</strong> - Detalhamento de todas as receitas</li>
                                            <li>📄 <strong>Despesas.txt</strong> - Detalhamento de todas as despesas</li>
                                            <li>📄 <strong>Doadores.txt</strong> - Relação completa de doadores</li>
                                            <li>📄 <strong>Fornecedores.txt</strong> - Cadastro de fornecedores</li>
                                            <li>📄 <strong>Extrato.txt</strong> - Extrato bancário da conta específica</li>
                                            <li>📁 <strong>Comprovantes/</strong> - PDFs de todas as notas fiscais e recibos</li>
                                        </ul>

                                        <hr />

                                        <div className="mb-3">
                                            <strong>Último Relatório Gerado:</strong>
                                            <div className="d-flex justify-content-between align-items-center mt-2">
                                                <div>
                                                    <Calendar size={16} className="me-2" />
                                                    {tseData.lastReport.period} - Gerado em {new Date(tseData.lastReport.generatedAt).toLocaleDateString('pt-BR')}
                                                </div>
                                                <Button variant="outline-primary" size="sm">
                                                    <Download size={14} className="me-2" />
                                                    Baixar Último Relatório
                                                </Button>
                                            </div>
                                        </div>

                                        <Alert variant="warning" className="mb-0">
                                            <AlertTriangle size={16} className="me-2" />
                                            <strong>Atenção:</strong> Certifique-se de que todas as notas fiscais foram validadas antes de gerar o relatório final para o TSE.
                                        </Alert>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </div>
            </SimpleBar>
        </div>
    );
};

const TSEReports = () => {
    const [showSidebar, setShowSidebar] = React.useState(true);

    return (
        <div className="hk-pg-body py-0">
            <div className={`fmapp-wrap ${!showSidebar ? 'fmapp-sidebar-toggle' : ''}`}>
                <FinancialSidebar />
                <div className="fmapp-content">
                    <div className="fmapp-detail-wrap">
                        <FinancialHeader showSidebar={showSidebar} toggleSidebar={() => setShowSidebar(!showSidebar)} />
                        <TSEReportsBody />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TSEReports;
