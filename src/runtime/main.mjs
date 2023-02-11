import { useNuxt } from '@nuxt/kit'
import { mergeConfig } from 'vite'
import options from './main.options.json'

const getNuxtViteConfig = (() => {
    const promise = new Promise((resolve) => {
        const nuxt = useNuxt()
        nuxt.hook('vite:extendConfig', config => resolve({ ...config }))
    })
    return () => promise
})()

const viteFinal = async (current) => {
    const nuxtConfig = await getNuxtViteConfig()

    // Prevent error when using HMR
    delete nuxtConfig.define['module.hot']

    const config = mergeConfig(nuxtConfig, current)

    // Remove duplicate plugins (e.g. vite:vue)
    config.plugins = config.plugins.filter((plugin, index, array) => {
        return array.findIndex((p) => p.name === plugin.name) === index
    })

    return config
}

export default { ...options, viteFinal }