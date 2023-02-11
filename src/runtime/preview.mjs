import previewImports from './preview.imports.json'

await Promise.all(previewImports.map((previewImport) => import(/* @vite-ignore */ previewImport)))

export const parameters = {
  layout: 'centered',
  controls: { expanded: true },
  actions: { argTypesRegex: '^on[A-Z].*' },
}