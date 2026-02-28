'use client';
import React, { useState, useRef } from 'react';
import classNames from 'classnames';
import SimpleBar from 'simplebar-react';
import { Button, Card, Col, Form, Row, Alert, Badge, ProgressBar, Spinner } from 'react-bootstrap';
import { Zap, Video, Download, Play, User, Volume2, Type, Clock, Settings, Upload } from 'react-feather';
// import VideoGeneratorSidebar from '../VideoGeneratorSidebar';
import ImageGeneratorSidebar from '../ImageGeneratorSidebar';

import VideoGeneratorHeader from '../VideoGeneratorHeader';
import studioAPI from '@/lib/api/services/studio';

const VideoGeneratorBody = () => {
    const [avatar, setAvatar] = useState('marcos-almeida');
    // ========== MOCK DATA (remover depois) ==========
    const MOCK_SCRIPT = 'Reporter: Sr Marcos Almeida, qual é o maior problema do Rio hoje? \nEntrevistado: Hoje cam certeza é a falta de emprego, Precisamos dar mais oportunidades.';
    const MOCK_IMAGE_URL = '/img/moke/entrevista-marcos-almeida.jpg';
    // ========== MOCK DATA END ==========
    const [script, setScript] = useState(MOCK_SCRIPT);
    const [language, setLanguage] = useState('pt-BR');
    const [voice, setVoice] = useState('neural-male-1');
    const [duration, setDuration] = useState(5);
    const [theme, setTheme] = useState('professional');
    const [subtitles, setSubtitles] = useState(true);
    const [aspectRatio, setAspectRatio] = useState('auto');
    const [seed, setSeed] = useState(70);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(MOCK_IMAGE_URL);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    // Avatares disponíveis
    const avatars = [
        { value: 'marcos-almeida', label: '👨 Marcos Almeida', description: 'Avatar candidato político' },
        { value: 'joao-silva', label: '👨 João Silva', description: 'Avatar masculino formal' },
        { value: 'maria-santos', label: '👩 Maria Santos', description: 'Avatar feminino profissional' },
        { value: 'carlos-oliveira', label: '👨‍💼 Carlos Oliveira', description: 'Avatar executivo' },
        { value: 'ana-costa', label: '👩‍💼 Ana Costa', description: 'Avatar apresentadora' },
    ];

    // Idiomas
    const languages = [
        { value: 'pt-BR', label: '🇧🇷 Português (Brasil)' },
        { value: 'en-US', label: '🇺🇸 English (US)' },
        { value: 'es-ES', label: '🇪🇸 Español' },
        { value: 'fr-FR', label: '🇫🇷 Français' },
    ];

    // Vozes
    const voices = [
        { value: 'neural-male-1', label: '🎙️ Masculina Neural 1', description: 'Voz masculina profissional' },
        { value: 'neural-male-2', label: '🎙️ Masculina Neural 2', description: 'Voz masculina amigável' },
        { value: 'neural-female-1', label: '🎙️ Feminina Neural 1', description: 'Voz feminina profissional' },
        { value: 'neural-female-2', label: '🎙️ Feminina Neural 2', description: 'Voz feminina suave' },
    ];

    // Temas
    const themes = [
        { value: 'professional', label: '💼 Profissional', description: 'Fundo corporativo azul' },
        { value: 'political', label: '🏛️ Político', description: 'Bandeira do Brasil' },
        { value: 'modern', label: '✨ Moderno', description: 'Fundo gradiente' },
        { value: 'minimalist', label: '⚪ Minimalista', description: 'Fundo branco clean' },
    ];

    // Scripts de exemplo
    const exampleScripts = [
        "Olá, sou Marcos Almeida, candidato a prefeito da nossa cidade. Trabalhei toda minha vida ao lado das pessoas, conhecendo a realidade de cada família, de cada trabalhador. Agora é hora de renovação, de união e trabalho. Juntos, vamos construir um futuro melhor, com mais saúde, educação e oportunidades para todos. Conte comigo!",
        "É hora de mudança! Nossa campanha representa o novo, o futuro. Vote consciente, vote 15!",
        "Trabalhei muito para chegar até aqui. Conheço a realidade de cada bairro. Com sua confiança, vamos fazer a diferença.",
    ];

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!script.trim()) {
            setError('Por favor, escreva o script do vídeo.');
            return;
        }

        if (script.trim().split(/\s+/).length < 10) {
            setError('O script deve ter pelo menos 10 palavras.');
            return;
        }

        setIsProcessing(true);
        setError(null);
        setResult(null);
        setProgress(0);

        // Animação de progresso em paralelo
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 95) {
                    clearInterval(progressInterval);
                    return 95;
                }
                return prev + 5;
            });
        }, 300);

        try {
            // ========== MOCK START (remover depois) ==========
            await new Promise((resolve) => setTimeout(resolve, 4000));
            clearInterval(progressInterval);
            setProgress(100);
            setResult({
                success: true,
                videoUrl: '/video/mock/video-generator-1.mp4',
                duration: `00:${String(duration).padStart(2, '0')}`,
                size: '2.3 MB',
                resolution: aspectRatio === '16:9' ? '1920x1080' : 
                            aspectRatio === '9:16' ? '1080x1920' :
                            aspectRatio === '1:1' ? '1080x1080' : '1920x1080',
                avatar: avatars.find(a => a.value === avatar)?.label || avatar,
                language: languages.find(l => l.value === language)?.label || language,
                metadata: { mock: true },
            });
            // ========== MOCK END (remover depois) ==========

            // ========== ORIGINAL API CALL (descomentar depois) ==========
            // const response = await studioAPI.generateVideo(
            //     image,
            //     script,
            //     duration,
            //     aspectRatio,
            //     seed
            // );
            //
            // clearInterval(progressInterval);
            // setProgress(100);
            //
            // if (response.success) {
            //     setResult({
            //         success: true,
            //         videoUrl: response.data.videoUrl,
            //         duration: `00:${String(response.data.duration).padStart(2, '0')}`,
            //         size: 'N/A',
            //         resolution: aspectRatio === '16:9' ? '1920x1080' : 
            //                     aspectRatio === '9:16' ? '1080x1920' :
            //                     aspectRatio === '1:1' ? '1080x1080' : '1920x1080',
            //         avatar: avatars.find(a => a.value === avatar)?.label || avatar,
            //         language: languages.find(l => l.value === language)?.label || language,
            //         metadata: response.data.metadata,
            //     });
            // } else {
            //     setError('Erro ao gerar vídeo. Tente novamente.');
            // }
            // ========== FIM ORIGINAL ==========
        } catch (err) {
            clearInterval(progressInterval);
            console.error('Erro ao gerar vídeo:', err);
            setError(err.message || 'Erro ao gerar vídeo. Tente novamente.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUseExample = (example) => {
        setScript(example);
    };

    const handleReset = () => {
        setScript('');
        setResult(null);
        setError(null);
        setProgress(0);
    };

    return (
        <div className="contact-body">
            <SimpleBar className="nicescroll-bar">
                <div className="contact-list-view">
                    <div className="p-4">
                        <Row>
                            <Col lg={5}>
                                <Card className="card-border mb-4">
                                    <Card.Header>
                                        <h5 className="mb-0">
                                            <Settings size={18} className="me-2" />
                                            Configurações do Vídeo
                                        </h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-medium">
                                                <Upload size={16} className="me-2" />
                                                1. Imagem/Foto do Avatar (opcional)
                                            </Form.Label>
                                            <Form.Control
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={true /* MOCK: era isProcessing */}
                                                ref={fileInputRef}
                                            />
                                            {imagePreview && (
                                                <div className="mt-2">
                                                    <img src={imagePreview} alt="Preview" className="img-thumbnail" style={{ maxHeight: '100px' }} />
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className="text-danger"
                                                        onClick={() => { setImage(null); setImagePreview(null); }}
                                                    >
                                                        Remover
                                                    </Button>
                                                </div>
                                            )}
                                            <Form.Text className="text-muted">
                                                Envie uma foto para usar como avatar no vídeo
                                            </Form.Text>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-medium">
                                                <Type size={16} className="me-2" />
                                                2. Escreva o Script
                                            </Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={6}
                                                value={script}
                                                onChange={(e) => setScript(e.target.value)}
                                                disabled={true /* MOCK: era isProcessing */}
                                            />
                                            <Form.Text className="text-muted">
                                                {script.trim().split(' ').filter(w => w).length} palavras | Duração estimada: ~{Math.ceil(script.trim().split(' ').length / 2.5)}s
                                            </Form.Text>
                                        </Form.Group>

                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-medium">3. Idioma</Form.Label>
                                                    <Form.Select
                                                        value={language}
                                                        onChange={(e) => setLanguage(e.target.value)}
                                                        disabled={true /* MOCK: era isProcessing */}
                                                    >
                                                        {languages.map((l) => (
                                                            <option key={l.value} value={l.value}>
                                                                {l.label}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-medium">
                                                        <Volume2 size={16} className="me-2" />
                                                        4. Voz
                                                    </Form.Label>
                                                    <Form.Select
                                                        value={voice}
                                                        onChange={(e) => setVoice(e.target.value)}
                                                        disabled={true /* MOCK: era isProcessing */}
                                                    >
                                                        {voices.map((v) => (
                                                            <option key={v.value} value={v.value}>
                                                                {v.label}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-medium">
                                                        <Clock size={16} className="me-2" />
                                                        5. Duração (segundos)
                                                    </Form.Label>
                                                    <Form.Select
                                                        value={duration}
                                                        onChange={(e) => setDuration(Number(e.target.value))}
                                                        disabled={true /* MOCK: era isProcessing */}
                                                    >
                                                        <option value={5}>5 segundos</option>
                                                        <option value={10}>10 segundos</option>
                                                        <option value={15}>15 segundos</option>
                                                        <option value={20}>20 segundos</option>
                                                        <option value={30}>30 segundos</option>
                                                        <option value={60}>60 segundos</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-medium">6. Proporção</Form.Label>
                                                    <Form.Select
                                                        value={aspectRatio}
                                                        onChange={(e) => setAspectRatio(e.target.value)}
                                                        disabled={true /* MOCK: era isProcessing */}
                                                    >
                                                        <option value="auto">Auto</option>
                                                        <option value="16:9">16:9 (Paisagem)</option>
                                                        <option value="9:16">9:16 (Retrato)</option>
                                                        <option value="1:1">1:1 (Quadrado)</option>
                                                        <option value="4:3">4:3</option>
                                                        <option value="3:4">3:4</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Form.Group className="mb-4">
                                            <Form.Label className="fw-medium">7. Seed (Aleatoriedade)</Form.Label>
                                            <Form.Range
                                                min={1}
                                                max={100}
                                                value={seed}
                                                onChange={(e) => setSeed(Number(e.target.value))}
                                                disabled={true /* MOCK: era isProcessing */}
                                            />
                                            <Form.Text className="text-muted">
                                                Seed: {seed} (valores diferentes geram resultados variados)
                                            </Form.Text>
                                        </Form.Group>

                                        {error && (
                                            <Alert variant="danger" className="mb-4">
                                                {error}
                                            </Alert>
                                        )}

                                        <div className="d-grid gap-2">
                                            <Button
                                                variant="primary"
                                                size="lg"
                                                onClick={handleGenerate}
                                                disabled={isProcessing || !script.trim()}
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <Spinner
                                                            as="span"
                                                            animation="border"
                                                            size="sm"
                                                            className="me-2"
                                                        />
                                                        Gerando Vídeo...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Zap size={18} className="me-2" />
                                                        Gerar Vídeo
                                                    </>
                                                )}
                                            </Button>
                                            {result && (
                                                <Button variant="outline-secondary" onClick={handleReset}>
                                                    Novo Vídeo
                                                </Button>
                                            )}
                                        </div>
                                    </Card.Body>
                                </Card>

                                <Card className="card-border">
                                    <Card.Header>
                                        <h6 className="mb-0">💡 Scripts de Exemplo</h6>
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="d-flex flex-column gap-2">
                                            {exampleScripts.map((example, idx) => (
                                                <Button
                                                    key={idx}
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="text-start"
                                                    onClick={() => handleUseExample(example)}
                                                    disabled={isProcessing}
                                                >
                                                    {example.substring(0, 80)}...
                                                </Button>
                                            ))}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col lg={7}>
                                <Card className="card-border">
                                    <Card.Header>
                                        <h5 className="mb-0">
                                            <Video size={18} className="me-2" />
                                            Preview do Vídeo
                                        </h5>
                                    </Card.Header>
                                    <Card.Body>
                                        {result ? (
                                            <div>
                                                <div className="ratio ratio-16x9 mb-3">
                                                    <video controls className="rounded">
                                                        <source src={result.videoUrl} type="video/mp4" />
                                                        Seu navegador não suporta vídeo.
                                                    </video>
                                                </div>

                                                <Row className="mb-3">
                                                    <Col>
                                                        <div className="d-flex align-items-center">
                                                            <User size={16} className="me-2 text-muted" />
                                                            <small className="text-muted">Avatar:</small>
                                                            <strong className="ms-2">{result.avatar}</strong>
                                                        </div>
                                                    </Col>
                                                    <Col>
                                                        <div className="d-flex align-items-center">
                                                            <Clock size={16} className="me-2 text-muted" />
                                                            <small className="text-muted">Duração:</small>
                                                            <strong className="ms-2">{result.duration}</strong>
                                                        </div>
                                                    </Col>
                                                </Row>

                                                <Row className="mb-4">
                                                    <Col>
                                                        <Badge bg="secondary">Resolução: {result.resolution}</Badge>
                                                    </Col>
                                                    <Col>
                                                        <Badge bg="secondary">Tamanho: {result.size}</Badge>
                                                    </Col>
                                                    <Col>
                                                        {subtitles && <Badge bg="success">Com Legendas</Badge>}
                                                    </Col>
                                                </Row>

                                                <div className="d-grid gap-2">
                                                    <Button
                                                        variant="success"
                                                        size="lg"
                                                        as="a"
                                                        href={result.videoUrl}
                                                        download="video-gerado.mp4"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Download size={18} className="me-2" />
                                                        Baixar Vídeo (MP4)
                                                    </Button>
                                                    <Row>
                                                        <Col>
                                                            <Button variant="outline-primary" size="sm" className="w-100">
                                                                <Play size={14} className="me-1" />
                                                                Compartilhar
                                                            </Button>
                                                        </Col>
                                                        <Col>
                                                            <Button variant="outline-secondary" size="sm" className="w-100">
                                                                Editar
                                                            </Button>
                                                        </Col>
                                                    </Row>
                                                </div>
                                            </div>
                                        ) : isProcessing ? (
                                            <div className="text-center py-5">
                                                <Spinner animation="border" variant="primary" className="mb-3" style={{ width: '3rem', height: '3rem' }} />
                                                <h6 className="mb-3">Gerando seu vídeo...</h6>
                                                <ProgressBar now={progress} label={`${progress}%`} className="mb-3" style={{ height: '25px' }} />
                                                <p className="text-muted mb-0">
                                                    {progress < 30 && '🎙️ Sintetizando voz...'}
                                                    {progress >= 30 && progress < 60 && '👤 Sincronizando avatar...'}
                                                    {progress >= 60 && progress < 90 && '🎬 Renderizando vídeo...'}
                                                    {progress >= 90 && '✨ Finalizando...'}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="text-center py-5">
                                                <Video size={64} className="text-muted opacity-25 mb-3" />
                                                <h5 className="text-muted">Aguardando geração</h5>
                                                <p className="text-muted mb-0">
                                                    Configure o avatar, escreva o script e clique em "Gerar Vídeo"
                                                </p>
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>

                                {result && (
                                    <Alert variant="success" className="mt-3">
                                        <Video size={16} className="me-2" />
                                        <strong>Sucesso!</strong> Seu vídeo foi gerado com sucesso. Você pode baixar, compartilhar ou criar uma nova versão.
                                    </Alert>
                                )}
                            </Col>
                        </Row>
                    </div>
                </div>
            </SimpleBar>
        </div>
    );
};

export default function VideoGeneratorPage() {
    const [showSidebar, setShowSidebar] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia('(max-width: 1740px)').matches;
    });

    return (
        <div className="hk-pg-body py-0">
            <div className={classNames("contactapp-wrap", { "contactapp-sidebar-toggle": showSidebar })}>
                <ImageGeneratorSidebar />
                <div className="contactapp-content">
                    <div className="contactapp-detail-wrap">
                        <VideoGeneratorHeader
                            toggleSidebar={() => setShowSidebar(!showSidebar)}
                            show={showSidebar}
                        />
                        <VideoGeneratorBody />
                    </div>
                </div>
            </div>
        </div>
    );
}
