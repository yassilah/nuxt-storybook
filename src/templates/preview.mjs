import previewImports from './preview.imports.json'
import { setup } from '@storybook/vue3'

await Promise.all(previewImports.map((previewImport) => import(/* @vite-ignore */ previewImport)))

setup(() => {
  console.log('[nuxt-storybook] Storybook successfully loaded.')
})

export const parameters = {
  layout: 'centered',
  controls: { expanded: true },
  actions: { argTypesRegex: '^on[A-Z].*' },
}