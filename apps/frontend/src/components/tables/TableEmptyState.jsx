import EmptyState from '../common/EmptyState.jsx'

function TableEmptyState({ message = 'No records found.' }) {
  return <EmptyState message={message} />
}

export default TableEmptyState
