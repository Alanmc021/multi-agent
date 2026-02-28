import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import SimpleBar from 'simplebar-react';
import { Button, Col, Dropdown, Form, Pagination, Row, Table } from 'react-bootstrap';
import { Edit, MoreVertical, Trash, Trash2, RefreshCw, X } from 'react-feather';
import HkDataTable from '@/components/@hk-data-table';
import { listLeads, deleteLead } from '@/lib/api/services/leads';
import { useAuth } from '@/lib/auth/AuthProvider';
import { showCustomAlert } from '@/components/CustomAlert';

const LeadListBody = () => {
    const router = useRouter();
    const { status } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sourceFilter, setSourceFilter] = useState('');
    const [dateFromFilter, setDateFromFilter] = useState('');
    const [dateToFilter, setDateToFilter] = useState('');
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [columns, setColumns] = useState([]);
    const [deletingId, setDeletingId] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const handleDelete = async (leadId, leadNameFromRow = '') => {
        const leadName =
            String(leadNameFromRow || '').trim() ||
            leads.find(l => l.id === leadId)?.name ||
            `ID ${leadId}`;

        const confirmation = await showCustomAlert({
            variant: 'warning',
            title: 'Confirmar exclusão',
            text: `Tem certeza que quer excluir o lead "${leadName}"?\n\nEsta ação não pode ser desfeita.`,
            confirmButtonText: 'Deletar',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
        });

        if (!confirmation.isConfirmed) {
            return;
        }

        try {
            setDeletingId(leadId);
            const response = await deleteLead(leadId);
            
            // Verifica se a resposta indica sucesso (pode ser { success: true } ou status 204 sem body)
            if (response && response.success === true) {
                // Recarregar a lista
                await loadLeads();
                await showCustomAlert({
                    variant: 'success',
                    title: 'Sucesso',
                    text: 'Lead deletado com sucesso!',
                });
            } else if (!response || response.success !== false) {
                // Se não houver resposta ou se não for explicitamente um erro, considera sucesso (status 204)
                await loadLeads();
                await showCustomAlert({
                    variant: 'success',
                    title: 'Sucesso',
                    text: 'Lead deletado com sucesso!',
                });
            } else {
                await showCustomAlert({
                    variant: 'danger',
                    title: 'Erro',
                    text: response?.message || 'Erro ao deletar lead',
                });
            }
        } catch (error) {
            console.error('Erro ao deletar lead:', error);
            const errorMessage = error?.message || error?.body?.message || 'Erro ao deletar lead. Tente novamente.';
            await showCustomAlert({
                variant: 'danger',
                title: 'Erro',
                text: errorMessage,
            });
        } finally {
            setDeletingId(null);
        }
    };

    // Formatter para ações
    const actionFormatter = (cell, row) => {
        if (!cell || !Array.isArray(cell) || cell.length === 0) return null;
        return (
            cell.map((data, indx) => (
                <div className="d-flex align-items-center" key={indx} >
                    <div className="d-flex">
                        <Button 
                            variant="flush-dark" 
                            className="btn-icon btn-rounded flush-soft-hover" 
                            data-bs-toggle="tooltip" 
                            data-placement="top" 
                            data-bs-original-title="Editar"
                            onClick={() => router.push(data.editLink)}
                        >
                            <span className="icon">
                                <span className="feather-icon">
                                    <Edit />
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
                            disabled={deletingId === data.id}
                        >
                            <span className="icon">
                                <span className="feather-icon">
                                    <Trash />
                                </span>
                            </span>
                        </Button>
                    </div>
                    <Dropdown>
                        <Dropdown.Toggle variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover no-caret" aria-expanded="false" data-bs-toggle="dropdown">
                            <span className="icon">
                                <span className="feather-icon">
                                    <MoreVertical />
                                </span>
                            </span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu align="end">
                            <Dropdown.Item onClick={() => router.push(data.editLink)}>
                                <span className="feather-icon dropdown-icon">
                                    <Edit />
                                </span>
                                <span>Editar Lead</span>
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleDelete(data.id, row?.name)} disabled={deletingId === data.id}>
                                <span className="feather-icon dropdown-icon">
                                    <Trash2 />
                                </span>
                                <span>Deletar</span>
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            ))
        )
    };

    // Formatter para status
    const statusFormatter = (cell) => {
        const statusMap = {
            'New': { label: 'Novo', bg: 'primary' },
            'Contacted': { label: 'Contatado', bg: 'info' },
            'Qualified': { label: 'Qualificado', bg: 'success' },
            'Converted': { label: 'Convertido', bg: 'success' },
        };
        const status = statusMap[cell] || { label: cell, bg: 'secondary' };
        return <span className={`badge bg-${status.bg}`}>{status.label}</span>;
    };

    // Definir colunas (será movido para arquivo separado depois)
    const defaultColumns = [
        {
            accessor: "name",
            title: "Nome",
            sort: true,
        },
        {
            accessor: "email",
            title: "Email",
            sort: true,
        },
        {
            accessor: "phone",
            title: "Telefone",
            sort: true,
        },
        {
            accessor: "status",
            title: "Status",
            sort: true,
            cellFormatter: statusFormatter,
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

    const loadLeads = async (showRefreshing = false) => {
        try {
            if (showRefreshing) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const params = {
                maxSize: 1000,
            };

            const response = await listLeads(params);
            if (response && response.success && response.data) {
                // Transformar dados para o formato da tabela
                const formattedData = response.data.map(lead => ({
                    id: lead.id,
                    name: lead.name || '-',
                    email: lead.emailAddress || '-',
                    phone: lead.phoneNumber || '-',
                    status: lead.status || 'New',
                    source: lead.source || '-',
                    createdAtRaw: lead.createdAt, // Manter data original para filtros
                    createdAt: lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }) : '-',
                    actions: [{ 
                        editLink: `/apps/leads/${lead.id}`, 
                        deleteLink: '#',
                        id: lead.id 
                    }]
                }));
                setLeads(formattedData);
            } else {
                // Se não houver dados, manter array vazio
                setLeads([]);
            }
        } catch (error) {
            console.error('Erro ao carregar leads:', error);
            console.error('Detalhes do erro:', {
                message: error?.message,
                status: error?.status,
                body: error?.body,
            });
            
            // Se for erro 403 ou 500, tentar sem parâmetros
            if (error?.status === 403 || error?.status === 500 || 
                error?.message?.includes('403') || error?.message?.includes('500')) {
                console.warn('Tentando carregar leads sem parâmetros...');
                try {
                    const simpleResponse = await listLeads();
                    if (simpleResponse && simpleResponse.success && simpleResponse.data) {
                        const formattedData = simpleResponse.data.map(lead => ({
                            id: lead.id,
                            name: lead.name || '-',
                            email: lead.emailAddress || '-',
                            phone: lead.phoneNumber || '-',
                            status: lead.status || 'New',
                            source: lead.source || '-',
                            createdAtRaw: lead.createdAt, // Manter data original para filtros
                            createdAt: lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : '-',
                            actions: [{ 
                                editLink: `/apps/leads/${lead.id}`, 
                                deleteLink: '#',
                                id: lead.id 
                            }]
                        }));
                        setLeads(formattedData);
                        return;
                    }
                } catch (retryError) {
                    console.error('Erro ao tentar carregar leads sem parâmetros:', retryError);
                }
            }
            
            setLeads([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        loadLeads(true);
    };

    const handleClearFilters = () => {
        setStatusFilter('');
        setSourceFilter('');
        setDateFromFilter('');
        setDateToFilter('');
    };

    // Verificar se há filtros ativos
    const hasActiveFilters = statusFilter || sourceFilter || dateFromFilter || dateToFilter;

    // Obter lista única de origens dos leads para o filtro
    const uniqueSources = useMemo(() => {
        const sources = new Set();
        leads.forEach(lead => {
            if (lead.source && lead.source !== '-') {
                sources.add(lead.source);
            }
        });
        return Array.from(sources).sort();
    }, [leads]);

    // Filtrar leads localmente por Status, Origem e Data
    // A busca por texto é feita pelo HkDataTable internamente via searchQuery
    const filteredLeads = useMemo(() => {
        let result = leads;
        
        // Filtro por Status
        if (statusFilter) {
            result = result.filter(lead => lead.status === statusFilter);
        }
        
        // Filtro por Origem
        if (sourceFilter) {
            result = result.filter(lead => lead.source === sourceFilter);
        }
        
        // Filtro por Data De
        if (dateFromFilter) {
            result = result.filter(lead => {
                if (!lead.createdAtRaw) return false;
                const leadDate = new Date(lead.createdAtRaw);
                const filterDate = new Date(dateFromFilter);
                return leadDate >= filterDate;
            });
        }
        
        // Filtro por Data Até
        if (dateToFilter) {
            result = result.filter(lead => {
                if (!lead.createdAtRaw) return false;
                const leadDate = new Date(lead.createdAtRaw);
                const filterDate = new Date(dateToFilter);
                // Adicionar 23:59:59 ao fim do dia para incluir todo o dia
                filterDate.setHours(23, 59, 59, 999);
                return leadDate <= filterDate;
            });
        }
        
        return result;
    }, [leads, statusFilter, sourceFilter, dateFromFilter, dateToFilter]);

    useEffect(() => {
        setColumns(defaultColumns);
        if (status === 'authenticated') {
            loadLeads();
        } else if (status === 'guest') {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, statusFilter, sourceFilter, dateFromFilter, dateToFilter]);

    // Expor função para recarregar (pode ser chamada pelo componente pai)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.reloadLeads = loadLeads;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                    {/* Filtros */}
                    <Row className="mb-3">
                        <Col xs={12}>
                            <div className="d-flex flex-wrap gap-2 align-items-end">
                                <Form.Group className="mb-0">
                                    <Form.Label className="small mb-1">Status</Form.Label>
                                    <Form.Select 
                                        size='sm' 
                                        className="w-auto"
                                        value={statusFilter}
                                        onChange={e => setStatusFilter(e.target.value)}
                                    >
                                        <option value="">Todos os Status</option>
                                        <option value="New">Novo</option>
                                        <option value="Contacted">Contatado</option>
                                        <option value="Qualified">Qualificado</option>
                                        <option value="Converted">Convertido</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-0">
                                    <Form.Label className="small mb-1">Origem</Form.Label>
                                    <Form.Select 
                                        size='sm' 
                                        className="w-auto"
                                        value={sourceFilter}
                                        onChange={e => setSourceFilter(e.target.value)}
                                    >
                                        <option value="">Todas as Origens</option>
                                        {uniqueSources.map(source => (
                                            <option key={source} value={source}>{source}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-0">
                                    <Form.Label className="small mb-1">Data De</Form.Label>
                                    <Form.Control
                                        size="sm"
                                        type="date"
                                        value={dateFromFilter}
                                        onChange={e => setDateFromFilter(e.target.value)}
                                        className="w-auto"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-0">
                                    <Form.Label className="small mb-1">Data Até</Form.Label>
                                    <Form.Control
                                        size="sm"
                                        type="date"
                                        value={dateToFilter}
                                        onChange={e => setDateToFilter(e.target.value)}
                                        className="w-auto"
                                    />
                                </Form.Group>

                                {hasActiveFilters && (
                                    <Button
                                        size="sm"
                                        variant="outline-secondary"
                                        onClick={handleClearFilters}
                                    >
                                        <X size={14} className="me-1" />
                                        Limpar Filtros
                                    </Button>
                                )}

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
                            </div>
                        </Col>
                    </Row>

                    {/* Busca */}
                    <Row className="mb-3">
                        <Col xs={12} md={6}>
                            <div className="contact-toolbar-right">
                                <div className="dataTables_filter">
                                    <Form.Label>
                                        <Form.Control
                                            size="sm"
                                            type="search"
                                            placeholder="Buscar por nome, email ou telefone..."
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                        />
                                    </Form.Label>
                                </div>
                            </div>
                        </Col>
                        {hasActiveFilters && (
                            <Col xs={12} md={6}>
                                <div className="d-flex align-items-center h-100">
                                    <small className="text-muted">
                                        {filteredLeads.length} lead(s) encontrado(s)
                                    </small>
                                </div>
                            </Col>
                        )}
                    </Row>

                    {loading ? (
                        <div className="text-center py-5">
                            <p>Carregando leads...</p>
                        </div>
                    ) : columns.length > 0 ? (
                        <HkDataTable
                            column={columns}
                            rowData={filteredLeads}
                            rowsPerPage={10}
                            rowSelection={true}
                            searchQuery={searchTerm}
                            classes="nowrap w-100 mb-5"
                            responsive
                        />
                    ) : (
                        <div className="text-center py-5">
                            <p>Nenhum lead encontrado</p>
                        </div>
                    )}
                </div>
            </SimpleBar >
        </div >
        </>
    )
}

export default LeadListBody

