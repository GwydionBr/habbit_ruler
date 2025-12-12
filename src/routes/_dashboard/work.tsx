import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/work')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/work"!</div>
}
