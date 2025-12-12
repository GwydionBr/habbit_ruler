import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/habbit-tracker')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/habbit-tracker"!</div>
}
