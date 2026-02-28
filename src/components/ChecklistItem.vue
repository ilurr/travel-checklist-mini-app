<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: { type: Object, required: true },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['toggle', 'remove', 'update-quantity'])

const quantity = computed(() => props.item.quantity ?? 1)

function onQuantityInput(e) {
  const v = e.target.value
  const n = parseInt(v, 10)
  if (!Number.isNaN(n) && n >= 1) emit('update-quantity', n)
}
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
      class="flex-1 text-stone-800 min-w-0"
      :class="{ 'line-through text-stone-500': item.checked }"
    >
      {{ item.label }}
    </span>
    <div class="flex items-center gap-1 shrink-0">
      <input
        type="number"
        :value="quantity"
        min="1"
        class="w-14 rounded border border-stone-300 px-2 py-1 text-center text-stone-800 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        :disabled="disabled"
        @input="onQuantityInput"
      />
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
  </div>
</template>
