interface SkeletonTableProps {
  rows?: number;
  columns: number;
}

export function SkeletonTable({ rows = 8, columns }: SkeletonTableProps) {
  return (
    <div className="er-surface p-0 overflow-hidden" aria-busy="true" aria-label="Carregando tabela">
      <table className="table mb-0">
        <tbody className="placeholder-glow">
          {Array.from({ length: rows }, (_, row) => (
            <tr key={row}>
              {Array.from({ length: columns }, (_, column) => (
                <td key={column}>
                  <span className={`placeholder col-${column === 0 ? 8 : 5} rounded`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
