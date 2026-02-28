<script setup>
import { ref } from 'vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
  shareUrl: { type: String, default: '' },
  expiresAt: { type: String, default: '' },
})
const emit = defineEmits(['create-share'])

const copied = ref(false)

function copyLink() {
  if (!props.shareUrl) return
  navigator.clipboard.writeText(props.shareUrl).then(() => {
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  })
}

function formatExpiry(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}
</script>

<template>
  <div class="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
    <h4 class="font-semibold text-stone-800 mb-2">Share this list</h4>
    <p class="text-sm text-stone-600 mb-3">
      Create a link valid for 7 days. Anyone with the link can view (and optionally edit) this snapshot.
    </p>
    <button
      type="button"
      class="btn-primary w-full sm:w-auto"
      :disabled="loading"
      @click="$emit('create-share')"
    >
      {{ loading ? 'Creating link…' : 'Share for 7 days' }}
    </button>
    <div v-if="shareUrl" class="mt-4 space-y-2">
      <div class="flex gap-2">
        <input
          :value="shareUrl"
          readonly
          class="input-base text-sm flex-1"
        />
        <button type="button" class="btn-secondary" @click="copyLink">
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
      </div>
      <p v-if="expiresAt" class="text-xs text-stone-500">
        Link expires: {{ formatExpiry(expiresAt) }}
      </p>
    </div>
  </div>
</template>
