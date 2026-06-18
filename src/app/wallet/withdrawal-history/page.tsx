export const dynamic = 'force-dynamic'
import TransactionsPage from '../transactions/page'
export default function WithdrawalHistoryPage() {
  return <TransactionsPage filterType="withdrawal" />
}
