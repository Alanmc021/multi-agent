'use client';
import { Button, Nav } from 'react-bootstrap';
import * as Icons from 'react-feather';
import SimpleBar from 'simplebar-react';
import HkTooltip from '@/components/@hk-tooltip/HkTooltip';
import classNames from 'classnames';

const CATEGORIES = [
  { value: 'contratos',    label: 'Contratos',    icon: Icons.Shield },
  { value: 'licitacoes',   label: 'Licitações',   icon: Icons.Award },
  { value: 'decretos',     label: 'Decretos',     icon: Icons.File },
  { value: 'processos',    label: 'Processos',    icon: Icons.BookOpen },
  { value: 'pareceres',    label: 'Pareceres',    icon: Icons.CheckSquare },
  { value: 'financeiro',   label: 'Financeiro',   icon: Icons.DollarSign },
  { value: 'marketing',    label: 'Marketing',    icon: Icons.TrendingUp },
  { value: 'juridico',     label: 'Jurídico',     icon: Icons.Briefcase },
  { value: 'rh',           label: 'RH',           icon: Icons.Users },
  { value: 'audiencias',   label: 'Audiências',   icon: Icons.Mic },
  { value: 'videos',       label: 'Vídeos',       icon: Icons.Video },
  { value: 'depoimentos',  label: 'Depoimentos',  icon: Icons.MessageSquare },
  { value: 'transmissoes', label: 'Transmissões', icon: Icons.Radio },
  { value: 'leads',        label: 'Leads',        icon: Icons.Target },
  { value: 'vendas',       label: 'Vendas',       icon: Icons.ShoppingCart },
  { value: 'operacoes',    label: 'Operações',    icon: Icons.Settings },
];

const DocumentsSidebar = ({ onUploadClick, activeFilter = 'all', onFilterChange }) => {
  const handleFilter = (filter) => {
    if (onFilterChange) onFilterChange(filter);
  };

  const isActive = (filter) => activeFilter === filter;

  return (
    <nav className="fmapp-sidebar">
      <SimpleBar className="nicescroll-bar">
        <div className="menu-content-wrap">
          <Button
            className="btn-block mb-4 fw-semibold"
            style={{
              background: 'linear-gradient(135deg, #009b36 0%, #007a2b 100%)',
              border: 'none',
              color: '#fff',
              borderRadius: 10,
              padding: '10px 16px',
              fontSize: 14,
              boxShadow: '0 4px 14px rgba(0,155,54,0.35)',
              letterSpacing: '0.02em',
            }}
            onClick={onUploadClick}
          >
            <Icons.UploadCloud className="me-2" size={20} />
            Upload Documento
          </Button>

          <div className="menu-group">
            <ul className="nav nav-light navbar-nav flex-column">
              {[
                { filter: 'all',       label: 'Todos os Documentos', Icon: Icons.FileText },
                { filter: 'recent',    label: 'Recentes',            Icon: Icons.Clock },
                { filter: 'favorites', label: 'Favoritos',           Icon: Icons.Star },
                { filter: 'shared',    label: 'Compartilhados',      Icon: Icons.Users },
              ].map(({ filter, label, Icon }) => (
                <li key={filter} className={classNames('nav-item', { active: isActive(filter) })}>
                  <a
                    className={classNames('nav-link', { active: isActive(filter) })}
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleFilter(filter); }}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="nav-icon-wrap">
                      <span className="feather-icon"><Icon size={16} /></span>
                    </span>
                    <span className="nav-link-text">{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="separator separator-light" />

          <div className="menu-group">
            <p className="menu-title mb-2" style={{ color: '#009b36', fontWeight: 700, letterSpacing: '0.05em', fontSize: 11 }}>Categorias</p>
            <ul className="nav nav-light navbar-nav flex-column">
              {CATEGORIES.map(({ value, label, icon: Icon }) => (
                <li key={value} className={classNames('nav-item', { active: isActive(value) })}>
                  <a
                    className={classNames('nav-link', { active: isActive(value) })}
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleFilter(value); }}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="nav-icon-wrap">
                      <span className="feather-icon"><Icon size={16} /></span>
                    </span>
                    <span className="nav-link-text">{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SimpleBar>

      <div className="fmapp-storage" style={{ background: '#ebf7ef', borderTop: '1.5px solid #c8ecd4' }}>
        <p className="p-sm" style={{ color: '#009b36', fontWeight: 600 }}>Armazenamento utilizado</p>
        <div className="progress-lb-wrap my-2">
          <label className="progress-label text-uppercase fs-8 fw-medium" style={{ color: '#009b36' }}>Documentos ativos</label>
          <div className="progress progress-bar-rounded progress-bar-xs">
            <div className="progress-bar w-25" role="progressbar" aria-valuenow={25} aria-valuemin={0} aria-valuemax={100} style={{ background: '#009b36' }} />
          </div>
        </div>
      </div>

      <div className="fmapp-fixednav">
        <div className="hk-toolbar">
          <Nav className="nav-light">
            <Nav.Item className="nav-link">
              <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover">
                <HkTooltip id="tooltip2" placement="top" title="Configurações">
                  <span className="icon"><span className="feather-icon"><Icons.Settings /></span></span>
                </HkTooltip>
              </Button>
            </Nav.Item>
            <Nav.Item className="nav-link">
              <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover">
                <HkTooltip id="tooltip3" placement="top" title="Arquivo">
                  <span className="icon"><span className="feather-icon"><Icons.Archive /></span></span>
                </HkTooltip>
              </Button>
            </Nav.Item>
            <Nav.Item className="nav-link">
              <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover">
                <HkTooltip id="tooltip4" placement="top" title="Ajuda">
                  <span className="icon"><span className="feather-icon"><Icons.HelpCircle /></span></span>
                </HkTooltip>
              </Button>
            </Nav.Item>
          </Nav>
        </div>
      </div>
    </nav>
  );
};

export default DocumentsSidebar;
