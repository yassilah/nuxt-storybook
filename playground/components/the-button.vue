<script setup lang="ts">
defineProps<{
    nice: string
}>()
const truc = useTruc()
const { cool } = useAppConfig()
const {
    public: { foo }
} = useRuntimeConfig()
</script>

<template>
    <div class="rounded bg-blue-500 text-white p-2" @click="truc">
        <slot />
        <FooBar />
        <p>app config: {{ cool }}</p>
        <p>public config: {{ foo }}</p>
        <p>prop: {{ nice }}</p>
    </div>
</template>