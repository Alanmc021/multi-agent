'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Col, Container, Form, Nav, Row, Tab, Alert, Spinner } from 'react-bootstrap';
import { apiRequest } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/AuthProvider';
import classNames from 'classnames';
import { showCustomAlert } from '@/components/CustomAlert';

const EditUserBody = ({ userId }) => {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userData, setUserData] = useState(null);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('employee');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Permissions state
  const [permissions, setPermissions] = useState({
    admin: { read: false, write: false, delete: false },
    financial: { read: false, write: false, delete: false },
    marketing: { read: false, write: false, delete: false },
    citizen: { read: false, write: false, delete: false },
    studio: { read: false, write: false, delete: false },
  });
  
  // Validation states
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const isOwner = currentUser?.role === 'owner';
  const isAdmin = currentUser?.role === 'admin';
  const isSelf = currentUser?.id === userId;

  // Buscar dados do usuÃ¡rio
  useEffect(() => {
    const fetchUser = async () => {
      let redirectedToAdmin = false;
      setLoading(true);
      setIsRedirecting(false);
      setError('');
      try {
        // Primeiro, tentar buscar como admin/polÃ­tico
        try {
          const adminResponse = await apiRequest(`/users/admin/${userId}`, { method: 'GET' });
          if (adminResponse?.success && adminResponse?.data) {
            // Ã‰ um polÃ­tico! Redirecionar para pÃ¡gina de ediÃ§Ã£o de polÃ­tico
            console.log('PolÃ­tico detectado, redirecionando para pÃ¡gina de ediÃ§Ã£o completa...');
            redirectedToAdmin = true;
            setIsRedirecting(true);
            router.push(`/apps/users/edit-admin/${userId}`);
            return;
          }
        } catch (adminErr) {
          // 404 ao buscar admin/político é fluxo normal
          if (adminErr?.status === 404) {
            console.log('Não é político, continuando como usuário normal');
          } else {
            console.warn('Falha ao checar perfil de político; continuando como usuário normal', adminErr);
          }
        }
        
        // Buscar como usuÃ¡rio normal
        const response = await apiRequest(`/users/${userId}`, { method: 'GET' });
        if (response?.user) {
          const user = response.user;
          setUserData(user);
          setName(user.name || '');
          setEmail(user.email || '');
          setRole(user.role || 'employee');
          
          // Carregar permissÃµes se existirem
          if (user.permissions) {
            setPermissions(user.permissions);
          }
        } else {
          throw new Error('UsuÃ¡rio nÃ£o encontrado');
        }
      } catch (err) {
        setError(err?.body?.message || err?.message || 'Erro ao carregar usuÃ¡rio');
      } finally {
        if (!redirectedToAdmin) {
          setLoading(false);
        }
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId, router]);

  useEffect(() => {
    if (!error) return;
    showCustomAlert({
      variant: 'danger',
      title: 'Erro',
      text: error,
    }).finally(() => setError(''));
  }, [error]);

  useEffect(() => {
    if (!success) return;
    showCustomAlert({
      variant: 'success',
      title: 'Sucesso',
      text: success,
    }).finally(() => setSuccess(''));
  }, [success]);

  // ValidaÃ§Ãµes
  const validateField = (fieldName, value) => {
    let error = '';
    
    if (fieldName === 'name') {
      if (!value || value.trim() === '') {
        error = 'Nome Ã© obrigatÃ³rio';
      }
    } else if (fieldName === 'email') {
      if (!value || value.trim() === '') {
        error = 'E-mail Ã© obrigatÃ³rio';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          error = 'Por favor, insira um e-mail vÃ¡lido';
        }
      }
    } else if (fieldName === 'password') {
      if (value && value.length < 6) {
        error = 'A senha deve ter no mÃ­nimo 6 caracteres';
      }
    } else if (fieldName === 'confirmPassword') {
      if (password && value !== password) {
        error = 'As senhas nÃ£o coincidem';
      }
    }
    
    return error;
  };

  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    let value;
    if (fieldName === 'name') value = name;
    else if (fieldName === 'email') value = email;
    else if (fieldName === 'password') value = password;
    else if (fieldName === 'confirmPassword') value = confirmPassword;
    
    const error = validateField(fieldName, value);
    setFieldErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleChange = (fieldName, value) => {
    if (fieldName === 'name') {
      setName(value);
    } else if (fieldName === 'email') {
      setEmail(value);
    } else if (fieldName === 'password') {
      setPassword(value);
    } else if (fieldName === 'confirmPassword') {
      setConfirmPassword(value);
    } else if (fieldName === 'role') {
      setRole(value);
    }
    
    if (touched[fieldName]) {
      const error = validateField(fieldName, value);
      setFieldErrors(prev => ({ ...prev, [fieldName]: error }));
    }
    
    if (error || success) {
      setError('');
      setSuccess('');
    }
  };

  const validateForm = () => {
    const errors = {
      name: validateField('name', name),
      email: validateField('email', email),
      password: validateField('password', password),
      confirmPassword: validateField('confirmPassword', confirmPassword),
    };
    
    setFieldErrors(errors);
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    
    return !errors.name && !errors.email && !errors.password && !errors.confirmPassword;
  };

  // Salvar alteraÃ§Ãµes
  const handleSavePersonalInfo = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }

    // Validar permissÃµes
    if (!isOwner && !isAdmin && !isSelf) {
      setError('VocÃª nÃ£o tem permissÃ£o para editar este usuÃ¡rio');
      return;
    }

    if (isAdmin && !['employee', 'external'].includes(userData?.role) && !isSelf) {
      setError('ADMIN sÃ³ pode editar usuÃ¡rios com role EMPLOYEE ou EXTERNAL');
      return;
    }
    
    setSaving(true);
    try {
      const updateData = {
        name,
        email,
      };
      
      // Adicionar senha apenas se foi preenchida
      if (password) {
        updateData.password = password;
      }
      
      const response = await apiRequest(`/users/${userId}`, {
        method: 'PATCH',
        body: updateData,
      });
      
      if (response?.user || response?.message) {
        setSuccess('InformaÃ§Ãµes pessoais atualizadas com sucesso!');
        setPassword('');
        setConfirmPassword('');
        setFieldErrors({});
        setTouched({});
        
        // Atualiza os dados locais
        if (response?.user) {
          setUserData(response.user);
          setName(response.user.name || '');
          setEmail(response.user.email || '');
          setRole(response.user.role || 'employee');
        }
      }
    } catch (err) {
      const msg = err?.body?.message || err?.message || 'Erro ao atualizar usuÃ¡rio';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  // Mudar role
  const handleChangeRole = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validar permissÃµes
    if (!isOwner) {
      setError('Apenas OWNER pode mudar a role de usuÃ¡rios');
      return;
    }

    if (userData?.role === 'owner' && !isSelf) {
      setError('VocÃª nÃ£o pode mudar a role de outro OWNER');
      return;
    }

    setSaving(true);
    try {
      const response = await apiRequest(`/users/${userId}/role`, {
        method: 'PATCH',
        body: { role },
      });
      
      if (response?.user || response?.message) {
        setSuccess('Role atualizada com sucesso!');
        
        // Atualiza os dados locais
        if (response?.user) {
          setUserData(response.user);
          setRole(response.user.role || 'employee');
        }
      }
    } catch (err) {
      const msg = err?.body?.message || err?.message || 'Erro ao atualizar role';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  // Atualizar permissÃµes do usuÃ¡rio
  const handleUpdatePermissions = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validar permissÃµes
    if (!isOwner && !isAdmin) {
      setError('Apenas OWNER e ADMIN podem alterar permissÃµes');
      return;
    }

    // NÃ£o pode alterar permissÃµes de OWNER ou ADMIN
    if (userData?.role === 'owner' || userData?.role === 'admin') {
      setError('OWNER e PolÃ­ticos (ADMIN) sempre tÃªm permissÃ£o total');
      return;
    }

    setSaving(true);
    try {
      const response = await apiRequest(`/users/${userId}/permissions`, {
        method: 'PUT',
        body: permissions,
      });
      
      if (response?.success) {
        setSuccess('PermissÃµes atualizadas com sucesso!');
        
        // Atualizar permissÃµes locais
        if (response?.data?.permissions) {
          setPermissions(response.data.permissions);
        }
      }
    } catch (err) {
      const msg = err?.body?.message || err?.message || 'Erro ao atualizar permissÃµes';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  // Atualizar permissÃ£o de um mÃ³dulo
  const handlePermissionChange = (module, permission, value) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [permission]: value,
      },
    }));
    
    // Limpar mensagens de erro/sucesso
    if (error || success) {
      setError('');
      setSuccess('');
    }
  };

  // Deletar usuÃ¡rio
  const handleDeleteAccount = async () => {
    const targetName = userData?.name || `ID ${userId}`;
    const confirmation = await showCustomAlert({
      variant: 'warning',
      title: 'Confirmar exclusÃ£o',
      text: `Tem certeza que quer excluir o usuÃ¡rio "${targetName}"?\n\nEsta aÃ§Ã£o nÃ£o pode ser desfeita.`,
      confirmButtonText: 'Excluir',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    });
    if (!confirmation.isConfirmed) {
      return;
    }

    // Validar permissÃµes
    if (!isOwner && !isAdmin) {
      setError('VocÃª nÃ£o tem permissÃ£o para deletar este usuÃ¡rio');
      return;
    }

    if (isAdmin && !['employee', 'external'].includes(userData?.role)) {
      setError('ADMIN sÃ³ pode deletar usuÃ¡rios com role EMPLOYEE ou EXTERNAL');
      return;
    }

    if (isSelf) {
      setError('VocÃª nÃ£o pode deletar sua prÃ³pria conta');
      return;
    }

    setSaving(true);
    try {
      await apiRequest(`/users/${userId}`, {
        method: 'DELETE',
      });
      
      // Redirecionar para lista de usuÃ¡rios
      router.push('/apps/users/list');
    } catch (err) {
      const msg = err?.body?.message || err?.message || 'Erro ao deletar usuÃ¡rio';
      setError(msg);
      setSaving(false);
    }
  };

  if (loading || isRedirecting) {
    return (
      <Container>
        <div className="hk-pg-body py-0">
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">
              {isRedirecting ? 'Redirecionando para edi\u00E7\u00E3o de pol\u00EDtico...' : 'Carregando dados do usu\u00E1rio...'}
            </p>
          </div>
        </div>
      </Container>
    );
  }

  if (!userData) {
    return (
      <Container>
        <div className="hk-pg-body py-0">
          <div className="text-center py-5">
            <h5 className="mb-2">UsuÃ¡rio nÃ£o encontrado</h5>
            <p className="text-muted mb-4">NÃ£o foi possÃ­vel carregar os dados deste usuÃ¡rio.</p>
            <Button variant="outline-secondary" onClick={() => router.push('/apps/users/list')}>
              Voltar para Lista
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="hk-pg-header pt-7 pb-4">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h1 className="pg-title">Editar UsuÃ¡rio</h1>
            <p>Gerencie as informaÃ§Ãµes e permissÃµes do usuÃ¡rio.</p>
          </div>
          <Button variant="outline-secondary" onClick={() => router.push('/apps/users/list')}>
            Voltar
          </Button>
        </div>
      </div>

      {/* Page Body */}
      <div className="hk-pg-body">
        <Tab.Container defaultActiveKey="tabBlock1">
          <Row className="edit-profile-wrap">
            <Col xs={4} sm={3} lg={2}>
              <div className="nav-profile mt-4">
                <div className="nav-header">
                  <span>ConfiguraÃ§Ãµes</span>
                </div>
                <Nav as="ul" variant="tabs" className="nav-light nav-vertical">
                  <Nav.Item as="li">
                    <Nav.Link eventKey="tabBlock1">
                      <span className="nav-link-text">InformaÃ§Ãµes Pessoais</span>
                    </Nav.Link>
                  </Nav.Item>
                  {isOwner && (
                    <Nav.Item as="li">
                      <Nav.Link eventKey="tabBlock2">
                        <span className="nav-link-text">Role & PermissÃµes</span>
                      </Nav.Link>
                    </Nav.Item>
                  )}
                  {(isOwner || isAdmin) && userData?.role !== 'owner' && userData?.role !== 'admin' && (
                    <Nav.Item as="li">
                      <Nav.Link eventKey="tabBlock2b">
                        <span className="nav-link-text">PermissÃµes Detalhadas</span>
                      </Nav.Link>
                    </Nav.Item>
                  )}
                  {(isOwner || isAdmin) && !isSelf && (
                    <Nav.Item as="li">
                      <Nav.Link eventKey="tabBlock3">
                        <span className="nav-link-text">ConfiguraÃ§Ãµes da Conta</span>
                      </Nav.Link>
                    </Nav.Item>
                  )}
                </Nav>
              </div>
            </Col>
            <Col lg={10} sm={9} xs={8}>
              <Tab.Content>
                {/* Tab 1: InformaÃ§Ãµes Pessoais */}
                <Tab.Pane eventKey="tabBlock1">
                  <Form onSubmit={handleSavePersonalInfo}>
                    <div className="title title-xs title-wth-divider text-primary text-uppercase my-4">
                      <span>InformaÃ§Ãµes Pessoais</span>
                    </div>
                    <Row className="gx-3">
                      <Col sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>Nome Completo <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Digite o nome completo"
                            value={name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            onBlur={() => handleBlur('name')}
                            required
                            isInvalid={touched.name && !!fieldErrors.name}
                          />
                          {touched.name && fieldErrors.name && (
                            <Form.Control.Feedback type="invalid" className="d-block">
                              {fieldErrors.name}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="gx-3">
                      <Col sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>E-mail <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            type="email"
                            placeholder="Digite o e-mail"
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
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="title title-xs title-wth-divider text-primary text-uppercase my-4">
                      <span>Alterar Senha</span>
                    </div>
                    <Row className="gx-3">
                      <Col sm={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Nova Senha</Form.Label>
                          <Form.Control
                            type="password"
                            placeholder="Deixe em branco para nÃ£o alterar"
                            value={password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            onBlur={() => handleBlur('password')}
                            isInvalid={touched.password && !!fieldErrors.password}
                          />
                          {touched.password && fieldErrors.password && (
                            <Form.Control.Feedback type="invalid" className="d-block">
                              {fieldErrors.password}
                            </Form.Control.Feedback>
                          )}
                          <Form.Text muted>
                            MÃ­nimo 6 caracteres
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col sm={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Confirmar Nova Senha</Form.Label>
                          <Form.Control
                            type="password"
                            placeholder="Confirme a nova senha"
                            value={confirmPassword}
                            onChange={(e) => handleChange('confirmPassword', e.target.value)}
                            onBlur={() => handleBlur('confirmPassword')}
                            isInvalid={touched.confirmPassword && !!fieldErrors.confirmPassword}
                          />
                          {touched.confirmPassword && fieldErrors.confirmPassword && (
                            <Form.Control.Feedback type="invalid" className="d-block">
                              {fieldErrors.confirmPassword}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>

                    <Button variant="primary" type="submit" className="mt-5" disabled={saving}>
                      {saving ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Salvando...
                        </>
                      ) : (
                        'Salvar AlteraÃ§Ãµes'
                      )}
                    </Button>
                  </Form>
                </Tab.Pane>

                {/* Tab 2: Role & PermissÃµes (Apenas OWNER) */}
                {isOwner && (
                  <Tab.Pane eventKey="tabBlock2">
                    <div className="title-lg fs-4"><span>Role & PermissÃµes</span></div>
                    <p className="mb-4">Gerencie a role e permissÃµes deste usuÃ¡rio no sistema.</p>
                    <Form onSubmit={handleChangeRole}>
                      <div className="title title-xs title-wth-divider text-primary text-uppercase my-4">
                        <span>Role do UsuÃ¡rio</span>
                      </div>
                      <Row className="gx-3">
                        <Col sm={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Role Atual</Form.Label>
                            <div className="mb-2">
                              {role === 'owner' && (
                                <span className="badge bg-danger">OWNER</span>
                              )}
                              {role === 'admin' && (
                                <span className="badge bg-warning">ADMIN</span>
                              )}
                              {role === 'employee' && (
                                <span className="badge bg-info">EMPLOYEE</span>
                              )}
                              {role === 'external' && (
                                <span className="badge bg-secondary">EXTERNAL</span>
                              )}
                            </div>
                          </Form.Group>
                        </Col>
                        <Col sm={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Mudar Role Para</Form.Label>
                            <Form.Control
                              as="select"
                              value={role}
                              onChange={(e) => handleChange('role', e.target.value)}
                              disabled={userData?.role === 'owner' && !isSelf}
                            >
                              <option value="employee">Employee</option>
                              <option value="admin">Admin</option>
                              <option value="owner">Owner</option>
                              <option value="external">External</option>
                            </Form.Control>
                            {userData?.role === 'owner' && !isSelf && (
                              <Form.Text muted className="d-block">
                                VocÃª nÃ£o pode mudar a role de outro OWNER
                              </Form.Text>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>

                      <div className="title title-xs title-wth-divider text-primary text-uppercase my-4">
                        <span>Hierarquia de PermissÃµes</span>
                      </div>
                      <Row className="gx-3">
                        <Col sm={12}>
                          <ul className="list-unstyled">
                            <li className="mb-2">
                              <strong className="text-danger">OWNER:</strong> Acesso total ao sistema, pode criar/editar/deletar tudo
                            </li>
                            <li className="mb-2">
                              <strong className="text-warning">ADMIN:</strong> Pode criar e gerenciar EMPLOYEES e EXTERNALS, mas nÃ£o pode criar outros ADMINS ou OWNERS
                            </li>
                            <li className="mb-2">
                              <strong className="text-info">EMPLOYEE:</strong> Acesso bÃ¡sico, nÃ£o pode gerenciar usuÃ¡rios
                            </li>
                            <li className="mb-2">
                              <strong className="text-secondary">EXTERNAL:</strong> UsuÃ¡rio temporÃ¡rio com permissÃµes limitadas
                            </li>
                          </ul>
                        </Col>
                      </Row>

                      <Button 
                        variant="primary" 
                        type="submit" 
                        className="mt-5" 
                        disabled={saving || (userData?.role === 'owner' && !isSelf)}
                      >
                        {saving ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Salvando...
                          </>
                        ) : (
                          'Atualizar Role'
                        )}
                      </Button>
                    </Form>
                  </Tab.Pane>
                )}

                {/* Tab 2b: PermissÃµes Detalhadas (Employee e External) */}
                {(isOwner || isAdmin) && userData?.role !== 'owner' && userData?.role !== 'admin' && (
                  <Tab.Pane eventKey="tabBlock2b">
                    <div className="title-lg fs-4"><span>PermissÃµes Detalhadas por MÃ³dulo</span></div>
                    <p className="mb-4">Configure permissÃµes especÃ­ficas para cada mÃ³dulo do sistema.</p>
                    
                    {(userData?.role === 'owner' || userData?.role === 'admin') && (
                      <Alert variant="info" className="mb-4">
                        <strong>â„¹ï¸ InformaÃ§Ã£o:</strong> {userData?.role === 'owner' ? 'OWNER' : 'PolÃ­ticos (ADMIN)'} sempre tÃªm permissÃ£o total e nÃ£o podem ter permissÃµes alteradas.
                      </Alert>
                    )}
                    
                    <Form onSubmit={handleUpdatePermissions}>
                      {/* MÃ³dulo: Admin */}
                      <div className="title title-xs title-wth-divider text-primary text-uppercase my-4">
                        <span>ðŸ›ï¸ AdministraÃ§Ã£o</span>
                      </div>
                      <Row className="gx-3 mb-3">
                        <Col sm={4}>
                          <Form.Check
                            type="switch"
                            id="admin-read"
                            label="Visualizar"
                            checked={permissions.admin.read}
                            onChange={(e) => handlePermissionChange('admin', 'read', e.target.checked)}
                            disabled={userData?.role === 'owner' || userData?.role === 'admin'}
                          />
                        </Col>
                        <Col sm={4}>
                          <Form.Check
                            type="switch"
                            id="admin-write"
                            label="Editar"
                            checked={permissions.admin.write}
                            onChange={(e) => handlePermissionChange('admin', 'write', e.target.checked)}
                            disabled={userData?.role === 'owner' || userData?.role === 'admin'}
                          />
                        </Col>
                        <Col sm={4}>
                          <Form.Check
                            type="switch"
                            id="admin-delete"
                            label="Deletar"
                            checked={permissions.admin.delete}
                            onChange={(e) => handlePermissionChange('admin', 'delete', e.target.checked)}
                            disabled={userData?.role === 'owner' || userData?.role === 'admin'}
                          />
                        </Col>
                      </Row>

                      {/* MÃ³dulo: Financeiro */}
                      <div className="title title-xs title-wth-divider text-primary text-uppercase my-4">
                        <span>ðŸ’° Financeiro</span>
                      </div>
                      <Row className="gx-3 mb-3">
                        <Col sm={4}>
                          <Form.Check
                            type="switch"
                            id="financial-read"
                            label="Visualizar"
                            checked={permissions.financial.read}
                            onChange={(e) => handlePermissionChange('financial', 'read', e.target.checked)}
                            disabled={userData?.role === 'owner' || userData?.role === 'admin'}
                          />
                        </Col>
                        <Col sm={4}>
                          <Form.Check
                            type="switch"
                            id="financial-write"
                            label="Editar"
                            checked={permissions.financial.write}
                            onChange={(e) => handlePermissionChange('financial', 'write', e.target.checked)}
                            disabled={userData?.role === 'owner' || userData?.role === 'admin'}
                          />
                        </Col>
                        <Col sm={4}>
                          <Form.Check
                            type="switch"
                            id="financial-delete"
                            label="Deletar"
                            checked={permissions.financial.delete}
                            onChange={(e) => handlePermissionChange('financial', 'delete', e.target.checked)}
                            disabled={userData?.role === 'owner' || userData?.role === 'admin'}
                          />
                        </Col>
                      </Row>

                      {/* MÃ³dulo: Marketing */}
                      <div className="title title-xs title-wth-divider text-primary text-uppercase my-4">
                        <span>ðŸ“¢ Marketing</span>
                      </div>
                      <Row className="gx-3 mb-3">
                        <Col sm={4}>
                          <Form.Check
                            type="switch"
                            id="marketing-read"
                            label="Visualizar"
                            checked={permissions.marketing.read}
                            onChange={(e) => handlePermissionChange('marketing', 'read', e.target.checked)}
                            disabled={userData?.role === 'owner' || userData?.role === 'admin'}
                          />
                        </Col>
                        <Col sm={4}>
                          <Form.Check
                            type="switch"
                            id="marketing-write"
                            label="Editar"
                            checked={permissions.marketing.write}
                            onChange={(e) => handlePermissionChange('marketing', 'write', e.target.checked)}
                            disabled={userData?.role === 'owner' || userData?.role === 'admin'}
                          />
                        </Col>
                        <Col sm={4}>
                          <Form.Check
                            type="switch"
                            id="marketing-delete"
                            label="Deletar"
                            checked={permissions.marketing.delete}
                            onChange={(e) => handlePermissionChange('marketing', 'delete', e.target.checked)}
                            disabled={userData?.role === 'owner' || userData?.role === 'admin'}
                          />
                        </Col>
                      </Row>

                      {/* MÃ³dulo: CidadÃ£o */}
                      <div className="title title-xs title-wth-divider text-primary text-uppercase my-4">
                        <span>ðŸ‘¥ CidadÃ£os</span>
                      </div>
                      <Row className="gx-3 mb-3">
                        <Col sm={4}>
                          <Form.Check
                            type="switch"
                            id="citizen-read"
                            label="Visualizar"
                            checked={permissions.citizen.read}
                            onChange={(e) => handlePermissionChange('citizen', 'read', e.target.checked)}
                            disabled={userData?.role === 'owner' || userData?.role === 'admin'}
                          />
                        </Col>
                        <Col sm={4}>
                          <Form.Check
                            type="switch"
                            id="citizen-write"
                            label="Editar"
                            checked={permissions.citizen.write}
                            onChange={(e) => handlePermissionChange('citizen', 'write', e.target.checked)}
                            disabled={userData?.role === 'owner' || userData?.role === 'admin'}
                          />
                        </Col>
                        <Col sm={4}>
                          <Form.Check
                            type="switch"
                            id="citizen-delete"
                            label="Deletar"
                            checked={permissions.citizen.delete}
                            onChange={(e) => handlePermissionChange('citizen', 'delete', e.target.checked)}
                            disabled={userData?.role === 'owner' || userData?.role === 'admin'}
                          />
                        </Col>
                      </Row>

                      {/* MÃ³dulo: EstÃºdio */}
                      <div className="title title-xs title-wth-divider text-primary text-uppercase my-4">
                        <span>ðŸŽ¬ EstÃºdio de ConteÃºdo</span>
                      </div>
                      <Row className="gx-3 mb-3">
                        <Col sm={4}>
                          <Form.Check
                            type="switch"
                            id="studio-read"
                            label="Visualizar"
                            checked={permissions.studio.read}
                            onChange={(e) => handlePermissionChange('studio', 'read', e.target.checked)}
                            disabled={userData?.role === 'owner' || userData?.role === 'admin'}
                          />
                        </Col>
                        <Col sm={4}>
                          <Form.Check
                            type="switch"
                            id="studio-write"
                            label="Editar"
                            checked={permissions.studio.write}
                            onChange={(e) => handlePermissionChange('studio', 'write', e.target.checked)}
                            disabled={userData?.role === 'owner' || userData?.role === 'admin'}
                          />
                        </Col>
                        <Col sm={4}>
                          <Form.Check
                            type="switch"
                            id="studio-delete"
                            label="Deletar"
                            checked={permissions.studio.delete}
                            onChange={(e) => handlePermissionChange('studio', 'delete', e.target.checked)}
                            disabled={userData?.role === 'owner' || userData?.role === 'admin'}
                          />
                        </Col>
                      </Row>

                      <div className="title title-xs title-wth-divider text-muted text-uppercase my-4">
                        <span>Legenda</span>
                      </div>
                      <Row className="gx-3">
                        <Col sm={12}>
                          <ul className="list-unstyled small text-muted">
                            <li className="mb-1"><strong>Visualizar:</strong> Permite ver informaÃ§Ãµes do mÃ³dulo</li>
                            <li className="mb-1"><strong>Editar:</strong> Permite criar e modificar dados</li>
                            <li className="mb-1"><strong>Deletar:</strong> Permite excluir dados permanentemente</li>
                          </ul>
                        </Col>
                      </Row>

                      <Button 
                        variant="primary" 
                        type="submit" 
                        className="mt-5" 
                        disabled={saving || userData?.role === 'owner' || userData?.role === 'admin'}
                      >
                        {saving ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Salvando...
                          </>
                        ) : (
                          'Salvar PermissÃµes'
                        )}
                      </Button>
                    </Form>
                  </Tab.Pane>
                )}

                {/* Tab 3: ConfiguraÃ§Ãµes da Conta */}
                {(isOwner || isAdmin) && !isSelf && (
                  <Tab.Pane eventKey="tabBlock3">
                    <div className="title-lg fs-4"><span>ConfiguraÃ§Ãµes da Conta</span></div>
                    <p className="mb-4">AÃ§Ãµes sensÃ­veis relacionadas Ã  conta do usuÃ¡rio.</p>
                    <Form>
                      <div className="title title-xs title-wth-divider text-danger text-uppercase my-4">
                        <span>Zona de Perigo</span>
                      </div>
                      <Row className="gx-3">
                        <Col sm={6}>
                          <Form.Group className="mb-3">
                            <div className="h5 d-block mb-2">Deletar Conta</div>
                            <Form.Text muted className="d-block mb-3">
                              Deletar permanentemente esta conta e todos os dados relacionados. Esta aÃ§Ã£o nÃ£o pode ser desfeita.
                            </Form.Text>
                          </Form.Group>
                        </Col>
                        <Col sm={6} className="text-end">
                          <Form.Group className="mb-3">
                            <Button 
                              variant="danger" 
                              onClick={handleDeleteAccount} 
                              disabled={saving}
                            >
                              {saving ? (
                                <>
                                  <Spinner animation="border" size="sm" className="me-2" />
                                  Deletando...
                                </>
                              ) : (
                                'Deletar Conta'
                              )}
                            </Button>
                          </Form.Group>
                        </Col>
                      </Row>
                    </Form>
                  </Tab.Pane>
                )}
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </div>
      {/* /Page Body */}
    </Container>
  );
};

export default EditUserBody;

