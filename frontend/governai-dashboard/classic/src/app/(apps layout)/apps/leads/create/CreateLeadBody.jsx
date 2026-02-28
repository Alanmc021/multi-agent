'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import { createLead } from '@/lib/api/services/leads';
import { useAuth } from '@/lib/auth/AuthProvider';
import { showCustomAlert } from '@/components/CustomAlert';

const CreateLeadBody = () => {
    const router = useRouter();
    const { status } = useAuth();

    const [saving, setSaving] = useState(false);
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
                text: 'Você precisa estar autenticado para criar um lead',
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
            
            // Garantir que o status está no formato correto (primeira letra maiúscula)
            if (leadData.status) {
                leadData.status = leadData.status.charAt(0).toUpperCase() + leadData.status.slice(1).toLowerCase();
            }
            
            // Adicionar campos opcionais apenas se preenchidos
            // Nota: Alguns campos podem ter validação específica no EspoCRM
            // IMPORTANTE: Não adicionar campos vazios para evitar erros de validação
            
            const sourceValue = formData.source?.trim();
            if (sourceValue) {
                leadData.source = sourceValue;
            }
            
            // Industry pode ter valores específicos permitidos no EspoCRM
            // NÃO adicionar se estiver vazio para evitar erro de validação
            const industryValue = formData.industry?.trim();
            if (industryValue) {
                leadData.industry = industryValue;
            }
            // NÃO adicionar industry se estiver vazio
            
            const websiteValue = formData.website?.trim();
            if (websiteValue) {
                leadData.website = websiteValue;
            }
            
            const descriptionValue = formData.description?.trim();
            if (descriptionValue) {
                leadData.description = descriptionValue;
            }

            // Limpeza final: remover qualquer campo que possa ter sido adicionado incorretamente
            // Isso evita erros de validação no EspoCRM
            const cleanedData = {};
            Object.keys(leadData).forEach(key => {
                const value = leadData[key];
                // Só adicionar se tiver valor válido
                if (value !== undefined && value !== null && value !== '' && 
                    (typeof value !== 'string' || value.trim() !== '')) {
                    cleanedData[key] = value;
                }
            });

            console.log('Dados do lead ANTES da limpeza:', leadData);
            console.log('Dados do lead DEPOIS da limpeza:', cleanedData);

            const response = await createLead(cleanedData);


            if (response?.success === false) {
                await showCustomAlert({
                    variant: 'danger',
                    title: 'Erro',
                    text: response?.message || 'Erro ao criar lead',
                });
                return;
            }

            // Redirecionar para a lista de leads após criar com sucesso
            await showCustomAlert({
                variant: 'success',
                title: 'Sucesso',
                text: 'Lead criado com sucesso!',
            });
            router.push('/apps/leads/list');
        } catch (err) {
            console.error('Erro ao criar lead:', err);
            console.error('Detalhes do erro:', {
                message: err?.message,
                status: err?.status,
                body: err?.body,
                stack: err?.stack
            });
            
            // Extrair mensagem de erro mais detalhada
            let errorMessage = 'Erro ao criar lead. Tente novamente.';
            
            // Verificar se a mensagem de erro contém informação sobre erro 409
            // (mesmo que o status seja 500, o backend pode estar retornando erro 409 do EspoCRM)
            const errorMessageText = err?.message || err?.body?.message || '';
            const is409Error = err?.status === 409 || 
                               errorMessageText.includes('EspoCRM API error: 409') ||
                               errorMessageText.includes('409');
            
            // Tratamento específico para erro 409 (Conflito - lead já existe)
            if (is409Error) {
                errorMessage = 'Já existe um lead com este email ou telefone. Verifique os dados e tente novamente.';
                
                // Tentar extrair informações do lead existente se disponível
                // O erro pode vir como string JSON ou como objeto
                let existingLead = null;
                
                // Primeiro, tentar extrair do body
                if (err?.body) {
                    // Se o body é uma string, tentar fazer parse
                    if (typeof err.body === 'string') {
                        try {
                            const parsed = JSON.parse(err.body);
                            if (Array.isArray(parsed) && parsed.length > 0) {
                                existingLead = parsed[0];
                            } else if (parsed && parsed.id) {
                                existingLead = parsed;
                            }
                        } catch (e) {
                            // Se não for JSON válido, tentar extrair da mensagem
                            console.log('Tentando extrair JSON da mensagem de erro');
                        }
                    } else if (Array.isArray(err.body) && err.body.length > 0) {
                        existingLead = err.body[0];
                    } else if (err.body.id) {
                        existingLead = err.body;
                    }
                }
                
                // Se não encontrou no body, tentar extrair da mensagem de erro
                // A mensagem pode conter JSON como string (formato: "EspoCRM API error: 409 - [{...}]")
                if (!existingLead) {
                    // Função auxiliar para extrair JSON de uma string
                    const extractJsonFromString = (text) => {
                        if (!text) return null;
                        
                        try {
                            // Tentar encontrar JSON na mensagem (pode estar após " - ")
                            const parts = text.split(' - ');
                            if (parts.length > 1) {
                                const jsonPart = parts[parts.length - 1].trim();
                                // Tentar parsear como array JSON
                                if (jsonPart.startsWith('[') && jsonPart.endsWith(']')) {
                                    const parsed = JSON.parse(jsonPart);
                                    if (Array.isArray(parsed) && parsed.length > 0) {
                                        return parsed[0];
                                    }
                                } else if (jsonPart.startsWith('{') && jsonPart.endsWith('}')) {
                                    // Ou como objeto JSON
                                    const parsed = JSON.parse(jsonPart);
                                    if (parsed && parsed.id) {
                                        return parsed;
                                    }
                                }
                            }
                            
                            // Se não encontrou após " - ", tentar encontrar qualquer JSON na string
                            const jsonMatch = text.match(/\[(\{.*\})\]/s);
                            if (jsonMatch) {
                                const jsonStr = '[' + jsonMatch[1] + ']';
                                const parsed = JSON.parse(jsonStr);
                                if (Array.isArray(parsed) && parsed.length > 0) {
                                    return parsed[0];
                                }
                            }
                        } catch (e) {
                            console.log('Erro ao extrair JSON:', e);
                        }
                        return null;
                    };
                    
                    // Tentar extrair do body.message primeiro
                    if (err?.body?.message) {
                        existingLead = extractJsonFromString(err.body.message);
                    }
                    
                    // Se ainda não encontrou, tentar da mensagem principal
                    if (!existingLead && err?.message) {
                        existingLead = extractJsonFromString(err.message);
                    }
                    
                    // Se ainda não encontrou, tentar do stack (pode conter a mensagem completa)
                    if (!existingLead && err?.stack) {
                        existingLead = extractJsonFromString(err.stack);
                    }
                }
                
                console.log('Lead existente extraído:', existingLead);
                console.log('Dados do formulário:', {
                    email: formData.emailAddress,
                    phone: formData.phoneNumber
                });
                
                // Se encontrou o lead existente, verificar qual campo está duplicado
                if (existingLead) {
                    const existingFields = [];
                    
                    // Comparar email (case-insensitive)
                    const formEmail = formData.emailAddress?.trim().toLowerCase();
                    const existingEmail = existingLead.emailAddress?.toLowerCase();
                    if (formEmail && existingEmail && formEmail === existingEmail) {
                        existingFields.push('email');
                    }
                    
                    // Comparar telefone
                    const formPhone = formData.phoneNumber?.trim();
                    const existingPhone = existingLead.phoneNumber;
                    if (formPhone && existingPhone && formPhone === existingPhone) {
                        existingFields.push('telefone');
                    }
                    
                    console.log('Campos duplicados encontrados:', existingFields);
                    
                    if (existingFields.length > 0) {
                        errorMessage = `Já existe um lead com este ${existingFields.join(' e ')}. `;
                        if (existingLead.name) {
                            errorMessage += `Lead existente: ${existingLead.name}`;
                        }
                    } else {
                        // Mesmo sem identificar o campo, mostrar o lead existente
                        if (existingLead.name) {
                            errorMessage = `Já existe um lead com esses dados. Lead existente: ${existingLead.name}`;
                        } else {
                            // Se não conseguiu identificar o campo, mas tem o lead, mostrar mensagem genérica
                            errorMessage = 'Já existe um lead com este email ou telefone. Verifique os dados e tente novamente.';
                        }
                    }
                } else {
                    // Se não conseguiu extrair o lead, mas é erro 409, mostrar mensagem genérica
                    console.log('Não foi possível extrair informações do lead existente');
                    errorMessage = 'Já existe um lead com este email ou telefone. Verifique os dados e tente novamente.';
                }
            } else if (err?.body?.message) {
                errorMessage = err.body.message;
            } else if (err?.body?.error) {
                errorMessage = err.body.error;
            } else if (err?.message) {
                errorMessage = err.message;
            }
            
            // Se houver detalhes de validação, adicionar
            if (err?.body?.errors) {
                const validationErrors = Object.values(err.body.errors).flat().join(', ');
                errorMessage += ` ${validationErrors}`;
            }
            
            console.log('=== DEBUG ERRO 409 ===');
            console.log('Status HTTP:', err?.status);
            console.log('Mensagem do erro:', err?.message);
            console.log('Body do erro:', err?.body);
            console.log('É erro 409?', is409Error);
            console.log('Mensagem de erro final:', errorMessage);
            console.log('========================');
            
            await showCustomAlert({
                variant: 'danger',
                title: 'Erro',
                text: errorMessage,
            });
            
            // Forçar scroll para o topo para garantir que o erro seja visível
            if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="contact-body contact-detail-body">
            <SimpleBar className="nicescroll-bar">
                <div className="contactapp-detail-wrap">
                    <Card>
                        <Card.Header>
                            <h5>Novo Lead</h5>
                        </Card.Header>
                        <Card.Body>
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
                                                {saving ? 'Criando...' : 'Criar Lead'}
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

export default CreateLeadBody;

