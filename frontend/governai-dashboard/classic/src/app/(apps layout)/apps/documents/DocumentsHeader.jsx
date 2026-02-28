import classNames from 'classnames';
import { useState, useEffect } from 'react';
import { Button, Dropdown, Form } from 'react-bootstrap';
import { ChevronDown, ChevronUp, File, FilePlus, FolderPlus, Grid, Info, List, UploadCloud, UserPlus } from 'react-feather';
import HkTooltip from '@/components/@hk-tooltip/HkTooltip';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGlobalStateContext } from '@/context/GolobalStateProvider';

const DocumentsHeader = ({ toggleSidebar, showSidebar, showInfo, toggleInfo, onUploadClick, onSearch }) => {

    const { states, dispatch } = useGlobalStateContext();
    const pathName = usePathname()
    const listViewRoute = pathName.match("/apps/documents/list-view");

    const [searchQuery, setSearchQuery] = useState('');

    // Debounce para busca
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (onSearch) {
                onSearch(searchQuery);
            }
        }, 500); // 500ms de debounce

        return () => clearTimeout(debounceTimer);
    }, [searchQuery, onSearch]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    return (
        <header className="fm-header">
            <div className="d-flex align-items-center flex-grow-1">
                <Dropdown>
                    <Dropdown.Toggle as="a" className="fmapp-title link-dark" href="#">
                        <h1>Documentos Legais</h1>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item>
                            <span className="feather-icon dropdown-icon">
                                <File />
                            </span>
                            <span>Todos os Documentos</span>
                        </Dropdown.Item>
                        <Dropdown.Item>
                            <span className="feather-icon dropdown-icon">
                                <FilePlus />
                            </span>
                            <span>Arquivos Recentes</span>
                        </Dropdown.Item>
                        <Dropdown.Item>
                            <span className="feather-icon dropdown-icon">
                                <UploadCloud />
                            </span>
                            <span>Armazenamento</span>
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                <Form className="mx-3 flex-grow-1 mw-400p" role="search" onSubmit={(e) => e.preventDefault()}>
                    <Form.Control 
                        type="text" 
                        placeholder="Buscar documentos por nome, categoria ou palavra-chave..." 
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </Form>
            </div>
            <div className="fm-options-wrap">
                <Link href="#" className="btn btn-icon btn-flush-dark btn-rounded flush-soft-hover disabled d-xl-inline-block d-none">
                    <span className="icon">
                        <span className="feather-icon">
                            <UserPlus />
                        </span>
                    </span>
                </Link>
                <Button as="a" variant="flush-dark" className={classNames("btn-icon btn-rounded flush-soft-hover fmapp-info-toggle", { "active": showInfo })} onClick={toggleInfo} >
                    <span className="icon">
                        <span className="feather-icon">
                            <Info />
                        </span>
                    </span>
                </Button>
                <div className="v-separator d-xl-inline-block d-none" />
                <Button as="a" variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover ms-0 d-xl-inline-block d-none">
                    <HkTooltip placement={states.layoutState.topNavCollapse ? "bottom" : "top"} title="Nova Pasta">
                        <span className="icon">
                            <span className="feather-icon">
                                <FolderPlus />
                            </span>
                        </span>
                    </HkTooltip>
                </Button>
                <Button 
                    variant="flush-dark" 
                    className="btn-icon btn-rounded btn-file flush-soft-hover d-md-inline-block d-none"
                    onClick={onUploadClick}
                >
                    <HkTooltip placement={states.layoutState.topNavCollapse ? "bottom" : "top"} title="Upload">
                        <span className="icon">
                            <span className="feather-icon">
                                <UploadCloud />
                            </span>
                        </span>
                    </HkTooltip>
                </Button>
                <div className="v-separator d-lg-inline-block d-none" />
                <Dropdown className="inline-block">
                    <Dropdown.Toggle as="a" className="btn btn-icon btn-flush-dark flush-soft-hover no-caret active ms-lg-0 d-sm-inline-block d-none">
                        <span className="icon">
                            <span className="feather-icon">
                                {listViewRoute ? <List /> : <Grid />}
                            </span>
                        </span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu align="end" >
                        <Dropdown.Item as={Link} href="list-view" active={listViewRoute}  >
                            <span className="feather-icon dropdown-icon">
                                <List />
                            </span>
                            <span>Visualizar Lista</span>
                        </Dropdown.Item>
                        <Dropdown.Item as={Link} href="grid-view" active={pathName.match("apps/documents/grid-view")} >
                            <span className="feather-icon dropdown-icon">
                                <Grid />
                            </span>
                            <span>Visualizar Grade</span>
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                <Button as="a" href="#" variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover hk-navbar-togglable d-sm-inline-block d-none" onClick={() => dispatch({ type: "top_nav_toggle" })} >
                    <HkTooltip placement={states.layoutState.topNavCollapse ? "bottom" : "top"} title="Recolher" >
                        <span className="icon">
                            <span className="feather-icon">
                                {
                                    states.layoutState.topNavCollapse ? <ChevronDown /> : <ChevronUp />
                                }
                            </span>
                        </span>
                    </HkTooltip>
                </Button>
            </div>
            <div className={classNames("hk-sidebar-togglable", { "active": !showSidebar })} onClick={toggleSidebar} />
        </header>
    )
}


export default DocumentsHeader;

