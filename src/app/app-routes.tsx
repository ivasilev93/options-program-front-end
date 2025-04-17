import { UiLayout } from '@/components/ui/ui-layout'
import { lazy } from 'react'
import { Navigate, RouteObject, useRoutes } from 'react-router-dom'

const AccountListFeature = lazy(() => import('../components/account/account-list-feature'))
const AccountDetailFeature = lazy(() => import('../components/account/account-detail-feature'))
const ClusterFeature = lazy(() => import('../components/cluster/cluster-feature'))
// const CounterFeature = lazy(() => import('../components/counter/counter-feature'))
const DashboardFeature = lazy(() => import('../components/dashboard/dashboard-feature'))
const AdminFeature = lazy(() => import('../components/admin/admin-feature'))
const LiquidityProvidersFeature = lazy(() => import('../components/liquidity-providers/liquidity-providers'))



const links: { label: string; path: string }[] = [
  { label: 'Admin', path: '/admin' },
  // { label: 'LPs', path: '/lps' },
  { label: 'Buy', path: '/buy' },
  { label: 'Account', path: '/account' },
  { label: 'Clusters', path: '/clusters' },
  { label: 'Counter Program', path: '/counter' },
]

const routes: RouteObject[] = [
  { path: '/admin', element: <AdminFeature /> },
  { path: '/liquidity-providers', element: <LiquidityProvidersFeature /> },
  { path: '/buy', element: <AccountListFeature /> },
  { path: '/account/', element: <AccountListFeature /> },
  { path: '/account/:address', element: <AccountDetailFeature /> },
  // { path: '/counter', element: <CounterFeature /> },
  { path: '/clusters', element: <ClusterFeature /> },
]

export function AppRoutes() {
  const router = useRoutes([
    { index: true, element: <Navigate to={'/dashboard'} replace={true} /> },
    { path: '/dashboard', element: <DashboardFeature /> },
    ...routes,
    { path: '*', element: <Navigate to={'/dashboard'} replace={true} /> },
  ])
  return <UiLayout links={links}>{router}</UiLayout>
}
