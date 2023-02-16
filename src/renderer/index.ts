import '#app/entry'
// @ts-expect-error fine
import { applyDecorators, renderToCanvas } from '@storybook/vue3/preview'
import { h } from 'vue'
import { start } from '@storybook/preview-api'
import type { Args, ArgsStoryFn, StoryContext } from '@storybook/csf'
import type { ClientApi } from './types'
import type { RenderToCanvas } from '@storybook/types'
import type { VueRenderer } from '@storybook/vue3'

const FRAMEWORK = 'nuxt'

const render: ArgsStoryFn<VueRenderer> = (props, context) => {
    const { id, component: Component } = context
    if (!Component) {
        throw new Error(
            `Unable to render story ${id} as the component annotation is missing from the default export`
        )
    }

    return h(Component, props, getSlots(props, context) as any[])
}

function getSlots(props: Args, context: StoryContext<VueRenderer, Args>) {
    const { argTypes } = context
    const slots = Object.entries(props)
        .filter(([key]) => argTypes[key]?.table?.category === 'slots')
        .map(([key, value]) => [key, () => h('span', JSON.stringify(value))])

    return Object.fromEntries(slots)
}

const api = start<VueRenderer>(renderToCanvas as RenderToCanvas<VueRenderer>, {
    decorateStory: applyDecorators,
    render
})

export const storiesOf: ClientApi['storiesOf'] = (kind, m: NodeModule) => {
    return api.clientApi.storiesOf(kind, m).addParameters({
        framework: FRAMEWORK
    })
}

export const configure: ClientApi['configure'] = (...args) => {
    return api.configure(FRAMEWORK, ...args)
}

export const { forceReRender } = api

export { renderToCanvas }

export const { raw } = api.clientApi
