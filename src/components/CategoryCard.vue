<script setup>
import { ref } from 'vue'
import ChecklistItem from './ChecklistItem.vue'

const props = defineProps({
  category: { type: Object, required: true },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['add-item', 'toggle-item', 'remove-item', 'remove-category'])

const newItemLabel = ref('')

function submitItem() {
  if (!newItemLabel.value.trim()) return
  emit('add-item', props.category.id, newItemLabel.value.trim())
  newItemLabel.value = ''
}
</script>

<template>
  <div class="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
    <div class="flex items-center justify-between px-4 py-3 bg-stone-50 border-b border-stone-200">
      <h3 class="font-semibold text-stone-800">{{ category.name }}</h3>
      <button
        v-if="!disabled"
        type="button"
        class="text-stone-400 hover:text-red-600 p-1 rounded"
        aria-label="Remove category"
        @click="$emit('remove-category', category.id)"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
    <div class="p-3 space-y-0">
      <ChecklistItem
        v-for="item in category.items"
        :key="item.id"
        :item="item"
        :disabled="disabled"
        @toggle="$emit('toggle-item', category.id, item.id)"
        @remove="$emit('remove-item', category.id, item.id)"
      />
      <form v-if="!disabled" class="flex gap-2 mt-2" @submit.prevent="submitItem">
        <input
          v-model="newItemLabel"
          type="text"
          class="input-base flex-1 text-sm"
          placeholder="Add item..."
        />
        <button type="submit" class="btn-primary text-sm py-2">Add</button>
      </form>
    </div>
  </div>
</template>
