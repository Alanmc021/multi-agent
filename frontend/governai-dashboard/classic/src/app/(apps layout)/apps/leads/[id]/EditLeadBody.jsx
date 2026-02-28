'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import { getLead, updateLead } from '@/lib/api/services/leads';
import { useAuth } from '@/lib/auth/AuthProvider';
import { showCustomAlert } from '@/components/CustomAlert';

const EditLeadBody = () => {
    const router = useRouter();
    const params = useParams();
    const { status } = useAuth();
    const leadId = params?.id;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lead, setLead] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        firstName: '',
        lastName: '',
        emailAddress: '',
        phoneNumber: '',
        status: 'New',
        source: '',
        industry: '',
        website: '',
        description: '',
    });

    useEffect(() => {
        if (status === 'authenticated' && leadId) {
            loadLead();
        } else if (status === 'guest') {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, leadId]);

    const loadLead = async () => {
        try {
            setLoading(true);
            const response = await getLead(leadId);
            if (response && response.success && response.data) {
                const data = response.data;
                setLead(data);
                setFormData({
                    name: data.name || '',
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    emailAddress: data.emailAddress || '',
                    phoneNumber: data.phoneNumber || '',
                    status: data.status || 'New',
                    source: data.source || '',
                    industry: data.industry || '',
                    website: data.website || '',
                    description: data.description || '',
                });
            } else {
                await showCustomAlert({
                    variant: 'danger',
                    title: 'Erro',
                    text: 'Lead não encontrado',
                });
                router.push('/apps/leads/list');
            }
        } catch (err) {
            console.error('Erro ao carregar lead:', err);
            await showCustomAlert({
                variant: 'danger',
                title: 'Erro',
                text: err?.message || 'Erro ao carregar lead',
            });
            router.push('/apps/leads/list');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validação básica - pelo menos nome ou primeiro nome + último nome
        if (!formData.name.trim() && (!formData.firstName.trim() || !formData.lastName.trim())) {
            await showCustomAlert({
                variant: 'danger',
                title: 'Erro',
                text: 'É necessário informar o nome completo ou primeiro nome e último nome',
            });
            return;
        }

        // Validação de email ou telefone
        if (!formData.emailAddress.trim() && !formData.phoneNumber.trim()) {
            await showCustomAlert({
                variant: 'danger',
                title: 'Erro',
                text: 'É necessário informar pelo menos o email ou telefone',
            });
            return;
        }

        if (status !== 'authenticated') {
            await showCustomAlert({
                variant: 'danger',
                title: 'Erro',
                text: 'Você precisa estar autenticado para editar um lead',
            });
            return;
        }

        try {
            setSaving(true);
            
            // Preparar dados para envio
            const nameValue = formData.name.trim() || 
                (formData.firstName.trim() && formData.lastName.trim() 
                    ? `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim()
                    : formData.firstName.trim() || formData.lastName.trim() || '');

            const leadData = {};
            
            // Adicionar nome se existir
            if (nameValue) {
                leadData.name = nameValue;
            }
            
            // Adicionar firstName e lastName se existirem
            if (formData.firstName.trim()) {
                leadData.firstName = formData.firstName.trim();
            }
            if (formData.lastName.trim()) {
                leadData.lastName = formData.lastName.trim();
            }
            
            // Adicionar email se existir
            if (formData.emailAddress.trim()) {
                leadData.emailAddress = formData.emailAddress.trim();
            }
            
            // Adicionar telefone se existir
            if (formData.phoneNumber.trim()) {
                leadData.phoneNumber = formData.phoneNumber.trim();
            }
            
            // Adicionar status (sempre presente, garantindo formato correto)
            leadData.status = formData.status || 'New';
            if (leadData.status) {
                leadData.status = leadData.status.charAt(0).toUpperCase() + leadData.status.slice(1).toLowerCase();
            }
            
            // Adicionar campos opcionais apenas se preenchidos
            // IMPORTANTE: Não adicionar campos vazios para evitar erros de validação
            // Campos problemáticos: source, industry, website - remover se vazios
            
            const sourceValue = formData.source?.trim();
            if (sourceValue) {
                leadData.source = sourceValue;
            }
            
            const industryValue = formData.industry?.trim();
            if (industryValue) {
                leadData.industry = industryValue;
            }
            
            const websiteValue = formData.website?.trim();
            if (websiteValue) {
                leadData.website = websiteValue;
            }
            
            const descriptionValue = formData.description?.trim();
            if (descriptionValue) {
                leadData.description = descriptionValue;
            }

            // Limpeza final: remover qualquer campo que possa ter sido adicionado incorretamente
            const cleanedData = {};
            Object.keys(leadData).forEach(key => {
                const value = leadData[key];
                if (value !== undefined && value !== null && value !== '' && 
                    (typeof value !== 'string' || value.trim() !== '')) {
                    cleanedData[key] = value;
                }
            });

            console.log('Dados do lead ANTES da limpeza:', leadData);
            console.log('Dados do lead DEPOIS da limpeza:', cleanedData);

            const response = await updateLead(leadId, cleanedData);

            if (response?.success === false) {
                await showCustomAlert({
                    variant: 'danger',
                    title: 'Erro',
                    text: response?.message || 'Erro ao atualizar lead',
                });
                return;
            }

            await showCustomAlert({
                variant: 'success',
                title: 'Sucesso',
                text: 'Lead atualizado com sucesso!',
            });
            // Redirecionar para a lista após confirmação do usuário
            router.push('/apps/leads/list');
        } catch (err) {
            console.error('Erro ao atualizar lead:', err);
            console.error('Detalhes do erro:', {
                message: err?.message,
                status: err?.status,
                body: err?.body,
            });
            
            let errorMessage = 'Erro ao atualizar lead. Tente novamente.';
            
            const errorMessageText = err?.message || err?.body?.message || '';
            const is409Error = err?.status === 409 || 
                               errorMessageText.includes('EspoCRM API error: 409') ||
                               errorMessageText.includes('409');
            
            if (is409Error) {
                errorMessage = 'Já existe um lead com este email ou telefone. Verifique os dados e tente novamente.';
            } else if (err?.body?.message) {
                errorMessage = err.body.message;
            } else if (err?.body?.error) {
                errorMessage = err.body.error;
            } else if (err?.message) {
                errorMessage = err.message;
            }
            
            if (err?.body?.errors) {
                const validationErrors = Object.values(err.body.errors).flat().join(', ');
                errorMessage += ` ${validationErrors}`;
            }
            
            await showCustomAlert({
                variant: 'danger',
                title: 'Erro',
                text: errorMessage,
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="contact-body">
                <SimpleBar className="nicescroll-bar">
                    <div className="text-center py-5">
                        <p>Carregando lead...</p>
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
                        <Card.Header>
                            <h5>Editar Lead</h5>
                        </Card.Header>
                        <Card.Body>
                            {lead && (
                                <div className="mb-3">
                                    <small className="text-muted">
                                        Criado em: {lead.createdAt ? new Date(lead.createdAt).toLocaleString('pt-BR') : '-'}
                                        {lead.modifiedAt && lead.modifiedAt !== lead.createdAt && (
                                            <> | Modificado em: {new Date(lead.modifiedAt).toLocaleString('pt-BR')}</>
                                        )}
                                    </small>
                                </div>
                            )}
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Nome Completo</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Digite o nome completo do lead"
                                                disabled={saving}
                                            />
                                            <Form.Text className="text-muted">
                                                Ou preencha primeiro nome e último nome abaixo
                                            </Form.Text>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Primeiro Nome</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                placeholder="Primeiro nome"
                                                disabled={saving}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Último Nome</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                placeholder="Último nome"
                                                disabled={saving}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="emailAddress"
                                                value={formData.emailAddress}
                                                onChange={handleChange}
                                                placeholder="email@exemplo.com"
                                                disabled={saving}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Telefone</Form.Label>
                                            <Form.Control
                                                type="tel"
                                                name="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleChange}
                                                placeholder="+55 11 99999-9999"
                                                disabled={saving}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Status</Form.Label>
                                            <Form.Select
                                                name="status"
                                                value={formData.status}
                                                onChange={handleChange}
                                                disabled={saving}
                                            >
                                                <option value="New">Novo</option>
                                                <option value="Contacted">Contatado</option>
                                                <option value="Qualified">Qualificado</option>
                                                <option value="Converted">Convertido</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Origem</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="source"
                                                value={formData.source}
                                                onChange={handleChange}
                                                placeholder="Ex: Website, Facebook, Indicação"
                                                disabled={saving}
                                            />
                                            <Form.Text className="text-muted">
                                                Nota: Este campo pode causar erro de validação. Deixe vazio se não tiver certeza.
                                            </Form.Text>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Indústria</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="industry"
                                                value={formData.industry}
                                                onChange={handleChange}
                                                placeholder="Ex: Tecnologia, Varejo"
                                                disabled={saving}
                                            />
                                            <Form.Text className="text-muted">
                                                Nota: Este campo pode causar erro de validação. Deixe vazio se não tiver certeza.
                                            </Form.Text>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Website</Form.Label>
                                            <Form.Control
                                                type="url"
                                                name="website"
                                                value={formData.website}
                                                onChange={handleChange}
                                                placeholder="https://exemplo.com"
                                                disabled={saving}
                                            />
                                            <Form.Text className="text-muted">
                                                Nota: Este campo pode causar erro de validação. Deixe vazio se não tiver certeza.
                                            </Form.Text>
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
                                                placeholder="Informações adicionais sobre o lead"
                                                disabled={saving}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12}>
                                        <div className="d-flex gap-2">
                                            <Button variant="primary" type="submit" disabled={saving}>
                                                {saving ? 'Salvando...' : 'Salvar Alterações'}
                                            </Button>
                                            <Button variant="light" onClick={() => router.push('/apps/leads/list')} disabled={saving}>
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
        </div>
    );
};

export default EditLeadBody;

