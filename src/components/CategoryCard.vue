<script setup>
import { ref, computed } from 'vue'
import ChecklistItem from './ChecklistItem.vue'
import ConfirmModal from './ConfirmModal.vue'

const props = defineProps({
  category: { type: Object, required: true },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['add-item', 'toggle-item', 'remove-item', 'remove-category', 'update-item-quantity'])

const newItemLabel = ref('')
const showItemConfirm = ref(false)
const showCategoryConfirm = ref(false)
const pendingItem = ref(null)

const totalQuantity = computed(() =>
  (props.category.items || []).reduce((s, i) => s + (Math.max(1, parseInt(i.quantity, 10) || 1)), 0)
)
const itemLabel = computed(() =>
  totalQuantity.value === 1 ? '1 item' : `${totalQuantity.value} items`
)
const allChecked = computed(() => {
  const items = props.category.items || []
  return items.length > 0 && items.every((i) => i.checked)
})
const itemConfirmMessage = computed(() =>
  pendingItem.value ? `Remove "${pendingItem.value.label}" from the list?` : ''
)
const categoryConfirmMessage = computed(() =>
  `Remove "${props.category.name}" and all its items?`
)

function requestRemoveItem(itemId, itemLabel) {
  if (props.disabled) return
  pendingItem.value = { id: itemId, label: itemLabel }
  showItemConfirm.value = true
}

function confirmRemoveItem() {
  if (pendingItem.value) {
    emit('remove-item', props.category.id, pendingItem.value.id)
    pendingItem.value = null
  }
  showItemConfirm.value = false
}

function requestRemoveCategory() {
  if (props.disabled) return
  showCategoryConfirm.value = true
}

function confirmRemoveCategory() {
  emit('remove-category', props.category.id)
  showCategoryConfirm.value = false
}

function cancelItemConfirm() {
  showItemConfirm.value = false
  pendingItem.value = null
}

function cancelCategoryConfirm() {
  showCategoryConfirm.value = false
}

function submitItem() {
  if (!newItemLabel.value.trim()) return
  emit('add-item', props.category.id, newItemLabel.value.trim())
  newItemLabel.value = ''
}
</script>

<template>
  <div class="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
    <div
      class="flex items-center justify-between px-4 py-3 border-b transition-colors"
      :class="allChecked ? 'bg-emerald-100 border-emerald-200' : 'bg-stone-50 border-stone-200'"
    >
      <h3 class="font-semibold text-stone-800">{{ category.name }} <span class="font-normal text-stone-500">{{ itemLabel }}</span></h3>
      <button
        v-if="!disabled"
        type="button"
        class="text-stone-400 hover:text-red-600 p-1 rounded"
        aria-label="Remove category"
        @click="requestRemoveCategory"
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
        @remove="requestRemoveItem(item.id, item.label)"
        @update-quantity="(qty) => emit('update-item-quantity', category.id, item.id, qty)"
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
    <ConfirmModal
      :show="showItemConfirm"
      title="Remove item"
      :message="itemConfirmMessage"
      confirm-label="Remove"
      @confirm="confirmRemoveItem"
      @cancel="cancelItemConfirm"
    />
    <ConfirmModal
      :show="showCategoryConfirm"
      title="Remove category"
      :message="categoryConfirmMessage"
      confirm-label="Remove"
      @confirm="confirmRemoveCategory"
      @cancel="cancelCategoryConfirm"
    />
  </div>
</template>
