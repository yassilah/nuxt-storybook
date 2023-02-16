import type { Addon_ClientStoryApi, Addon_Loadable } from '@storybook/types'
import type { App } from 'vue'

export interface ClientApi
    extends Addon_ClientStoryApi<VueRenderer['storyResult']> {
    configure(loader: Addon_Loadable, module: NodeModule): void
    forceReRender(): void
    raw: () => any // todo add type
    load: (...args: any[]) => void
    app: App
}
