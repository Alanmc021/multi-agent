import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import SimpleBar from 'simplebar-react';
import { Button, Card, Col, Dropdown, Form, Pagination, Row, Table } from 'react-bootstrap';
import { Edit, MoreVertical, Trash, Trash2, Play, Pause, Square, RotateCw, RefreshCw, Download, FileText } from 'react-feather';
import HkDataTable from '@/components/@hk-data-table';
import { listCampaigns, deleteCampaign, startCampaign, pauseCampaign, resumeCampaign, stopCampaign } from '@/lib/api/services/campaigns';
import { useAuth } from '@/lib/auth/AuthProvider';
import { exportToCSV, exportToExcel, formatDate, formatStatus } from '@/lib/utils/export';
import { showCustomAlert } from '@/components/CustomAlert';

const CampaignListBody = () => {
    const router = useRouter();
    const { status } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [columns, setColumns] = useState([]);
    const [deletingId, setDeletingId] = useState(null);
    const [processingId, setProcessingId] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // Formatter para ações
    const actionFormatter = (cell, row) => {
        if (!cell || !Array.isArray(cell) || cell.length === 0) return null;
        return (
            cell.map((data, indx) => {
                // Obter status de múltiplas fontes para garantir que funcione
                // 1. Do objeto data (se foi passado)
                // 2. Da linha (row) se disponível
                // 3. Buscando no array campaigns
                const campaignId = data.id;
                const statusFromData = data.status;
                const statusFromRow = row?.status;
                const campaign = campaigns.find(c => c.id === campaignId);
                const statusFromCampaigns = campaign?.status;
                
                // Usar a primeira fonte disponível
                const status = statusFromData || statusFromRow || statusFromCampaigns || 'draft';
                
                // Normalizar status para lowercase para garantir comparação
                const normalizedStatus = (status || 'draft').toLowerCase();
                const isProcessing = processingId === campaignId;
                
                // Debug: log para verificar status (apenas em desenvolvimento)
                if (process.env.NODE_ENV === 'development') {
                    console.log('Campaign action formatter:', {
                        campaignId: campaignId,
                        status: normalizedStatus,
                        sources: {
                            fromData: statusFromData,
                            fromRow: statusFromRow,
                            fromCampaigns: statusFromCampaigns
                        }
                    });
                }
                
                // Determinar quais ações estão disponíveis baseado no status
                const canStart = normalizedStatus === 'draft'; // Apenas draft pode "Iniciar"
                const canPause = normalizedStatus === 'active';
                const canResume = normalizedStatus === 'paused'; // Apenas paused pode "Retomar"
                const canStop = normalizedStatus === 'active' || normalizedStatus === 'paused';
                
                return (
                    <div className="d-flex align-items-center" key={indx} >
                        <div className="d-flex">
                            <Button 
                                variant="flush-dark" 
                                className="btn-icon btn-rounded flush-soft-hover" 
                                data-bs-toggle="tooltip" 
                                data-placement="top" 
                                data-bs-original-title="Editar"
                                onClick={() => router.push(data.editLink)}
                                disabled={isProcessing}
                            >
                                <span className="icon">
                                    <span className="feather-icon">
                                        <Edit />
                                    </span>
                                </span>
                            </Button>
                            
                            {/* Botão Iniciar - aparece para draft ou paused */}
                            <Button 
                                variant="flush-dark" 
                                className="btn-icon btn-rounded flush-soft-hover" 
                                data-bs-toggle="tooltip" 
                                data-placement="top" 
                                data-bs-original-title="Iniciar"
                                onClick={() => handleStart(campaignId, row?.name || data?.name)}
                                disabled={isProcessing || !canStart}
                                style={{ opacity: canStart ? 1 : 0.3 }}
                            >
                                <span className="icon">
                                    <span className="feather-icon">
                                        <Play />
                                    </span>
                                </span>
                            </Button>
                            
                            {/* Botão Pausar - aparece para active */}
                            <Button 
                                variant="flush-dark" 
                                className="btn-icon btn-rounded flush-soft-hover" 
                                data-bs-toggle="tooltip" 
                                data-placement="top" 
                                data-bs-original-title="Pausar"
                                onClick={() => handlePause(campaignId, row?.name || data?.name)}
                                disabled={isProcessing || !canPause}
                                style={{ opacity: canPause ? 1 : 0.3 }}
                            >
                                <span className="icon">
                                    <span className="feather-icon">
                                        <Pause />
                                    </span>
                                </span>
                            </Button>
                            
                            {/* Botão Retomar - aparece para paused */}
                            <Button 
                                variant="flush-dark" 
                                className="btn-icon btn-rounded flush-soft-hover" 
                                data-bs-toggle="tooltip" 
                                data-placement="top" 
                                data-bs-original-title="Retomar"
                                onClick={() => handleResume(campaignId, row?.name || data?.name)}
                                disabled={isProcessing || !canResume}
                                style={{ opacity: canResume ? 1 : 0.3 }}
                            >
                                <span className="icon">
                                    <span className="feather-icon">
                                        <RotateCw />
                                    </span>
                                </span>
                            </Button>
                            
                            {/* Botão Parar - aparece para active ou paused */}
                            <Button 
                                variant="flush-dark" 
                                className="btn-icon btn-rounded flush-soft-hover" 
                                data-bs-toggle="tooltip" 
                                data-placement="top" 
                                data-bs-original-title="Parar"
                                onClick={() => handleStop(campaignId, row?.name || data?.name)}
                                disabled={isProcessing || !canStop}
                                style={{ opacity: canStop ? 1 : 0.3 }}
                            >
                                <span className="icon">
                                    <span className="feather-icon">
                                        <Square />
                                    </span>
                                </span>
                            </Button>
                            
                            <Button 
                                variant="flush-dark" 
                                className="btn-icon btn-rounded flush-soft-hover del-button" 
                                data-bs-toggle="tooltip" 
                                data-placement="top" 
                                data-bs-original-title="Deletar"
                                onClick={() => handleDelete(data.id, row?.name)}
                                disabled={deletingId === data.id || isProcessing}
                            >
                                <span className="icon">
                                    <span className="feather-icon">
                                        <Trash />
                                    </span>
                                </span>
                            </Button>
                        </div>
                        <Dropdown>
                            <Dropdown.Toggle variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover no-caret" aria-expanded="false" data-bs-toggle="dropdown" disabled={isProcessing}>
                                <span className="icon">
                                    <span className="feather-icon">
                                        <MoreVertical />
                                    </span>
                                </span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu align="end">
                                <Dropdown.Item onClick={() => router.push(data.editLink)} disabled={isProcessing}>
                                    <span className="feather-icon dropdown-icon">
                                        <Edit />
                                    </span>
                                    <span>Editar Campanha</span>
                                </Dropdown.Item>
                                
                                <Dropdown.Divider />
                                
                                <Dropdown.Item 
                                    onClick={() => handleStart(campaignId, row?.name || data?.name)} 
                                    disabled={isProcessing || !canStart}
                                    className={!canStart ? 'text-muted' : ''}
                                >
                                    <span className="feather-icon dropdown-icon">
                                        <Play />
                                    </span>
                                    <span>Iniciar Campanha</span>
                                </Dropdown.Item>
                                
                                <Dropdown.Item 
                                    onClick={() => handlePause(campaignId, row?.name || data?.name)} 
                                    disabled={isProcessing || !canPause}
                                    className={!canPause ? 'text-muted' : ''}
                                >
                                    <span className="feather-icon dropdown-icon">
                                        <Pause />
                                    </span>
                                    <span>Pausar Campanha</span>
                                </Dropdown.Item>
                                
                                <Dropdown.Item 
                                    onClick={() => handleResume(campaignId, row?.name || data?.name)} 
                                    disabled={isProcessing || !canResume}
                                    className={!canResume ? 'text-muted' : ''}
                                >
                                    <span className="feather-icon dropdown-icon">
                                        <RotateCw />
                                    </span>
                                    <span>Retomar Campanha</span>
                                </Dropdown.Item>
                                
                                <Dropdown.Item 
                                    onClick={() => handleStop(campaignId, row?.name || data?.name)} 
                                    disabled={isProcessing || !canStop}
                                    className={!canStop ? 'text-muted' : ''}
                                >
                                    <span className="feather-icon dropdown-icon">
                                        <Square />
                                    </span>
                                    <span>Parar Campanha</span>
                                </Dropdown.Item>
                                
                                <Dropdown.Divider />
                                
                                <Dropdown.Item onClick={() => handleDelete(campaignId, row?.name)} disabled={deletingId === campaignId || isProcessing}>
                                    <span className="feather-icon dropdown-icon">
                                        <Trash2 />
                                    </span>
                                    <span>Deletar</span>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                );
            })
        )
    };

    // Formatter para status
    const statusFormatter = (cell) => {
        const statusMap = {
            'draft': { label: 'Rascunho', bg: 'secondary' },
            'active': { label: 'Ativa', bg: 'success' },
            'paused': { label: 'Pausada', bg: 'warning' },
            'completed': { label: 'Completada', bg: 'primary' },
            'cancelled': { label: 'Cancelada', bg: 'danger' },
        };
        const status = statusMap[cell] || { label: cell, bg: 'secondary' };
        return <span className={`badge bg-${status.bg}`}>{status.label}</span>;
    };

    // Formatter para porcentagem de envio
    const progressFormatter = (cell, row) => {
        // cell é o valor de row.progress que é { leadCount, sentCount }
        // row contém os dados completos da linha (pode ser undefined se HkDataTable não passar)
        let leadCount = 0;
        let sentCount = 0;
        
        // Primeiro tenta usar cell (que é o objeto progress)
        if (cell && typeof cell === 'object' && cell.leadCount !== undefined) {
            leadCount = cell.leadCount || 0;
            sentCount = cell.sentCount || 0;
        } 
        // Se cell não tiver os dados, tenta usar row diretamente
        else if (row && typeof row === 'object') {
            leadCount = row.leadCount || 0;
            sentCount = row.sentCount || 0;
        }
        
        if (leadCount === 0) return <span className="text-muted">-</span>;
        const percentage = Math.round((sentCount / leadCount) * 100);
        return (
            <div className="d-flex align-items-center">
                <span className="me-2">{percentage}%</span>
                <div className="progress flex-grow-1" style={{ height: '8px', width: '60px' }}>
                    <div 
                        className="progress-bar" 
                        role="progressbar" 
                        style={{ width: `${percentage}%` }}
                        aria-valuenow={percentage} 
                        aria-valuemin="0" 
                        aria-valuemax="100"
                    />
                </div>
            </div>
        );
    };

    // Formatter para instância WhatsApp
    const instanceFormatter = (cell) => {
        if (!cell || cell === '-') return <span className="text-muted">-</span>;
        return <span className="badge bg-light text-dark">{cell}</span>;
    };

    // Definir colunas (será movido para arquivo separado depois)
    const defaultColumns = [
        {
            accessor: "name",
            title: "Nome",
            sort: true,
        },
        {
            accessor: "status",
            title: "Status",
            sort: true,
            cellFormatter: statusFormatter,
        },
        {
            accessor: "instanceName",
            title: "Instância WhatsApp",
            sort: true,
            cellFormatter: instanceFormatter,
        },
        {
            accessor: "leadCount",
            title: "Leads",
            sort: true,
        },
        {
            accessor: "sentCount",
            title: "Enviados",
            sort: true,
        },
        {
            accessor: "progress",
            title: "Progresso",
            sort: false,
            cellFormatter: progressFormatter,
        },
        {
            accessor: "createdAt",
            title: "Data de Criação",
            sort: true,
        },
        {
            accessor: "actions",
            title: "",
            cellFormatter: actionFormatter,
        },
    ];

    const loadCampaigns = async (showRefreshing = false) => {
        try {
            if (showRefreshing) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            
            const params = {};
            if (statusFilter) {
                params.status = statusFilter;
            }
            
            const response = await listCampaigns(params);
            if (response && response.success && response.data) {
                // Transformar dados para o formato da tabela
                const formattedData = response.data.map(campaign => {
                    const status = (campaign.status || 'draft').toLowerCase(); // Normalizar status
                    
                    // Formatar data de criação
                    let createdAtFormatted = '-';
                    if (campaign.createdAt) {
                        const date = new Date(campaign.createdAt);
                        createdAtFormatted = date.toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                    }
                    
                    return {
                        id: campaign.id,
                        name: campaign.name || '-',
                        status: status, // Garantir que status está em lowercase
                        instanceName: campaign.instanceName || '-',
                        leadCount: campaign.leadIds?.length || 0,
                        sentCount: campaign.sentCount || 0,
                        createdAt: createdAtFormatted,
                        progress: { leadCount: campaign.leadIds?.length || 0, sentCount: campaign.sentCount || 0 },
                        actions: [{ 
                            editLink: `/apps/campaigns/${campaign.id}`, 
                            deleteLink: '#',
                            id: campaign.id,
                            status: status // Passar status também no actions para facilitar acesso
                        }]
                    };
                });
                setCampaigns(formattedData);
            } else {
                // Se não houver dados, manter array vazio
                setCampaigns([]);
            }
        } catch (error) {
            console.error('Erro ao carregar campanhas:', error);
            setCampaigns([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        loadCampaigns(true);
    };

    const handleExportCSV = () => {
        const columns = [
            { key: 'name', label: 'Nome' },
            { key: 'status', label: 'Status', formatter: (val) => formatStatus(val) },
            { key: 'instanceName', label: 'Instância WhatsApp' },
            { key: 'leadCount', label: 'Total de Leads' },
            { key: 'sentCount', label: 'Mensagens Enviadas' },
            { key: 'createdAt', label: 'Data de Criação' },
        ];
        exportToCSV(filteredCampaigns, columns, 'campanhas');
    };

    const handleExportExcel = async () => {
        const columns = [
            { key: 'name', label: 'Nome' },
            { key: 'status', label: 'Status', formatter: (val) => formatStatus(val) },
            { key: 'instanceName', label: 'Instância WhatsApp' },
            { key: 'leadCount', label: 'Total de Leads' },
            { key: 'sentCount', label: 'Mensagens Enviadas' },
            { key: 'createdAt', label: 'Data de Criação' },
        ];
        await exportToExcel(filteredCampaigns, columns, 'campanhas');
    };

    const resolveCampaignName = (campaignId, campaignNameFromRow = '') => {
        const rowName = String(campaignNameFromRow || '').trim();
        if (rowName) return rowName;

        const matchedCampaign = campaigns.find(c => String(c?.id) === String(campaignId));
        const matchedName = String(matchedCampaign?.name || '').trim();
        if (matchedName) return matchedName;

        return `ID ${campaignId}`;
    };

    const handleDelete = async (campaignId, campaignNameFromRow = '') => {
        const campaignName = resolveCampaignName(campaignId, campaignNameFromRow);

        const confirmation = await showCustomAlert({
            variant: 'warning',
            title: 'Confirmar exclusão',
            text: `Tem certeza que quer excluir a campanha "${campaignName}"?\n\nEsta ação não pode ser desfeita.`,
            confirmButtonText: 'Deletar',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
        });

        if (!confirmation.isConfirmed) {
            return;
        }

        try {
            setDeletingId(campaignId);
            const response = await deleteCampaign(campaignId);
            
            // Verifica se a resposta indica sucesso (pode ser { success: true } ou status 204 sem body)
            if (response && response.success === true) {
                // Recarregar a lista
                await loadCampaigns();
                await showCustomAlert({
                    variant: 'success',
                    title: 'Sucesso',
                    text: 'Campanha deletada com sucesso!',
                });
            } else if (!response || response.success !== false) {
                // Se não houver resposta ou se não for explicitamente um erro, considera sucesso (status 204)
                await loadCampaigns();
                await showCustomAlert({
                    variant: 'success',
                    title: 'Sucesso',
                    text: 'Campanha deletada com sucesso!',
                });
            } else {
                await showCustomAlert({
                    variant: 'danger',
                    title: 'Erro',
                    text: response?.message || 'Erro ao deletar campanha',
                });
            }
        } catch (error) {
            console.error('Erro ao deletar campanha:', error);
            const errorMessage = error?.message || error?.body?.message || 'Erro ao deletar campanha. Tente novamente.';
            await showCustomAlert({
                variant: 'danger',
                title: 'Erro',
                text: errorMessage,
            });
        } finally {
            setDeletingId(null);
        }
    };

    const handleStart = async (campaignId, campaignNameFromRow = '') => {
        const campaignName = resolveCampaignName(campaignId, campaignNameFromRow);

        const confirmation = await showCustomAlert({
            variant: 'warning',
            title: 'Iniciar campanha',
            text: `Deseja iniciar a campanha "${campaignName}"?`,
            confirmButtonText: 'Iniciar',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
        });

        if (!confirmation.isConfirmed) {
            return;
        }

        try {
            setProcessingId(campaignId);
            const response = await startCampaign(campaignId);
            
            if (response && response.success) {
                await loadCampaigns();
                await showCustomAlert({
                    variant: 'success',
                    title: 'Sucesso',
                    text: 'Campanha iniciada com sucesso!',
                });
            } else {
                await showCustomAlert({
                    variant: 'danger',
                    title: 'Erro',
                    text: response?.message || 'Erro ao iniciar campanha',
                });
            }
        } catch (error) {
            console.error('Erro ao iniciar campanha:', error);
            await showCustomAlert({
                variant: 'danger',
                title: 'Erro',
                text: error?.message || 'Erro ao iniciar campanha. Tente novamente.',
            });
        } finally {
            setProcessingId(null);
        }
    };

    const handlePause = async (campaignId, campaignNameFromRow = '') => {
        const campaignName = resolveCampaignName(campaignId, campaignNameFromRow);

        const confirmation = await showCustomAlert({
            variant: 'warning',
            title: 'Pausar campanha',
            text: `Deseja pausar a campanha "${campaignName}"?`,
            confirmButtonText: 'Pausar',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
        });

        if (!confirmation.isConfirmed) {
            return;
        }

        try {
            setProcessingId(campaignId);
            const response = await pauseCampaign(campaignId);
            
            if (response && response.success) {
                await loadCampaigns();
                await showCustomAlert({
                    variant: 'success',
                    title: 'Sucesso',
                    text: 'Campanha pausada com sucesso!',
                });
            } else {
                await showCustomAlert({
                    variant: 'danger',
                    title: 'Erro',
                    text: response?.message || 'Erro ao pausar campanha',
                });
            }
        } catch (error) {
            console.error('Erro ao pausar campanha:', error);
            await showCustomAlert({
                variant: 'danger',
                title: 'Erro',
                text: error?.message || 'Erro ao pausar campanha. Tente novamente.',
            });
        } finally {
            setProcessingId(null);
        }
    };

    const handleResume = async (campaignId, campaignNameFromRow = '') => {
        const campaign = campaigns.find(c => String(c?.id) === String(campaignId));
        const campaignName = resolveCampaignName(campaignId, campaignNameFromRow);
        
        console.log('🔄 handleResume chamado:', {
            campaignId,
            campaignName,
            status: campaign?.status,
            campaign
        });
        
        const confirmation = await showCustomAlert({
            variant: 'warning',
            title: 'Retomar campanha',
            text: `Deseja retomar a campanha "${campaignName}"?`,
            confirmButtonText: 'Retomar',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
        });

        if (!confirmation.isConfirmed) {
            return;
        }

        try {
            setProcessingId(campaignId);
            console.log('📡 Chamando API resumeCampaign...');
            const response = await resumeCampaign(campaignId);
            console.log('✅ Resposta da API:', response);
            
            if (response && response.success) {
                await loadCampaigns();
                await showCustomAlert({
                    variant: 'success',
                    title: 'Sucesso',
                    text: 'Campanha retomada com sucesso!',
                });
            } else {
                await showCustomAlert({
                    variant: 'danger',
                    title: 'Erro',
                    text: response?.message || 'Erro ao retomar campanha',
                });
            }
        } catch (error) {
            console.error('❌ Erro ao retomar campanha:', error);
            await showCustomAlert({
                variant: 'danger',
                title: 'Erro',
                text: error?.message || 'Erro ao retomar campanha. Tente novamente.',
            });
        } finally {
            setProcessingId(null);
        }
    };

    const handleStop = async (campaignId, campaignNameFromRow = '') => {
        const campaignName = resolveCampaignName(campaignId, campaignNameFromRow);

        const confirmation = await showCustomAlert({
            variant: 'warning',
            title: 'Parar campanha',
            text: `Deseja parar a campanha "${campaignName}"?\n\nEsta ação não pode ser desfeita.`,
            confirmButtonText: 'Parar',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
        });

        if (!confirmation.isConfirmed) {
            return;
        }

        try {
            setProcessingId(campaignId);
            const response = await stopCampaign(campaignId);
            
            if (response && response.success) {
                await loadCampaigns();
                await showCustomAlert({
                    variant: 'success',
                    title: 'Sucesso',
                    text: 'Campanha parada com sucesso!',
                });
            } else {
                await showCustomAlert({
                    variant: 'danger',
                    title: 'Erro',
                    text: response?.message || 'Erro ao parar campanha',
                });
            }
        } catch (error) {
            console.error('Erro ao parar campanha:', error);
            await showCustomAlert({
                variant: 'danger',
                title: 'Erro',
                text: error?.message || 'Erro ao parar campanha. Tente novamente.',
            });
        } finally {
            setProcessingId(null);
        }
    };

    useEffect(() => {
        setColumns(defaultColumns);
        if (status === 'authenticated') {
            loadCampaigns();
        } else if (status === 'guest') {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, statusFilter]);

    // Calcular estatísticas resumidas
    const stats = useMemo(() => {
        const total = campaigns.length;
        const active = campaigns.filter(c => c.status === 'active').length;
        const paused = campaigns.filter(c => c.status === 'paused').length;
        const draft = campaigns.filter(c => c.status === 'draft').length;
        const totalLeads = campaigns.reduce((sum, c) => sum + (c.leadCount || 0), 0);
        const totalSent = campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0);
        
        return {
            total,
            active,
            paused,
            draft,
            totalLeads,
            totalSent,
            avgProgress: totalLeads > 0 ? Math.round((totalSent / totalLeads) * 100) : 0
        };
    }, [campaigns]);

    // Filtrar campanhas por busca (nome e instância)
    const filteredCampaigns = useMemo(() => {
        if (!searchTerm) return campaigns;
        const search = searchTerm.toLowerCase();
        return campaigns.filter(campaign => 
            campaign.name?.toLowerCase().includes(search) ||
            campaign.instanceName?.toLowerCase().includes(search)
        );
    }, [campaigns, searchTerm]);

    // Expor função para recarregar (pode ser chamada pelo componente pai)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.reloadCampaigns = loadCampaigns;
        }
    }, []);

    return (
        <>
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
            <div className="contact-body">
                <SimpleBar className="nicescroll-bar">
                    <div className="contact-list-view">
                    {/* Cards de Estatísticas */}
                    <Row className="mb-4">
                        <Col md={3} sm={6} className="mb-3">
                            <Card className="card-border card-border-primary">
                                <Card.Body>
                                    <div className="d-flex align-items-center">
                                        <div className="flex-grow-1">
                                            <span className="text-muted fs-7 d-block">Total de Campanhas</span>
                                            <span className="fs-3 fw-bold">{stats.total}</span>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <div className="avatar avatar-sm avatar-primary">
                                                <span className="initial-wrap">C</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3} sm={6} className="mb-3">
                            <Card className="card-border card-border-success">
                                <Card.Body>
                                    <div className="d-flex align-items-center">
                                        <div className="flex-grow-1">
                                            <span className="text-muted fs-7 d-block">Campanhas Ativas</span>
                                            <span className="fs-3 fw-bold text-success">{stats.active}</span>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <div className="avatar avatar-sm avatar-success">
                                                <span className="initial-wrap">A</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3} sm={6} className="mb-3">
                            <Card className="card-border card-border-info">
                                <Card.Body>
                                    <div className="d-flex align-items-center">
                                        <div className="flex-grow-1">
                                            <span className="text-muted fs-7 d-block">Total de Leads</span>
                                            <span className="fs-3 fw-bold">{stats.totalLeads}</span>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <div className="avatar avatar-sm avatar-info">
                                                <span className="initial-wrap">L</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3} sm={6} className="mb-3">
                            <Card className="card-border card-border-warning">
                                <Card.Body>
                                    <div className="d-flex align-items-center">
                                        <div className="flex-grow-1">
                                            <span className="text-muted fs-7 d-block">Mensagens Enviadas</span>
                                            <span className="fs-3 fw-bold">{stats.totalSent}</span>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <div className="avatar avatar-sm avatar-warning">
                                                <span className="initial-wrap">M</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Filtros e Busca */}
                    <Row className="mb-3" >
                        <Col xs={12} md={6} className="mb-3">
                            <div className="contact-toolbar-left d-flex align-items-center gap-2">
                                <Form.Group className="mb-0">
                                    <Form.Select 
                                        size='sm' 
                                        className="w-auto"
                                        value={statusFilter}
                                        onChange={e => setStatusFilter(e.target.value)}
                                    >
                                        <option value="">Todos os Status</option>
                                        <option value="draft">Rascunho</option>
                                        <option value="active">Ativa</option>
                                        <option value="paused">Pausada</option>
                                        <option value="completed">Completada</option>
                                        <option value="cancelled">Cancelada</option>
                                    </Form.Select>
                                </Form.Group>
                                <Button 
                                    size="sm" 
                                    variant="light" 
                                    onClick={handleRefresh}
                                    disabled={refreshing || loading}
                                >
                                    <RefreshCw 
                                        size={14} 
                                        style={refreshing ? { 
                                            animation: 'spin 1s linear infinite',
                                            display: 'inline-block'
                                        } : {}}
                                    />
                                    <span className="ms-1">Atualizar</span>
                                </Button>
                                <Dropdown>
                                    <Dropdown.Toggle 
                                        size="sm" 
                                        variant="light" 
                                        disabled={loading || filteredCampaigns.length === 0}
                                    >
                                        <Download size={14} />
                                        <span className="ms-1">Exportar</span>
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item onClick={handleExportCSV}>
                                            <FileText size={14} className="me-2" />
                                            Exportar como CSV
                                        </Dropdown.Item>
                                        <Dropdown.Item onClick={handleExportExcel}>
                                            <FileText size={14} className="me-2" />
                                            Exportar como Excel
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                        </Col>
                        <Col xs={12} md={6} className="mb-3">
                            <div className="contact-toolbar-right">
                                <div className="dataTables_filter">
                                    <Form.Label>
                                        <Form.Control
                                            size="sm"
                                            type="search"
                                            placeholder="Buscar por nome ou instância..."
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                        />
                                    </Form.Label>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    {loading ? (
                        <div className="text-center py-5">
                            <p>Carregando campanhas...</p>
                        </div>
                    ) : columns.length > 0 ? (
                        <HkDataTable
                            column={columns}
                            rowData={filteredCampaigns}
                            rowsPerPage={10}
                            rowSelection={true}
                            searchQuery={searchTerm}
                            classes="nowrap w-100 mb-5"
                            responsive
                        />
                    ) : (
                        <div className="text-center py-5">
                            <p>Nenhuma campanha encontrada</p>
                        </div>
                    )}
                    </div>
                </SimpleBar >
            </div >
        </>
    )
}

export default CampaignListBody

