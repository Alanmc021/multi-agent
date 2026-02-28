'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SimpleBar from 'simplebar-react';
import { Button, Col, Dropdown, Form, Row, Badge } from 'react-bootstrap';
import { Edit, MoreVertical, Trash, Trash2, UserPlus, Star, Download, Shield } from 'react-feather';
import HkDataTable from '@/components/@hk-data-table';
import HkBadge from '@/components/@hk-badge/@hk-badge';
import { listUsers, deleteUser, getUsersStats, listAdmins, deleteAdmin } from '@/lib/api/services/users';
import { useAuth } from '@/lib/auth/AuthProvider';
import classNames from 'classnames';
import { showCustomAlert } from '@/components/CustomAlert';

const UsersAppBody = ({ triggerExportCSV }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ totalUsers: 0, owners: 0, admins: 0, campaignManagers: 0, employees: 0, externals: 0 });
  const { user: currentUser } = useAuth();

  const isOwner = currentUser?.role === 'owner';
  const isAdmin = currentUser?.role === 'admin';
  const roleDisplayMap = {
    owner: 'PROPRIETÁRIO',
    admin: 'POLÍTICO',
    campaign_manager: 'GERENTE DE CAMPANHA',
    employee: 'FUNCIONÁRIO',
    external: 'EXTERNO',
  };

  const getRoleDisplayName = (role) => {
    if (!role) return 'N/A';
    return roleDisplayMap[role.toLowerCase()] || role.toUpperCase();
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      // Buscar usuários normais (employees, externals)
      const usersData = await listUsers();
      const normalUsers = usersData?.users || usersData || [];
      
      // Buscar admins/políticos (com profile)
      const adminsData = await listAdmins();
      const adminUsers = adminsData?.data || adminsData || [];
      
      // Extrair IDs dos usuários que são políticos
      // A API retorna: { _id: userId, email, name, role, profile: {...} }
      const adminUserIds = adminUsers.map(admin => admin._id).filter(Boolean);
      
      // Filtrar usuários normais para remover os que já são políticos
      const filteredNormalUsers = normalUsers.filter(user => 
        !adminUserIds.includes(user._id || user.id)
      );
      
      // Combinar e transformar admins para o formato de usuário
      // A API retorna: { _id: userId, email, name, role, profile: {...} }
      const adminsAsUsers = adminUsers.map(admin => ({
        _id: admin._id, // Já é o userId
        name: admin.profile?.nomePolitico || admin.name || 'Sem nome',
        email: admin.email,
        role: admin.role || 'admin',
        emailVerified: admin.emailVerified || false,
        createdAt: admin.createdAt || admin.profile?.createdAt,
        isAdmin: true, // Flag para identificar que é político
        cargo: admin.profile?.cargo || '',
        territorio: admin.profile?.territorio || '',
        status: admin.profile?.status || '',
      }));
      
      // Combinar todos os usuários (agora sem duplicatas)
      const allUsers = [...filteredNormalUsers, ...adminsAsUsers];
      setUsers(allUsers);
      
    } catch (err) {
      setError(err?.body?.message || err?.message || 'Erro ao carregar usuários');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getUsersStats();
      if (data) {
        // Backend retorna: { total: N, byRole: { owners, admins, employees, externals } }
        setStats({
          totalUsers: data.total || 0,
          owners: data.byRole?.owners || 0,
          admins: data.byRole?.admins || 0,
          campaignManagers: data.byRole?.campaignManagers || 0,
          employees: data.byRole?.employees || 0,
          externals: data.byRole?.externals || 0,
        });
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  useEffect(() => {
    if (!error) return;
    showCustomAlert({
      variant: 'danger',
      title: 'Erro',
      text: error,
    }).finally(() => setError(''));
  }, [error]);

  // Responder ao trigger de exportar CSV do header
  useEffect(() => {
    if (triggerExportCSV > 0) {
      handleExportCSV();
    }
  }, [triggerExportCSV]);

  const handleDelete = async (userId, isAdmin, userName = '') => {
    const name = String(userName || '').trim() || `ID ${userId}`;
    const confirmation = await showCustomAlert({
      variant: 'warning',
      title: 'Confirmar exclusão',
      text: `Tem certeza que quer excluir o usuário "${name}"?\n\nEsta ação não pode ser desfeita.`,
      confirmButtonText: 'Excluir',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    });
    if (!confirmation.isConfirmed) return;

    try {
      if (isAdmin) {
        await deleteAdmin(userId);
      } else {
        await deleteUser(userId);
      }
      fetchUsers();
      fetchStats();
      await showCustomAlert({
        variant: 'success',
        title: 'Sucesso',
        text: 'Usuário deletado com sucesso!',
      });
    } catch (err) {
      await showCustomAlert({
        variant: 'danger',
        title: 'Erro',
        text: err?.body?.message || err?.message || 'Erro ao deletar usuário',
      });
    }
  };

  // Função para exportar usuários para CSV
  const handleExportCSV = () => {
    if (users.length === 0) {
      showCustomAlert({
        variant: 'warning',
        title: 'Exportar usuários',
        text: 'Nenhum usuário para exportar',
      });
      return;
    }

    // Headers do CSV
    const headers = ['ID', 'Nome', 'E-mail', 'Role', 'E-mail Verificado', 'Data de Criação'];
    
    // Converter dados para CSV
    const csvData = users.map(user => [
      user._id || user.id,
      user.name || 'Sem nome',
      user.email,
      getRoleDisplayName(user.role),
      user.emailVerified ? 'Sim' : 'Não',
      user.createdAt ? new Date(user.createdAt).toLocaleString('pt-BR') : 'N/A',
    ]);

    // Adicionar headers
    const csv = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Criar blob e fazer download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Custom Star Formatter (não usado, mas mantido para consistência)
  const starFormatter = (cell) => (
    <div className="d-flex align-items-center">
      <span className={classNames('contact-star', { marked: cell })}>
        <span className="feather-icon">
          <Star />
        </span>
      </span>
    </div>
  );

  // Custom Name Formatter com Avatar
  const nameFormatter = (cell, row) => {
    if (!cell) return null;
    const userName = cell;
    const email = row?.email || '';
    const isAdmin = row?.isAdmin;
    const cargo = row?.cargo;
    const territorio = row?.territorio;
    const status = row?.status;
    
    // Pegar iniciais do nome
    const initials = userName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    // Cor do avatar baseado no role
    const avatarColor = row?.role === 'owner' ? 'danger' : row?.role === 'admin' ? 'warning' : row?.role === 'campaign_manager' ? 'success' : row?.role === 'external' ? 'secondary' : 'info';

    return (
      <div className="media align-items-center">
        <div className="media-head me-2">
          <div className={`avatar avatar-xs avatar-rounded avatar-soft-${avatarColor}`}>
            <span className="initial-wrap">{initials}</span>
          </div>
        </div>
        <div className="media-body">
          <div className="d-flex align-items-center gap-2">
            <div className="text-high-em">{userName}</div>
            {isAdmin && (
              <Badge bg="warning" className="badge-sm">
                🏛️ Político
              </Badge>
            )}
          </div>
          <div className="text-muted fs-7">
            {email}
            {isAdmin && cargo && (
              <span className="ms-2">
                • {cargo.replace(/_/g, ' ')}
                {territorio && ` • ${territorio}`}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Custom Role Formatter
  const roleFormatter = (cell) => {
    const roleBadges = {
      owner: { bg: 'danger', text: 'PROPRIETÁRIO' },
      admin: { bg: 'warning', text: 'POLÍTICO' },
      campaign_manager: { bg: 'success', text: 'GERENTE DE CAMPANHA' },
      employee: { bg: 'info', text: 'FUNCIONÁRIO' },
      external: { bg: 'secondary', text: 'EXTERNO' },
    };
    const badge = roleBadges[cell?.toLowerCase()] || { bg: 'secondary', text: getRoleDisplayName(cell) };
    return <HkBadge bg={badge.bg} soft className="my-1">{badge.text}</HkBadge>;
  };

  // Custom Email Verified Formatter
  const emailVerifiedFormatter = (cell) => {
    return cell ? (
      <HkBadge bg="success" soft className="my-1">Verificado</HkBadge>
    ) : (
      <HkBadge bg="secondary" soft className="my-1">Não Verificado</HkBadge>
    );
  };

  // Custom Date Formatter
  const dateFormatter = (cell) => {
    if (!cell) return '-';
    const date = new Date(cell);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Custom Action Formatter
  const actionFormatter = (cell, row) => {
    const userId = row?._id || row?.id;
    const userRole = row?.role;
    const isSelf = userId === currentUser?.id || userId === currentUser?._id;
    
    // Qualquer um pode editar qualquer um, exceto owner (só owner pode editar owner)
    const canEdit = userRole !== 'owner' || isOwner;
    // Ninguém pode deletar owner ou a si próprio
    const canDelete = !isSelf && userRole !== 'owner';

    return (
      <div className="d-flex align-items-center">
        <div className="d-flex">
          {canEdit && (
            <Button
              variant="flush-dark"
              className="btn-icon btn-rounded flush-soft-hover"
              data-bs-toggle="tooltip"
              data-placement="top"
              data-bs-original-title="Editar"
              onClick={() => router.push(`/apps/users/edit/${userId}`)}
            >
              <span className="icon">
                <span className="feather-icon">
                  <Edit />
                </span>
              </span>
            </Button>
          )}
          {canDelete && (
            <Button
              variant="flush-dark"
              className="btn-icon btn-rounded flush-soft-hover del-button"
              data-bs-toggle="tooltip"
              data-placement="top"
              data-bs-original-title="Deletar"
              onClick={() => handleDelete(userId, isAdmin, row?.name)}
            >
              <span className="icon">
                <span className="feather-icon">
                  <Trash />
                </span>
              </span>
            </Button>
          )}
        </div>
        {(canEdit || canDelete) && (
          <Dropdown>
            <Dropdown.Toggle
              variant="flush-dark"
              className="btn-icon btn-rounded flush-soft-hover no-caret"
              aria-expanded="false"
              data-bs-toggle="dropdown"
            >
              <span className="icon">
                <span className="feather-icon">
                  <MoreVertical />
                </span>
              </span>
            </Dropdown.Toggle>
            <Dropdown.Menu align="end">
              {canEdit && (
                <Dropdown.Item onClick={() => router.push(`/apps/users/edit/${userId}`)}>
                  <span className="feather-icon dropdown-icon">
                    <Edit />
                  </span>
                  <span>Editar Usuário</span>
                </Dropdown.Item>
              )}
              {canDelete && (
                <>
                  <Dropdown.Divider as="div" />
                  <Dropdown.Item onClick={() => handleDelete(userId, isAdmin, row?.name)}>
                    <span className="feather-icon dropdown-icon">
                      <Trash2 />
                    </span>
                    <span>Deletar</span>
                  </Dropdown.Item>
                </>
              )}
            </Dropdown.Menu>
          </Dropdown>
        )}
      </div>
    );
  };

  // Colunas da tabela
  const columns = [
    {
      accessor: 'id',
      title: 'User ID',
      hidden: true,
    },
    {
      accessor: 'name',
      title: 'Nome',
      sort: true,
      cellFormatter: nameFormatter,
    },
    {
      accessor: 'role',
      title: 'Role',
      sort: true,
      cellFormatter: roleFormatter,
    },
    {
      accessor: 'emailVerified',
      title: 'E-mail Verificado',
      sort: true,
      cellFormatter: emailVerifiedFormatter,
    },
    {
      accessor: 'createdAt',
      title: 'Criado Em',
      sort: true,
      cellFormatter: dateFormatter,
    },
    {
      accessor: 'actions',
      title: 'Ações',
      sort: false,
      cellFormatter: actionFormatter,
    },
  ];

  // Transformar dados para o formato esperado pelo HkDataTable
  const tableData = users.map((user) => ({
    id: user._id,
    _id: user._id,
    name: user.name || 'Sem nome',
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    isAdmin: user.isAdmin || false,
    cargo: user.cargo || '',
    territorio: user.territorio || '',
    status: user.status || '',
  }));

  return (
    <div className="fm-body">
      <SimpleBar className="nicescroll-bar">
        <div className="container-fluid px-4 py-4">
          {/* Stats Minimalista */}
          <div className="d-flex flex-wrap align-items-center gap-2 mb-3 py-2 px-3 bg-light rounded">
            <span className="text-muted small fw-medium">Estatísticas:</span>
            <Badge bg="primary" className="d-flex align-items-center gap-1 py-2 px-3">
              <span className="fw-normal">Total:</span>
              <span className="fw-bold">{stats.totalUsers}</span>
            </Badge>
            <Badge bg="danger" className="d-flex align-items-center gap-1 py-2 px-3">
              <span className="fw-normal">🏛️ Partido:</span>
              <span className="fw-bold">{stats.owners}</span>
            </Badge>
            <Badge bg="warning" className="d-flex align-items-center gap-1 py-2 px-3 text-dark">
              <span className="fw-normal">👔 Políticos:</span>
              <span className="fw-bold">{stats.admins}</span>
            </Badge>
            <Badge bg="success" className="d-flex align-items-center gap-1 py-2 px-3">
              <span className="fw-normal">🗂️ Gerentes:</span>
              <span className="fw-bold">{stats.campaignManagers}</span>
            </Badge>
            <Badge bg="info" className="d-flex align-items-center gap-1 py-2 px-3">
              <span className="fw-normal">👥 Funcionários:</span>
              <span className="fw-bold">{stats.employees}</span>
            </Badge>
            <Badge bg="secondary" className="d-flex align-items-center gap-1 py-2 px-3">
              <span className="fw-normal">🔗 Externos:</span>
              <span className="fw-bold">{stats.externals}</span>
            </Badge>
          </div>

          {/* Toolbar */}
          <Row className="mb-3">
            <Col xs={12} className="mb-3">
              <div className="contact-toolbar-right">
                <div className="dataTables_filter">
                  <Form.Label>
                    <Form.Control
                      size="sm"
                      type="search"
                      placeholder="Buscar usuário..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Form.Label>
                </div>
              </div>
            </Col>
          </Row>

          {/* Data Table */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
            </div>
          ) : tableData.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">Nenhum usuário encontrado</p>
            </div>
          ) : (
            <HkDataTable
              column={columns}
              rowData={tableData}
              rowsPerPage={10}
              rowSelection={false}
              searchQuery={searchTerm}
              classes="nowrap w-100 mb-5"
              responsive
            />
          )}
        </div>
      </SimpleBar>

    </div>
  );
};

export default UsersAppBody;

