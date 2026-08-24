import { useFarmers } from '../farmers.hooks.js'

function FarmersPage() {
  const { farmers, isLoading, error } = useFarmers()

  return (
    <div className="space-y-6">
      <div>
        <h1>Farmers</h1>
        <p className="text-sm text-muted-foreground">Manage registered farmers.</p>
      </div>

     
    </div>
  )
}

export default FarmersPage
