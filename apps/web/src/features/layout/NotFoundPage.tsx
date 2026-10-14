import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('Página não encontrada');
  return (
    <EmptyState
      icon="signpost-split"
      title="Página não encontrada"
      description="O endereço acessado não existe ou foi movido."
      action={
        <Link to="/" className="btn btn-primary">
          Ir para o ranking
        </Link>
      }
    />
  );
}
