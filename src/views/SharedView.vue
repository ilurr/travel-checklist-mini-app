<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import CategoryList from '../components/CategoryList.vue'

const route = useRoute()
const id = computed(() => route.params.id)
const token = computed(() => route.query.t)

const categories = ref([])
const destination = ref('')
const tripDate = ref('')
const loading = ref(true)
const error = ref('')
const expiresAt = ref('')
const saveStatus = ref(null)
let saveTimeout = null
const SAVE_DEBOUNCE_MS = 600

function generateId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 11)}`
}

function getData() {
  const cats = categories.value || []
  const data = {
    destination: destination.value || '',
    date: tripDate.value || '',
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
  if (!id.value || !token.value) return
  saveStatus.value = 'saving'
  try {
    const base = import.meta.env.VITE_APP_URL || ''
    const res = await fetch(`${base}/.netlify/functions/share-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id.value, t: token.value, data: getData() }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || json.details || 'Failed to save')
    expiresAt.value = json.expiresAt || expiresAt.value
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

function addCategory(name) {
  if (!name?.trim()) return
  categories.value.push({
    id: generateId('cat'),
    name: name.trim(),
    items: [],
  })
  scheduleSave()
}

function removeCategory(categoryId) {
  categories.value = categories.value.filter((c) => c.id !== categoryId)
  scheduleSave()
}

function addItem(categoryId, label) {
  if (!label?.trim()) return
  const cat = categories.value.find((c) => c.id === categoryId)
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

function toggleItem(categoryId, itemId) {
  const cat = categories.value.find((c) => c.id === categoryId)
  const item = cat?.items?.find((i) => i.id === itemId)
  if (item) {
    item.checked = !item.checked
    scheduleSave()
  }
}

function removeItem(categoryId, itemId) {
  const cat = categories.value.find((c) => c.id === categoryId)
  if (!cat?.items) return
  cat.items = cat.items.filter((i) => i.id !== itemId)
  scheduleSave()
}

function updateItemQuantity(categoryId, itemId, quantity) {
  const item = categories.value
    ?.find((c) => c.id === categoryId)
    ?.items?.find((i) => i.id === itemId)
  if (!item) return
  item.quantity = Math.max(1, parseInt(quantity, 10) || 1)
  scheduleSave()
}

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
      else error.value = json.error || json.details || 'Could not load shared list.'
      loading.value = false
      return
    }
    const data = json.data || {}
    categories.value = data.categories || []
    destination.value = data.destination || ''
    tripDate.value = data.date || ''
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
      <p v-if="destination" class="text-lg text-stone-700 mt-1">
        {{ destination }}<span v-if="tripDate"> — {{ new Date(tripDate).toLocaleDateString() }}</span>
      </p>
      <p class="text-stone-600 mt-1">Edits are saved to this shared list (last write wins).</p>
      <div class="flex items-center gap-3 mt-2">
        <p v-if="expiresAt" class="text-sm text-stone-500">
          Link expires: {{ expiresAt ? new Date(expiresAt).toLocaleString() : '' }}
        </p>
        <span
          v-if="saveStatus === 'saving'"
          class="text-sm text-amber-600"
        >Saving…</span>
        <span
          v-else-if="saveStatus === 'saved'"
          class="text-sm text-emerald-600"
        >Saved</span>
        <span
          v-else-if="saveStatus === 'error'"
          class="text-sm text-red-600"
        >Save failed</span>
      </div>
    </header>

    <div v-if="loading" class="text-stone-500">Loading…</div>
    <div v-else-if="error" class="rounded-lg bg-red-50 text-red-800 p-4">
      {{ error }}
    </div>
    <CategoryList
      v-else
      :categories="categories"
      :disabled="false"
      @add-category="addCategory"
      @add-item="addItem"
      @toggle-item="toggleItem"
      @remove-item="removeItem"
      @remove-category="removeCategory"
      @update-item-quantity="updateItemQuantity"
    />
  </div>
</template>
