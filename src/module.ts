import { addTemplate, defineNuxtModule, useNuxt } from '@nuxt/kit'
import { buildOptions } from '../../../storybook/code/lib/core-server/src/build-dev'
import { isAbsolute, join } from 'pathe'
import { logger } from '@storybook/node-logger'
import { readPackageJSON } from 'pkg-types'
import { resolve } from 'pathe'
import consola from 'consola'
import installStorybook from './storybook/install'
import type {
    StorybookConfig,
    Parameters as StorybookParameters
} from '@storybook/types'

export interface ModuleOptions {
    enabled?: boolean
    config: StorybookConfig
    preview?: StorybookParameters
    baseURL: string
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
                renderer: resolve(__dirname, 'storybook/renderer')
            },
            features: {
                buildStoriesJson: false,
                storyStoreV7: false
            },
            addons: [
                '@storybook/addon-essentials',
                '@storybook/addon-interactions'
            ]
        },
        baseURL: '/storybook',
        preview: {
            layout: 'centered',
            controls: { expanded: true },
            actions: { argTypesRegex: '^on[A-Z].*' }
        }
    }),
    async setup(options, nuxt) {
        if (options.enabled) {
            options.config.stories = makeAbsoluteStoriesPaths(
                options.config.stories
            )

            addTemplate({
                filename: '.storybook/main.mjs',
                write: true,
                getContents: () =>
                    `export default ${JSON.stringify(options.config, null, 2)}`
            })

            addTemplate({
                filename: '.storybook/preview.mjs',
                write: true,
                getContents: () =>
                    `export const parameters = ${JSON.stringify(
                        options.preview,
                        null,
                        2
                    )}`
            })
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

            const baseBuildOptions: Parameters<typeof buildOptions>[0] = {
                configDir: join(nuxt.options.buildDir, '.storybook'),
                outputDir: join(nuxt.options.buildDir, 'storybook'),
                quiet: true,
                packageJson: await readPackageJSON(),
                port: nuxt.options.devServer.port,
                loglevel: 'silent'
            }

            if (!baseBuildOptions?.packageJson?.version) {
                baseBuildOptions.packageJson.version = '0.0.0'
            }

            installStorybook({
                nuxt,
                baseURL: options.baseURL,
                options: baseBuildOptions
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
