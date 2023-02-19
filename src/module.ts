import '@nuxt/schema'
import {
    addTemplate,
    createResolver,
    defineNuxtModule,
    useNuxt
} from '@nuxt/kit'
import { buildDevStandalone } from '@storybook/core-server'
import { isAbsolute, join } from 'pathe'
import { logger } from '@storybook/node-logger'
import { readPackageJSON } from 'pkg-types'
import { resolve } from 'pathe'
import consola from 'consola'
import type { StorybookConfig } from '@storybook/vue3-vite'
import type { Parameters as StorybookParameters } from '@storybook/types'

export interface ModuleOptions {
    enabled?: boolean
    buildOptions: Parameters<typeof buildDevStandalone>[0]
    config: StorybookConfig
    parameters?: StorybookParameters
}

declare module '@nuxt/schema' {
    interface NuxtHooks {
        'storybook:config': (config: StorybookConfig) => void
        'storybook:build:before': (
            options: ModuleOptions['buildOptions']
        ) => void
        'storybook:build:after': () => void
    }
}

export default defineNuxtModule<ModuleOptions>({
    meta: {
        name: 'storybook',
        configKey: 'storybook'
    },
    defaults: nuxt => ({
        enabled: nuxt.options.dev,
        config: {
            stories: ['components/*.stories.@(js|jsx|ts|tsx|mdx)'],
            framework: '@storybook/vue3-vite',
            core: {
                renderer: resolve(__dirname, 'renderer')
            },
            addons: []
        },
        buildOptions: {
            configDir: join(nuxt.options.buildDir, '.storybook'),
            quiet: true,
            packageJson: undefined as any,
            port: nuxt.options.devServer.port + 1,
            cache: undefined,
            loglevel: 'silent'
        },
        parameters: {
            layout: 'centered',
            controls: { expanded: true },
            actions: { argTypesRegex: '^on[A-Z].*' }
        }
    }),
    async setup(options, nuxt) {
        if (options.enabled) {
            const { resolve } = createResolver(import.meta.url)

            options.config.stories = makeAbsoluteStoriesPaths(
                options.config.stories
            )

            await nuxt.callHook('storybook:config', options.config)

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
                filename: '.storybook/preview.mjs',
                write: true,
                getContents: () =>
                    `export const parameters = ${JSON.stringify(
                        options.parameters,
                        null,
                        2
                    )}`
            })

            addTemplate({
                filename: '.storybook/preview-head.html',
                write: true,
                getContents: () =>
                    `<script>window.global = window</script><script>window.__NUXT__={data:{},state:{},_errors:{},serverRendered:false,config:{public:{},app:{baseURL:"\u002F",buildAssetsDir:"\u002F_nuxt\u002F",cdnURL:""}}}</script>`
            })

            if (!options.buildOptions?.packageJson) {
                const packageJson = await readPackageJSON()
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

            // Extend server to close it when nuxt closes.
            const { extendServer = () => void 0 } = options.buildOptions
            options.buildOptions.extendServer = server => {
                extendServer(server)
                nuxt.hook('close', () => {
                    server.close()
                })
            }

            nuxt.hook('app:templatesGenerated', async () => {
                await nuxt.callHook(
                    'storybook:build:before',
                    options.buildOptions
                )
                void buildDevStandalone(options.buildOptions).then(() => {
                    void nuxt.callHook('storybook:build:after')
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

    const list = nuxt.options._layers.flatMap(layer => {
        return stories.map(story => {
            if (typeof story !== 'string') {
                story.directory = isAbsolute(story.directory)
                    ? story.directory
                    : join(layer.cwd, story.directory)
                return story
            } else {
                story = isAbsolute(story) ? story : join(layer.cwd, story)
            }
            return story
        })
    })

    return [...new Set(list)]
}
