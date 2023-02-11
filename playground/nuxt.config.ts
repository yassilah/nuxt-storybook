import{ resolve } from 'pathe'
 
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss', '../src/module'],
  hooks: {
    'storybook:preview:imports': (imports) => {
      imports.push(resolve(__dirname, '../node_modules/@nuxtjs/tailwindcss/dist/runtime/tailwind.css'))
    }
  }
})
