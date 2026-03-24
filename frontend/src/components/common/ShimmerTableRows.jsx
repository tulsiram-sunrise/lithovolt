export default function ShimmerTableRows({ rows = 4, columns = 4 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={`shimmer-row-${rowIndex}`} className="animate-pulse" aria-hidden="true">
          {Array.from({ length: columns }).map((__, colIndex) => (
            <td key={`shimmer-cell-${rowIndex}-${colIndex}`}>
              <div className="h-4 w-full max-w-[180px] rounded bg-white/10" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
