import {
    type Router,
    createRouter,
    eventHandler,
    getQuery,
    setResponseHeader
} from 'h3'
import { buildOptions } from '../../../../storybook/code/lib/core-server/src/build-dev'
import { codeGeneratorPlugin } from '../../../../storybook/code/lib/builder-vite/src/plugins'
import { dirname, join, resolve } from 'pathe'
import { getData } from '../../../../storybook/code/lib/builder-manager/src/utils/data'
import { joinURL } from 'ufo'
import { readFileSync } from 'fs'
import { readOrderedFiles } from '../../../../storybook/code/lib/builder-manager/src/utils/files'
import { renderHTML } from '../../../../storybook/code/lib/builder-manager/src/utils/template'
import { transformIframeHtml } from '../../../../storybook/code/lib/builder-vite/src/transform-iframe-html'
import { vueDocgen } from '../../../../storybook/code/frameworks/vue3-vite/src/plugins/vue-docgen'
import type { NitroDevServer } from 'nitropack'
import type { Options } from '@storybook/types'
import type { StartOptions } from './types'
import type { UserConfig } from 'vite'

export default function install({ nuxt, options, baseURL }: StartOptions) {
    addStaticAssets({ nuxt, options, baseURL })
    const router = createRouter()

    nuxt.hook('ready', nuxt => {
        const server = nuxt.server as NitroDevServer
        server.app.stack.unshift({
            route: baseURL,
            handler: router.handler
        })
    })

    nuxt.hook('app:templatesGenerated', async () => {
        const { options: fullOptions } = await buildOptions(options, true)
        addEntryRoute(router, fullOptions)
        addIFrameRoute(router, fullOptions)

        nuxt.hook('vite:extendConfig', config => {
            extendViteConfig(config, fullOptions)
        })
    })
}

/**
 * Add static assets to be served by Nitro.
 */
function addStaticAssets({ nuxt, options, baseURL }: StartOptions) {
    const previewDir = dirname(
        require.resolve('@storybook/preview/package.json')
    )
    const managerDir = dirname(
        require.resolve('@storybook/manager/package.json')
    )

    nuxt.options.nitro.publicAssets ??= []

    nuxt.options.nitro.publicAssets.push(
        {
            baseURL: joinURL(baseURL, 'sb-preview'),
            dir: join(previewDir, 'dist')
        },
        {
            baseURL: joinURL(baseURL, 'sb-common-assets'),
            dir: join(managerDir, 'static')
        },
        {
            baseURL: joinURL(baseURL, 'sb-manager'),
            dir: join(managerDir, 'dist')
        },
        {
            baseURL: joinURL(baseURL, 'sb-addons'),
            dir: join(options.outputDir || '', 'sb-addons')
        }
    )
}

/**
 * Add the iframe.html route to the Nitro server.
 */
function addIFrameRoute(router: Router, options: Options) {
    router.use(
        '/iframe.html',
        eventHandler(async event => {
            const query = getQuery(event)

            if (query['html-proxy'] !== undefined) {
                return
            }

            const indexHtml = readFileSync(
                resolve(__dirname, './iframe.html'),
                'utf-8'
            )

            setResponseHeader(event, 'Content-Type', 'text/html')

            return await transformIframeHtml(indexHtml, options)
        })
    )
}

/**
 * Add entry router to the Nitro server.
 */
function addEntryRoute(router: Router, options: Options) {
    router.use(
        '/',
        eventHandler(async () => {
            const {
                config,
                favicon,
                customHead,
                features,
                instance,
                refs,
                template,
                title,
                logLevel,
                docsOptions
            } = await getData(options)

            const addonsDir = config.outdir || ''

            const compilation = await instance({
                ...config,
                minify: true,
                watch: false
            })

            const { cssFiles, jsFiles } = await readOrderedFiles(
                addonsDir,
                compilation?.outputFiles
            )

            return renderHTML(
                template,
                title,
                favicon,
                customHead,
                cssFiles,
                jsFiles,
                features,
                refs,
                logLevel,
                docsOptions,
                options
            )
        })
    )
}
/**
 * Extend Nuxt vite config with Storybook specific config.
 */
function extendViteConfig(config: UserConfig, options: Options) {
    config.plugins ??= []
    // @ts-expect-error fine
    config.plugins.push(vueDocgen(), codeGeneratorPlugin(options))
    config.plugins.push()
    config.resolve ??= {}
    config.resolve.alias ??= {}
    Object.defineProperty(config.resolve.alias, 'assert', {
        value: require.resolve('browser-assert')
    })
}
