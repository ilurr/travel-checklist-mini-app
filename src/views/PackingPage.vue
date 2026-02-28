<script setup>
import { ref } from 'vue'
import CategoryList from '../components/CategoryList.vue'
import SharePanel from '../components/SharePanel.vue'
import TripSelector from '../components/TripSelector.vue'
import { useTrips } from '../composables/useTrips'

const {
  trips,
  currentTripId,
  currentTrip,
  categories,
  totalItems,
  checkedCount,
  setCurrentTrip,
  addTrip,
  updateTrip,
  removeTrip,
  addCategory,
  removeCategory,
  addItem,
  toggleItem,
  removeItem,
  updateItemQuantity,
  clearAllChecks,
  getCurrentTripData,
} = useTrips()

const shareLoading = ref(false)
const shareUrl = ref('')
const shareExpiresAt = ref('')
const lastShareUrl = ref('')
try {
  lastShareUrl.value = localStorage.getItem('travel-packing-last-share') || ''
} catch (_) {}

async function createShare() {
  const data = getCurrentTripData()
  if (!data) return
  shareLoading.value = true
  shareUrl.value = ''
  shareExpiresAt.value = ''
  try {
    const base = import.meta.env.VITE_APP_URL || ''
    const res = await fetch(`${base}/.netlify/functions/share-create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
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
      <p class="text-stone-600 mt-1">Manage trips by destination and date; each trip has its own list.</p>

      <div class="mt-4">
        <TripSelector
          :trips="trips"
          :current-trip-id="currentTripId"
          @select="setCurrentTrip"
          @add="(dest, date) => addTrip(dest, date)"
          @edit="(id, payload) => updateTrip(id, payload)"
          @remove="removeTrip"
        />
      </div>

      <div v-if="currentTrip" class="mt-4 flex flex-wrap gap-4 text-sm text-stone-500">
        <span>{{ currentTrip.destination }} — {{ new Date(currentTrip.date).toLocaleDateString() }}</span>
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
      v-if="currentTrip"
      :categories="categories"
      @add-category="addCategory"
      @add-item="addItem"
      @toggle-item="toggleItem"
      @remove-item="removeItem"
      @remove-category="removeCategory"
      @update-item-quantity="updateItemQuantity"
    />
    <p v-else class="text-stone-500">Add a trip to get started.</p>

    <section v-if="currentTrip" class="mt-10 space-y-4">
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
