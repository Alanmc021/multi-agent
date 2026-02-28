'use client'
import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, ProgressBar, Badge } from 'react-bootstrap';
import * as Icons from 'react-feather';
import documentsAPI from '@/lib/api/services/documents';

const UploadModal = ({ show, onHide, onUploadSuccess, initialCategory }) => {
    const DEFAULT_CATEGORY = 'financeiro';

    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(initialCategory || DEFAULT_CATEGORY);
    const [tags, setTags] = useState('');

    // Atualiza a categoria automaticamente quando o modal abre ou a pasta muda
    useEffect(() => {
        if (show) {
            setCategory(initialCategory || DEFAULT_CATEGORY);
        }
    }, [show, initialCategory]);
    const [isFavorite, setIsFavorite] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [lastUploadRagId, setLastUploadRagId] = useState(null);

    // Validação de arquivo
    const ALLOWED_TYPES = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
        'application/msword', // DOC
        'text/plain',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
        'application/vnd.ms-excel', // XLS
        'text/csv',
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/tiff',
        'image/gif',
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'video/x-matroska',
        'video/webm',
        'audio/mpeg', // MP3
        'audio/wav',
        'audio/mp4', // M4A
        'audio/aac',
        'audio/ogg',
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
    ];

    const MAX_FILE_SIZE = {
        'video': 500 * 1024 * 1024, // 500 MB
        'audio': 100 * 1024 * 1024, // 100 MB
        'image': 10 * 1024 * 1024,  // 10 MB
        'document': 50 * 1024 * 1024, // 50 MB
        'archive': 100 * 1024 * 1024, // 100 MB
    };

    const getFileType = (mimeType) => {
        if (mimeType.startsWith('video/')) return 'video';
        if (mimeType.startsWith('audio/')) return 'audio';
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'archive';
        return 'document';
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setError(null);

        if (!selectedFile) {
            setFile(null);
            return;
        }

        // Validar tipo
        if (!ALLOWED_TYPES.includes(selectedFile.type)) {
            setError(`Tipo de arquivo não permitido: ${selectedFile.type}`);
            setFile(null);
            return;
        }

        // Validar tamanho
        const fileType = getFileType(selectedFile.type);
        const maxSize = MAX_FILE_SIZE[fileType];
        if (selectedFile.size > maxSize) {
            const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
            setError(`Arquivo muito grande. Máximo: ${maxSizeMB} MB para arquivos de ${fileType}`);
            setFile(null);
            return;
        }

        setFile(selectedFile);
        
        // Auto-preencher título se vazio
        if (!title) {
            const fileNameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
            setTitle(fileNameWithoutExt);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        // Validações
        if (!file) {
            setError('Selecione um arquivo para fazer upload');
            return;
        }

        if (!title.trim()) {
            setError('O título é obrigatório');
            return;
        }

        if (!category) {
            setError('Selecione uma categoria');
            return;
        }

        try {
            setUploading(true);
            setUploadProgress(0);

            const metadata = {
                title: title.trim(),
                description: description.trim(),
                category,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                isFavorite,
            };

            const response = await documentsAPI.upload(
                file,
                metadata,
                (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(percentCompleted);
                }
            );

            setSuccess(true);
            setUploadProgress(100);
            setLastUploadRagId(response?.ragDocumentId || null);

            const indexedInRag = !!response?.ragDocumentId;
            if (indexedInRag) {
                console.log('[Upload] Documento indexado no RAG:', response.ragDocumentId);
            } else if (response?._id || response?.id) {
                console.warn('[Upload] Documento salvo mas sem ragDocumentId (mídia sem descrição ou tipo não vetorizável)');
            }

            // Resetar form após 1 segundo
            setTimeout(() => {
                resetForm();
                if (onUploadSuccess) {
                    onUploadSuccess(response);
                }
                onHide();
            }, 1500);

        } catch (err) {
            console.error('Erro ao fazer upload:', err);
            setError(err.message || 'Erro ao fazer upload do documento');
            setUploading(false);
        }
    };

    const resetForm = () => {
        setFile(null);
        setTitle('');
        setDescription('');
        setCategory('financeiro');
        setTags('');
        setIsFavorite(false);
        setUploading(false);
        setUploadProgress(0);
        setError(null);
        setSuccess(false);
        setLastUploadRagId(null);
    };

    const handleClose = () => {
        if (!uploading) {
            resetForm();
            onHide();
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton={!uploading}>
                <Modal.Title>
                    <Icons.UploadCloud size={24} className="me-2" />
                    Upload de Documento
                </Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {/* Error Alert */}
                    {error && (
                        <Alert variant="danger" dismissible onClose={() => setError(null)}>
                            <Icons.AlertCircle size={18} className="me-2" />
                            {error}
                        </Alert>
                    )}

                    {/* Success Alert */}
                    {success && (
                        <Alert variant="success">
                            <Icons.CheckCircle size={18} className="me-2" />
                            Upload realizado com sucesso!
                            {lastUploadRagId && (
                                <div className="mt-2 small">
                                    Documento indexado no RAG. Você já pode perguntar sobre ele ao agente.
                                </div>
                            )}
                        </Alert>
                    )}

                    {/* File Upload */}
                    <Form.Group className="mb-3">
                        <Form.Label>Arquivo *</Form.Label>
                        <Form.Control
                            type="file"
                            onChange={handleFileChange}
                            disabled={uploading}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png,.webp,.gif,.mp4,.mov,.avi,.mkv,.mp3,.wav,.m4a,.zip,.rar,.7z"
                        />
                        {file && (
                            <div className="mt-2 p-2 border rounded bg-light">
                                <small className="text-muted d-flex align-items-center">
                                    <Icons.File size={16} className="me-2" />
                                    <span className="me-2">{file.name}</span>
                                    <Badge bg="secondary">{formatFileSize(file.size)}</Badge>
                                </small>
                            </div>
                        )}
                        <Form.Text className="text-muted">
                            Formatos aceitos: PDF, Word, Excel, Imagens, Vídeos, Áudios, Arquivos compactados
                        </Form.Text>
                    </Form.Group>

                    {/* Title */}
                    <Form.Group className="mb-3">
                        <Form.Label>Título *</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Ex: Contrato de Prestação de Serviços 2025"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={uploading}
                            maxLength={255}
                            required
                        />
                    </Form.Group>

                    {/* Description */}
                    <Form.Group className="mb-3">
                        <Form.Label>Descrição (Opcional)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Descreva brevemente o conteúdo do documento..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={uploading}
                        />
                    </Form.Group>

                    {/* Category */}
                    <Form.Group className="mb-3">
                        <Form.Label>Categoria *</Form.Label>
                        <Form.Select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            disabled={uploading}
                            required
                        >
                            <optgroup label="📊 Assistentes Especializados">
                                <option value="financeiro">💰 Financeiro</option>
                                <option value="marketing">📢 Marketing</option>
                                <option value="vendas">💼 Vendas</option>
                                <option value="operacoes">⚙️ Operações</option>
                                <option value="rh">👥 Recursos Humanos</option>
                                <option value="juridico">⚖️ Jurídico</option>
                                <option value="leads">🎯 Leads</option>
                            </optgroup>
                            <optgroup label="📋 Documentos Administrativos">
                                <option value="contratos">📄 Contratos</option>
                                <option value="licitacoes">🏛️ Licitações</option>
                                <option value="decretos">📜 Decretos</option>
                                <option value="processos">⚖️ Processos</option>
                                <option value="pareceres">📝 Pareceres</option>
                            </optgroup>
                            <optgroup label="🎥 Mídia">
                                <option value="audiencias">🎙️ Audiências</option>
                                <option value="videos">📹 Vídeos</option>
                                <option value="depoimentos">🗣️ Depoimentos</option>
                                <option value="transmissoes">📡 Transmissões</option>
                            </optgroup>
                        </Form.Select>
                        <Form.Text className="text-muted">
                            Selecione a categoria que define o tipo de documento e qual assistente terá acesso a ele
                        </Form.Text>
                    </Form.Group>

                    {/* Tags */}
                    <Form.Group className="mb-3">
                        <Form.Label>Tags (Opcional)</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Ex: urgente, 2025, parceria (separadas por vírgula)"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            disabled={uploading}
                        />
                        <Form.Text className="text-muted">
                            Separe múltiplas tags por vírgula
                        </Form.Text>
                    </Form.Group>

                    {/* Favorite Checkbox */}
                    <Form.Group className="mb-3">
                        <Form.Check
                            type="checkbox"
                            label="Marcar como favorito"
                            checked={isFavorite}
                            onChange={(e) => setIsFavorite(e.target.checked)}
                            disabled={uploading}
                        />
                    </Form.Group>

                    {/* Progress Bar */}
                    {uploading && (
                        <div className="mb-3">
                            <ProgressBar
                                now={uploadProgress}
                                label={`${uploadProgress}%`}
                                animated
                                striped
                                variant={success ? 'success' : 'primary'}
                            />
                        </div>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={uploading}>
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={uploading || !file}
                        style={{
                            background: file && !uploading
                                ? 'linear-gradient(135deg, #009b36 0%, #007a2b 100%)'
                                : undefined,
                            border: 'none',
                            borderRadius: 8,
                            padding: '9px 22px',
                            fontWeight: 600,
                            fontSize: 15,
                            boxShadow: file && !uploading ? '0 4px 14px rgba(0,155,54,0.35)' : undefined,
                            minWidth: 150,
                        }}
                    >
                        {uploading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Icons.UploadCloud size={18} className="me-2" />
                                Fazer Upload
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default UploadModal;

