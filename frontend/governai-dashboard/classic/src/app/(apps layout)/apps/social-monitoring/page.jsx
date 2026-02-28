'use client'
import { useState } from 'react';
import { Badge, Button, Card, Col, Form, Row } from 'react-bootstrap';
import * as Icons from 'react-feather';
import classNames from 'classnames';
import SimpleBar from 'simplebar-react';
import SocialMonitoringHeader from './SocialMonitoringHeader';
import SocialMonitoringSidebar from './SocialMonitoringSidebar';

const socialMock = {
    title: 'Monitoramento de Redes Sociais',
    subtitle: 'Acompanhe adversários e aliados em tempo real',
    stats: [
        { id: 'profiles', label: 'Perfis Monitorados', value: '5', icon: Icons.Users, iconClass: 'metric-icon-success' },
        { id: 'posts', label: 'Posts Hoje', value: '18', icon: Icons.MessageSquare, iconClass: 'metric-icon-warning' },
        { id: 'engagement', label: 'Engajamento Total', value: '12.4K', icon: Icons.TrendingUp, iconClass: 'metric-icon-danger' },
        { id: 'alerts', label: 'Alertas', value: '3', icon: Icons.Activity, iconClass: 'metric-icon-danger' },
    ],
    platforms: [
        { id: 'instagram', label: 'Instagram', value: 2, icon: Icons.Instagram, tone: 'social-tone-pink', brandClass: 'platform-brand-instagram' },
        { id: 'facebook', label: 'Facebook', value: 2, icon: Icons.Facebook, tone: 'social-tone-blue', brandClass: 'platform-brand-facebook' },
        { id: 'tiktok', label: 'TikTok', value: 1, icon: Icons.Music, tone: 'social-tone-dark', brandClass: 'platform-brand-tiktok' },
        { id: 'twitter', label: 'X (Twitter)', value: 0, icon: Icons.Twitter, tone: 'social-tone-slate', brandClass: 'platform-brand-twitter' },
        { id: 'youtube', label: 'YouTube', value: 0, icon: Icons.Youtube, tone: 'social-tone-red', brandClass: 'platform-brand-youtube' },
    ],
    opponents: [
        { name: 'Carlos Machado', handle: '@carlosmachado', network: 'Instagram', posts: 3 },
        { name: 'Roberto Lima', handle: '@robertolima_pol', network: 'Facebook', posts: 5 },
        { name: 'Patrícia Souza', handle: '@patriciasouza_real', network: 'TikTok', posts: 7 },
    ],
    allies: [
        { name: 'Ana Beatriz', handle: '@anabeatriz_vereadora', network: 'Instagram', posts: 2 },
        { name: 'Deputado Ferreira', handle: '@dep_ferreira', network: 'Facebook', posts: 1 },
    ],
    alerts: [
        { id: 1, type: 'danger', text: 'Carlos Machado mencionou seu nome em post com alto engajamento', ago: '32 min atrás' },
        { id: 2, type: 'danger', text: 'Roberto Lima publicou crítica à gestão atual — possível ataque indireto', ago: '1h atrás' },
        { id: 3, type: 'warning', text: 'Patrícia Souza atingiu 5K+ compartilhamentos em vídeo polêmico', ago: '3h atrás' },
    ],
    posts: [
        {
            id: 1,
            name: 'Carlos Machado',
            handle: '@carlosmachado',
            sentiment: 'Positivo',
            sentimentClass: 'success',
            image: '/img/monitoramentoSocial/social-post-1.jpg',
            likes: '1.243',
            comments: '89',
            shares: '156',
            text: 'Nossa cidade merece mais! Estou apresentando meu plano de governo com foco em saúde e educação. Juntos vamos transformar a realidade de cada bairro.',
            ago: '32 min atrás',
        },
        {
            id: 2,
            name: 'Roberto Lima',
            handle: '@robertolima_pol',
            sentiment: 'Negativo',
            sentimentClass: 'danger',
            image: '/img/monitoramentoSocial/social-post-2.jpg',
            likes: '876',
            comments: '234',
            shares: '412',
            text: 'A atual gestão não entrega resultados. Enquanto prometem, a população sofre com falta de transporte e segurança. É hora de cobrar!',
            ago: '1h atrás',
        },
        {
            id: 3,
            name: 'Ana Beatriz',
            handle: '@anabeatriz_vereadora',
            sentiment: 'Positivo',
            sentimentClass: 'success',
            image: '/img/monitoramentoSocial/social-post-3.jpg',
            likes: '654',
            comments: '45',
            shares: '78',
            text: 'Hoje tive uma reunião produtiva com Marcos Almeida para discutir o projeto de proteção animal. Estamos alinhados e comprometidos com essa causa!',
            ago: '2h atrás',
        },
        {
            id: 4,
            name: 'Patrícia Souza',
            handle: '@patriciasouza_real',
            sentiment: 'Negativo',
            sentimentClass: 'danger',
            image: '/img/monitoramentoSocial/social-post-4.jpg',
            likes: '5.432',
            comments: '876',
            shares: '2.341',
            text: 'URGENTE: Vocês viram o que aconteceu na sessão da câmara? O povo precisa saber a verdade. Assista até o final.',
            ago: '3h atrás',
        },
        {
            id: 5,
            name: 'Deputado Ferreira',
            handle: '@dep_ferreira',
            sentiment: 'Positivo',
            sentimentClass: 'success',
            image: '/img/monitoramentoSocial/social-post-5.jpg',
            likes: '321',
            comments: '56',
            shares: '89',
            text: 'Parabéns ao pré-candidato Marcos Almeida pela excelente proposta de revitalização do centro da cidade. Apoio total à ideia de trazer novos investimentos!',
            ago: '4h atrás',
        },
        {
            id: 6,
            name: 'Carlos Machado',
            handle: '@carlosmachado',
            sentiment: 'Neutro',
            sentimentClass: 'secondary',
            image: '/img/monitoramentoSocial/social-post-6.jpg',
            likes: '987',
            comments: '123',
            shares: '67',
            text: 'Live hoje às 20h! Vou responder todas as perguntas sobre meu plano de governo. Não percam! #AoVivo #Transparência',
            ago: '5h atrás',
        },
        {
            id: 7,
            name: 'Roberto Lima',
            handle: '@robertolima_pol',
            sentiment: 'Negativo',
            sentimentClass: 'danger',
            image: '/img/monitoramentoSocial/social-post-7.jpg',
            likes: '1.567',
            comments: '345',
            shares: '567',
            text: 'Visitei o bairro Vila Nova nesta manhã e ouvi as demandas da comunidade. Esgoto a céu aberto, ruas sem pavimentação. Cadê a prefeitura?',
            ago: '6h atrás',
        },
    ],
};

const SocialMonitoringPage = () => {
    const [showSidebar, setShowSidebar] = useState(true);

    return (
        <div className="hk-pg-body py-0 social-monitoring-page">
            <div className={classNames('fmapp-wrap', { 'fmapp-sidebar-toggle': !showSidebar })}>
                <SocialMonitoringSidebar />
                <div className="fmapp-content">
                    <div className="fmapp-detail-wrap">
                        <SocialMonitoringHeader toggleSidebar={() => setShowSidebar(!showSidebar)} />
                        <div className="fm-body">
                            <SimpleBar className="nicescroll-bar">
                                <div className="container-fluid px-4 py-4">
                                    <div className="mb-4">
                                        <h4 className="mb-0">{socialMock.title}</h4>
                                        <p className="text-muted mb-0">{socialMock.subtitle}</p>
                                    </div>

                                    <div className="stats-grid mb-3">
                                        {socialMock.stats.map((item) => (
                                            <Card key={item.id} className="metric-card h-100">
                                                <Card.Body className="text-center py-3">
                                                    <div className={classNames('metric-icon mb-2', item.iconClass)}>
                                                        <item.icon size={16} />
                                                    </div>
                                                    <h2 className="mb-1 metric-value">{item.value}</h2>
                                                    <div className="text-muted fs-8">{item.label}</div>
                                                </Card.Body>
                                            </Card>
                                        ))}
                                    </div>

                                    <div className="platform-grid mb-4">
                                        {socialMock.platforms.map((platform) => (
                                            <Card key={platform.id} className={classNames('h-100 text-center platform-card', platform.tone)}>
                                                <Card.Body className="py-3">
                                                    <div className={classNames('platform-badge mx-auto mb-2', platform.brandClass)}>
                                                        <platform.icon size={14} />
                                                    </div>
                                                    <h3 className="mb-1 metric-value">{platform.value}</h3>
                                                    <small className="text-muted">{platform.label}</small>
                                                </Card.Body>
                                            </Card>
                                        ))}
                                    </div>

                                    <Card className="mb-4">
                                        <Card.Body>
                                            <h6 className="mb-3">
                                                <Icons.UserPlus size={15} className="me-2 text-success" />
                                                Cadastrar Perfil Político
                                            </h6>
                                            <Row className="g-2 mb-3">
                                                <Col md={6}>
                                                    <Form.Control size="sm" placeholder="Nome do político" />
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Control size="sm" placeholder="@ ou perfil (ex: @joao_pol)" />
                                                </Col>
                                            </Row>
                                            <Row className="g-2 mb-3">
                                                <Col md={3}>
                                                    <Form.Select size="sm" defaultValue="adversario">
                                                        <option value="adversario">Adversário</option>
                                                        <option value="aliado">Aliado</option>
                                                    </Form.Select>
                                                </Col>
                                                <Col md={3}>
                                                    <Form.Select size="sm" defaultValue="instagram">
                                                        <option value="instagram">Instagram</option>
                                                        <option value="facebook">Facebook</option>
                                                        <option value="tiktok">TikTok</option>
                                                        <option value="x">X (Twitter)</option>
                                                        <option value="youtube">YouTube</option>
                                                    </Form.Select>
                                                </Col>
                                                <Col md={3}>
                                                    <Button size="sm" variant="primary">
                                                        <Icons.Plus size={14} className="me-1" />
                                                        Cadastrar
                                                    </Button>
                                                </Col>
                                            </Row>
                                            <Row className="g-2">
                                                <Col lg={6}>
                                                    <h6 className="fs-8 text-danger mb-2">
                                                        <Icons.X size={13} className="me-1" />
                                                        ADVERSÁRIOS ({socialMock.opponents.length})
                                                    </h6>
                                                    {socialMock.opponents.map((person) => (
                                                        <div key={person.handle} className="list-chip list-chip-danger mb-2">
                                                            <div>
                                                                <div className="fw-medium fs-8">{person.name}</div>
                                                                <small className="text-muted">{person.handle} - {person.network}</small>
                                                            </div>
                                                            <Badge bg="light" text="dark">{person.posts} posts</Badge>
                                                        </div>
                                                    ))}
                                                </Col>
                                                <Col lg={6}>
                                                    <h6 className="fs-8 text-success mb-2">
                                                        <Icons.Check size={13} className="me-1" />
                                                        ALIADOS ({socialMock.allies.length})
                                                    </h6>
                                                    {socialMock.allies.map((person) => (
                                                        <div key={person.handle} className="list-chip list-chip-success mb-2">
                                                            <div>
                                                                <div className="fw-medium fs-8">{person.name}</div>
                                                                <small className="text-muted">{person.handle} - {person.network}</small>
                                                            </div>
                                                            <Badge bg="light" text="dark">{person.posts} posts</Badge>
                                                        </div>
                                                    ))}
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>

                                    <Card className="mb-4">
                                        <Card.Body>
                                            <h6 className="mb-3">
                                                <Icons.Activity size={14} className="me-2 text-danger" />
                                                Alertas Recentes
                                            </h6>
                                            {socialMock.alerts.map((alert) => (
                                                <div key={alert.id} className={`alert py-2 mb-2 alert-soft-${alert.type}`}>
                                                    <div className="fw-medium fs-8">{alert.text}</div>
                                                    <small className="text-muted">{alert.ago}</small>
                                                </div>
                                            ))}
                                        </Card.Body>
                                    </Card>

                                    <Card>
                                        <Card.Body>
                                            <div className="post-feed-wrap">
                                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                                                    <h6 className="mb-0">
                                                        <Icons.Rss size={15} className="me-2 text-success" />
                                                        Feed de Postagens
                                                    </h6>
                                                    <div className="d-flex gap-2">
                                                        <Form.Select size="sm" defaultValue="all">
                                                            <option value="all">Todos</option>
                                                            <option value="allies">Aliados</option>
                                                            <option value="opponents">Adversários</option>
                                                        </Form.Select>
                                                        <Form.Select size="sm" defaultValue="network-all">
                                                            <option value="network-all">Todas Redes</option>
                                                            <option value="instagram">Instagram</option>
                                                            <option value="facebook">Facebook</option>
                                                            <option value="tiktok">TikTok</option>
                                                            <option value="x">X (Twitter)</option>
                                                            <option value="youtube">YouTube</option>
                                                        </Form.Select>
                                                    </div>
                                                </div>

                                                <Row className="g-2 post-feed-row">
                                                    {socialMock.posts.map((post) => (
                                                        <Col lg={6} key={post.id}>
                                                            <Card className="post-card h-100">
                                                                <Card.Body className="post-head pb-2">
                                                                    <div className="post-head-row">
                                                                        <div className="post-user-block">
                                                                            <div className="post-avatar">
                                                                                {post.name.charAt(0)}
                                                                            </div>
                                                                            <div className="post-user-text">
                                                                                <div className="d-flex align-items-center gap-1 post-title-row">
                                                                                    <div className="fw-semibold">{post.name}</div>
                                                                                    <small className="text-danger">⚔</small>
                                                                                    <span className={classNames('post-sentiment-pill', `post-sentiment-${post.sentimentClass}`)}>{post.sentiment}</span>
                                                                                </div>
                                                                                <small className="text-muted d-flex align-items-center gap-1 post-meta-row">
                                                                                    <Icons.Instagram size={12} />
                                                                                    {post.handle} - {post.ago}
                                                                                </small>
                                                                            </div>
                                                                        </div>
                                                                        <Button variant="link" className="post-menu-btn p-0 text-muted">
                                                                            <Icons.MoreHorizontal size={16} />
                                                                        </Button>
                                                                    </div>
                                                                </Card.Body>
                                                                <img src={post.image} alt={post.name} className="w-100 post-image " />
                                                                <Card.Body>
                                                                    <div className="d-flex justify-content-between align-items-center text-muted fs-8 mb-2">
                                                                        <div className="d-flex gap-3">
                                                                            <span><Icons.Heart size={14} className="me-1" />{post.likes}</span>
                                                                            <span><Icons.MessageSquare size={14} className="me-1" />{post.comments}</span>
                                                                            <span><Icons.Send size={14} className="me-1" />{post.shares}</span>
                                                                        </div>
                                                                        <span><Icons.Bookmark size={14} /></span>
                                                                    </div>
                                                                    <p className="mb-0 fs-7 post-caption">
                                                                        <strong>{post.handle}</strong> {post.text}
                                                                    </p>
                                                                </Card.Body>
                                                            </Card>
                                                        </Col>
                                                    ))}
                                                </Row>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </div>
                            </SimpleBar>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .social-monitoring-page .platform-card {
                    border: 1px solid var(--bs-border-color);
                }

                .social-monitoring-page .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    gap: 12px;
                }

                .social-monitoring-page .platform-grid {
                    display: grid;
                    grid-template-columns: repeat(5, minmax(0, 1fr));
                    gap: 12px;
                }

                .social-monitoring-page .metric-card,
                .social-monitoring-page .platform-card {
                    border-radius: 12px;
                }

                .social-monitoring-page .metric-value {
                    font-size: 2rem;
                    line-height: 1;
                    font-weight: 700;
                }

                .social-monitoring-page .metric-icon {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    line-height: 1;
                }

                .social-monitoring-page .metric-icon-success {
                    color: #0ea46d;
                }

                .social-monitoring-page .metric-icon-warning {
                    color: #f59e0b;
                }

                .social-monitoring-page .metric-icon-danger {
                    color: #ef4444;
                }

                .social-monitoring-page .platform-badge {
                    width: 36px;
                    height: 36px;
                    border-radius: 12px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                }

                .social-monitoring-page .platform-brand-instagram {
                    background: linear-gradient(135deg, #c13584, #833ab4);
                }

                .social-monitoring-page .platform-brand-facebook {
                    background: #2563eb;
                }

                .social-monitoring-page .platform-brand-tiktok {
                    background: #1f2937;
                }

                .social-monitoring-page .platform-brand-twitter {
                    background: #1f2937;
                }

                .social-monitoring-page .platform-brand-youtube {
                    background: #ef4444;
                }

                .social-monitoring-page .social-tone-pink {
                    background: rgba(214, 41, 118, 0.05);
                }

                .social-monitoring-page .social-tone-blue {
                    background: rgba(24, 119, 242, 0.05);
                }

                .social-monitoring-page .social-tone-dark {
                    background: rgba(15, 23, 42, 0.04);
                }

                .social-monitoring-page .social-tone-slate {
                    background: rgba(71, 85, 105, 0.04);
                }

                .social-monitoring-page .social-tone-red {
                    background: rgba(239, 68, 68, 0.05);
                }

                .social-monitoring-page .list-chip {
                    border-radius: 10px;
                    border: 1px solid var(--bs-border-color);
                    padding: 8px 10px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                }

                .social-monitoring-page .list-chip-danger {
                    background: rgba(220, 53, 69, 0.04);
                    border-color: rgba(220, 53, 69, 0.2);
                }

                .social-monitoring-page .list-chip-success {
                    background: rgba(25, 135, 84, 0.04);
                    border-color: rgba(25, 135, 84, 0.2);
                }

                .social-monitoring-page .alert-soft-danger {
                    background: rgba(220, 53, 69, 0.06);
                    border: 1px solid rgba(220, 53, 69, 0.2);
                }

                .social-monitoring-page .alert-soft-warning {
                    background: rgba(255, 193, 7, 0.08);
                    border: 1px solid rgba(255, 193, 7, 0.25);
                }

                .social-monitoring-page .post-card {
                    display: grid;
                    grid-template-rows: 72px 280px auto;
                    overflow: hidden;
                    border-radius: 10px;
                    border: 1px solid rgba(15, 23, 42, 0.12);
                    box-shadow: none;
                    width: 100%;
                    max-width: none;
                    margin: 0;
                }

                .social-monitoring-page .post-feed-wrap {
                    max-width: 980px;
                    margin: 0 auto;
                }

                .social-monitoring-page .post-feed-row {
                    --bs-gutter-x: 10px;
                    --bs-gutter-y: 10px;
                }

                .social-monitoring-page .post-head {
                    padding: 10px 12px 8px 12px;
                    height: 100%;
                    box-sizing: border-box;
                    overflow: hidden;
                }

                .social-monitoring-page .post-head-row {
                    display: grid;
                    grid-template-columns: 34px minmax(0, 1fr) 16px;
                    column-gap: 10px;
                    width: 100%;
                    height: 100%;
                    align-items: center;
                }

                .social-monitoring-page .post-user-block {
                    grid-column: 1 / 3;
                    display: grid;
                    grid-template-columns: 34px minmax(0, 1fr);
                    column-gap: 10px;
                    align-items: center;
                    min-width: 0;
                }

                .social-monitoring-page .post-user-text {
                    min-width: 0;
                }

                .social-monitoring-page .post-title-row,
                .social-monitoring-page .post-meta-row {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .social-monitoring-page .post-title-row {
                    height: 20px;
                    line-height: 20px;
                    font-size: 1rem;
                    margin: 0;
                }

                .social-monitoring-page .post-meta-row {
                    height: 18px;
                    line-height: 18px;
                    margin-top: 1px;
                    font-size: 0.88rem;
                }

                .social-monitoring-page .post-title-row .fw-semibold {
                    white-space: nowrap;
                }

                .social-monitoring-page .post-avatar {
                    width: 34px;
                    height: 34px;
                    border-radius: 50%;
                    border: 1px solid #f2b4b4;
                    color: #e04747;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.9rem;
                    font-weight: 500;
                    flex-shrink: 0;
                }

                .social-monitoring-page .post-sentiment-pill {
                    font-size: 11px;
                    line-height: 1;
                    padding: 4px 8px;
                    border-radius: 999px;
                    border: 1px solid transparent;
                }

                .social-monitoring-page .post-sentiment-success {
                    color: #0d9c6d;
                    background: rgba(13, 156, 109, 0.12);
                    border-color: rgba(13, 156, 109, 0.2);
                }

                .social-monitoring-page .post-sentiment-danger {
                    color: #df3a3a;
                    background: rgba(223, 58, 58, 0.12);
                    border-color: rgba(223, 58, 58, 0.2);
                }

                .social-monitoring-page .post-sentiment-secondary {
                    color: #667085;
                    background: rgba(102, 112, 133, 0.12);
                    border-color: rgba(102, 112, 133, 0.2);
                }

                .social-monitoring-page .post-menu-btn {
                    text-decoration: none !important;
                    line-height: 1;
                    border: 0 !important;
                    box-shadow: none !important;
                }

                .social-monitoring-page .post-menu-btn:hover,
                .social-monitoring-page .post-menu-btn:focus {
                    color: #667085 !important;
                }

                .social-monitoring-page .post-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center center;
                    display: block;
                    border-top: 1px solid rgba(15, 23, 42, 0.08);
                    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
                }

                .social-monitoring-page .post-caption {
                    line-height: 1.55;
                    font-size: 1rem;
                }

                @media (max-width: 991px) {
                    .social-monitoring-page .post-card {
                        grid-template-rows: 72px 240px auto;
                    }

                    .social-monitoring-page .stats-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }

                    .social-monitoring-page .platform-grid {
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                    }

                }

                @media (max-width: 575px) {
                    .social-monitoring-page .platform-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                }
            `}</style>
        </div>
    );
};

export default SocialMonitoringPage;
