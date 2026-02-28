'use client'
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Spinner, Alert, Button, Badge, Dropdown, Row, Col, Card } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import HkDataTable from '@/components/@hk-data-table';
import * as Icons from 'react-feather';
import documentsAPI from '@/lib/api/services/documents';

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

const getFileIcon = (mimeType) => {
    if (!mimeType) return <Icons.File className="text-secondary" />;
    if (mimeType.startsWith('video/'))   return <Icons.Video className="text-danger" />;
    if (mimeType.startsWith('audio/'))   return <Icons.Music className="text-primary" />;
    if (mimeType.startsWith('image/'))   return <Icons.Image className="text-success" />;
    if (mimeType === 'application/pdf')  return <Icons.FileText className="text-danger" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <Icons.FileText className="text-success" />;
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return <Icons.FileText className="text-warning" />;
    if (mimeType.includes('zip') || mimeType.includes('rar')) return <Icons.Archive className="text-info" />;
    return <Icons.File className="text-secondary" />;
};

const translateStatus = (status) => {
    const map = { active: 'Ativo', archived: 'Arquivado', deleted: 'Deletado' };
    return map[status] || status;
};

// ─── Definição das Pastas ────────────────────────────────────────────────────

const FOLDERS = [
    // Documentos Administrativos
    { id: 'contratos',    label: 'Contratos',    emoji: '📄', color: '#e3f0fb', icon: Icons.Shield,      group: 'Administrativo' },
    { id: 'licitacoes',   label: 'Licitações',   emoji: '🏛️', color: '#fef9e7', icon: Icons.Award,       group: 'Administrativo' },
    { id: 'decretos',     label: 'Decretos',     emoji: '📜', color: '#fdf2f8', icon: Icons.File,        group: 'Administrativo' },
    { id: 'processos',    label: 'Processos',    emoji: '⚖️', color: '#f0fdf4', icon: Icons.BookOpen,    group: 'Administrativo' },
    { id: 'pareceres',    label: 'Pareceres',    emoji: '📝', color: '#fff7ed', icon: Icons.CheckSquare, group: 'Administrativo' },
    // Financeiro / Jurídico / RH
    { id: 'financeiro',   label: 'Financeiro',   emoji: '💰', color: '#f0fdf4', icon: Icons.DollarSign,  group: 'Gestão' },
    { id: 'juridico',     label: 'Jurídico',     emoji: '⚖️', color: '#fdf2f8', icon: Icons.Briefcase,   group: 'Gestão' },
    { id: 'rh',           label: 'RH',           emoji: '👥', color: '#e3f0fb', icon: Icons.Users,       group: 'Gestão' },
    { id: 'marketing',    label: 'Marketing',    emoji: '📢', color: '#fff7ed', icon: Icons.TrendingUp,  group: 'Gestão' },
    { id: 'vendas',       label: 'Vendas',       emoji: '💼', color: '#fef9e7', icon: Icons.ShoppingCart, group: 'Gestão' },
    { id: 'operacoes',    label: 'Operações',    emoji: '⚙️', color: '#f0fdf4', icon: Icons.Settings,    group: 'Gestão' },
    { id: 'leads',        label: 'Leads',        emoji: '🎯', color: '#e3f0fb', icon: Icons.Target,      group: 'Gestão' },
    // Mídia
    { id: 'audiencias',   label: 'Audiências',   emoji: '🎙️', color: '#fdf2f8', icon: Icons.Mic,         group: 'Mídia' },
    { id: 'videos',       label: 'Vídeos',       emoji: '📹', color: '#fff7ed', icon: Icons.Video,       group: 'Mídia' },
    { id: 'depoimentos',  label: 'Depoimentos',  emoji: '🗣️', color: '#e3f0fb', icon: Icons.MessageSquare, group: 'Mídia' },
    { id: 'transmissoes', label: 'Transmissões', emoji: '📡', color: '#f0fdf4', icon: Icons.Radio,       group: 'Mídia' },
];

// ─── Componente FolderCard ───────────────────────────────────────────────────

const FolderCard = ({ folder, count, onClick }) => {
    const FolderIcon = folder.icon;
    const hasFiles = count > 0;
    return (
        <Col xs={6} sm={4} md={3} xl={2} className="mb-3">
            <Card
                className="h-100 text-center"
                style={{
                    cursor: 'pointer',
                    transition: 'box-shadow 0.15s ease, transform 0.1s ease, border-color 0.15s ease',
                    borderRadius: 12,
                    border: '1.5px solid #e8f5ed',
                }}
                onClick={onClick}
                onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,155,54,0.10)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = '#009b36';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '';
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.borderColor = '#e8f5ed';
                }}
            >
                <Card.Body className="d-flex flex-column align-items-center justify-content-center py-3 px-2">
                    <div
                        className="d-flex align-items-center justify-content-center mb-2"
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            background: folder.color,
                        }}
                    >
                        <FolderIcon size={22} strokeWidth={1.5} style={{ color: '#009b36' }} />
                    </div>
                    <div className="fw-semibold small text-truncate w-100">{folder.label}</div>
                    <div style={{ fontSize: 11, color: hasFiles ? '#009b36' : '#aaa', fontWeight: hasFiles ? 600 : 400 }}>
                        {count !== undefined ? `${count} arquivo${count !== 1 ? 's' : ''}` : '—'}
                    </div>
                </Card.Body>
            </Card>
        </Col>
    );
};

// ─── DocumentsList ───────────────────────────────────────────────────────────

const CATEGORY_IDS = FOLDERS.map(f => f.id);

const DocumentsList = forwardRef(({ toggleInfo, onDocumentSelect, activeFilter = 'all', onFolderChange }, ref) => {
    const [allDocuments, setAllDocuments]     = useState([]);
    const [folderDocuments, setFolderDocuments] = useState([]);
    const [openFolder, setOpenFolder]         = useState(null); // { id, label }
    const [loadingAll, setLoadingAll]         = useState(true);
    const [loadingFolder, setLoadingFolder]   = useState(false);
    const [error, setError]                   = useState(null);

    // Carregar todos os documentos (para contar por pasta)
    const loadAllDocuments = async () => {
        try {
            setLoadingAll(true);
            setError(null);
            const response = await documentsAPI.list({ limit: 500, sortBy: 'uploadedAt', sortOrder: 'desc' });
            setAllDocuments(response.documents || []);
        } catch {
            setError('Erro ao carregar documentos.');
        } finally {
            setLoadingAll(false);
        }
    };

    // Carregar documentos de uma pasta específica
    const loadFolderDocuments = async (categoryId) => {
        try {
            setLoadingFolder(true);
            setError(null);

            if (categoryId === '__uncategorized__') {
                // Filtra client-side documentos sem categoria
                setFolderDocuments(allDocuments.filter(d => !d.category));
                return;
            }

            const response = await documentsAPI.list({
                category: categoryId,
                limit: 100,
                sortBy: 'uploadedAt',
                sortOrder: 'desc',
            });
            setFolderDocuments(response.documents || []);
        } catch {
            setError('Erro ao carregar documentos da pasta.');
        } finally {
            setLoadingFolder(false);
        }
    };

    useImperativeHandle(ref, () => ({
        reload: () => {
            loadAllDocuments();
            if (openFolder) loadFolderDocuments(openFolder.id);
        },
        search: (query) => {
            // busca global: só fecha pasta e filtra se houver query real
            if (!query || !query.trim()) return;
            setOpenFolder(null);
            documentsAPI.list({ search: query.trim(), limit: 100, sortBy: 'uploadedAt', sortOrder: 'desc' })
                .then(r => setAllDocuments(r.documents || []))
                .catch(() => {});
        },
    }));

    // Ao montar
    useEffect(() => { loadAllDocuments(); }, []);

    // Quando o sidebar muda o filtro: fechar pasta se mudar para all/recent/favorites/shared
    useEffect(() => {
        if (!CATEGORY_IDS.includes(activeFilter)) {
            setOpenFolder(null);
        } else {
            // Sidebar clicou numa categoria: abre essa pasta
            const folder = FOLDERS.find(f => f.id === activeFilter);
            if (folder) openFolderById(folder);
        }
    }, [activeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

    const openFolderById = (folder) => {
        setOpenFolder(folder);
        loadFolderDocuments(folder.id);
        if (onFolderChange) onFolderChange(folder.id);
    };

    const closeFolder = () => {
        setOpenFolder(null);
        if (onFolderChange) onFolderChange(null);
    };

    // Documentos filtrados client-side (para visões especiais)
    const getSpecialDocuments = () => {
        if (activeFilter === 'recent')    return allDocuments.slice(0, 10);
        if (activeFilter === 'favorites') return allDocuments.filter(d => d.isFavorite);
        if (activeFilter === 'shared')    return allDocuments.filter(d => d.sharedWith?.length > 0);
        return allDocuments;
    };

    // Contagem por pasta
    const countByCategory = (categoryId) =>
        allDocuments.filter(d => d.category === categoryId).length;

    // Processar documentos para exibição
    const processDoc = (doc) => ({
        ...doc,
        uploadedByString: typeof doc.uploadedBy === 'object'
            ? (doc.uploadedBy?.name || doc.uploadedBy?.email || 'Desconhecido')
            : (doc.uploadedBy || 'Desconhecido'),
    });

    // ── Colunas da tabela ──────────────────────────────────────────────────

    const handleDownload = async (id) => {
        try { await documentsAPI.download(id); } catch { setError('Erro ao baixar.'); }
    };

    const handleToggleFavorite = async (id, current) => {
        try {
            await documentsAPI.toggleFavorite(id, !current);
            loadAllDocuments();
            if (openFolder) loadFolderDocuments(openFolder.id);
        } catch { setError('Erro ao favoritar.'); }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Excluir "${title}"?\n\nEsta ação não pode ser desfeita.`)) return;
        try {
            await documentsAPI.delete(id);
            loadAllDocuments();
            if (openFolder) loadFolderDocuments(openFolder.id);
        } catch { setError('Erro ao excluir.'); }
    };

    const columns = [
        {
            accessor: 'title',
            title: 'Nome',
            cellFormatter: (cell, row) => (
                <div
                    className="d-flex align-items-center"
                    style={{ cursor: 'pointer' }}
                    onClick={() => onDocumentSelect && onDocumentSelect(row)}
                >
                    <span className="me-2">{getFileIcon(row.mimeType)}</span>
                    <span className="fw-medium text-truncate" style={{ maxWidth: 260 }}>{cell}</span>
                    {row.isFavorite && <Icons.Star size={13} className="text-warning ms-1" fill="currentColor" />}
                </div>
            ),
        },
        {
            accessor: 'category',
            title: 'Categoria',
            cellFormatter: (cell) => {
                const folder = FOLDERS.find(f => f.id === cell);
                return folder
                    ? <Badge bg="light" text="dark" className="border">{folder.emoji} {folder.label}</Badge>
                    : <span className="text-muted small">{cell || '—'}</span>;
            },
        },
        {
            accessor: 'fileSize',
            title: 'Tamanho',
            cellFormatter: (cell) => <span className="text-muted small">{formatFileSize(cell)}</span>,
        },
        {
            accessor: 'uploadedByString',
            title: 'Enviado por',
            cellFormatter: (cell) => <span className="text-muted small">{cell}</span>,
        },
        {
            accessor: 'uploadedAt',
            title: 'Data',
            cellFormatter: (cell) => <span className="text-muted small">{formatDate(cell)}</span>,
        },
        {
            accessor: 'status',
            title: 'Status',
            cellFormatter: (cell) => <Badge bg={cell === 'active' ? 'light-success' : 'light-secondary'}>{translateStatus(cell)}</Badge>,
        },
        {
            accessor: '_id',
            title: '',
            cellFormatter: (cell, row) => (
                <Dropdown align="end">
                    <Dropdown.Toggle as="span" style={{ cursor: 'pointer' }}>
                        <Icons.MoreHorizontal size={16} className="text-muted" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => { onDocumentSelect && onDocumentSelect(row); toggleInfo && toggleInfo(); }}>
                            <Icons.Eye size={14} className="me-2" /> Visualizar
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleToggleFavorite(cell, row.isFavorite)}>
                            <Icons.Star size={14} className="me-2" />
                            {row.isFavorite ? 'Remover favorito' : 'Adicionar favorito'}
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleDownload(cell)}>
                            <Icons.Download size={14} className="me-2" /> Baixar
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item className="text-danger" onClick={() => handleDelete(cell, row.title)}>
                            <Icons.Trash2 size={14} className="me-2" /> Excluir
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            ),
        },
    ];

    // ── Render ─────────────────────────────────────────────────────────────

    const isLoading = loadingAll || loadingFolder;

    // ── Vista: interior de uma pasta ───────────────────────────────────────
    if (openFolder) {
        const docs = folderDocuments.map(processDoc);
        const FolderIcon = openFolder.icon || Icons.Folder;

        return (
            <div className="fm-body">
                <SimpleBar className="nicescroll-bar">
                    <div className="file-list-view">
                        {/* Breadcrumb */}
                        <div
                            className="d-flex align-items-center gap-2 px-4 pt-3 pb-3"
                            style={{ background: '#ebf7ef', borderBottom: '2px solid #c8ecd4' }}
                        >
                            <button
                                className="btn btn-sm d-flex align-items-center gap-1"
                                style={{ background: '#fff', border: '1.5px solid #009b36', color: '#009b36', borderRadius: 8 }}
                                onClick={closeFolder}
                            >
                                <Icons.ChevronLeft size={14} />
                                Voltar
                            </button>
                            <Icons.Home size={14} style={{ color: '#009b36' }} />
                            <span style={{ color: '#009b36', fontSize: 13 }}>/</span>
                            <span className="fw-semibold small" style={{ color: '#009b36' }}>{openFolder.label}</span>
                            {!loadingFolder && (
                                <span style={{ fontSize: 11, background: '#fff', color: '#009b36', border: '1px solid #c8ecd4', borderRadius: 8, padding: '1px 8px', fontWeight: 600 }}>
                                    {docs.length} arquivo{docs.length !== 1 ? 's' : ''}
                                </span>
                            )}
                            {loadingFolder && <Spinner animation="border" size="sm" style={{ color: '#009b36' }} />}
                        </div>

                        {error && (
                            <Alert variant="danger" className="m-4">{error}</Alert>
                        )}

                        {loadingFolder && (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                                <p className="text-muted mt-3">Carregando...</p>
                            </div>
                        )}

                        {!loadingFolder && docs.length > 0 && (
                            <HkDataTable
                                column={columns}
                                rowData={docs}
                                rowSelection={true}
                                markStarred={true}
                                classes="nowrap w-100 mb-5"
                                responsive
                            />
                        )}

                        {!loadingFolder && docs.length === 0 && (
                            <div className="text-center py-5">
                                <Icons.Archive size={52} className="text-muted mb-3" strokeWidth={1} />
                                <p className="fw-medium text-muted">Pasta vazia</p>
                                <p className="text-muted small">
                                    Nenhum documento na categoria "{openFolder.label}".<br />
                                    Faça upload e selecione esta categoria.
                                </p>
                            </div>
                        )}
                    </div>
                </SimpleBar>
            </div>
        );
    }

    // ── Vista: visões especiais (recentes, favoritos, compartilhados) ──────
    if (['recent', 'favorites', 'shared'].includes(activeFilter)) {
        const LABELS = { recent: 'Recentes', favorites: 'Favoritos', shared: 'Compartilhados' };
        const docs = getSpecialDocuments().map(processDoc);

        return (
            <div className="fm-body">
                <SimpleBar className="nicescroll-bar">
                    <div className="file-list-view">
                        <div
                            className="d-flex align-items-center gap-2 px-4 pt-3 pb-3"
                            style={{ background: '#ebf7ef', borderBottom: '2px solid #c8ecd4' }}
                        >
                            <h6 className="mb-0 fw-semibold" style={{ color: '#009b36' }}>{LABELS[activeFilter]}</h6>
                            {!loadingAll && (
                                <span style={{ fontSize: 11, background: '#fff', color: '#009b36', border: '1px solid #c8ecd4', borderRadius: 8, padding: '1px 8px', fontWeight: 600 }}>
                                    {docs.length}
                                </span>
                            )}
                            {loadingAll && <Spinner animation="border" size="sm" style={{ color: '#009b36' }} />}
                        </div>

                        {loadingAll && (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                            </div>
                        )}

                        {!loadingAll && docs.length > 0 && (
                            <HkDataTable
                                column={columns}
                                rowData={docs}
                                rowSelection={true}
                                markStarred={true}
                                classes="nowrap w-100 mb-5"
                                responsive
                            />
                        )}

                        {!loadingAll && docs.length === 0 && (
                            <div className="text-center py-5">
                                <Icons.Inbox size={48} className="text-muted mb-3" />
                                <p className="text-muted">Nenhum documento encontrado</p>
                            </div>
                        )}
                    </div>
                </SimpleBar>
            </div>
        );
    }

    // ── Vista padrão: grade de pastas ──────────────────────────────────────
    const GROUPS = ['Mídia', 'Administrativo', 'Gestão'];

    return (
        <div className="fm-body">
            <SimpleBar className="nicescroll-bar">
                <div className="file-list-view px-4 pt-4">
                    {error && <Alert variant="danger">{error}</Alert>}

                    {loadingAll && (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="text-muted mt-3">Carregando...</p>
                        </div>
                    )}

                    {!loadingAll && GROUPS.map(group => {
                        const folders = FOLDERS.filter(f => f.group === group);
                        return (
                            <div key={group} className="mb-4">
                                <div className="d-flex align-items-center gap-2 mb-3 pb-1" style={{ borderBottom: '2px solid #ebf7ef' }}>
                                    <span className="fw-semibold small text-uppercase" style={{ color: '#009b36', letterSpacing: '0.06em' }}>{group}</span>
                                    <span style={{ fontSize: 11, background: '#ebf7ef', color: '#009b36', borderRadius: 8, padding: '1px 8px', fontWeight: 600 }}>
                                        {folders.reduce((sum, f) => sum + countByCategory(f.id), 0)} arquivos
                                    </span>
                                </div>
                                <Row className="g-3">
                                    {folders.map(folder => (
                                        <FolderCard
                                            key={folder.id}
                                            folder={folder}
                                            count={countByCategory(folder.id)}
                                            onClick={() => openFolderById(folder)}
                                        />
                                    ))}
                                </Row>
                            </div>
                        );
                    })}

                    {/* Todos os documentos sem categoria */}
                    {!loadingAll && (
                        <div className="mb-5">
                            <div className="d-flex align-items-center gap-2 mb-3 pb-1" style={{ borderBottom: '2px solid #fffbed' }}>
                                <span className="fw-semibold small text-uppercase" style={{ color: '#b38600', letterSpacing: '0.06em' }}>Sem Categoria</span>
                            </div>
                            <Row className="g-3">
                                <FolderCard
                                    folder={{
                                        id: '__uncategorized__',
                                        label: 'Sem categoria',
                                        emoji: '📁',
                                        color: '#f5f5f5',
                                        icon: Icons.Archive,
                                    }}
                                    count={allDocuments.filter(d => !d.category).length}
                                    onClick={() => openFolderById({
                                        id: '__uncategorized__',
                                        label: 'Sem categoria',
                                        emoji: '📁',
                                        color: '#f5f5f5',
                                        icon: Icons.Archive,
                                    })}
                                />
                            </Row>
                        </div>
                    )}
                </div>
            </SimpleBar>
        </div>
    );
});

DocumentsList.displayName = 'DocumentsList';

export default DocumentsList;
