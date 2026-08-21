import { useFarmers } from '../farmers.hooks.js'
import { farmerColumns } from '../components/farmerColumns.js'
import CommonTable from '../../../components/tables/CommonTable.jsx'
import TableEmptyState from '../../../components/tables/TableEmptyState.jsx'
import Loader from '../../../components/common/Loader.jsx'
import ErrorMessage from '../../../components/common/ErrorMessage.jsx'

function FarmersPage() {
  const { farmers, isLoading, error } = useFarmers()

  return (
    <div className="space-y-6">
      <div>
        <h1>Farmers</h1>
        <p className="text-sm text-muted-foreground">Manage registered farmers.</p>
      </div>

      {isLoading && <Loader />}
      {!isLoading && error && <ErrorMessage message={error} />}
      {!isLoading && !error && farmers.length === 0 && (
        <TableEmptyState message="No farmers found." />
      )}
      {!isLoading && !error && farmers.length > 0 && (
        <CommonTable columns={farmerColumns} data={farmers} />
      )}
    </div>
  )
}

export default FarmersPage
