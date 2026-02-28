'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from 'react-bootstrap';
import { ArrowLeft } from 'react-feather';
import AgentForm from '../AgentForm';

/**
 * Página de criação de novo agente
 */
const NewAgentPage = () => {
  const router = useRouter();

  return (
    <div className="hk-pg-body">
      <div className="container-fluid">
        <div className="d-flex align-items-center mb-4">
          <Button
            as={Link}
            href="/apps/agents"
            variant="flush-dark"
            className="btn-icon btn-rounded"
          >
            <ArrowLeft size={20} />
          </Button>
          <h4 className="mb-0 ms-3">Novo Agente</h4>
        </div>
        <AgentForm
          onSave={() => router.push('/apps/agents')}
          onCancel={() => router.push('/apps/agents')}
          isEdit={false}
        />
      </div>
    </div>
  );
};

export default NewAgentPage;
