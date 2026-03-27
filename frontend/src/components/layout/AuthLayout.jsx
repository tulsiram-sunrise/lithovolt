import { Outlet } from 'react-router-dom'
import PublicHeader from './PublicHeader'

export default function AuthLayout() {
  return (
    <div className="min-h-[100dvh] box-border auth-hero px-4 pb-4 pt-0 md:px-8 md:pb-6 md:pt-0">
      <PublicHeader title="Access & Discovery" />

      <Outlet />
    </div>
  )
}
