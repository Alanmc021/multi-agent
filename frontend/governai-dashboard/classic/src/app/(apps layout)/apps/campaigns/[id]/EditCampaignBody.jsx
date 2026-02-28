'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Alert, Badge, Button, Card, Col, Form, Modal, Row, Table } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import { X, Plus, FileText, Download, Upload, Users, File } from 'react-feather';
import { getCampaign, updateCampaign, addLeadsToCampaign, getCampaignStats } from '@/lib/api/services/campaigns';
import { listLeads, createLead } from '@/lib/api/services/leads';
import { useAuth } from '@/lib/auth/AuthProvider';
import { generateCampaignReportPDF } from '@/lib/utils/pdf';
import { parseCSV, parseExcel, validateImportedLeads, EXPECTED_COLUMNS } from '@/lib/utils/import-leads';
import { showCustomAlert } from '@/components/CustomAlert';

const EditCampaignBody = () => {
    const router = useRouter();
    const params = useParams();
    const { status } = useAuth();
    const campaignId = params?.id;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [campaign, setCampaign] = useState(null);
    const [campaignType, setCampaignType] = useState('whatsapp'); // 'whatsapp' ou 'voice'
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        prompt: '',
    });

    // Webhooks predefinidos (agora usa Meta API via N8N)
    const webhooks = {
        voice: 'https://nexus-n8n.captain.nexusbr.ai/webhook/ce0328f9-175e-4512-826f-979e5d592841',
        whatsapp: 'https://nexus-n8n.captain.nexusbr.ai/webhook/outbound-whatsapp-campanha',
    };
    const [showAddLeadsModal, setShowAddLeadsModal] = useState(false);
    const [availableLeads, setAvailableLeads] = useState([]);
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [leadLabels, setLeadLabels] = useState({});
    const [loadingLeads, setLoadingLeads] = useState(false);
    const [addingLeads, setAddingLeads] = useState(false);
    const [removingLeadId, setRemovingLeadId] = useState(null);
    const [generatingPDF, setGeneratingPDF] = useState(false);
    const [importMode, setImportMode] = useState('list'); // 'list' ou 'import'
    const [importFile, setImportFile] = useState(null);
    const [importedData, setImportedData] = useState([]);
    const [importing, setImporting] = useState(false);
    const [importErrors, setImportErrors] = useState([]);
    const [importWarnings, setImportWarnings] = useState([]);

    useEffect(() => {
        if (status === 'authenticated' && campaignId) {
            loadCampaign();
        } else if (status === 'guest') {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, campaignId]);

    const loadCampaign = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getCampaign(campaignId);
            if (response && response.success && response.data) {
                const data = response.data;
                setCampaign(data);
                const metadata = data.metadata || {};
                
                // Detectar tipo de campanha baseado no webhook
                const currentWebhook = metadata.webhookUrl || metadata.n8nWebhookUrl || '';
                if (currentWebhook.includes('ce0328f9-175e-4512-826f-979e5d592841')) {
                    setCampaignType('voice');
                } else if (currentWebhook.includes('outbound-whatsapp-campanha')) {
                    setCampaignType('whatsapp');
                } else {
                    // Default para whatsapp se não reconhecido
                    setCampaignType(metadata.campaignType || 'whatsapp');
                }

                setFormData({
                    name: data.name || '',
                    description: data.description || '',
                    prompt: data.prompt || '',
                });
                if (data.leadIds && data.leadIds.length > 0) {
                    const labels = await loadLeadLabelsByIds(data.leadIds);
                    setLeadLabels((prev) => ({ ...prev, ...labels }));
                }
            } else {
                setError('Campanha não encontrada');
            }
        } catch (err) {
            console.error('Erro ao carregar campanha:', err);
            setError(err?.message || 'Erro ao carregar campanha');
        } finally {
            setLoading(false);
        }
    };

    const loadLeadLabelsByIds = async (leadIds = []) => {
        if (!leadIds.length) {
            return {};
        }

        try {
            const response = await listLeads({ maxSize: 1000 });
            if (response && response.success && response.data) {
                const labelsFromResponse = response.data.reduce((acc, lead) => {
                    acc[lead.id] = lead.name || lead.emailAddress || lead.phoneNumber || `Lead ${lead.id?.substring(0, 8) || ''}`;
                    return acc;
                }, {});
                setLeadLabels((prev) => ({ ...prev, ...labelsFromResponse }));
                return response.data.reduce((acc, lead) => {
                    if (leadIds.includes(lead.id)) {
                        acc[lead.id] = lead.name || lead.emailAddress || lead.phoneNumber || `Lead ${lead.id?.substring(0, 8) || ''}`;
                    }
                    return acc;
                }, {});
            }
        } catch (err) {
            console.error('Erro ao carregar nomes de leads:', err);
        }

        return {};
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null);
        setSuccess(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // Validação básica
        if (!formData.name.trim()) {
            setError('O nome da campanha é obrigatório');
            return;
        }
        if (!formData.prompt.trim()) {
            setError('O prompt é obrigatório');
            return;
        }

        try {
            setSaving(true);
            const updateData = {
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                prompt: formData.prompt.trim(),
            };

            // Adicionar webhook ao metadata baseado no tipo de campanha selecionado
            const selectedWebhook = webhooks[campaignType];
            updateData.metadata = {
                ...(campaign?.metadata || {}),
                webhookUrl: selectedWebhook,
                n8nWebhookUrl: selectedWebhook,
                campaignType: campaignType, // 'whatsapp' ou 'voice'
            };

            const response = await updateCampaign(campaignId, updateData);

            if (response?.success === false) {
                setError(response?.message || 'Erro ao atualizar campanha');
                return;
            }

            await showCustomAlert({
                variant: 'success',
                title: 'Sucesso',
                text: 'Campanha atualizada com sucesso!',
            });
            router.push('/apps/campaigns/list');
        } catch (err) {
            console.error('Erro ao atualizar campanha:', err);
            setError(err?.message || 'Erro ao atualizar campanha. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    const loadAvailableLeads = async () => {
        try {
            setLoadingLeads(true);
            const response = await listLeads({ maxSize: 100 });
            if (response && response.success && response.data) {
                // Filtrar leads que já estão na campanha
                const currentLeadIds = campaign?.leadIds || [];
                const available = response.data.filter(lead => !currentLeadIds.includes(lead.id));
                setAvailableLeads(available);
            }
        } catch (err) {
            console.error('Erro ao carregar leads:', err);
        } finally {
            setLoadingLeads(false);
        }
    };

    const handleOpenAddLeadsModal = () => {
        setSelectedLeads([]);
        setImportMode('list');
        setImportFile(null);
        setImportedData([]);
        setImportErrors([]);
        setImportWarnings([]);
        loadAvailableLeads();
        setShowAddLeadsModal(true);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImportFile(file);
        setImportedData([]);
        setImportErrors([]);
        setImportWarnings([]);

        try {
            let data = [];
            const fileExtension = file.name.split('.').pop().toLowerCase();

            if (fileExtension === 'csv') {
                data = await parseCSV(file);
            } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
                data = await parseExcel(file);
            } else {
                await showCustomAlert({
                    variant: 'warning',
                    title: 'Formato não suportado',
                    text: 'Formato de arquivo não suportado. Use CSV ou Excel (.xlsx, .xls).',
                });
                setImportFile(null);
                return;
            }

            // Validar dados
            const validation = validateImportedLeads(data);
            setImportErrors(validation.errors);
            setImportWarnings(validation.warnings);

            if (validation.valid) {
                setImportedData(data);
            } else {
                await showCustomAlert({
                    variant: 'danger',
                    title: 'Erros no arquivo',
                    text: `Erros encontrados no arquivo:\n${validation.errors.join('\n')}`,
                });
            }
        } catch (error) {
            console.error('Erro ao processar arquivo:', error);
            await showCustomAlert({
                variant: 'danger',
                title: 'Erro',
                text: `Erro ao processar arquivo: ${error.message}`,
            });
            setImportFile(null);
        }
    };

    const handleImportLeads = async () => {
        if (importedData.length === 0) {
            await showCustomAlert({
                variant: 'warning',
                title: 'Importação',
                text: 'Nenhum lead válido para importar.',
            });
            return;
        }

        try {
            setImporting(true);
            const createdLeadIds = [];
            const errors = [];
            const skipped = [];

            // Campos que podem causar erro de validação no EspoCRM
            const problematicFields = ['source', 'industry', 'website'];
            
            // Criar leads que não existem
            for (let i = 0; i < importedData.length; i++) {
                const leadData = importedData[i];
                try {
                    // Limpar dados vazios e campos problemáticos
                    const cleanedData = {};
                    Object.keys(leadData).forEach(key => {
                        const value = leadData[key];
                        
                        // Pular campos problemáticos que podem causar erro de validação
                        if (problematicFields.includes(key)) {
                            // Não incluir campos problemáticos por enquanto
                            return;
                        }
                        
                        // Incluir apenas campos válidos e não vazios
                        if (value !== undefined && value !== null && value !== '' && 
                            (typeof value !== 'string' || value.trim() !== '')) {
                            cleanedData[key] = value;
                        }
                    });

                    // Validar que tem pelo menos nome, email ou telefone
                    if (!cleanedData.name && !cleanedData.emailAddress && !cleanedData.phoneNumber) {
                        skipped.push(`Linha ${i + 2}: Sem nome, email ou telefone`);
                        continue;
                    }

                    // Normalizar status se fornecido
                    if (cleanedData.status) {
                        cleanedData.status = cleanedData.status.charAt(0).toUpperCase() + 
                                            cleanedData.status.slice(1).toLowerCase();
                    }

                    // Criar lead
                    const response = await createLead(cleanedData);
                    if (response && response.success && response.data) {
                        createdLeadIds.push(response.data.id);
                    }
                } catch (error) {
                    const leadName = leadData.name || leadData.emailAddress || leadData.phoneNumber || `Linha ${i + 2}`;
                    
                    // Se for erro 409 (duplicado), pular
                    if (error.status === 409 || error.message?.includes('409')) {
                        skipped.push(`${leadName}: Lead já existe`);
                        console.warn('Lead já existe:', leadData);
                    } 
                    // Se for erro 400 (validação), pular e registrar
                    else if (error.status === 400 || error.message?.includes('400')) {
                        const errorMsg = error.message || 'Erro de validação';
                        errors.push(`${leadName}: ${errorMsg}`);
                        console.error('Erro de validação ao criar lead:', error);
                    } 
                    // Outros erros
                    else {
                        errors.push(`${leadName}: ${error.message || 'Erro desconhecido'}`);
                        console.error('Erro ao criar lead:', error);
                    }
                }
            }

            // Adicionar leads criados à campanha
            if (createdLeadIds.length > 0) {
                try {
                    const response = await addLeadsToCampaign(campaignId, createdLeadIds);
                    if (response && response.success) {
                        let message = `${createdLeadIds.length} lead(s) importado(s) e adicionado(s) com sucesso!`;
                        
                        if (skipped.length > 0 || errors.length > 0) {
                            message += `\n\n`;
                            if (skipped.length > 0) {
                                message += `Ignorados: ${skipped.length} (já existem ou sem dados válidos)\n`;
                            }
                            if (errors.length > 0) {
                                message += `Erros: ${errors.length}\n`;
                                message += errors.slice(0, 5).join('\n');
                                if (errors.length > 5) {
                                    message += `\n... e mais ${errors.length - 5} erro(s)`;
                                }
                            }
                        }
                        
                        await showCustomAlert({
                            variant: 'success',
                            title: 'Sucesso',
                            text: message,
                        });
                        setShowAddLeadsModal(false);
                        setImportedData([]);
                        setImportFile(null);
                        await loadCampaign();
                    } else {
                        await showCustomAlert({
                            variant: 'danger',
                            title: 'Erro',
                            text: response?.message || 'Erro ao adicionar leads à campanha',
                        });
                    }
                } catch (error) {
                    console.error('Erro ao adicionar leads à campanha:', error);
                    await showCustomAlert({
                        variant: 'danger',
                        title: 'Erro',
                        text: `Erro ao adicionar leads à campanha: ${error.message}`,
                    });
                }
            } else {
                let message = 'Nenhum lead foi criado.';
                if (errors.length > 0) {
                    message += `\n\nErros encontrados:\n${errors.slice(0, 10).join('\n')}`;
                    if (errors.length > 10) {
                        message += `\n... e mais ${errors.length - 10} erro(s)`;
                    }
                }
                if (skipped.length > 0) {
                    message += `\n\nIgnorados:\n${skipped.slice(0, 10).join('\n')}`;
                    if (skipped.length > 10) {
                        message += `\n... e mais ${skipped.length - 10}`;
                    }
                }
                await showCustomAlert({
                    variant: 'warning',
                    title: 'Importação finalizada',
                    text: message,
                });
            }
        } catch (error) {
            console.error('Erro ao importar leads:', error);
            await showCustomAlert({
                variant: 'danger',
                title: 'Erro',
                text: `Erro ao importar leads: ${error.message}`,
            });
        } finally {
            setImporting(false);
        }
    };

    const handleToggleLeadSelection = (leadId) => {
        setSelectedLeads(prev => 
            prev.includes(leadId) 
                ? prev.filter(id => id !== leadId)
                : [...prev, leadId]
        );
    };

    const handleAddLeads = async () => {
        if (selectedLeads.length === 0) {
            await showCustomAlert({
                variant: 'warning',
                title: 'Adicionar leads',
                text: 'Selecione pelo menos um lead para adicionar.',
            });
            return;
        }

        try {
            setAddingLeads(true);
            const response = await addLeadsToCampaign(campaignId, selectedLeads);
            if (response && response.success) {
                await showCustomAlert({
                    variant: 'success',
                    title: 'Sucesso',
                    text: `${selectedLeads.length} lead(s) adicionado(s) com sucesso!`,
                });
                setShowAddLeadsModal(false);
                setSelectedLeads([]);
                // Recarregar campanha para atualizar a lista de leads
                await loadCampaign();
            } else {
                await showCustomAlert({
                    variant: 'danger',
                    title: 'Erro',
                    text: response?.message || 'Erro ao adicionar leads',
                });
            }
        } catch (err) {
            console.error('Erro ao adicionar leads:', err);
            await showCustomAlert({
                variant: 'danger',
                title: 'Erro',
                text: err?.message || 'Erro ao adicionar leads. Tente novamente.',
            });
        } finally {
            setAddingLeads(false);
        }
    };

    const getLeadLabel = (leadId, index) => {
        return leadLabels[leadId] || `Lead ${index + 1} (${leadId.substring(0, 8)}...)`;
    };

    const handleRemoveCampaignLead = async (leadId) => {
        if (!campaign?.leadIds?.includes(leadId)) {
            return;
        }

        const nextLeadIds = campaign.leadIds.filter((id) => id !== leadId);
        const selectedWebhook = webhooks[campaignType];

        try {
            setRemovingLeadId(leadId);
            const response = await updateCampaign(campaignId, {
                name: formData.name.trim() || campaign.name,
                description: formData.description.trim() || undefined,
                prompt: formData.prompt.trim() || campaign.prompt,
                metadata: {
                    ...(campaign?.metadata || {}),
                    webhookUrl: selectedWebhook,
                    n8nWebhookUrl: selectedWebhook,
                    campaignType: campaignType,
                },
                leadIds: nextLeadIds,
            });

            if (response && response.success) {
                setCampaign((prev) => ({
                    ...prev,
                    leadIds: nextLeadIds,
                }));
                setSuccess('Lead removido da campanha com sucesso!');
                setTimeout(() => setSuccess(null), 2500);
            } else {
                setError(response?.message || 'Erro ao remover lead da campanha');
            }
        } catch (err) {
            console.error('Erro ao remover lead da campanha:', err);
            setError(err?.message || 'Erro ao remover lead da campanha. Tente novamente.');
        } finally {
            setRemovingLeadId(null);
        }
    };

    const handleGeneratePDF = async () => {
        if (!campaign) return;

        try {
            setGeneratingPDF(true);
            
            // Buscar estatísticas da campanha
            let stats = null;
            try {
                const statsResponse = await getCampaignStats(campaignId);
                if (statsResponse && statsResponse.success) {
                    stats = statsResponse.data;
                }
            } catch (error) {
                console.warn('Erro ao buscar estatísticas:', error);
            }

            // Buscar leads da campanha (se houver leadIds)
            let leads = [];
            if (campaign.leadIds && campaign.leadIds.length > 0) {
                try {
                    const leadsResponse = await listLeads({ maxSize: 1000 });
                    if (leadsResponse && leadsResponse.success && leadsResponse.data) {
                        // Filtrar apenas os leads da campanha
                        leads = leadsResponse.data.filter(lead => 
                            campaign.leadIds.includes(lead.id)
                        );
                    }
                } catch (error) {
                    console.warn('Erro ao buscar leads:', error);
                }
            }

            // Gerar PDF
            await generateCampaignReportPDF(
                campaign,
                stats,
                leads,
                `relatorio_campanha_${campaign.name?.replace(/\s+/g, '_') || campaignId}`
            );
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            await showCustomAlert({
                variant: 'danger',
                title: 'Erro',
                text: 'Erro ao gerar relatório PDF. Verifique se a biblioteca jsPDF está instalada.',
            });
        } finally {
            setGeneratingPDF(false);
        }
    };

    if (loading) {
        return (
            <div className="contact-body">
                <SimpleBar className="nicescroll-bar">
                    <div className="text-center py-5">
                        <p>Carregando campanha...</p>
                    </div>
                </SimpleBar>
            </div>
        );
    }

    if (error && !campaign) {
        return (
            <div className="contact-body">
                <SimpleBar className="nicescroll-bar">
                    <div className="text-center py-5">
                        <Alert variant="danger">{error}</Alert>
                        <Button variant="primary" onClick={() => router.push('/apps/campaigns/list')}>
                            Voltar para Lista
                        </Button>
                    </div>
                </SimpleBar>
            </div>
        );
    }

    return (
        <div className="contact-body contact-detail-body">
            <SimpleBar className="nicescroll-bar">
                <div className="contactapp-detail-wrap">
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h5>Editar Campanha</h5>
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={handleGeneratePDF}
                                disabled={generatingPDF || !campaign}
                            >
                                {generatingPDF ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        Gerando...
                                    </>
                                ) : (
                                    <>
                                        <FileText size={14} className="me-2" />
                                        Gerar Relatório PDF
                                    </>
                                )}
                            </Button>
                        </Card.Header>
                        <Card.Body>
                            {error && (
                                <Alert variant="danger" className="mb-3">
                                    {error}
                                </Alert>
                            )}
                            {success && (
                                <Alert variant="success" className="mb-3">
                                    {success}
                                </Alert>
                            )}
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Nome da Campanha *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Digite o nome da campanha"
                                                required
                                                disabled={saving}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Descrição</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                placeholder="Descrição da campanha"
                                                disabled={saving}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Tipo de Campanha *</Form.Label>
                                            <Form.Select
                                                value={campaignType}
                                                onChange={(e) => setCampaignType(e.target.value)}
                                                disabled={saving}
                                            >
                                                <option value="whatsapp">📱 Campanha de WhatsApp</option>
                                                <option value="voice">📞 Campanha de Voz</option>
                                            </Form.Select>
                                            <Form.Text className="text-muted">
                                                {campaignType === 'whatsapp' 
                                                    ? '📱 Webhook: https://nexus-n8n.captain.nexusbr.ai/webhook/outbound-whatsapp-campanha'
                                                    : '📞 Webhook: https://nexus-n8n.captain.nexusbr.ai/webhook/ce0328f9-175e-4512-826f-979e5d592841'
                                                }
                                            </Form.Text>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Prompt *</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={6}
                                                name="prompt"
                                                value={formData.prompt}
                                                onChange={handleChange}
                                                placeholder="Prompt/mensagem a ser enviada"
                                                required
                                                disabled={saving}
                                            />
                                            <Form.Text className="text-muted">
                                                Use variáveis como {`{{name}}`} para personalizar o prompt
                                            </Form.Text>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                {campaign && (
                                    <>
                                        <Row>
                                            <Col md={12}>
                                                <div className="mb-3">
                                                    <strong>Status:</strong>{' '}
                                                    <span className={`badge bg-${
                                                        campaign.status === 'active' ? 'success' :
                                                        campaign.status === 'paused' ? 'warning' :
                                                        campaign.status === 'completed' ? 'primary' :
                                                        campaign.status === 'cancelled' ? 'danger' : 'secondary'
                                                    }`}>
                                                        {campaign.status === 'active' ? 'Ativa' :
                                                         campaign.status === 'paused' ? 'Pausada' :
                                                         campaign.status === 'completed' ? 'Completada' :
                                                         campaign.status === 'cancelled' ? 'Cancelada' : 'Rascunho'}
                                                    </span>
                                                </div>
                                                <div className="mb-3">
                                                    <strong>Enviados:</strong> {campaign.sentCount || 0}
                                                </div>
                                                <div className="mb-3">
                                                    <strong>Criada em:</strong>{' '}
                                                    {campaign.createdAt ? new Date(campaign.createdAt).toLocaleString('pt-BR') : '-'}
                                                </div>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={12}>
                                                <Card className="mb-3">
                                                    <Card.Header className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <strong>Leads da Campanha</strong>
                                                            <Badge bg="primary" className="ms-2">
                                                                {campaign.leadIds?.length || 0}
                                                            </Badge>
                                                        </div>
                                                        <Button 
                                                            variant="primary" 
                                                            size="sm"
                                                            onClick={handleOpenAddLeadsModal}
                                                            disabled={saving}
                                                        >
                                                            <Plus size={16} className="me-1" />
                                                            Adicionar Leads
                                                        </Button>
                                                    </Card.Header>
                                                    <Card.Body>
                                                        {campaign.leadIds && campaign.leadIds.length > 0 ? (
                                                            <div className="d-flex flex-wrap gap-2">
                                                                {campaign.leadIds.map((leadId, index) => (
                                                                    <Badge key={leadId} bg="secondary" className="p-2 d-flex align-items-center gap-2">
                                                                        {getLeadLabel(leadId, index)}
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-link text-white p-0 d-flex align-items-center"
                                                                            onClick={() => handleRemoveCampaignLead(leadId)}
                                                                            aria-label="Remover lead"
                                                                            disabled={saving || removingLeadId === leadId}
                                                                        >
                                                                            <X size={12} />
                                                                        </button>
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-muted mb-0">Nenhum lead adicionado ainda.</p>
                                                        )}
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        </Row>
                                    </>
                                )}
                                <Row>
                                    <Col md={12}>
                                        <div className="d-flex gap-2">
                                            <Button variant="primary" type="submit" disabled={saving}>
                                                {saving ? 'Salvando...' : 'Salvar Alterações'}
                                            </Button>
                                            <Button variant="light" onClick={() => router.push('/apps/campaigns/list')} disabled={saving}>
                                                Cancelar
                                            </Button>
                                        </div>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            </SimpleBar>

            {/* Modal para adicionar leads */}
            <Modal show={showAddLeadsModal} onHide={() => setShowAddLeadsModal(false)} size="lg" centered>
                <Modal.Header>
                    <Modal.Title>Adicionar Leads à Campanha</Modal.Title>
                    <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover" onClick={() => setShowAddLeadsModal(false)}>
                        <span className="icon">
                            <span className="feather-icon">
                                <X />
                            </span>
                        </span>
                    </Button>
                </Modal.Header>
                <Modal.Body>
                    {/* Tabs para escolher modo */}
                    <div className="mb-3">
                        <div className="btn-group w-100" role="group">
                            <Button
                                variant={importMode === 'list' ? 'primary' : 'outline-primary'}
                                size="sm"
                                onClick={() => setImportMode('list')}
                            >
                                <Users size={14} className="me-2" />
                                Selecionar da Lista
                            </Button>
                            <Button
                                variant={importMode === 'import' ? 'primary' : 'outline-primary'}
                                size="sm"
                                onClick={() => setImportMode('import')}
                            >
                                <Upload size={14} className="me-2" />
                                Importar CSV/Excel
                            </Button>
                        </div>
                    </div>

                    {importMode === 'list' ? (
                        <>
                            {loadingLeads ? (
                                <div className="text-center py-4">
                                    <p>Carregando leads disponíveis...</p>
                                </div>
                            ) : availableLeads.length === 0 ? (
                                <Alert variant="info">
                                    Não há leads disponíveis para adicionar. Todos os leads já estão nesta campanha ou não há leads cadastrados.
                                </Alert>
                            ) : (
                                <>
                                    <p className="mb-3">
                                        Selecione os leads que deseja adicionar à campanha:
                                    </p>
                                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        <Table hover>
                                            <thead>
                                                <tr>
                                                    <th style={{ width: '50px' }}>
                                                        <Form.Check
                                                            checked={selectedLeads.length === availableLeads.length && availableLeads.length > 0}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedLeads(availableLeads.map(l => l.id));
                                                                } else {
                                                                    setSelectedLeads([]);
                                                                }
                                                            }}
                                                        />
                                                    </th>
                                                    <th>Nome</th>
                                                    <th>Email</th>
                                                    <th>Telefone</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {availableLeads.map((lead) => (
                                                    <tr 
                                                        key={lead.id}
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => handleToggleLeadSelection(lead.id)}
                                                    >
                                                        <td>
                                                            <Form.Check
                                                                checked={selectedLeads.includes(lead.id)}
                                                                onChange={() => handleToggleLeadSelection(lead.id)}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </td>
                                                        <td>{lead.name || '-'}</td>
                                                        <td>{lead.emailAddress || '-'}</td>
                                                        <td>{lead.phoneNumber || '-'}</td>
                                                        <td>
                                                            <Badge bg="secondary">{lead.status || 'New'}</Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                    {selectedLeads.length > 0 && (
                                        <Alert variant="info" className="mt-3">
                                            {selectedLeads.length} lead(s) selecionado(s)
                                        </Alert>
                                    )}
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Modo Importação */}
                            <Alert variant="info" className="mb-3">
                                <strong>Formato esperado:</strong> CSV ou Excel (.xlsx, .xls)
                                <br />
                                <strong>Colunas aceitas:</strong> Nome, Email, Telefone, Status, Origem, Indústria, Website, Descrição
                                <br />
                                <small>Pelo menos um dos campos: Nome, Email ou Telefone deve estar preenchido.</small>
                            </Alert>

                            <Form.Group className="mb-3">
                                <Form.Label>
                                    <File size={16} className="me-2" />
                                    Selecione o arquivo
                                </Form.Label>
                                <Form.Control
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleFileChange}
                                    disabled={importing}
                                />
                                <Form.Text className="text-muted">
                                    Formatos suportados: CSV, Excel (.xlsx, .xls)
                                </Form.Text>
                            </Form.Group>

                            {importErrors.length > 0 && (
                                <Alert variant="danger" className="mb-3">
                                    <strong>Erros encontrados:</strong>
                                    <ul className="mb-0 mt-2">
                                        {importErrors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </Alert>
                            )}

                            {importWarnings.length > 0 && (
                                <Alert variant="warning" className="mb-3">
                                    <strong>Avisos:</strong>
                                    <ul className="mb-0 mt-2">
                                        {importWarnings.map((warning, index) => (
                                            <li key={index}>{warning}</li>
                                        ))}
                                    </ul>
                                </Alert>
                            )}

                            {importedData.length > 0 && (
                                <>
                                    <Alert variant="success" className="mb-3">
                                        <strong>{importedData.length} lead(s) encontrado(s) no arquivo</strong>
                                    </Alert>
                                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        <Table hover size="sm">
                                            <thead>
                                                <tr>
                                                    <th>Nome</th>
                                                    <th>Email</th>
                                                    <th>Telefone</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {importedData.slice(0, 10).map((lead, index) => (
                                                    <tr key={index}>
                                                        <td>{lead.name || '-'}</td>
                                                        <td>{lead.emailAddress || '-'}</td>
                                                        <td>{lead.phoneNumber || '-'}</td>
                                                        <td>
                                                            <Badge bg="secondary">{lead.status || 'New'}</Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                        {importedData.length > 10 && (
                                            <p className="text-muted text-center mt-2">
                                                ... e mais {importedData.length - 10} lead(s)
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={() => setShowAddLeadsModal(false)} disabled={addingLeads || importing}>
                        Cancelar
                    </Button>
                    {importMode === 'list' ? (
                        <Button 
                            variant="primary" 
                            onClick={handleAddLeads}
                            disabled={addingLeads || selectedLeads.length === 0}
                        >
                            {addingLeads ? 'Adicionando...' : `Adicionar ${selectedLeads.length > 0 ? `(${selectedLeads.length})` : ''}`}
                        </Button>
                    ) : (
                        <Button 
                            variant="primary" 
                            onClick={handleImportLeads}
                            disabled={importing || importedData.length === 0}
                        >
                            {importing ? 'Importando...' : `Importar ${importedData.length > 0 ? `(${importedData.length})` : ''}`}
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default EditCampaignBody;

