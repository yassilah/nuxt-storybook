<script setup lang="ts">
const truc = useTruc()
</script>

<template>
  <button
    class="rounded bg-purple-500 text-white p-2"
    @click="truc"
  >
    <slot />
    <FooBar />
  </button>
</template>
