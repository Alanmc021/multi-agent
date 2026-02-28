'use client';
import React, { useState, useEffect } from 'react';
import SimpleBar from 'simplebar-react';
import { Card, Col, Row, Badge, Alert, Spinner, Button, Modal, Form } from 'react-bootstrap';
import { TrendingUp, AlertTriangle, PlusCircle, Check, X, Trash2, Paperclip, FileText, Image } from 'react-feather';
import FinancialHeader from '../FinancialHeader';
import FinancialSidebar from '../FinancialSidebar';
import { listRevenues, createRevenue, confirmRevenue, cancelRevenue, deleteRevenue, getFinancialSummary, uploadFinancialFile } from '@/lib/api/services/financial';

const REVENUE_TYPES = [
    { value: 'donation', label: 'Doação' },
    { value: 'transfer', label: 'Transferência' },
    { value: 'event', label: 'Evento' },
    { value: 'funding', label: 'Financiamento Coletivo' },
    { value: 'other', label: 'Outros' },
];

const PAYMENT_METHODS = [
    { value: 'pix', label: 'PIX' },
    { value: 'bank_transfer', label: 'Transferência Bancária' },
    { value: 'cash', label: 'Dinheiro' },
    { value: 'boleto', label: 'Boleto' },
    { value: 'check', label: 'Cheque' },
    { value: 'other', label: 'Outros' },
];

const EMPTY_FORM = {
    type: 'donation',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'pix',
    donorName: '',
    donorCpfCnpj: '',
    donorEmail: '',
    donorPhone: '',
    receiptNumber: '',
    notes: '',
};

const RevenuesBody = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [revenues, setRevenues] = useState([]);
    const [budgetId, setBudgetId] = useState(null);

    // Modal nova receita
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [receiptFile, setReceiptFile] = useState(null); // arquivo do comprovante

    // Modal cancelar
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancellingId, setCancellingId] = useState(null);
    const [cancelReason, setCancelReason] = useState('');

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const summaryRes = await getFinancialSummary().catch(() => null);
            const activeBudgetId = (!summaryRes?.noBudget && summaryRes?.budgetId) ? summaryRes.budgetId : null;
            setBudgetId(activeBudgetId);
            const revRes = await listRevenues({
                ...(activeBudgetId ? { budgetId: activeBudgetId } : {}),
                limit: 100,
                sortBy: 'date',
                sortOrder: 'desc',
            });
            setRevenues(revRes.data || []);
        } catch (err) {
            setError(err.message || 'Erro ao carregar receitas');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!budgetId) { setError('Nenhum orçamento ativo. Crie um orçamento primeiro no overview.'); return; }
        try {
            setSaving(true);

            // Upload do comprovante se houver
            let receiptFileUrl = null;
            if (receiptFile) {
                const uploaded = await uploadFinancialFile(receiptFile, 'financial-receipts');
                receiptFileUrl = uploaded?.url || null;
            }

            await createRevenue({
                budgetId,
                type: form.type,
                description: form.description,
                amount: parseFloat(form.amount),
                date: form.date,
                paymentMethod: form.paymentMethod,
                donor: form.donorName ? {
                    name: form.donorName,
                    cpfCnpj: form.donorCpfCnpj || undefined,
                    email: form.donorEmail || undefined,
                    phone: form.donorPhone || undefined,
                } : undefined,
                receiptNumber: form.receiptNumber || undefined,
                receiptFileUrl: receiptFileUrl || undefined,
                notes: form.notes || undefined,
            });
            setShowModal(false);
            setForm(EMPTY_FORM);
            setReceiptFile(null);
            setSuccess('Receita registrada com sucesso!');
            await loadData();
        } catch (err) {
            setError(err.message || 'Erro ao registrar receita');
        } finally {
            setSaving(false);
        }
    };

    const handleConfirm = async (id) => {
        try {
            await confirmRevenue(id, {});
            setSuccess('Receita confirmada!');
            await loadData();
        } catch (err) { setError(err.message || 'Erro ao confirmar'); }
    };

    const handleCancelConfirm = async () => {
        if (!cancelReason.trim()) { setError('Informe o motivo do cancelamento'); return; }
        try {
            await cancelRevenue(cancellingId, { cancellationReason: cancelReason });
            setShowCancelModal(false);
            setCancelReason('');
            setCancellingId(null);
            setSuccess('Receita cancelada.');
            await loadData();
        } catch (err) { setError(err.message || 'Erro ao cancelar'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja excluir esta receita?')) return;
        try {
            await deleteRevenue(id);
            setSuccess('Receita excluída.');
            await loadData();
        } catch (err) { setError(err.message || 'Erro ao excluir'); }
    };

    const formatCurrency = (v) => {
        const num = (typeof v === 'number' && !isNaN(v)) ? v : (parseFloat(v) || 0);
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
    };

    const statusBadge = { pending: { bg: 'warning', text: 'Pendente' }, confirmed: { bg: 'success', text: 'Confirmado' }, cancelled: { bg: 'danger', text: 'Cancelado' } };
    const typeLabel = { donation: 'Doação', transfer: 'Transferência', event: 'Evento', funding: 'Financiamento', other: 'Outros' };

    const totalRevenues = revenues.reduce((s, r) => s + (r.amount || 0), 0);
    const pending = revenues.filter(r => r.status === 'pending').length;
    const confirmed = revenues.filter(r => r.status === 'confirmed').length;

    if (loading) return (
        <div className="fm-body"><SimpleBar className="nicescroll-bar">
            <div className="container-fluid px-4 py-5 text-center">
                <Spinner animation="border" variant="success" />
                <p className="mt-3 text-muted">Carregando receitas...</p>
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
                                    <div className="text-muted small">Total de Receitas</div>
                                    <div className="h4 text-success mb-0">{formatCurrency(totalRevenues)}</div>
                                    <small className="text-muted">{revenues.length} registrada(s)</small>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3} sm={6} className="mb-3">
                            <Card className="card-border">
                                <Card.Body>
                                    <div className="text-muted small">Pendentes de Confirmação</div>
                                    <div className="h4 text-warning mb-0">{pending}</div>
                                    <small className="text-muted">pendente(s)</small>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3} sm={6} className="mb-3">
                            <Card className="card-border">
                                <Card.Body>
                                    <div className="text-muted small">Confirmadas</div>
                                    <div className="h4 text-success mb-0">{confirmed}</div>
                                    <small className="text-muted">confirmada(s)</small>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Tabela */}
                    <Card className="card-border">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0"><TrendingUp size={18} className="me-2" />Receitas</h5>
                            <Button variant="success" size="sm" onClick={() => { setForm(EMPTY_FORM); setShowModal(true); }}>
                                <PlusCircle size={14} className="me-1" />Nova Receita
                            </Button>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {revenues.length === 0 ? (
                                <div className="text-center py-5">
                                    <TrendingUp size={40} className="text-muted mb-3" />
                                    <p className="text-muted mb-3">Nenhuma receita registrada ainda.</p>
                                    <Button variant="success" onClick={() => { setForm(EMPTY_FORM); setShowModal(true); }}>
                                        <PlusCircle size={14} className="me-1" />Registrar Primeira Receita
                                    </Button>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead>
                                            <tr>
                                                <th>Data</th>
                                                <th>Tipo</th>
                                                <th>Doador / Origem</th>
                                                <th>CPF/CNPJ</th>
                                                <th className="text-end">Valor</th>
                                                <th>Status</th>
                                                <th>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {revenues.map((rev) => {
                                                const sb = statusBadge[rev.status] || statusBadge.pending;
                                                return (
                                                    <tr key={rev._id}>
                                                        <td className="text-nowrap">{new Date(rev.date).toLocaleDateString('pt-BR')}</td>
                                                        <td><Badge bg="primary">{typeLabel[rev.type] || rev.type}</Badge></td>
                                                        <td>
                                                            <div>{rev.donor?.name || rev.description}</div>
                                                            <div className="d-flex align-items-center gap-2 mt-1">
                                                                {rev.receiptNumber && <small className="text-muted">Recibo: {rev.receiptNumber}</small>}
                                                                {rev.receiptFileUrl && (
                                                                    <a href={rev.receiptFileUrl} target="_blank" rel="noopener noreferrer" className="text-success" title="Ver comprovante">
                                                                        <Paperclip size={13} />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td><small className="text-muted">{rev.donor?.cpfCnpj || '-'}</small></td>
                                                        <td className="text-end"><strong className="text-success">{formatCurrency(rev.amount)}</strong></td>
                                                        <td><Badge bg={sb.bg}>{sb.text}</Badge></td>
                                                        <td>
                                                            <div className="d-flex gap-1 flex-nowrap">
                                                                {rev.status === 'pending' && (
                                                                    <>
                                                                        <Button size="sm" variant="outline-success" title="Confirmar" onClick={() => handleConfirm(rev._id)}>
                                                                            <Check size={13} />
                                                                        </Button>
                                                                        <Button size="sm" variant="outline-danger" title="Cancelar" onClick={() => { setCancellingId(rev._id); setCancelReason(''); setShowCancelModal(true); }}>
                                                                            <X size={13} />
                                                                        </Button>
                                                                    </>
                                                                )}
                                                                {['pending', 'cancelled'].includes(rev.status) && (
                                                                    <Button size="sm" variant="outline-secondary" title="Excluir" onClick={() => handleDelete(rev._id)}>
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

            {/* Modal Nova Receita */}
            <Modal show={showModal} onHide={() => { setShowModal(false); setReceiptFile(null); }} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title><TrendingUp size={18} className="me-2" />Nova Receita</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row className="gx-3">
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tipo <span className="text-danger">*</span></Form.Label>
                                    <Form.Select required value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                                        {REVENUE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Data <span className="text-danger">*</span></Form.Label>
                                    <Form.Control required type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Descrição <span className="text-danger">*</span></Form.Label>
                                    <Form.Control required placeholder="Ex: Doação campanha março" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
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
                                    <Form.Label>Forma de Pagamento <span className="text-danger">*</span></Form.Label>
                                    <Form.Select required value={form.paymentMethod} onChange={e => setForm(p => ({ ...p, paymentMethod: e.target.value }))}>
                                        {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={12}><hr className="my-2" /><p className="fw-semibold small mb-2">Dados do Doador / Origem (opcional)</p></Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nome</Form.Label>
                                    <Form.Control placeholder="Nome completo" value={form.donorName} onChange={e => setForm(p => ({ ...p, donorName: e.target.value }))} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>CPF / CNPJ</Form.Label>
                                    <Form.Control placeholder="000.000.000-00" value={form.donorCpfCnpj} onChange={e => setForm(p => ({ ...p, donorCpfCnpj: e.target.value }))} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>E-mail</Form.Label>
                                    <Form.Control type="email" placeholder="email@exemplo.com" value={form.donorEmail} onChange={e => setForm(p => ({ ...p, donorEmail: e.target.value }))} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Número do Recibo</Form.Label>
                                    <Form.Control placeholder="REC-001" value={form.receiptNumber} onChange={e => setForm(p => ({ ...p, receiptNumber: e.target.value }))} />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        <Paperclip size={14} className="me-1" />
                                        Anexo do Comprovante
                                        <small className="text-muted ms-2">(PDF, imagem — opcional)</small>
                                    </Form.Label>
                                    <Form.Control
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                                        onChange={e => setReceiptFile(e.target.files?.[0] || null)}
                                    />
                                    {receiptFile && (
                                        <div className="d-flex align-items-center gap-2 mt-2 p-2 rounded border bg-light">
                                            {receiptFile.type.startsWith('image/') ? <Image size={16} className="text-primary" /> : <FileText size={16} className="text-danger" />}
                                            <span className="small text-truncate flex-grow-1">{receiptFile.name}</span>
                                            <span className="small text-muted text-nowrap">({(receiptFile.size / 1024).toFixed(0)} KB)</span>
                                            <button type="button" className="btn-close btn-sm" style={{ fontSize: '0.6rem' }} onClick={() => setReceiptFile(null)} />
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
                        <Button variant="success" type="submit" disabled={saving}>
                            {saving ? <><Spinner size="sm" className="me-2" />Salvando...</> : 'Registrar Receita'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal Cancelar */}
            <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Cancelar Receita</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Motivo do cancelamento <span className="text-danger">*</span></Form.Label>
                        <Form.Control as="textarea" rows={3} placeholder="Descreva o motivo..." value={cancelReason} onChange={e => setCancelReason(e.target.value)} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCancelModal(false)}>Voltar</Button>
                    <Button variant="danger" onClick={handleCancelConfirm}>Cancelar Receita</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

const Revenues = () => {
    const [showSidebar, setShowSidebar] = React.useState(true);
    return (
        <div className="hk-pg-body py-0">
            <div className={`fmapp-wrap ${!showSidebar ? 'fmapp-sidebar-toggle' : ''}`}>
                <FinancialSidebar />
                <div className="fmapp-content">
                    <div className="fmapp-detail-wrap">
                        <FinancialHeader showSidebar={showSidebar} toggleSidebar={() => setShowSidebar(!showSidebar)} />
                        <RevenuesBody />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Revenues;
