# Nuxt + Storybook

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]

## Quick Setup

1. Add `@yassidev/nuxt-storybook` dependency to your project

```bash

# Using pnpm

pnpm add -D @yassidev/nuxt-storybook @storybook/vue3-vite

# Using yarn

yarn add --dev @yassidev/nuxt-storybook @storybook/vue3-vite

# Using npm

npm install --save-dev @yassidev/nuxt-storybook @storybook/vue3-vite
```

2. Add `@yassidev/nuxt-storybook` to the `modules` section of `nuxt.config.ts`

```ts
export default defineNuxtConfig({
    modules: [
        '@yassidev/nuxt-storybook'
    ],
    storybook: {
        config: {}, // What you would export from `.storybook/main`.
        buildOptions: {},  // Add any extra options for building the storybook server.
        parameters: {}  // Parameters you'd normally export from `.storybook/previews`.
    }
})
```

## Notes

This module really was just for me to get started with defining stories and be able to use all my Nuxt-specific features without requiring a bunch of tweaks and hacks (e.g.composable auto-imports, custom components, etc.). But I'm now trying to work on a **Storybook Nuxt Framework** that would just plug itself to a running Nuxt server instance and add a `/storybook` route to view all your stories within a Nuxt context :) 

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@yassidev/nuxt-storybook/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@yassidev/nuxt-storybook

[npm-downloads-src]: https://img.shields.io/npm/dm/@yassidev/nuxt-storybook.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@yassidev/nuxt-storybook

[license-src]: https://img.shields.io/npm/l/@yassidev/nuxt-storybook.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/@yassidev/nuxt-storybook
