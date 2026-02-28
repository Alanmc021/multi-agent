import { Col, Container, Row } from 'react-bootstrap';

const CommonFooter1 = () => {
    return (
        <div className="hk-footer border-0">
            <Container as="footer" className="footer">
                <Row>
                    <Col xl={8} className="text-center">
                        <p className="footer-text pb-0">
                            <span className="copy-text">GovernAI© {new Date().getFullYear()} Todos os direitos reservados.</span>
                            <a href="#">Política de Privacidade</a>
                            <span className="footer-link-sep">|</span><a href="#">Termos</a><span className="footer-link-sep">|</span><a href="#">Status do Sistema</a>
                        </p>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default CommonFooter1
