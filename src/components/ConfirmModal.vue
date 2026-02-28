<script setup>
defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: 'Confirm' },
  message: { type: String, default: 'Are you sure?' },
  confirmLabel: { type: String, default: 'Delete' },
})
defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="$emit('cancel')"
    >
      <div
        class="bg-white rounded-xl shadow-lg max-w-sm w-full p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <h3 id="confirm-title" class="font-semibold text-stone-900">{{ title }}</h3>
        <p class="mt-2 text-stone-600 text-sm">{{ message }}</p>
        <div class="mt-5 flex gap-2 justify-end">
          <button type="button" class="btn-secondary" @click="$emit('cancel')">
            Cancel
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition"
            @click="$emit('confirm')"
          >
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
