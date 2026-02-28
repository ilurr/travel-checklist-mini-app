<script setup>
import { ref } from 'vue'
import CategoryList from '../components/CategoryList.vue'
import SharePanel from '../components/SharePanel.vue'
import { usePackingList } from '../composables/usePackingList'

const {
  categories,
  totalItems,
  checkedCount,
  addCategory,
  removeCategory,
  addItem,
  toggleItem,
  removeItem,
  clearAllChecks,
  getData,
} = usePackingList()

const shareLoading = ref(false)
const shareUrl = ref('')
const shareExpiresAt = ref('')
const lastShareUrl = ref('')
try {
  lastShareUrl.value = localStorage.getItem('travel-packing-last-share') || ''
} catch (_) {}

async function createShare() {
  shareLoading.value = true
  shareUrl.value = ''
  shareExpiresAt.value = ''
  try {
    const base = import.meta.env.VITE_APP_URL || ''
    const res = await fetch(`${base}/.netlify/functions/share-create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: getData() }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Failed to create share')
    shareUrl.value = json.shareUrl || ''
    shareExpiresAt.value = json.expiresAt || ''
    lastShareUrl.value = shareUrl.value
    try {
      localStorage.setItem('travel-packing-last-share', shareUrl.value)
    } catch (_) {}
  } catch (e) {
    console.error(e)
    alert(e.message || 'Could not create share link. Check Netlify env and Supabase.')
  } finally {
    shareLoading.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-stone-900">Travel Packing List</h1>
      <p class="text-stone-600 mt-1">Pack by category and share with travel buddies.</p>
      <div class="mt-4 flex flex-wrap gap-4 text-sm text-stone-500">
        <span>{{ checkedCount }} / {{ totalItems }} packed</span>
        <button
          v-if="checkedCount > 0"
          type="button"
          class="text-emerald-600 hover:underline"
          @click="clearAllChecks"
        >
          Clear all checks
        </button>
      </div>
    </header>

    <CategoryList
      :categories="categories"
      @add-category="addCategory"
      @add-item="addItem"
      @toggle-item="toggleItem"
      @remove-item="removeItem"
      @remove-category="removeCategory"
    />

    <section class="mt-10 space-y-4">
      <SharePanel
        :loading="shareLoading"
        :share-url="shareUrl"
        :expires-at="shareExpiresAt"
        @create-share="createShare"
      />
      <p v-if="lastShareUrl && !shareUrl" class="text-sm text-stone-500">
        Last share: <a :href="lastShareUrl" class="text-emerald-600 hover:underline">Open shared link</a>
      </p>
    </section>
  </div>
</template>
