import { ref, computed, watch } from 'vue'
import defaultData from '../data/defaultPackingList.json'

const STORAGE_KEY = 'travel-packing-local'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.categories?.length) return parsed
    }
  } catch (_) {}
  return {
    templateId: defaultData.templateId,
    templateName: defaultData.templateName,
    categories: JSON.parse(JSON.stringify(defaultData.categories)),
  }
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (_) {}
}

function generateId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 11)}`
}

export function usePackingList() {
  const state = ref(loadFromStorage())

  const categories = computed(() => state.value.categories || [])

  const totalItems = computed(() =>
    categories.value.reduce((sum, cat) => sum + (cat.items?.length || 0), 0)
  )
  const checkedCount = computed(() =>
    categories.value.reduce(
      (sum, cat) => sum + (cat.items?.filter((i) => i.checked)?.length || 0),
      0
    )
  )

  watch(
    state,
    (v) => saveToStorage(v),
    { deep: true }
  )

  function addCategory(name) {
    if (!name?.trim()) return
    const id = generateId('cat')
    state.value.categories.push({
      id,
      name: name.trim(),
      items: [],
    })
  }

  function removeCategory(categoryId) {
    state.value.categories = state.value.categories.filter((c) => c.id !== categoryId)
  }

  function addItem(categoryId, label) {
    if (!label?.trim()) return
    const cat = state.value.categories.find((c) => c.id === categoryId)
    if (!cat) return
    if (!cat.items) cat.items = []
    cat.items.push({
      id: generateId('item'),
      label: label.trim(),
      checked: false,
    })
  }

  function toggleItem(categoryId, itemId) {
    const cat = state.value.categories.find((c) => c.id === categoryId)
    const item = cat?.items?.find((i) => i.id === itemId)
    if (item) item.checked = !item.checked
  }

  function removeItem(categoryId, itemId) {
    const cat = state.value.categories.find((c) => c.id === categoryId)
    if (!cat?.items) return
    cat.items = cat.items.filter((i) => i.id !== itemId)
  }

  function clearAllChecks() {
    state.value.categories.forEach((cat) => {
      (cat.items || []).forEach((i) => (i.checked = false))
    })
  }

  function setData(data) {
    if (data?.categories?.length) state.value = { ...data }
  }

  function getData() {
    return {
      templateId: state.value.templateId,
      templateName: state.value.templateName,
      categories: JSON.parse(JSON.stringify(state.value.categories)),
    }
  }

  return {
    state,
    categories,
    totalItems,
    checkedCount,
    addCategory,
    removeCategory,
    addItem,
    toggleItem,
    removeItem,
    clearAllChecks,
    setData,
    getData,
  }
}
