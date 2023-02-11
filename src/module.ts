import { defineNuxtModule, addTemplate, useNuxt, createResolver } from '@nuxt/kit'
import type { StorybookConfig } from '@storybook/vue3-vite'
import { buildDevStandalone } from '@storybook/core-server'
import { isAbsolute, join } from 'pathe'
import consola from 'consola'
import { logger } from '@storybook/node-logger'
import '@nuxt/schema'


export interface ModuleOptions {
  enabled?: boolean
  buildOptions: Parameters<typeof buildDevStandalone>[0]
  config: StorybookConfig
  previewImports?: string[]
}

export interface ModuleHooks {
  'storybook:preview:imports': (imports: string[]) => void
  'storybook:config': (config: StorybookConfig) => void
  'storybook:build:before': (options: ModuleOptions['buildOptions']) => void
  'storybook:build:after': () => void
}

declare module '@nuxt/schema' {
  interface NuxtHooks extends ModuleHooks {}
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'storybook',
    configKey: 'storybook'
  },
  defaults: (nuxt) => ({
      enabled: nuxt.options.dev,
      config: {
      stories: [
        '**/*.stories.@(js|jsx|ts|tsx|mdx)'
      ],
      framework: '@storybook/vue3-vite',
      addons: [
        '@storybook/addon-essentials',
        '@storybook/addon-interactions',
      ],
      },
      buildOptions: {
        configDir: join(nuxt.options.buildDir, '.storybook'),
        quiet: true,
        packageJson: undefined as any,
        port: nuxt.options.devServer.port + 1,
        cache: undefined,
        loglevel: 'silent',
      },
      previewImports: []
    }),
  async setup (options, nuxt) {
    if (options.enabled) {
      const { resolve } = createResolver(import.meta.url)
      
      options.config.stories = makeAbsoluteStoriesPaths(options.config.stories)

      await nuxt.callHook('storybook:config', options.config)

      const previewImports = options.previewImports ?? []

      await nuxt.callHook('storybook:preview:imports', previewImports)

      addTemplate({
        filename: '.storybook/main.options.json',
        write: true,
        getContents: () => JSON.stringify(options.config, null, 2)
      })

      addTemplate({
        filename: '.storybook/main.mjs',
        write: true,
        src: resolve('runtime/main.mjs')
      })

      addTemplate({
        filename: '.storybook/preview.imports.json',
        write: true,
        getContents: () => JSON.stringify(previewImports, null, 2)
      })

      addTemplate({
        filename: '.storybook/preview.mjs',
        write: true,
        src: resolve('runtime/preview.mjs')
      })

      addTemplate({
        filename: '.storybook/preview-head.html',
        write: true,
        getContents:() => `<script>window.global = window</script>`
      })

      if (!options.buildOptions?.packageJson) {
        const packageJson = await import(join(nuxt.options.rootDir, 'package.json'))
        options.buildOptions.packageJson = packageJson
      }

      if (!options.buildOptions?.packageJson?.version) {
        options.buildOptions.packageJson.version = '0.0.0'
      }

      const newLogger = consola.create({
        defaults: {
          message: '[nuxt:storybook]',
          tag: 'nuxt:storybook'
        }
      })

      logger.error = newLogger.error.bind(newLogger)
      logger.warn = newLogger.warn.bind(newLogger)
      logger.info = newLogger.info.bind(newLogger)
      logger.trace = newLogger.trace.bind(newLogger)

      nuxt.hook('app:templatesGenerated', async () => {
        await nuxt.callHook('storybook:build:before', options.buildOptions)
        void buildDevStandalone(options.buildOptions).then(() => {
          nuxt.callHook('storybook:build:after')
        })
      })
    }
  }
})

/**
 * Make stories paths absolute.
 */
function makeAbsoluteStoriesPaths(stories: StorybookConfig['stories']) {
  const nuxt = useNuxt()
  const rootDir = nuxt.options.rootDir

  return stories.map((story) => {
    if (typeof story !== 'string') {
      story.directory = isAbsolute(story.directory) ? story.directory : join(rootDir, story.directory)
      return story
    } else {
      story = isAbsolute(story) ? story : join(rootDir, story)
    }

    return  story
  })
}