import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/finance')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/finance"!</div>
}
