export const dynamic = 'force-dynamic'
import TransactionsPage from '../transactions/page'
export default function DepositHistoryPage() {
  return <TransactionsPage filterType="deposit" />
}
