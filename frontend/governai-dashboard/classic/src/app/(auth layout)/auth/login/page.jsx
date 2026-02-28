'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Alert, Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import { ExternalLink } from 'react-feather';

//Images
import logo from '@/assets/img/logo-governa-ia.svg';
import logoutImg from '@/assets/img/login-bg-politico.png';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { getTenantId, clearTenantId } from '@/lib/auth/session';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({
        email: '',
        password: '',
    });
    const [touched, setTouched] = useState({
        email: false,
        password: false,
    });

    const router = useRouter();
    const { login } = useAuth();

    const validateField = (fieldName, value) => {
        let error = '';
        
        if (fieldName === 'email') {
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
            }
        }
        
        return error;
    };

    const handleBlur = (fieldName) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));
        const value = fieldName === 'email' ? email : password;
        const error = validateField(fieldName, value);
        setFieldErrors(prev => ({ ...prev, [fieldName]: error }));
    };

    const handleChange = (fieldName, value) => {
        if (fieldName === 'email') {
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
            email: validateField('email', email),
            password: validateField('password', password),
        };
        
        setFieldErrors(errors);
        setTouched({ email: true, password: true });
        
        return !errors.email && !errors.password;
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
            // ✅ NOVO: Login simplificado - só email + senha
            // Backend busca automaticamente o tenant do usuário
            await login({ email, password });
            router.push('/dashboard-analytics');
        } catch (err) {
            const msg = err?.body?.message || err?.message || 'Falha no login';
            
            // Se erro de tenant não encontrado, limpa e pede novamente
            if (msg.includes('Tenant') || msg.includes('tenant') || msg.includes('empresa')) {
                clearTenantId();
                setShowSubdomainField(true);
                setError('Empresa não encontrada. Por favor, verifique o nome.');
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="hk-pg-wrapper py-0" >
            <div className="hk-pg-body py-0">
                <Container fluid>
                    <Row className="auth-split">
                        <Col xl={5} lg={6} md={7} className="position-relative mx-auto">
                            <div className="auth-content flex-column pt-8 pb-md-8 pb-13">
                                <div className="text-center mb-7">
                                    <Link href="/" className="navbar-brand me-0">
                                        <Image
                                            className="brand-img d-inline-block"
                                            src={logo}
                                            alt="brand"
                                            height={44}
                                            style={{ width: 'auto', height: '55px' }}
                                            priority
                                        />
                                    </Link>
                                </div>
                                <Form className="w-100" onSubmit={e => handleSubmit(e)} >
                                    <Row>
                                        <Col xl={7} sm={10} className="mx-auto">
                                            <div className="text-center mb-4">
                                                <h4>Entrar na sua conta GovernAI</h4>
                                                <p>Bem-vindo ao GovernAI — sua plataforma de gestão de campanha eleitoral. Acesse para gerenciar sua campanha com inteligência artificial.</p>
                                            </div>
                                            {error && (
                                                <Alert variant="danger" className="py-2">
                                                    {error}
                                                </Alert>
                                            )}
                                            <Row className="gx-3">
                                                <Col as={Form.Group} lg={12} className="mb-3" >
                                                    <div className="form-label-group">
                                                        <Form.Label>E-mail <span className="text-danger">*</span></Form.Label>
                                                    </div>
                                                    <Form.Control 
                                                        placeholder="Digite seu e-mail" 
                                                        type="email" 
                                                        value={email} 
                                                        onChange={e => handleChange('email', e.target.value)}
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
                                                <Col as={Form.Group} lg={12} className="mb-3" >
                                                    <div className="form-label-group">
                                                        <Form.Label>Senha <span className="text-danger">*</span></Form.Label>
                                                        <Link href="#" className="fs-7 fw-medium">Esqueceu a senha?</Link>
                                                    </div>
                                                    <InputGroup className="password-check">
                                                        <span className="input-affix-wrapper affix-wth-text">
                                                            <Form.Control 
                                                                placeholder="Digite sua senha" 
                                                                value={password} 
                                                                onChange={e => handleChange('password', e.target.value)}
                                                                onBlur={() => handleBlur('password')}
                                                                type={showPassword ? "text" : "password"}
                                                                required
                                                                isInvalid={touched.password && !!fieldErrors.password}
                                                            />
                                                            <Link href="#" className="input-suffix text-primary text-uppercase fs-8 fw-medium" onClick={() => setShowPassword(!showPassword)} >
                                                                {showPassword
                                                                    ?
                                                                    <span>Ocultar</span>
                                                                    :
                                                                    <span>Mostrar</span>
                                                                }
                                                            </Link>
                                                        </span>
                                                    </InputGroup>
                                                    {touched.password && fieldErrors.password && (
                                                        <Form.Control.Feedback type="invalid" className="d-block">
                                                            {fieldErrors.password}
                                                        </Form.Control.Feedback>
                                                    )}
                                                </Col>
                                            </Row>
                                            <div className="d-flex justify-content-center">
                                                <Form.Check id="logged_in" className="form-check-sm mb-3" >
                                                    <Form.Check.Input type="checkbox" defaultChecked />
                                                    <Form.Check.Label className="text-muted fs-7">Manter conectado</Form.Check.Label>
                                                </Form.Check>
                                            </div>
                                            <Button variant="primary" type="submit" className="btn-uppercase btn-block" disabled={loading}>
                                                {loading ? 'Entrando…' : 'Login'}
                                            </Button>
                                            <p className="p-xs mt-2 text-center">Novo no GovernAI? <Link href="/auth/signup/classic"><u>Criar conta</u></Link></p>
                                            <Link href="#" className="d-block extr-link text-center mt-4">
                                                <span className="feather-icon">
                                                    <ExternalLink />
                                                </span>
                                                <u className="text-muted">Precisa de ajuda? Fale com o suporte</u>
                                            </Link>
                                        </Col>
                                    </Row>
                                </Form>
                            </div>
                            {/* Page Footer */}
                            <div className="hk-footer border-0">
                                <Container fluid as="footer" className="footer">
                                    <Row>
                                        <div className="col-xl-8 text-center">
                                            <p className="footer-text pb-0"><span className="copy-text">GovernAI © {new Date().getFullYear()} Todos os direitos reservados.</span> <a href="#some" target="_blank">Política de Privacidade</a><span className="footer-link-sep">|</span><a href="#some" target="_blank">Termos</a><span className="footer-link-sep">|</span><a href="#some" target="_blank">Status do Sistema</a></p>
                                        </div>
                                    </Row>
                                </Container>
                            </div>
                        </Col>
                        <Col xl={7} lg={6} md={5} sm={10} className="d-md-block d-none position-relative bg-primary-light-5">
                            <div className="auth-content flex-column text-center py-8">
                                <Row>
                                    <Col xxl={7} xl={8} lg={11} className="mx-auto">
                                        <h2 className="mb-4">Sua campanha eleitoral inteligente</h2>
                                        <p>Gerencie sua campanha política com IA: atenda cidadãos, crie conteúdo, controle finanças TSE e acompanhe métricas — tudo em uma plataforma completa.</p>
                                        <Button variant="flush-primary" className="btn-uppercase mt-2">Ver recurso</Button>
                                    </Col>
                                </Row>
                                <Image src={logoutImg} className="img-fluid w-sm-50 mt-7" alt="login" />
                            </div>
                           
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    )
}

export default Login
