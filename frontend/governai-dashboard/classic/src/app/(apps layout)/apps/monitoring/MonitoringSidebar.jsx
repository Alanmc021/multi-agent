'use client'
import { Nav } from 'react-bootstrap';
import * as Icons from 'react-feather';
import SimpleBar from 'simplebar-react';

const MonitoringSidebar = () => {
    return (
        <div className="fmapp-sidebar">
            <SimpleBar className="nicescroll-bar">
                <div className="menu-content-wrap">
                    <div className="fmapp-sidebar-header">
                        <div className="media">
                            <div className="media-head">
                                <div className="avatar avatar-icon avatar-purple avatar-rounded">
                                    <span className="initial-wrap">
                                        <Icons.Activity size={24} />
                                    </span>
                                </div>
                            </div>
                            <div className="media-body">
                                <div className="text-dark fw-medium">Monitoramento</div>
                                <div className="fs-7 text-muted">Logs e auditoria</div>
                            </div>
                        </div>
                    </div>

                    <Nav className="nav nav-light mt-3">
                        <Nav.Item>
                            <a className="nav-link active" href="#">
                                <span className="nav-icon">
                                    <Icons.Activity size={18} />
                                </span>
                                <span className="nav-link-text">Todos os Logs</span>
                            </a>
                        </Nav.Item>
                        <Nav.Item>
                            <a className="nav-link" href="#">
                                <span className="nav-icon">
                                    <Icons.AlertCircle size={18} />
                                </span>
                                <span className="nav-link-text">Alertas</span>
                            </a>
                        </Nav.Item>
                        <Nav.Item>
                            <a className="nav-link" href="#">
                                <span className="nav-icon">
                                    <Icons.Info size={18} />
                                </span>
                                <span className="nav-link-text">Informativos</span>
                            </a>
                        </Nav.Item>
                        <Nav.Item>
                            <a className="nav-link" href="#">
                                <span className="nav-icon">
                                    <Icons.AlertTriangle size={18} />
                                </span>
                                <span className="nav-link-text">Avisos</span>
                            </a>
                        </Nav.Item>
                        <Nav.Item>
                            <a className="nav-link" href="#">
                                <span className="nav-icon">
                                    <Icons.XCircle size={18} />
                                </span>
                                <span className="nav-link-text">Erros</span>
                            </a>
                        </Nav.Item>
                    </Nav>

                    <div className="separator separator-light mt-3 mb-3" />

                    <div className="px-3">
                        <h6 className="text-uppercase text-muted fs-7 fw-medium mb-3">
                            Contexto
                        </h6>
                        <Nav className="nav nav-sm nav-light">
                            <Nav.Item>
                                <a className="nav-link" href="#">
                                    <span className="nav-icon-wrap">🔐</span>
                                    <span className="nav-link-text">Autenticação</span>
                                </a>
                            </Nav.Item>
                            <Nav.Item>
                                <a className="nav-link" href="#">
                                    <span className="nav-icon-wrap">👥</span>
                                    <span className="nav-link-text">Usuários</span>
                                </a>
                            </Nav.Item>
                            <Nav.Item>
                                <a className="nav-link" href="#">
                                    <span className="nav-icon-wrap">💰</span>
                                    <span className="nav-link-text">Financeiro</span>
                                </a>
                            </Nav.Item>
                            <Nav.Item>
                                <a className="nav-link" href="#">
                                    <span className="nav-icon-wrap">📊</span>
                                    <span className="nav-link-text">Relatórios</span>
                                </a>
                            </Nav.Item>
                            <Nav.Item>
                                <a className="nav-link" href="#">
                                    <span className="nav-icon-wrap">⚙️</span>
                                    <span className="nav-link-text">Sistema</span>
                                </a>
                            </Nav.Item>
                        </Nav>
                    </div>

                    <div className="separator separator-light mt-3 mb-3" />

                    <div className="px-3">
                        <h6 className="text-uppercase text-muted fs-7 fw-medium mb-3">
                            Período
                        </h6>
                        <Nav className="nav nav-sm nav-light">
                            <Nav.Item>
                                <a className="nav-link" href="#">
                                    <span className="nav-icon-wrap">📅</span>
                                    <span className="nav-link-text">Hoje</span>
                                </a>
                            </Nav.Item>
                            <Nav.Item>
                                <a className="nav-link" href="#">
                                    <span className="nav-icon-wrap">📆</span>
                                    <span className="nav-link-text">Últimos 7 dias</span>
                                </a>
                            </Nav.Item>
                            <Nav.Item>
                                <a className="nav-link" href="#">
                                    <span className="nav-icon-wrap">📊</span>
                                    <span className="nav-link-text">Últimos 30 dias</span>
                                </a>
                            </Nav.Item>
                        </Nav>
                    </div>

                    <div className="separator separator-light mt-3 mb-3" />

                    <div className="px-3">
                        <h6 className="text-uppercase text-muted fs-7 fw-medium mb-3">
                            Estatísticas
                        </h6>
                        <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="fs-8">Total de Logs</span>
                                <span className="badge badge-sm badge-soft-primary">2.847</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="fs-8">Logs Hoje</span>
                                <span className="badge badge-sm badge-soft-success">156</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="fs-8">Alertas Ativos</span>
                                <span className="badge badge-sm badge-soft-warning">12</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="fs-8">Erros Críticos</span>
                                <span className="badge badge-sm badge-soft-danger">3</span>
                            </div>
                        </div>
                    </div>

                    <div className="separator separator-light mt-3 mb-3" />

                    <div className="px-3">
                        <div className="card card-border border-purple mb-3">
                            <div className="card-body py-3">
                                <div className="media">
                                    <div className="media-head me-3">
                                        <div className="avatar avatar-icon avatar-sm avatar-purple avatar-rounded">
                                            <span className="initial-wrap">
                                                <Icons.Shield size={16} />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="media-body">
                                        <div className="fs-7 fw-medium mb-1">Auditoria Completa</div>
                                        <div className="fs-8 text-muted">
                                            Registros detalhados de todas as atividades do sistema.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleBar>
        </div>
    );
};

export default MonitoringSidebar;
