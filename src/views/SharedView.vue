<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import CategoryList from '../components/CategoryList.vue'

const route = useRoute()
const id = computed(() => route.params.id)
const token = computed(() => route.query.t)

const categories = ref([])
const loading = ref(true)
const error = ref('')
const expiresAt = ref('')

onMounted(async () => {
  if (!id.value || !token.value) {
    error.value = 'Invalid share link. Missing id or token.'
    loading.value = false
    return
  }
  try {
    const base = import.meta.env.VITE_APP_URL || ''
    const res = await fetch(
      `${base}/.netlify/functions/share-get?id=${encodeURIComponent(id.value)}&t=${encodeURIComponent(token.value)}`
    )
    const json = await res.json()
    if (!res.ok) {
      if (res.status === 410) error.value = 'This shared link has expired.'
      else error.value = json.error || 'Could not load shared list.'
      loading.value = false
      return
    }
    categories.value = json.data?.categories || []
    expiresAt.value = json.expiresAt || ''
  } catch (e) {
    console.error(e)
    error.value = 'Failed to load shared list.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-stone-900">Shared Travel Packing List</h1>
      <p class="text-stone-600 mt-1">View-only snapshot from a shared link.</p>
      <p v-if="expiresAt" class="text-sm text-stone-500 mt-2">
        Link expires: {{ expiresAt ? new Date(expiresAt).toLocaleString() : '' }}
      </p>
    </header>

    <div v-if="loading" class="text-stone-500">Loading…</div>
    <div v-else-if="error" class="rounded-lg bg-red-50 text-red-800 p-4">
      {{ error }}
    </div>
    <CategoryList v-else :categories="categories" disabled />
  </div>
</template>
