'use client';
import React, { useState, useEffect } from 'react';
import SimpleBar from 'simplebar-react';
import { Card, Col, Row, Badge, Button, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import { TrendingDown, AlertTriangle, PlusCircle, Check, X, DollarSign, Trash2, Paperclip, FileText, Image } from 'react-feather';
import FinancialHeader from '../FinancialHeader';
import FinancialSidebar from '../FinancialSidebar';
import { listExpenses, createExpense, approveExpense, rejectExpense, payExpense, deleteExpense, getFinancialSummary, uploadFinancialFile } from '@/lib/api/services/financial';

const TSE_CATEGORIES = [
    { name: 'Propaganda', code: '01' },
    { name: 'Transporte', code: '02' },
    { name: 'Despesas com Pessoal', code: '03' },
    { name: 'Comitê', code: '04' },
    { name: 'Serviços Prestados', code: '05' },
    { name: 'Produção', code: '06' },
    { name: 'Eventos', code: '07' },
    { name: 'Outras Despesas', code: '08' },
];

const PAYMENT_METHODS = [
    { value: 'pix', label: 'PIX' },
    { value: 'bank_transfer', label: 'Transferência Bancária' },
    { value: 'cash', label: 'Dinheiro' },
    { value: 'boleto', label: 'Boleto' },
    { value: 'corporate_card', label: 'Cartão Corporativo' },
    { value: 'check', label: 'Cheque' },
    { value: 'other', label: 'Outros' },
];

const EMPTY_FORM = {
    description: '',
    supplier: '',
    supplierCnpj: '',
    categoryCode: '01',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'pix',
    invoiceNumber: '',
    notes: '',
};

const ExpensesBody = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [budgetId, setBudgetId] = useState(null);

    // Modal nova despesa
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [invoiceFile, setInvoiceFile] = useState(null); // arquivo da NF

    // Modal rejeitar
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const summaryRes = await getFinancialSummary().catch(() => null);
            const activeBudgetId = (!summaryRes?.noBudget && summaryRes?.budgetId) ? summaryRes.budgetId : null;
            setBudgetId(activeBudgetId);
            const expRes = await listExpenses({
                ...(activeBudgetId ? { budgetId: activeBudgetId } : {}),
                limit: 100,
                sortBy: 'date',
                sortOrder: 'desc',
            });
            setExpenses(expRes.data || []);
        } catch (err) {
            setError(err.message || 'Erro ao carregar despesas');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!budgetId) { setError('Nenhum orçamento ativo. Crie um orçamento primeiro no overview.'); return; }
        try {
            setSaving(true);
            const cat = TSE_CATEGORIES.find(c => c.code === form.categoryCode);

            // Upload do arquivo de NF se houver
            let invoiceFileUrl = null;
            if (invoiceFile) {
                const uploaded = await uploadFinancialFile(invoiceFile, 'financial-invoices');
                invoiceFileUrl = uploaded?.url || null;
            }

            // Monta o objeto invoice apenas se tiver número ou arquivo
            let invoice = undefined;
            if (form.invoiceNumber || invoiceFileUrl) {
                invoice = {
                    ...(form.invoiceNumber ? { number: form.invoiceNumber } : { number: '-' }),
                    ...(invoiceFileUrl ? { fileUrl: invoiceFileUrl } : {}),
                };
            }

            await createExpense({
                budgetId,
                description: form.description,
                supplier: form.supplier,
                supplierCnpj: form.supplierCnpj || undefined,
                categoryCode: form.categoryCode,
                categoryName: cat?.name || form.categoryCode,
                amount: parseFloat(form.amount),
                date: form.date,
                paymentMethod: form.paymentMethod,
                invoice,
                notes: form.notes || undefined,
            });
            setShowModal(false);
            setForm(EMPTY_FORM);
            setInvoiceFile(null);
            setSuccess('Despesa registrada com sucesso!');
            await loadData();
        } catch (err) {
            setError(err.message || 'Erro ao registrar despesa');
        } finally {
            setSaving(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await approveExpense(id, {});
            setSuccess('Despesa aprovada!');
            await loadData();
        } catch (err) { setError(err.message || 'Erro ao aprovar'); }
    };

    const handlePay = async (id) => {
        try {
            await payExpense(id, {});
            setSuccess('Despesa marcada como paga!');
            await loadData();
        } catch (err) { setError(err.message || 'Erro ao pagar'); }
    };

    const handleRejectConfirm = async () => {
        if (!rejectReason.trim()) { setError('Informe o motivo da rejeição'); return; }
        try {
            await rejectExpense(rejectingId, { rejectionReason: rejectReason });
            setShowRejectModal(false);
            setRejectReason('');
            setRejectingId(null);
            setSuccess('Despesa rejeitada.');
            await loadData();
        } catch (err) { setError(err.message || 'Erro ao rejeitar'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja excluir esta despesa?')) return;
        try {
            await deleteExpense(id);
            setSuccess('Despesa excluída.');
            await loadData();
        } catch (err) { setError(err.message || 'Erro ao excluir'); }
    };

    const formatCurrency = (v) => {
        const num = (typeof v === 'number' && !isNaN(v)) ? v : (parseFloat(v) || 0);
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
    };

    const statusBadge = { pending: { bg: 'warning', text: 'Pendente' }, approved: { bg: 'info', text: 'Aprovado' }, paid: { bg: 'success', text: 'Pago' }, rejected: { bg: 'danger', text: 'Rejeitado' }, cancelled: { bg: 'secondary', text: 'Cancelado' } };

    const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    const pending = expenses.filter(e => e.status === 'pending').length;
    const approved = expenses.filter(e => e.status === 'approved').length;

    if (loading) return (
        <div className="fm-body"><SimpleBar className="nicescroll-bar">
            <div className="container-fluid px-4 py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Carregando despesas...</p>
            </div>
        </SimpleBar></div>
    );

    return (
        <div className="fm-body">
            <SimpleBar className="nicescroll-bar">
                <div className="container-fluid px-4 py-4">

                    {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}
                    {error && <Alert variant="danger" dismissible onClose={() => setError(null)}><AlertTriangle size={16} className="me-2" />{error}</Alert>}

                    {/* KPIs */}
                    <Row className="mb-4 gx-3">
                        <Col md={3} sm={6} className="mb-3">
                            <Card className="card-border">
                                <Card.Body>
                                    <div className="text-muted small">Total de Despesas</div>
                                    <div className="h4 text-danger mb-0">{formatCurrency(totalExpenses)}</div>
                                    <small className="text-muted">{expenses.length} registrada(s)</small>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3} sm={6} className="mb-3">
                            <Card className="card-border">
                                <Card.Body>
                                    <div className="text-muted small">Aguardando Aprovação</div>
                                    <div className="h4 text-warning mb-0">{pending}</div>
                                    <small className="text-muted">pendente(s)</small>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3} sm={6} className="mb-3">
                            <Card className="card-border">
                                <Card.Body>
                                    <div className="text-muted small">Aprovadas / A Pagar</div>
                                    <div className="h4 text-info mb-0">{approved}</div>
                                    <small className="text-muted">aprovada(s)</small>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Tabela */}
                    <Card className="card-border">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0"><TrendingDown size={18} className="me-2" />Despesas</h5>
                            <Button variant="primary" size="sm" onClick={() => { setForm(EMPTY_FORM); setShowModal(true); }}>
                                <PlusCircle size={14} className="me-1" />Nova Despesa
                            </Button>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {expenses.length === 0 ? (
                                <div className="text-center py-5">
                                    <TrendingDown size={40} className="text-muted mb-3" />
                                    <p className="text-muted mb-3">Nenhuma despesa registrada ainda.</p>
                                    <Button variant="primary" onClick={() => { setForm(EMPTY_FORM); setShowModal(true); }}>
                                        <PlusCircle size={14} className="me-1" />Registrar Primeira Despesa
                                    </Button>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead>
                                            <tr>
                                                <th>Data</th>
                                                <th>Descrição</th>
                                                <th>Fornecedor</th>
                                                <th>Categoria</th>
                                                <th className="text-end">Valor</th>
                                                <th>Status</th>
                                                <th>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {expenses.map((exp) => {
                                                const sb = statusBadge[exp.status] || statusBadge.pending;
                                                return (
                                                    <tr key={exp._id}>
                                                        <td className="text-nowrap">{new Date(exp.date).toLocaleDateString('pt-BR')}</td>
                                                        <td>
                                                            <div>{exp.description}</div>
                                                            <div className="d-flex align-items-center gap-2 mt-1">
                                                                {exp.invoice?.number && exp.invoice.number !== '-' && <small className="text-muted">NF: {exp.invoice.number}</small>}
                                                                {exp.invoice?.fileUrl && (
                                                                    <a href={exp.invoice.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary" title="Ver anexo da NF">
                                                                        <Paperclip size={13} />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div>{exp.supplier}</div>
                                                            {exp.supplierCnpj && <small className="text-muted">{exp.supplierCnpj}</small>}
                                                        </td>
                                                        <td><Badge bg="secondary">{exp.categoryName}</Badge></td>
                                                        <td className="text-end"><strong className="text-danger">{formatCurrency(exp.amount)}</strong></td>
                                                        <td><Badge bg={sb.bg}>{sb.text}</Badge></td>
                                                        <td>
                                                            <div className="d-flex gap-1 flex-nowrap">
                                                                {exp.status === 'pending' && (
                                                                    <>
                                                                        <Button size="sm" variant="outline-success" title="Aprovar" onClick={() => handleApprove(exp._id)}>
                                                                            <Check size={13} />
                                                                        </Button>
                                                                        <Button size="sm" variant="outline-danger" title="Rejeitar" onClick={() => { setRejectingId(exp._id); setRejectReason(''); setShowRejectModal(true); }}>
                                                                            <X size={13} />
                                                                        </Button>
                                                                    </>
                                                                )}
                                                                {exp.status === 'approved' && (
                                                                    <Button size="sm" variant="outline-primary" title="Marcar como Pago" onClick={() => handlePay(exp._id)}>
                                                                        <DollarSign size={13} />
                                                                    </Button>
                                                                )}
                                                                {['pending', 'rejected'].includes(exp.status) && (
                                                                    <Button size="sm" variant="outline-secondary" title="Excluir" onClick={() => handleDelete(exp._id)}>
                                                                        <Trash2 size={13} />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </div>
            </SimpleBar>

            {/* Modal Nova Despesa */}
            <Modal show={showModal} onHide={() => { setShowModal(false); setInvoiceFile(null); }} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title><TrendingDown size={18} className="me-2" />Nova Despesa</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row className="gx-3">
                            <Col md={8}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Descrição <span className="text-danger">*</span></Form.Label>
                                    <Form.Control required placeholder="Ex: Material gráfico para campanha" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Data <span className="text-danger">*</span></Form.Label>
                                    <Form.Control required type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Fornecedor <span className="text-danger">*</span></Form.Label>
                                    <Form.Control required placeholder="Nome do fornecedor" value={form.supplier} onChange={e => setForm(p => ({ ...p, supplier: e.target.value }))} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>CNPJ do Fornecedor</Form.Label>
                                    <Form.Control placeholder="00.000.000/0001-00" value={form.supplierCnpj} onChange={e => setForm(p => ({ ...p, supplierCnpj: e.target.value }))} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Categoria TSE <span className="text-danger">*</span></Form.Label>
                                    <Form.Select required value={form.categoryCode} onChange={e => setForm(p => ({ ...p, categoryCode: e.target.value }))}>
                                        {TSE_CATEGORIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Forma de Pagamento <span className="text-danger">*</span></Form.Label>
                                    <Form.Select required value={form.paymentMethod} onChange={e => setForm(p => ({ ...p, paymentMethod: e.target.value }))}>
                                        {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Valor (R$) <span className="text-danger">*</span></Form.Label>
                                    <Form.Control required type="number" min="0.01" step="0.01" placeholder="0,00" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Número da Nota Fiscal</Form.Label>
                                    <Form.Control placeholder="NF-001234" value={form.invoiceNumber} onChange={e => setForm(p => ({ ...p, invoiceNumber: e.target.value }))} />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        <Paperclip size={14} className="me-1" />
                                        Anexo da Nota Fiscal
                                        <small className="text-muted ms-2">(PDF, imagem — opcional)</small>
                                    </Form.Label>
                                    <Form.Control
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                                        onChange={e => setInvoiceFile(e.target.files?.[0] || null)}
                                    />
                                    {invoiceFile && (
                                        <div className="d-flex align-items-center gap-2 mt-2 p-2 rounded border bg-light">
                                            {invoiceFile.type.startsWith('image/') ? <Image size={16} className="text-primary" /> : <FileText size={16} className="text-danger" />}
                                            <span className="small text-truncate flex-grow-1">{invoiceFile.name}</span>
                                            <span className="small text-muted text-nowrap">({(invoiceFile.size / 1024).toFixed(0)} KB)</span>
                                            <button type="button" className="btn-close btn-sm" style={{ fontSize: '0.6rem' }} onClick={() => setInvoiceFile(null)} />
                                        </div>
                                    )}
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Observações</Form.Label>
                                    <Form.Control as="textarea" rows={2} placeholder="Informações adicionais..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancelar</Button>
                        <Button variant="primary" type="submit" disabled={saving}>
                            {saving ? <><Spinner size="sm" className="me-2" />Salvando...</> : 'Registrar Despesa'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal Rejeitar */}
            <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Rejeitar Despesa</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Motivo da rejeição <span className="text-danger">*</span></Form.Label>
                        <Form.Control as="textarea" rows={3} placeholder="Descreva o motivo..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowRejectModal(false)}>Cancelar</Button>
                    <Button variant="danger" onClick={handleRejectConfirm}>Rejeitar</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

const Expenses = () => {
    const [showSidebar, setShowSidebar] = React.useState(true);
    return (
        <div className="hk-pg-body py-0">
            <div className={`fmapp-wrap ${!showSidebar ? 'fmapp-sidebar-toggle' : ''}`}>
                <FinancialSidebar />
                <div className="fmapp-content">
                    <div className="fmapp-detail-wrap">
                        <FinancialHeader showSidebar={showSidebar} toggleSidebar={() => setShowSidebar(!showSidebar)} />
                        <ExpensesBody />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Expenses;
