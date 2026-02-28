'use client'
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Alert, Button, Card, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import CommonFooter1 from '../../CommonFooter1';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';

//Image
import logo from '@/assets/img/logo-governa-ia.svg';

const SignupClassic = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [subdomain, setSubdomain] = useState('');
    const [subdomainTouched, setSubdomainTouched] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({
        name: '',
        companyName: '',
        email: '',
        password: ''
    });
    const [touched, setTouched] = useState({
        name: false,
        companyName: false,
        email: false,
        password: false
    });

    const router = useRouter();
    const { registerCompany } = useAuth();

    const slugify = (value) =>
        String(value || '')
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')
            .slice(0, 50);

    useEffect(() => {
        if (!subdomainTouched) {
            setSubdomain(slugify(companyName));
        }
    }, [companyName, subdomainTouched]);

    const validateField = (fieldName, value) => {
        let error = '';
        
        if (fieldName === 'name') {
            if (!value || value.trim() === '') {
                error = 'Nome é obrigatório';
            }
        } else if (fieldName === 'companyName') {
            if (!value || value.trim() === '') {
                error = 'Nome da empresa é obrigatório';
            }
        } else if (fieldName === 'email') {
            if (!value || value.trim() === '') {
                error = 'E-mail é obrigatório';
            } else {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    error = 'Por favor, insira um e-mail válido';
                }
            }
        } else if (fieldName === 'password') {
            if (!value || value.trim() === '') {
                error = 'Senha é obrigatória';
            } else if (value.length < 6) {
                error = 'A senha deve ter no mínimo 6 caracteres';
            }
        }
        
        return error;
    };

    const handleBlur = (fieldName) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));
        let value;
        if (fieldName === 'name') value = name;
        else if (fieldName === 'companyName') value = companyName;
        else if (fieldName === 'email') value = email;
        else if (fieldName === 'password') value = password;
        
        const error = validateField(fieldName, value);
        setFieldErrors(prev => ({ ...prev, [fieldName]: error }));
    };

    const handleChange = (fieldName, value) => {
        if (fieldName === 'name') {
            setName(value);
        } else if (fieldName === 'companyName') {
            setCompanyName(value);
        } else if (fieldName === 'email') {
            setEmail(value);
        } else if (fieldName === 'password') {
            setPassword(value);
        }
        
        // Limpa erro do campo quando o usuário começa a digitar
        if (touched[fieldName]) {
            const error = validateField(fieldName, value);
            setFieldErrors(prev => ({ ...prev, [fieldName]: error }));
        }
        
        // Limpa erro geral quando o usuário começa a digitar
        if (error) {
            setError('');
        }
    };

    const validateForm = () => {
        const errors = {
            name: '',
            companyName: validateField('companyName', companyName),
            email: validateField('email', email),
            password: validateField('password', password)
        };
        
        setFieldErrors(errors);
        setTouched({ name: true, companyName: true, email: true, password: true });
        
        return !errors.companyName && !errors.email && !errors.password;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Valida todos os campos antes de submeter
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        try {
            await registerCompany({
                name: companyName,
                email,
                password,
                companyName,
                subdomain: subdomain || undefined,
            });
            router.push('/dashboard-analytics');
        } catch (err) {
            const msg = err?.body?.message || err?.message || 'Falha ao criar conta';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="hk-pg-wrapper pt-0 pb-xl-0 pb-5">
            <div className="hk-pg-body pt-0 pb-xl-0">
                <Container>
                    <Row>
                        <Col sm={10} className="position-relative mx-auto">
                            <div className="auth-content py-8">
                                <Form className="w-100" onSubmit={handleSubmit}>
                                    <Row>
                                        <Col xxl={5} xl={7} lg={8} sm={10} className="mx-auto">
                                            <div className="text-center mb-7">
                                                <Link className="navbar-brand me-0" href="/" >
                                                    <Image className="brand-img d-inline-block" src={logo} alt="brand" />
                                                </Link>
                                            </div>
                                            <Card className="card-border" style={{ borderTop: '4px solid #009b36' }}>
                                                <Card.Body>
                                                    <h4 className="text-center mb-0">Criar conta no GovernAI</h4>
                                                    <p className="p-xs mt-2 mb-4 text-center">
                                                        Já tem conta? <Link href="/auth/login" style={{ color: '#009b36' }}><u>Entrar</u></Link>
                                                    </p>
                                                    {error && (
                                                        <Alert variant="danger" className="py-2">
                                                            {error}
                                                        </Alert>
                                                    )}
                                                    {/*
                                                      Login social (Google/Facebook) - ainda não implementado no GovernAI.
                                                      Mantemos somente o cadastro via GovernAI API por enquanto.
                                                    */}
                                                    <Row className="gx-3">
                                                        <Col lg={12} as={Form.Group} className="mb-3">
                                                            <Form.Label>Nome do Partido / Comitê <span className="text-danger">*</span></Form.Label>
                                                            <Form.Control
                                                                placeholder="Ex: Partido da Renovação Cidadã"
                                                                type="text"
                                                                value={companyName}
                                                                onChange={(e) => handleChange('companyName', e.target.value)}
                                                                onBlur={() => handleBlur('companyName')}
                                                                required
                                                                isInvalid={touched.companyName && !!fieldErrors.companyName}
                                                            />
                                                            {touched.companyName && fieldErrors.companyName && (
                                                                <Form.Control.Feedback type="invalid" className="d-block">
                                                                    {fieldErrors.companyName}
                                                                </Form.Control.Feedback>
                                                            )}
                                                        </Col>
                                                        <Col lg={12} as={Form.Group} className="mb-3">
                                                            <Form.Label>Subdomínio (opcional)</Form.Label>
                                                            <Form.Control
                                                                placeholder="ex: partido-renovacao-cidada"
                                                                type="text"
                                                                value={subdomain}
                                                                onChange={(e) => {
                                                                    setSubdomainTouched(true);
                                                                    setSubdomain(e.target.value);
                                                                }}
                                                            />
                                                            <Form.Text className="text-muted">
                                                                Gerado automaticamente. Você pode personalizar se quiser.
                                                            </Form.Text>
                                                        </Col>
                                                        <Col lg={12} as={Form.Group} className="mb-3">
                                                            <Form.Label>E-mail <span className="text-danger">*</span></Form.Label>
                                                            <Form.Control
                                                                placeholder="Digite seu e-mail"
                                                                type="email"
                                                                value={email}
                                                                onChange={(e) => handleChange('email', e.target.value)}
                                                                onBlur={() => handleBlur('email')}
                                                                required
                                                                isInvalid={touched.email && !!fieldErrors.email}
                                                            />
                                                            {touched.email && fieldErrors.email && (
                                                                <Form.Control.Feedback type="invalid" className="d-block">
                                                                    {fieldErrors.email}
                                                                </Form.Control.Feedback>
                                                            )}
                                                        </Col>
                                                        <Col lg={12} as={Form.Group} className="mb-3">
                                                            <Form.Label>Senha <span className="text-danger">*</span></Form.Label>
                                                            <InputGroup className="password-check">
                                                                <span className="input-affix-wrapper affix-wth-text">
                                                                    <Form.Control
                                                                        placeholder="Mínimo 6 caracteres"
                                                                        type={showPassword ? "text" : "password"}
                                                                        value={password}
                                                                        onChange={(e) => handleChange('password', e.target.value)}
                                                                        onBlur={() => handleBlur('password')}
                                                                        required
                                                                        isInvalid={touched.password && !!fieldErrors.password}
                                                                    />
                                                                    <a
                                                                        href="#"
                                                                        className="input-suffix text-primary text-uppercase fs-8 fw-medium"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            setShowPassword(!showPassword);
                                                                        }}
                                                                    >
                                                                        {showPassword
                                                                            ?
                                                                            <span>Ocultar</span>
                                                                            :
                                                                            <span>Mostrar</span>
                                                                        }
                                                                    </a>
                                                                </span>
                                                            </InputGroup>
                                                            {touched.password && fieldErrors.password && (
                                                                <Form.Control.Feedback type="invalid" className="d-block">
                                                                    {fieldErrors.password}
                                                                </Form.Control.Feedback>
                                                            )}
                                                        </Col>
                                                    </Row>
                                                    <Form.Check id="logged_in" className="form-check-sm mb-3" >
                                                        <Form.Check.Input type="checkbox" defaultChecked />
                                                        <Form.Check.Label className="text-muted fs-7">
                                                            Ao criar uma conta, você concorda com nossos <a href="#" style={{ color: '#009b36' }}>Termos de uso</a> e <a href="#" style={{ color: '#009b36' }}>Política de privacidade</a>.
                                                        </Form.Check.Label>
                                                    </Form.Check>
                                                    <Button
                                                        type="submit"
                                                        className="btn-rounded btn-uppercase btn-block"
                                                        style={{ backgroundColor: '#009b36', borderColor: '#009b36', color: '#fff' }}
                                                        disabled={loading}
                                                    >
                                                        {loading ? 'Criando…' : 'Criar minha conta'}
                                                    </Button>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                </Form>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
            {/* Page Footer */}
            <CommonFooter1 />
        </div>

    )
}

export default SignupClassic
