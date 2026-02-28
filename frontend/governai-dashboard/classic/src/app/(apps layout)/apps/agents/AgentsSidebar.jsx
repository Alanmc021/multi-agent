'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button, Form, Nav } from 'react-bootstrap';
import { Cpu, Plus, List, Settings } from 'react-feather';
import SimpleBar from 'simplebar-react';
import HkTooltip from '@/components/@hk-tooltip/HkTooltip';

/**
 * Sidebar de navegação do gerenciamento de agentes
 */
const AgentsSidebar = () => {
  const pathName = usePathname();
  const isList = pathName === '/apps/agents' || pathName === '/apps/agents/';
  const isNew = pathName === '/apps/agents/new';

  return (
    <nav className="integrationsapp-sidebar">
      <SimpleBar className="nicescroll-bar">
        <div className="menu-content-wrap">
          <Form className="mb-4" role="search">
            <Form.Control type="text" placeholder="Buscar agente..." />
          </Form>

          <div className="menu-group">
            <Nav as="ul" className="nav-light navbar-nav flex-column">
              <Nav.Item as="li">
                <Nav.Link
                  as={Link}
                  href="/apps/agents"
                  className={isList ? 'active' : ''}
                >
                  <span className="nav-icon-wrap">
                    <span className="feather-icon">
                      <List />
                    </span>
                  </span>
                  <span className="nav-link-text">Todos os Agentes</span>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item as="li">
                <Nav.Link as={Link} href="/apps/agents/new" className={isNew ? 'active' : ''}>
                  <span className="nav-icon-wrap">
                    <span className="feather-icon">
                      <Plus />
                    </span>
                  </span>
                  <span className="nav-link-text">Novo Agente</span>
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </div>

          <div className="menu-gap" />
          <div className="nav-header">
            <span>Gerenciamento</span>
          </div>

          <div className="menu-group">
            <Nav as="ul" className="nav-light navbar-nav flex-column">
              <Nav.Item as="li">
                <Nav.Link as={Link} href="/apps/agents">
                  <span className="nav-icon-wrap">
                    <span className="feather-icon">
                      <Cpu />
                    </span>
                  </span>
                  <span className="nav-link-text">Definições</span>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item as="li">
                <Nav.Link as={Link} href="/apps/assistants">
                  <span className="nav-icon-wrap">
                    <span className="feather-icon">
                      <Settings />
                    </span>
                  </span>
                  <span className="nav-link-text">Assistentes (Chat)</span>
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </div>
        </div>
      </SimpleBar>
    </nav>
  );
};

export default AgentsSidebar;
