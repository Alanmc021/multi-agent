'use client';
import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { Col, Row, Form, Button, Alert, Badge, Spinner, Nav, Tab } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import { Settings, Save, Home, Shield, Bell, Link2, Database, CheckCircle, AlertTriangle } from 'react-feather';
import AdminSidebar from '../../users/AdminSidebar';
import { getTenantSettings, updateTenantSettings, getTenant } from '@/lib/api/services/tenant';
import { useAuth } from '@/lib/auth/AuthProvider';

const AdminSettingsPage = () => {
    const { user } = useAuth();
    const [saved, setSaved] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [tenantName, setTenantName] = useState(''); // nome base do tenant

    // State para as configurações
    const [settings, setSettings] = useState({
        organization: {
            // Dados da campanha política
            partyName: '',
            partyNumber: '',
            position: '',
            city: '',
            state: '',
            campaignYear: new Date().getFullYear(),
            // Dados da organização
            cnpj: '',
            email: '',
            phone: '',
            address: '',
        },
        security: {
            require2FA: true,
            sessionTimeout: 30,
            strongPasswordPolicy: true,
            allowSocialLogin: false,
        },
        notifications: {
            email: {
                newLeads: true,
                crisisAlerts: true,
                weeklyReports: true,
            },
            whatsapp: {
                criticalAlerts: true,
            },
            push: {
                enabled: true,
            }
        },
        integrations: {
            whatsapp: { connected: true },
            googleAnalytics: { connected: true },
            metaAds: { connected: false },
            youtubeAds: { connected: false },
        },
        backup: {
            frequency: 'daily',
            retention: 30,
            lastBackup: new Date().toISOString(),
            lastBackupSize: '2.4 GB',
        },
        webhooks: {
            voiceCampaign: 'https://nexus-n8n.captain.nexusbr.ai/webhook/ce0328f9-175e-4512-826f-979e5d592841',
            whatsappCampaign: 'https://nexus-n8n.captain.nexusbr.ai/webhook/outbound-whatsapp-campanha',
        }
    });

    // Carregar configurações ao montar o componente
    useEffect(() => {
        loadSettings();
    }, [user]);

    const loadSettings = async () => {
        if (!user?.tenantId) {
            setLoading(false);
            setError('Tenant não identificado. Faça login novamente.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const [response, tenantData] = await Promise.all([
                getTenantSettings(user.tenantId),
                getTenant(user.tenantId).catch(() => null),
            ]);

            if (tenantData?.name) setTenantName(tenantData.name);

            const orgFromApi = response.organization || {};
            // Pré-popula partyName com o nome do tenant se ainda não foi configurado
            if (!orgFromApi.partyName && tenantData?.name) {
                orgFromApi.partyName = tenantData.name;
            }

            setSettings(prev => ({
                organization: { ...prev.organization, ...orgFromApi },
                security: { ...prev.security, ...(response.security || {}) },
                notifications: {
                    email: { ...prev.notifications.email, ...(response.notifications?.email || {}) },
                    whatsapp: { ...prev.notifications.whatsapp, ...(response.notifications?.whatsapp || {}) },
                    push: { ...prev.notifications.push, ...(response.notifications?.push || {}) },
                },
                integrations: { ...prev.integrations, ...(response.integrations || {}) },
                backup: { ...prev.backup, ...(response.backup || {}) },
                webhooks: { ...prev.webhooks, ...(response.webhooks || {}) },
            }));
        } catch (err) {
            setError('Erro ao carregar configurações. Usando valores padrão.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user?.tenantId) {
            setError('Tenant não identificado');
            return;
        }

        try {
            setSaving(true);
            setError(null);
            
            const response = await updateTenantSettings(user.tenantId, settings);
            
            if (response.success) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            } else {
                setError(response.message || 'Erro ao salvar configurações');
            }
        } catch (err) {
            console.error('Erro ao salvar configurações:', err);
            setError(err?.message || 'Erro ao salvar configurações. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    const formatCNPJ = (value = '') => {
        const digits = String(value).replace(/\D/g, '').slice(0, 14);
        return digits
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2');
    };

    const formatPhone = (value = '') => {
        const digits = String(value).replace(/\D/g, '').slice(0, 11);
        if (digits.length <= 2) return digits;
        if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
        if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    };

    const handleChange = (path, value) => {
        if (path === 'organization.cnpj') value = formatCNPJ(value);
        if (path === 'organization.phone') value = formatPhone(value);

        setSettings(prev => {
            const keys = path.split('.');
            const newSettings = { ...prev };
            let current = newSettings;
            
            for (let i = 0; i < keys.length - 1; i++) {
                current[keys[i]] = { ...current[keys[i]] };
                current = current[keys[i]];
            }
            
            current[keys[keys.length - 1]] = value;
            return newSettings;
        });
    };

    return (
        <div className="hk-pg-body py-0">
        <style>{`
            .settings-nav .nav-pills .nav-link.active,
            .settings-nav .nav-pills .show > .nav-link {
                background-color: #009b36 !important;
                border-color: #009b36 !important;
                color: #fff !important;
            }
            .settings-nav .nav-pills .nav-link:hover:not(.active) {
                color: #009b36 !important;
                background-color: #ebf7ef !important;
            }
        `}</style>
            <div className={classNames("fmapp-wrap", { "fmapp-sidebar-toggle": !showSidebar })}>
                <AdminSidebar />
                <div className="fmapp-content">
                    <div className="fmapp-detail-wrap">
                        {/* Header */}
                        <header className="contact-header">
                            <div className="d-flex align-items-center">
                                <Button 
                                    variant="flush-dark" 
                                    className="btn-icon btn-rounded flush-soft-hover flex-shrink-0 me-3"
                                    onClick={() => setShowSidebar(!showSidebar)}
                                >
                                    <span className="icon">
                                        <span className="feather-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                                <line x1="3" y1="18" x2="21" y2="18"></line>
                                            </svg>
                                        </span>
                                    </span>
                                </Button>
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb mb-0">
                                        <li className="breadcrumb-item">
                                            <a href="/dashboard-analytics">GovernAI</a>
                                        </li>
                                        <li className="breadcrumb-item">
                                            <a href="#">Admin</a>
                                        </li>
                                        <li className="breadcrumb-item active">Configurações</li>
                                    </ol>
                                </nav>
                            </div>
                            <div className="contact-options-wrap">
                                <Button
                                    onClick={handleSave}
                                    disabled={saving || loading}
                                    style={{ backgroundColor: '#009b36', borderColor: '#009b36', color: '#fff' }}
                                >
                                    {saving ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} className="me-2" />
                                            Salvar Alterações
                                        </>
                                    )}
                                </Button>
                            </div>
                        </header>

                        {/* Body */}
                        <div className="contact-body">
                            <SimpleBar className="nicescroll-bar">
                                <div className="contact-list-view">
                                    {loading ? (
                                        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                                            <Spinner animation="border" variant="primary" />
                                        </div>
                                    ) : (
                                        <div className="p-4">
                                            {/* Alert de Sucesso */}
                                            {saved && (
                                                <Alert className="d-flex align-items-center mb-4" style={{ backgroundColor: '#ebf7ef', borderColor: '#009b36', color: '#007a2b' }}>
                                                    <CheckCircle size={18} className="me-2" style={{ color: '#009b36' }} />
                                                    Configurações salvas com sucesso!
                                                </Alert>
                                            )}

                                            {/* Alert de Erro */}
                                            {error && (
                                                <Alert className="d-flex align-items-center mb-4" style={{ backgroundColor: '#fffbed', borderColor: '#ffc501', color: '#7a5c00' }}>
                                                    <AlertTriangle size={18} className="me-2" style={{ color: '#ffc501' }} />
                                                    {error}
                                                </Alert>
                                            )}

                                            {/* Tabs de Configuração */}
                                            <Tab.Container defaultActiveKey="organization">
                                                <Row className="settings-nav">
                                                    {/* Navegação lateral das tabs */}
                                                    <Col md={3}>
                                                        <Nav variant="pills" className="flex-column">
                                                            <Nav.Item>
                                                                <Nav.Link eventKey="organization">
                                                                    <Home size={16} className="me-2" />
                                                                    Organização
                                                                </Nav.Link>
                                                            </Nav.Item>
                                                            <Nav.Item>
                                                                <Nav.Link eventKey="security">
                                                                    <Shield size={16} className="me-2" />
                                                                    Segurança
                                                                </Nav.Link>
                                                            </Nav.Item>
                                                            <Nav.Item>
                                                                <Nav.Link eventKey="notifications">
                                                                    <Bell size={16} className="me-2" />
                                                                    Notificações
                                                                </Nav.Link>
                                                            </Nav.Item>
                                                            <Nav.Item>
                                                                <Nav.Link eventKey="integrations">
                                                                    <Link2 size={16} className="me-2" />
                                                                    Integrações
                                                                </Nav.Link>
                                                            </Nav.Item>
                                                            <Nav.Item>
                                                                <Nav.Link eventKey="backup">
                                                                    <Database size={16} className="me-2" />
                                                                    Backup
                                                                </Nav.Link>
                                                            </Nav.Item>
                                                        </Nav>
                                                    </Col>

                                                    {/* Conteúdo das tabs */}
                                                    <Col md={9}>
                                                        <Tab.Content>
                                                            {/* Organização */}
                                                            <Tab.Pane eventKey="organization">
                                                                <h4 className="mb-1">Dados da Organização</h4>
                                                                {tenantName && (
                                                                    <p className="small mb-4 px-3 py-2 rounded" style={{ backgroundColor: '#ebf7ef', color: '#007a2b', borderLeft: '3px solid #009b36' }}>
                                                                        Conta: <strong>{tenantName}</strong>
                                                                    </p>
                                                                )}

                                                                <Form>
                                                                    {/* ── Dados da Campanha ── */}
                                                                    <h6 className="mb-3 mt-2 border-bottom pb-2" style={{ color: '#009b36' }}>
                                                                        🏛️ Dados da Campanha Política
                                                                    </h6>
                                                                    <Row className="gx-3">
                                                                        <Col sm={8}>
                                                                            <Form.Group className="mb-3">
                                                                                <Form.Label>Nome do Partido</Form.Label>
                                                                                <Form.Control
                                                                                    type="text"
                                                                                    value={settings.organization.partyName || ''}
                                                                                    onChange={(e) => handleChange('organization.partyName', e.target.value)}
                                                                                    placeholder="Ex: Partido da Renovação Cidadã"
                                                                                />
                                                                            </Form.Group>
                                                                        </Col>
                                                                        <Col sm={4}>
                                                                            <Form.Group className="mb-3">
                                                                                <Form.Label>Número do Partido</Form.Label>
                                                                                <Form.Control
                                                                                    type="text"
                                                                                    value={settings.organization.partyNumber || ''}
                                                                                    onChange={(e) => handleChange('organization.partyNumber', e.target.value)}
                                                                                    placeholder="Ex: 22"
                                                                                    maxLength={4}
                                                                                />
                                                                            </Form.Group>
                                                                        </Col>
                                                                        <Col sm={6}>
                                                                            <Form.Group className="mb-3">
                                                                                <Form.Label>Cargo Disputado</Form.Label>
                                                                                <Form.Select
                                                                                    value={settings.organization.position || ''}
                                                                                    onChange={(e) => handleChange('organization.position', e.target.value)}
                                                                                >
                                                                                    <option value="">Selecione o cargo...</option>
                                                                                    <option value="Prefeito">Prefeito(a)</option>
                                                                                    <option value="Vice-Prefeito">Vice-Prefeito(a)</option>
                                                                                    <option value="Vereador">Vereador(a)</option>
                                                                                    <option value="Governador">Governador(a)</option>
                                                                                    <option value="Vice-Governador">Vice-Governador(a)</option>
                                                                                    <option value="Deputado Estadual">Deputado(a) Estadual</option>
                                                                                    <option value="Deputado Federal">Deputado(a) Federal</option>
                                                                                    <option value="Senador">Senador(a)</option>
                                                                                    <option value="Presidente">Presidente(a)</option>
                                                                                    <option value="Vice-Presidente">Vice-Presidente(a)</option>
                                                                                </Form.Select>
                                                                            </Form.Group>
                                                                        </Col>
                                                                        <Col sm={2}>
                                                                            <Form.Group className="mb-3">
                                                                                <Form.Label>Ano</Form.Label>
                                                                                <Form.Control
                                                                                    type="number"
                                                                                    value={settings.organization.campaignYear || new Date().getFullYear()}
                                                                                    onChange={(e) => handleChange('organization.campaignYear', parseInt(e.target.value))}
                                                                                    min={2024}
                                                                                    max={2040}
                                                                                />
                                                                            </Form.Group>
                                                                        </Col>
                                                                        <Col sm={4}>
                                                                            <Form.Group className="mb-3">
                                                                                <Form.Label>Estado (UF)</Form.Label>
                                                                                <Form.Select
                                                                                    value={settings.organization.state || ''}
                                                                                    onChange={(e) => handleChange('organization.state', e.target.value)}
                                                                                >
                                                                                    <option value="">UF</option>
                                                                                    {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                                                                                        <option key={uf} value={uf}>{uf}</option>
                                                                                    ))}
                                                                                </Form.Select>
                                                                            </Form.Group>
                                                                        </Col>
                                                                        <Col sm={12}>
                                                                            <Form.Group className="mb-4">
                                                                                <Form.Label>Município</Form.Label>
                                                                                <Form.Control
                                                                                    type="text"
                                                                                    value={settings.organization.city || ''}
                                                                                    onChange={(e) => handleChange('organization.city', e.target.value)}
                                                                                    placeholder="Ex: São Paulo"
                                                                                />
                                                                            </Form.Group>
                                                                        </Col>
                                                                    </Row>

                                                                    {/* ── Dados da Organização ── */}
                                                                    <h6 className="text-secondary mb-3 border-bottom pb-2">
                                                                        🏢 Dados da Organização / Comitê
                                                                    </h6>
                                                                    <Row className="gx-3">
                                                                        <Col sm={6}>
                                                                            <Form.Group className="mb-3">
                                                                                <Form.Label>CNPJ</Form.Label>
                                                                                <Form.Control
                                                                                    type="text"
                                                                                    value={settings.organization.cnpj}
                                                                                    onChange={(e) => handleChange('organization.cnpj', e.target.value)}
                                                                                    placeholder="12.345.678/0001-90"
                                                                                    inputMode="numeric"
                                                                                    maxLength={18}
                                                                                />
                                                                            </Form.Group>
                                                                        </Col>
                                                                        <Col sm={6}>
                                                                            <Form.Group className="mb-3">
                                                                                <Form.Label>Email Principal</Form.Label>
                                                                                <Form.Control
                                                                                    type="email"
                                                                                    value={settings.organization.email}
                                                                                    onChange={(e) => handleChange('organization.email', e.target.value)}
                                                                                    placeholder="contato@partido.com.br"
                                                                                />
                                                                            </Form.Group>
                                                                        </Col>
                                                                        <Col sm={6}>
                                                                            <Form.Group className="mb-3">
                                                                                <Form.Label>Telefone</Form.Label>
                                                                                <Form.Control
                                                                                    type="text"
                                                                                    value={settings.organization.phone}
                                                                                    onChange={(e) => handleChange('organization.phone', e.target.value)}
                                                                                    placeholder="(11) 3000-0000"
                                                                                    inputMode="numeric"
                                                                                    maxLength={15}
                                                                                />
                                                                            </Form.Group>
                                                                        </Col>
                                                                        <Col sm={6}>
                                                                            <Form.Group className="mb-3">
                                                                                <Form.Label>Endereço Completo</Form.Label>
                                                                                <Form.Control
                                                                                    type="text"
                                                                                    value={settings.organization.address}
                                                                                    onChange={(e) => handleChange('organization.address', e.target.value)}
                                                                                    placeholder="Av. Paulista, 1000 - São Paulo - SP"
                                                                                />
                                                                            </Form.Group>
                                                                        </Col>
                                                                    </Row>
                                                                </Form>
                                                            </Tab.Pane>

                                                            {/* Segurança */}
                                                            <Tab.Pane eventKey="security">
                                                                <h4 className="mb-4">Segurança e Acesso</h4>
                                                                <Form>
                                                                    <Form.Check 
                                                                        type="switch"
                                                                        id="enable-2fa"
                                                                        label="Exigir autenticação de dois fatores (2FA)"
                                                                        checked={settings.security.require2FA}
                                                                        onChange={(e) => handleChange('security.require2FA', e.target.checked)}
                                                                        className="mb-3"
                                                                    />
                                                                    <Form.Group className="mb-3">
                                                                        <Form.Label>Tempo de Expiração de Sessão</Form.Label>
                                                                        <Form.Select 
                                                                            value={settings.security.sessionTimeout}
                                                                            onChange={(e) => handleChange('security.sessionTimeout', parseInt(e.target.value))}
                                                                        >
                                                                            <option value="15">15 minutos</option>
                                                                            <option value="30">30 minutos</option>
                                                                            <option value="60">1 hora</option>
                                                                            <option value="120">2 horas</option>
                                                                            <option value="0">Nunca expirar</option>
                                                                        </Form.Select>
                                                                    </Form.Group>
                                                                    <Form.Check 
                                                                        type="switch"
                                                                        id="password-policy"
                                                                        label="Política de senha forte"
                                                                        checked={settings.security.strongPasswordPolicy}
                                                                        onChange={(e) => handleChange('security.strongPasswordPolicy', e.target.checked)}
                                                                        className="mb-3"
                                                                    />
                                                                    <Form.Check 
                                                                        type="switch"
                                                                        id="social-login"
                                                                        label="Permitir login com redes sociais"
                                                                        checked={settings.security.allowSocialLogin}
                                                                        onChange={(e) => handleChange('security.allowSocialLogin', e.target.checked)}
                                                                    />
                                                                </Form>
                                                            </Tab.Pane>

                                                            {/* Notificações */}
                                                            <Tab.Pane eventKey="notifications">
                                                                <h4 className="mb-4">Notificações</h4>
                                                                <h6 className="mb-3">Email</h6>
                                                                <Form.Check 
                                                                    type="switch"
                                                                    id="email-leads"
                                                                    label="Novos leads"
                                                                    checked={settings.notifications.email.newLeads}
                                                                    onChange={(e) => handleChange('notifications.email.newLeads', e.target.checked)}
                                                                    className="mb-2"
                                                                />
                                                                <Form.Check 
                                                                    type="switch"
                                                                    id="email-crisis"
                                                                    label="Alertas de crise"
                                                                    checked={settings.notifications.email.crisisAlerts}
                                                                    onChange={(e) => handleChange('notifications.email.crisisAlerts', e.target.checked)}
                                                                    className="mb-2"
                                                                />
                                                                <Form.Check 
                                                                    type="switch"
                                                                    id="email-reports"
                                                                    label="Relatórios semanais"
                                                                    checked={settings.notifications.email.weeklyReports}
                                                                    onChange={(e) => handleChange('notifications.email.weeklyReports', e.target.checked)}
                                                                    className="mb-4"
                                                                />
                                                                
                                                                <h6 className="mb-3">WhatsApp</h6>
                                                                <Form.Check 
                                                                    type="switch"
                                                                    id="whatsapp-alerts"
                                                                    label="Alertas críticos"
                                                                    checked={settings.notifications.whatsapp.criticalAlerts}
                                                                    onChange={(e) => handleChange('notifications.whatsapp.criticalAlerts', e.target.checked)}
                                                                    className="mb-4"
                                                                />

                                                                <h6 className="mb-3">Push</h6>
                                                                <Form.Check 
                                                                    type="switch"
                                                                    id="push-enabled"
                                                                    label="Notificações push no navegador"
                                                                    checked={settings.notifications.push.enabled}
                                                                    onChange={(e) => handleChange('notifications.push.enabled', e.target.checked)}
                                                                />
                                                            </Tab.Pane>

                                                            {/* Integrações */}
                                                            <Tab.Pane eventKey="integrations">
                                                                <h4 className="mb-4">Integrações</h4>
                                                                <div className="list-group">
                                                                    <div className="list-group-item d-flex justify-content-between align-items-center">
                                                                        <div>
                                                                            <strong>WhatsApp Business API</strong>
                                                                            <br />
                                                                            <small className="text-muted">Envio de mensagens em massa</small>
                                                                        </div>
                                                                        <Badge bg={settings.integrations.whatsapp?.connected ? "success" : "secondary"}>
                                                                            {settings.integrations.whatsapp?.connected ? "Conectado" : "Desconectado"}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="list-group-item d-flex justify-content-between align-items-center">
                                                                        <div>
                                                                            <strong>Google Analytics</strong>
                                                                            <br />
                                                                            <small className="text-muted">Análise de comportamento</small>
                                                                        </div>
                                                                        <Badge bg={settings.integrations.googleAnalytics?.connected ? "success" : "secondary"}>
                                                                            {settings.integrations.googleAnalytics?.connected ? "Conectado" : "Desconectado"}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="list-group-item d-flex justify-content-between align-items-center">
                                                                        <div>
                                                                            <strong>Meta Ads</strong>
                                                                            <br />
                                                                            <small className="text-muted">Campanhas Facebook/Instagram</small>
                                                                        </div>
                                                                        <Button variant="outline-primary" size="sm">Conectar</Button>
                                                                    </div>
                                                                </div>
                                                            </Tab.Pane>

                                                            {/* Backup */}
                                                            <Tab.Pane eventKey="backup">
                                                                <h4 className="mb-4">Backup e Recuperação</h4>
                                                                <Row className="gx-3">
                                                                    <Col sm={6}>
                                                                        <Form.Group className="mb-3">
                                                                            <Form.Label>Frequência</Form.Label>
                                                                            <Form.Select 
                                                                                value={settings.backup.frequency}
                                                                                onChange={(e) => handleChange('backup.frequency', e.target.value)}
                                                                            >
                                                                                <option value="hourly">A cada hora</option>
                                                                                <option value="daily">Diário</option>
                                                                                <option value="weekly">Semanal</option>
                                                                                <option value="monthly">Mensal</option>
                                                                            </Form.Select>
                                                                        </Form.Group>
                                                                    </Col>
                                                                    <Col sm={6}>
                                                                        <Form.Group className="mb-3">
                                                                            <Form.Label>Retenção</Form.Label>
                                                                            <Form.Select 
                                                                                value={settings.backup.retention}
                                                                                onChange={(e) => handleChange('backup.retention', parseInt(e.target.value))}
                                                                            >
                                                                                <option value="7">7 dias</option>
                                                                                <option value="30">30 dias</option>
                                                                                <option value="90">90 dias</option>
                                                                                <option value="365">1 ano</option>
                                                                            </Form.Select>
                                                                        </Form.Group>
                                                                    </Col>
                                                                </Row>
                                                                <Alert variant="info">
                                                                    <strong>Último backup:</strong> {new Date(settings.backup.lastBackup).toLocaleString('pt-BR')}<br />
                                                                    <small>Tamanho: {settings.backup.lastBackupSize}</small>
                                                                </Alert>
                                                            </Tab.Pane>
                                                        </Tab.Content>
                                                    </Col>
                                                </Row>
                                            </Tab.Container>
                                        </div>
                                    )}
                                </div>
                            </SimpleBar>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettingsPage;
