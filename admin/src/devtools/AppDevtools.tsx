import { TanStackDevtools } from '@tanstack/react-devtools'
import type { TanStackDevtoolsReactPlugin } from '@tanstack/react-devtools'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import { ProductDevtoolsPanel } from './ProductDevtoolsPanel'

const devtoolsPlugins = [
  {
    id: 'tanstack-router',
    name: 'TanStack Router',
    render: <TanStackRouterDevtoolsPanel />,
  },
  {
    id: 'suxin-product',
    name: 'Product State',
    render: <ProductDevtoolsPanel />,
  },
] satisfies Array<TanStackDevtoolsReactPlugin>

export function AppDevtools() {
  if (!import.meta.env.DEV) {
    return null
  }

  return (
    <TanStackDevtools
      config={{
        position: 'bottom-right',
      }}
      plugins={devtoolsPlugins}
    />
  )
}
