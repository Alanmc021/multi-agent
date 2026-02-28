'use client';
import React, { useState, useEffect } from 'react';
import SimpleBar from 'simplebar-react';
import { Card, Col, Row, ProgressBar, Badge, Button, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, DollarSign, FileText, PlusCircle } from 'react-feather';
import FinancialHeader from '../FinancialHeader';
import FinancialSidebar from '../FinancialSidebar';
import RevenueExpenseChart from '@/components/shared-charts/RevenueExpenseChart';
import { getFinancialSummary, createBudget, updateBudget, getTenantBudget } from '@/lib/api/services/financial';
import { Settings } from 'react-feather';

const TSE_CATEGORIES = [
    { name: 'Propaganda', code: '01', icon: '📢' },
    { name: 'Transporte', code: '02', icon: '🚗' },
    { name: 'Despesas com Pessoal', code: '03', icon: '👥' },
    { name: 'Comitê', code: '04', icon: '🏢' },
    { name: 'Serviços Prestados', code: '05', icon: '🛠️' },
    { name: 'Produção', code: '06', icon: '🎬' },
    { name: 'Eventos', code: '07', icon: '🎪' },
    { name: 'Outras Despesas', code: '08', icon: '📋' },
];

const FinancialOverviewBody = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [financialData, setFinancialData] = useState(null);
    const [noBudget, setNoBudget] = useState(false);

    // Modal criar/editar orçamento
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [savingBudget, setSavingBudget] = useState(false);
    const [editingBudgetId, setEditingBudgetId] = useState(null);
    const [budgetForm, setBudgetForm] = useState({
        campaignName: '',
        campaignYear: new Date().getFullYear(),
        totalBudget: '',
        categories: TSE_CATEGORIES.map(c => ({ ...c, limit: '' })),
    });

    // Carregar dados da API
    useEffect(() => {
        loadFinancialData();
    }, []);

    const loadFinancialData = async () => {
        try {
            setLoading(true);
            setError(null);
            setNoBudget(false);
            const data = await getFinancialSummary();

            if (data.noBudget) {
                setNoBudget(true);
                return;
            }

            setFinancialData({
                budgetId: data.budgetId || null,
                campaignName: data.campaignName || '',
                campaignYear: data.campaignYear || new Date().getFullYear(),
                totalBudget: data.budget?.totalBudget || 0,
                totalSpent: data.budget?.totalSpent || 0,
                totalRevenue: data.budget?.totalRevenue || 0,
                available: data.budget?.available || 0,
                percentUsed: data.budget?.percentUsed || 0,
                categories: data.categories || [],
                recentTransactions: data.recentTransactions || [],
                alerts: data.alerts || []
            });
        } catch (err) {
            console.error('Erro ao carregar dados financeiros:', err);
            setError(err.message || 'Erro ao carregar dados financeiros');
        } finally {
            setLoading(false);
        }
    };

    const openEditBudget = async () => {
        try {
            const res = await getTenantBudget();
            const b = res?.data || res;
            setEditingBudgetId(b._id || b.id);
            setBudgetForm({
                campaignName: b.campaignName || '',
                campaignYear: b.campaignYear || new Date().getFullYear(),
                totalBudget: b.totalBudget?.toString() || '',
                categories: TSE_CATEGORIES.map(c => {
                    const existing = b.categories?.find(bc => bc.code === c.code);
                    return { ...c, limit: existing?.limit?.toString() || '' };
                }),
            });
        } catch {
            setEditingBudgetId(null);
            setBudgetForm({ campaignName: '', campaignYear: new Date().getFullYear(), totalBudget: '', categories: TSE_CATEGORIES.map(c => ({ ...c, limit: '' })) });
        }
        setShowBudgetModal(true);
    };

    const handleSaveBudget = async (e) => {
        e.preventDefault();
        try {
            setSavingBudget(true);
            const total = parseFloat(budgetForm.totalBudget);
            if (!total || total <= 0) throw new Error('Informe um valor de orçamento válido');
            const categories = budgetForm.categories
                .filter(c => parseFloat(c.limit) > 0)
                .map(c => ({ name: c.name, code: c.code, icon: c.icon, limit: parseFloat(c.limit) }));
            const payload = {
                campaignName: budgetForm.campaignName || `Campanha ${budgetForm.campaignYear}`,
                campaignYear: parseInt(budgetForm.campaignYear),
                totalBudget: total,
                categories,
            };
            if (editingBudgetId) {
                await updateBudget(editingBudgetId, payload);
            } else {
                await createBudget(payload);
            }
            setShowBudgetModal(false);
            setEditingBudgetId(null);
            await loadFinancialData();
        } catch (err) {
            setError(err.message || 'Erro ao salvar orçamento');
        } finally {
            setSavingBudget(false);
        }
    };

    const formatCurrency = (value) => {
        const num = (typeof value === 'number' && !isNaN(value)) ? value : (parseFloat(value) || 0);
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(num);
    };

    const getStatusBadge = (status) => {
        const badges = {
            approved: { bg: 'success', text: 'Aprovado' },
            pending: { bg: 'warning', text: 'Pendente' },
            rejected: { bg: 'danger', text: 'Rejeitado' },
            confirmed: { bg: 'success', text: 'Confirmado' },
            paid: { bg: 'success', text: 'Pago' }
        };
        return badges[status] || badges.pending;
    };

    // Loading state
    if (loading) {
        return (
            <div className="fm-body">
                <SimpleBar className="nicescroll-bar">
                    <div className="container-fluid px-4 py-4">
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-3 text-muted">Carregando dados financeiros...</p>
                        </div>
                    </div>
                </SimpleBar>
            </div>
        );
    }

    // No budget state — tela de onboarding
    if (noBudget || (!loading && !financialData && !error)) {
        return (
            <div className="fm-body">
                <SimpleBar className="nicescroll-bar">
                    <div className="container-fluid px-4 py-5">
                        <div className="text-center py-5">
                            <div className="avatar avatar-icon avatar-xl avatar-soft-primary avatar-rounded mb-4" style={{ margin: '0 auto' }}>
                                <DollarSign size={36} />
                            </div>
                            <h3 className="mb-2">Nenhum orçamento cadastrado</h3>
                            <p className="text-muted mb-4" style={{ maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                                Para começar a gerenciar as finanças da campanha, crie o orçamento inicial com o valor total e as categorias TSE.
                            </p>
                            <Button variant="primary" size="lg" onClick={() => setShowBudgetModal(true)}>
                                <PlusCircle size={18} className="me-2" />
                                Criar Orçamento
                            </Button>
                        </div>
                    </div>
                </SimpleBar>

            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="fm-body">
                <SimpleBar className="nicescroll-bar">
                    <div className="container-fluid px-4 py-4">
                        <Alert variant="danger">
                            <AlertTriangle size={18} className="me-2" />
                            <strong>Erro:</strong> {error}
                            <Button variant="outline-danger" size="sm" className="ms-3" onClick={loadFinancialData}>
                                Tentar Novamente
                            </Button>
                        </Alert>
                    </div>
                </SimpleBar>
            </div>
        );
    }

    return (
        <div className="fm-body">
            <SimpleBar className="nicescroll-bar">
                <div className="container-fluid px-4 py-4">
                        {/* Barra de ações */}
                        <div className="d-flex justify-content-end mb-3">
                            <Button variant="outline-secondary" size="sm" onClick={openEditBudget}>
                                <Settings size={14} className="me-1" />
                                Configurar Orçamento
                            </Button>
                        </div>

                        {/* Header com resumo financeiro */}
                        <Row className="mb-4">
                            <Col xxl={9} lg={8}>
                                <Row>
                                    <Col lg={4} sm={6} className="mb-3">
                                        <Card className="card-border">
                                            <Card.Body>
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar avatar-icon avatar-lg avatar-success avatar-rounded me-3">
                                                        <DollarSign size={24} />
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <div className="text-muted small">Orçamento Total</div>
                                                        <div className="h4 mb-0">{formatCurrency(financialData.totalBudget)}</div>
                                                    </div>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>

                                    <Col lg={4} sm={6} className="mb-3">
                                        <Card className="card-border">
                                            <Card.Body>
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar avatar-icon avatar-lg avatar-danger avatar-rounded me-3">
                                                        <TrendingDown size={24} />
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <div className="text-muted small">Total Gasto</div>
                                                        <div className="h4 mb-0">{formatCurrency(financialData.totalSpent)}</div>
                                                    </div>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>

                                    <Col lg={4} sm={6} className="mb-3">
                                        <Card className="card-border">
                                            <Card.Body>
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar avatar-icon avatar-lg avatar-primary avatar-rounded me-3">
                                                        <CheckCircle size={24} />
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <div className="text-muted small">Disponível</div>
                                                        <div className="h4 mb-0">{formatCurrency(financialData.available)}</div>
                                                    </div>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            </Col>

                            <Col xxl={3} lg={4} className="mb-3">
                                <Card className="card-border">
                                    <Card.Header>
                                        <h6 className="mb-0 fs-7">Receitas vs Despesas</h6>
                                    </Card.Header>
                                    <Card.Body className="text-center py-3">
                                        <div style={{ maxWidth: '160px', margin: '0 auto' }}>
                                            <RevenueExpenseChart 
                                                revenue={financialData.totalRevenue} 
                                                expense={financialData.totalSpent} 
                                            />
                                        </div>
                                        <div className="mt-3">
                                            <div className="d-flex align-items-center justify-content-between mb-2 px-3">
                                                <div className="d-flex align-items-center">
                                                    <Badge bg="success" className="badge-indicator badge-indicator-nobdr me-2" />
                                                    <span className="fs-8 text-muted">Receitas</span>
                                                </div>
                                                <span className="fw-medium fs-7">
                                                    {formatCurrency(financialData.totalRevenue)}
                                                </span>
                                            </div>
                                            <div className="d-flex align-items-center justify-content-between px-3">
                                                <div className="d-flex align-items-center">
                                                    <Badge bg="danger" className="badge-indicator badge-indicator-nobdr me-2" />
                                                    <span className="fs-8 text-muted">Despesas</span>
                                                </div>
                                                <span className="fw-medium fs-7">
                                                    {formatCurrency(financialData.totalSpent)}
                                                </span>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* Alertas */}
                        {financialData.alerts.length > 0 && (
                            <Row className="mb-4">
                                <Col>
                                    <Card className="card-border">
                                        <Card.Header>
                                            <h5 className="mb-0">
                                                <AlertTriangle size={18} className="me-2" />
                                                Alertas Recentes
                                            </h5>
                                        </Card.Header>
                                        <Card.Body>
                                            {financialData.alerts.map((alert) => (
                                                <Alert key={alert.id} variant={alert.type} className="mb-2">
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <div>
                                                            <strong>{alert.title}</strong>
                                                            <p className="mb-0 small">{alert.message}</p>
                                                        </div>
                                                        <small className="text-muted">{alert.date}</small>
                                                    </div>
                                                </Alert>
                                            ))}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        )}

                        {/* Gastos por Categoria */}
                        <Row className="mb-4">
                            <Col>
                                <Card className="card-border">
                                    <Card.Header className="d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">Controle de Limites por Categoria</h5>
                                        <Badge bg="secondary">TSE Compliance</Badge>
                                    </Card.Header>
                                    <Card.Body>
                                        {financialData.categories.map((category) => {
                                            // Mapear ícones para cada categoria
                                            const categoryIcons = {
                                                'Propaganda': '📢',
                                                'Marketing Digital': '📢',
                                                'Transporte': '🚗',
                                                'Despesas com Pessoal': '👥',
                                                'Pessoal': '👥',
                                                'Comitê': '🏢',
                                                'Serviços Prestados': '🛠️',
                                                'Eventos': '🎪',
                                                'Produção': '🎬',
                                                'Outras': '📋',
                                                'Material Gráfico': '📄'
                                            };
                                            
                                            const icon = category.icon || categoryIcons[category.name] || '📋';
                                            
                                            return (
                                            <div key={category.code || category.id} className="mb-4">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <div>
                                                        <span className="me-2">{icon}</span>
                                                        <strong>{category.name}</strong>
                                                        <Badge 
                                                            bg={category.status} 
                                                            className="ms-2"
                                                        >
                                                            {category.percent || 0}%
                                                        </Badge>
                                                    </div>
                                                    <div className="text-end">
                                                        <div>
                                                            <strong>{formatCurrency(category.spent || 0)}</strong>
                                                            <span className="text-muted"> / {formatCurrency(category.limit || 0)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <ProgressBar 
                                                    now={category.percent || 0} 
                                                    variant={category.status}
                                                    style={{ height: '8px' }}
                                                />
                                                {(category.percent || 0) >= 95 && (
                                                    <small className="text-danger d-block mt-1">
                                                        ⚠️ Limite crítico - Novas despesas podem ser bloqueadas
                                                    </small>
                                                )}
                                                {(category.percent || 0) >= 80 && (category.percent || 0) < 95 && (
                                                    <small className="text-warning d-block mt-1">
                                                        ⚠️ Atenção - Monitorar próximas despesas
                                                    </small>
                                                )}
                                            </div>
                                        )})}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* Transações Recentes */}
                        <Row>
                            <Col>
                                <Card className="card-border">
                                    <Card.Header className="d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">
                                            <FileText size={18} className="me-2" />
                                            Transações Recentes
                                        </h5>
                                        <Button variant="outline-primary" size="sm">
                                            Ver Todas
                                        </Button>
                                    </Card.Header>
                                    <Card.Body className="p-0">
                                        <div className="table-responsive">
                                            <table className="table table-hover mb-0">
                                                <thead>
                                                    <tr>
                                                        <th>Data</th>
                                                        <th>Tipo</th>
                                                        <th>Descrição</th>
                                                        <th>Categoria</th>
                                                        <th className="text-end">Valor</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {financialData.recentTransactions.map((transaction) => (
                                                        <tr key={transaction._id || transaction.id}>
                                                            <td>{new Date(transaction.date || transaction.createdAt).toLocaleDateString('pt-BR')}</td>
                                                            <td>
                                                                <Badge bg={transaction.type === 'expense' ? 'danger' : 'success'}>
                                                                    {transaction.type === 'expense' ? 'Despesa' : 'Receita'}
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                <div>
                                                                    {transaction.description}
                                                                    {transaction.invoice?.number && (
                                                                        <div className="small text-muted">{transaction.invoice.number}</div>
                                                                    )}
                                                                    {transaction.donor?.name && (
                                                                        <div className="small text-muted">Doador: {transaction.donor.name}</div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td>{transaction.category || transaction.categoryName}</td>
                                                            <td className="text-end">
                                                                <strong className={transaction.type === 'expense' ? 'text-danger' : 'text-success'}>
                                                                    {transaction.type === 'expense' ? '- ' : '+ '}
                                                                    {formatCurrency(transaction.amount)}
                                                                </strong>
                                                            </td>
                                                            <td>
                                                                <Badge bg={getStatusBadge(transaction.status).bg}>
                                                                    {getStatusBadge(transaction.status).text}
                                                                </Badge>
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
                    </div>
            </SimpleBar>

            {/* Modal Criar / Editar Orçamento — sempre montado */}
            <Modal show={showBudgetModal} onHide={() => { setShowBudgetModal(false); setEditingBudgetId(null); }} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editingBudgetId ? 'Editar Orçamento' : 'Criar Orçamento da Campanha'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSaveBudget}>
                    <Modal.Body>
                        {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
                        <Row className="gx-3">
                            <Col md={8}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nome da Campanha</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Ex: Campanha Vereador 2026"
                                        value={budgetForm.campaignName}
                                        onChange={e => setBudgetForm(p => ({ ...p, campaignName: e.target.value }))}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Ano da Eleição</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={budgetForm.campaignYear}
                                        onChange={e => setBudgetForm(p => ({ ...p, campaignYear: e.target.value }))}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-4">
                                    <Form.Label>Orçamento Total (R$) <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="Ex: 500000"
                                        required
                                        value={budgetForm.totalBudget}
                                        onChange={e => setBudgetForm(p => ({ ...p, totalBudget: e.target.value }))}
                                    />
                                    <Form.Text className="text-muted">Valor máximo total de gastos conforme declarado ao TSE</Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>
                        <p className="fw-semibold mb-2">Limites por Categoria TSE <span className="text-muted fw-normal">(opcional)</span></p>
                        <Row className="gx-3">
                            {budgetForm.categories.map((cat, i) => (
                                <Col key={cat.code} md={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label className="small">{cat.icon} {cat.name}</Form.Label>
                                        <Form.Control
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="0,00"
                                            value={cat.limit}
                                            onChange={e => setBudgetForm(p => {
                                                const cats = [...p.categories];
                                                cats[i] = { ...cats[i], limit: e.target.value };
                                                return { ...p, categories: cats };
                                            })}
                                        />
                                    </Form.Group>
                                </Col>
                            ))}
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => { setShowBudgetModal(false); setEditingBudgetId(null); }} disabled={savingBudget}>Cancelar</Button>
                        <Button variant="primary" type="submit" disabled={savingBudget}>
                            {savingBudget ? <><Spinner size="sm" className="me-2" />Salvando...</> : editingBudgetId ? 'Salvar Alterações' : 'Criar Orçamento'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

const FinancialOverview = () => {
    const [showSidebar, setShowSidebar] = React.useState(true);

    return (
        <div className="hk-pg-body py-0">
            <div className={`fmapp-wrap ${!showSidebar ? 'fmapp-sidebar-toggle' : ''}`}>
                <FinancialSidebar />
                <div className="fmapp-content">
                    <div className="fmapp-detail-wrap">
                        <FinancialHeader showSidebar={showSidebar} toggleSidebar={() => setShowSidebar(!showSidebar)} />
                        <FinancialOverviewBody />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialOverview;
