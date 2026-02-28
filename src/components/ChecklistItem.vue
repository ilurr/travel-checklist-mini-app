<script setup>
defineProps({
  item: { type: Object, required: true },
  disabled: { type: Boolean, default: false },
})
defineEmits(['toggle', 'remove'])
</script>

<template>
  <div
    class="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-stone-100/80 group"
  >
    <input
      type="checkbox"
      :checked="item.checked"
      :disabled="disabled"
      class="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
      @change="$emit('toggle')"
    />
    <span
      class="flex-1 text-stone-800"
      :class="{ 'line-through text-stone-500': item.checked }"
    >
      {{ item.label }}
    </span>
    <button
      v-if="!disabled"
      type="button"
      class="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-600 p-1 rounded transition"
      aria-label="Remove item"
      @click="$emit('remove')"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>
