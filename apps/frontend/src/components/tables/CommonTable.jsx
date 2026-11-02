
function CommonTable({ columns = [], data = [] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#e2e3dd] bg-white shadow-sm">
      <table className="w-full min-w-[850px] text-left text-sm">
        <thead>
          <tr className="border-b border-[#e8e9e3] bg-white">
            {columns.map(col => (
              <th key={col.key} className="whitespace-nowrap px-6 py-4 text-xs font-bold text-[#828984]">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row.id ?? index} className={`border-b border-[#ecede7] last:border-0 hover:bg-[#f3f4ef] ${index % 2 ? 'bg-[#faf9f6]' : 'bg-white'}`}>
              {columns.map(col => (
                <td key={col.key} className="whitespace-nowrap px-6 py-5 text-[#5e6560]">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default CommonTable
