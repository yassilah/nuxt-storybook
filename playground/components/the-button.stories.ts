import TheButton from './the-button.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<typeof TheButton> = {
    title: 'The Button',
    component: TheButton
}

export default meta

type Story = StoryObj<typeof TheButton>

export const TheButtonStory: Story = {
    render: args => ({
        components: { TheButton },
        setup() {
            return { args }
        },
        template: `<TheButton v-bind="args"><slot/></TheButton>`
    }),
    args: {
        nice: 'lala'
    }
}

export const TheButtonStory2: Story = {
    render: args => ({
        components: { TheButton },
        setup() {
            return { args }
        },
        template: `<TheButton v-bind="args">kikoo</TheButton>`
    }),
    args: {
        nice: 'wouhou'
    }
}
