export default defineNuxtConfig({
    modules: ['@nuxtjs/tailwindcss', '../src/module'],
    runtimeConfig: {
        public: {
            foo: 'Some value from runtime config'
        }
    }
})
