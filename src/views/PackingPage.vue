<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import CategoryList from '../components/CategoryList.vue'
import SharePanel from '../components/SharePanel.vue'
import TripSelector from '../components/TripSelector.vue'
import { useTrips } from '../composables/useTrips'

const route = useRoute()

const isSharedMode = computed(
  () => route.name === 'shared' && route.params.id && route.query.t
)
const sharedId = computed(() => route.params.id || '')
const sharedToken = computed(() => route.query.t || '')

// --- Local mode (useTrips) ---
const {
  trips,
  currentTripId,
  currentTrip: localCurrentTrip,
  categories: localCategories,
  totalItems: localTotalItems,
  checkedCount: localCheckedCount,
  setCurrentTrip,
  addTrip,
  updateTrip,
  removeTrip,
  addCategory: localAddCategory,
  removeCategory: localRemoveCategory,
  addItem: localAddItem,
  toggleItem: localToggleItem,
  removeItem: localRemoveItem,
  updateItemQuantity: localUpdateItemQuantity,
  clearAllChecks: localClearAllChecks,
  getCurrentTripData,
  setCurrentTripShareInfo,
} = useTrips()

// --- Shared mode state ---
const sharedCategories = ref([])
const sharedDestination = ref('')
const sharedTripDate = ref('')
const sharedLoading = ref(false)
const sharedError = ref('')
const sharedExpiresAt = ref('')
const saveStatus = ref(null)
let saveTimeout = null
const SAVE_DEBOUNCE_MS = 600

function generateId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 11)}`
}

function getSharedData() {
  const cats = sharedCategories.value || []
  const data = {
    destination: sharedDestination.value || '',
    date: sharedTripDate.value || '',
    categories: JSON.parse(JSON.stringify(cats)),
  }
  data.categories.forEach((cat) => {
    (cat.items || []).forEach((i) => {
      if (i.quantity == null) i.quantity = 1
    })
  })
  return data
}

async function saveToRemote() {
  if (!sharedId.value || !sharedToken.value) return
  saveStatus.value = 'saving'
  try {
    const base = import.meta.env.VITE_APP_URL || ''
    const res = await fetch(`${base}/.netlify/functions/share-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: sharedId.value,
        t: sharedToken.value,
        data: getSharedData(),
      }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || json.details || 'Failed to save')
    sharedExpiresAt.value = json.expiresAt || sharedExpiresAt.value
    saveStatus.value = 'saved'
    setTimeout(() => { saveStatus.value = null }, 2000)
  } catch (e) {
    console.error(e)
    saveStatus.value = 'error'
    setTimeout(() => { saveStatus.value = null }, 3000)
  }
}

function scheduleSave() {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    saveTimeout = null
    saveToRemote()
  }, SAVE_DEBOUNCE_MS)
}

function sharedAddCategory(name) {
  if (!name?.trim()) return
  sharedCategories.value.push({
    id: generateId('cat'),
    name: name.trim(),
    items: [],
  })
  scheduleSave()
}

function sharedRemoveCategory(categoryId) {
  sharedCategories.value = sharedCategories.value.filter((c) => c.id !== categoryId)
  scheduleSave()
}

function sharedAddItem(categoryId, label) {
  if (!label?.trim()) return
  const cat = sharedCategories.value.find((c) => c.id === categoryId)
  if (!cat) return
  if (!cat.items) cat.items = []
  cat.items.push({
    id: generateId('item'),
    label: label.trim(),
    checked: false,
    quantity: 1,
  })
  scheduleSave()
}

function sharedToggleItem(categoryId, itemId) {
  const cat = sharedCategories.value.find((c) => c.id === categoryId)
  const item = cat?.items?.find((i) => i.id === itemId)
  if (item) {
    item.checked = !item.checked
    scheduleSave()
  }
}

function sharedRemoveItem(categoryId, itemId) {
  const cat = sharedCategories.value.find((c) => c.id === categoryId)
  if (!cat?.items) return
  cat.items = cat.items.filter((i) => i.id !== itemId)
  scheduleSave()
}

function sharedUpdateItemQuantity(categoryId, itemId, quantity) {
  const item = sharedCategories.value
    ?.find((c) => c.id === categoryId)
    ?.items?.find((i) => i.id === itemId)
  if (!item) return
  item.quantity = Math.max(1, parseInt(quantity, 10) || 1)
  scheduleSave()
}

function sharedClearAllChecks() {
  sharedCategories.value.forEach((cat) => {
    (cat.items || []).forEach((i) => (i.checked = false))
  })
  scheduleSave()
}

const sharedCurrentTrip = computed(() =>
  sharedDestination.value || sharedTripDate.value
    ? {
        destination: sharedDestination.value,
        date: sharedTripDate.value,
      }
    : null
)
const sharedTotalItems = computed(() =>
  (sharedCategories.value || []).reduce(
    (sum, cat) =>
      sum +
      (cat.items || []).reduce(
        (s, i) => s + (Math.max(1, parseInt(i.quantity, 10) || 1)),
        0
      ),
    0
  )
)
const sharedCheckedCount = computed(() =>
  (sharedCategories.value || []).reduce(
    (sum, cat) => sum + (cat.items?.filter((i) => i.checked)?.length || 0),
    0
  )
)

// --- Unified interface for template ---
const currentTrip = computed(() =>
  isSharedMode.value ? sharedCurrentTrip.value : localCurrentTrip.value
)
const categories = computed(() =>
  isSharedMode.value ? sharedCategories.value : localCategories.value
)
const totalItems = computed(() =>
  isSharedMode.value ? sharedTotalItems.value : localTotalItems.value
)
const checkedCount = computed(() =>
  isSharedMode.value ? sharedCheckedCount.value : localCheckedCount.value
)

function addCategory(name) {
  if (isSharedMode.value) sharedAddCategory(name)
  else localAddCategory(name)
}
function removeCategory(categoryId) {
  if (isSharedMode.value) sharedRemoveCategory(categoryId)
  else localRemoveCategory(categoryId)
}
function addItem(categoryId, label) {
  if (isSharedMode.value) sharedAddItem(categoryId, label)
  else localAddItem(categoryId, label)
}
function toggleItem(categoryId, itemId) {
  if (isSharedMode.value) sharedToggleItem(categoryId, itemId)
  else localToggleItem(categoryId, itemId)
}
function removeItem(categoryId, itemId) {
  if (isSharedMode.value) sharedRemoveItem(categoryId, itemId)
  else localRemoveItem(categoryId, itemId)
}
function updateItemQuantity(categoryId, itemId, quantity) {
  if (isSharedMode.value)
    sharedUpdateItemQuantity(categoryId, itemId, quantity)
  else localUpdateItemQuantity(categoryId, itemId, quantity)
}
function clearAllChecks() {
  if (isSharedMode.value) sharedClearAllChecks()
  else localClearAllChecks()
}

// --- Shared mode: load on mount when route has id + t ---
onMounted(async () => {
  if (!isSharedMode.value || !sharedId.value || !sharedToken.value) return
  sharedLoading.value = true
  sharedError.value = ''
  try {
    const base = import.meta.env.VITE_APP_URL || ''
    const res = await fetch(
      `${base}/.netlify/functions/share-get?id=${encodeURIComponent(sharedId.value)}&t=${encodeURIComponent(sharedToken.value)}`
    )
    const json = await res.json()
    if (!res.ok) {
      if (res.status === 410) sharedError.value = 'This shared link has expired.'
      else sharedError.value = json.error || json.details || 'Could not load shared list.'
      sharedLoading.value = false
      return
    }
    const data = json.data || {}
    sharedCategories.value = data.categories || []
    sharedDestination.value = data.destination || ''
    sharedTripDate.value = data.date || ''
    sharedExpiresAt.value = json.expiresAt || ''
  } catch (e) {
    console.error(e)
    sharedError.value = 'Failed to load shared list.'
  } finally {
    sharedLoading.value = false
  }
})

// Reload shared data when navigating to another shared link
watch(
  () => [route.params.id, route.query.t],
  async ([id, t]) => {
    if (route.name !== 'shared' || !id || !t) return
    sharedLoading.value = true
    sharedError.value = ''
    try {
      const base = import.meta.env.VITE_APP_URL || ''
      const res = await fetch(
        `${base}/.netlify/functions/share-get?id=${encodeURIComponent(id)}&t=${encodeURIComponent(t)}`
      )
      const json = await res.json()
      if (!res.ok) {
        if (res.status === 410) sharedError.value = 'This shared link has expired.'
        else sharedError.value = json.error || json.details || 'Could not load shared list.'
        return
      }
      const data = json.data || {}
      sharedCategories.value = data.categories || []
      sharedDestination.value = data.destination || ''
      sharedTripDate.value = data.date || ''
      sharedExpiresAt.value = json.expiresAt || ''
    } catch (e) {
      console.error(e)
      sharedError.value = 'Failed to load shared list.'
    } finally {
      sharedLoading.value = false
    }
  }
)

// --- Share (local only) ---
const shareLoading = ref(false)
const shareUrl = ref('')
const shareExpiresAt = ref('')
const lastShareUrl = ref('')
try {
  lastShareUrl.value = localStorage.getItem('travel-packing-last-share') || ''
} catch (_) {}

async function createShare() {
  const data = getCurrentTripData()
  if (!data || !localCurrentTrip.value) return
  shareLoading.value = true
  shareUrl.value = ''
  shareExpiresAt.value = ''
  try {
    const base = import.meta.env.VITE_APP_URL || ''
    const trip = localCurrentTrip.value
    if (trip.remoteId && trip.remoteToken) {
      const res = await fetch(`${base}/.netlify/functions/share-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: trip.remoteId,
          t: trip.remoteToken,
          data,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update shared trip')
      shareExpiresAt.value = json.expiresAt || ''
      shareUrl.value = `${base}/#/shared/${trip.remoteId}?t=${trip.remoteToken}`
    } else {
      const res = await fetch(`${base}/.netlify/functions/share-create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      })
      let json = {}
      try {
        json = await res.json()
      } catch (_) {
        throw new Error(`Server error ${res.status}. Check Netlify functions and Supabase.`)
      }
      if (!res.ok) throw new Error(json.details ? `${json.error}: ${json.details}` : (json.error || `Failed to create share (${res.status})`))
      shareUrl.value = json.shareUrl || ''
      shareExpiresAt.value = json.expiresAt || ''
      if (json.id && json.token) {
        setCurrentTripShareInfo(json.id, json.token)
      }
    }
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

const showList = computed(() => {
  if (isSharedMode.value) return !sharedLoading.value && !sharedError.value
  return !!localCurrentTrip.value
})
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-stone-900">Travel Packing List</h1>

      <!-- Local mode: trip selector and subtitle -->
      <template v-if="!isSharedMode">
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
      </template>

      <!-- Shared mode: destination, save status, no trip selector -->
      <template v-else>
        <p v-if="sharedDestination || sharedTripDate" class="text-lg text-stone-700 mt-1">
          {{ sharedDestination || 'Shared list' }}<span v-if="sharedTripDate"> — {{ new Date(sharedTripDate).toLocaleDateString() }}</span>
        </p>
        <p class="text-stone-600 mt-1">Edits are saved to this shared list (last write wins).</p>
        <div class="flex flex-wrap items-center gap-3 mt-2">
          <p v-if="sharedExpiresAt" class="text-sm text-stone-500">
            Link expires: {{ new Date(sharedExpiresAt).toLocaleString() }}
          </p>
          <span v-if="saveStatus === 'saving'" class="text-sm text-amber-600">Saving…</span>
          <span v-else-if="saveStatus === 'saved'" class="text-sm text-emerald-600">Saved</span>
          <span v-else-if="saveStatus === 'error'" class="text-sm text-red-600">Save failed</span>
          <span v-if="showList" class="text-sm text-stone-500">{{ checkedCount }} / {{ totalItems }} packed</span>
          <button
            v-if="showList && checkedCount > 0"
            type="button"
            class="text-emerald-600 hover:underline text-sm"
            @click="clearAllChecks"
          >
            Clear all checks
          </button>
        </div>
      </template>
    </header>

    <!-- Loading / error (shared mode only) -->
    <div v-if="isSharedMode && sharedLoading" class="text-stone-500">Loading…</div>
    <div v-else-if="isSharedMode && sharedError" class="rounded-lg bg-red-50 text-red-800 p-4">
      {{ sharedError }}
    </div>

    <!-- Single list UI for both modes -->
    <CategoryList
      v-else-if="showList"
      :categories="categories"
      @add-category="addCategory"
      @add-item="addItem"
      @toggle-item="toggleItem"
      @remove-item="removeItem"
      @remove-category="removeCategory"
      @update-item-quantity="updateItemQuantity"
    />
    <p v-else-if="!isSharedMode" class="text-stone-500">Add a trip to get started.</p>

    <!-- Share panel (local mode only) -->
    <section v-if="!isSharedMode && localCurrentTrip" class="mt-10 space-y-4">
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
