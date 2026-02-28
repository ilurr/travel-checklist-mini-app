<script setup>
import { ref } from 'vue'
import CategoryCard from './CategoryCard.vue'

const props = defineProps({
  categories: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['add-category', 'add-item', 'toggle-item', 'remove-item', 'remove-category', 'update-item-quantity'])

const newCategoryName = ref('')

function submitCategory() {
  if (!newCategoryName.value.trim()) return
  emit('add-category', newCategoryName.value.trim())
  newCategoryName.value = ''
}
</script>

<template>
  <div class="space-y-6">
    <CategoryCard
      v-for="cat in categories"
      :key="cat.id"
      :category="cat"
      :disabled="disabled"
      @add-item="(cid, label) => $emit('add-item', cid, label)"
      @toggle-item="(cid, iid) => $emit('toggle-item', cid, iid)"
      @remove-item="(cid, iid) => $emit('remove-item', cid, iid)"
      @remove-category="(cid) => $emit('remove-category', cid)"
      @update-item-quantity="(cid, iid, qty) => $emit('update-item-quantity', cid, iid, qty)"
    />
    <form
      v-if="!disabled"
      class="flex gap-2 p-4 bg-white rounded-xl border border-dashed border-stone-300"
      @submit.prevent="submitCategory"
    >
      <input
        v-model="newCategoryName"
        type="text"
        class="input-base flex-1"
        placeholder="New category name..."
      />
      <button type="submit" class="btn-primary">Add category</button>
    </form>
  </div>
</template>
