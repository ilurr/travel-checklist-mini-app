<script setup>
import { ref, computed } from 'vue'
import ConfirmModal from './ConfirmModal.vue'

const props = defineProps({
  trips: { type: Array, default: () => [] },
  currentTripId: { type: String, default: '' },
})
const emit = defineEmits(['select', 'add', 'edit', 'remove'])

const showAdd = ref(false)
const newDestination = ref('')
const newDate = ref('')
const editingId = ref(null)
const editDestination = ref('')
const editDate = ref('')
const showTripConfirm = ref(false)
const tripToRemove = ref(null)

const currentTrip = computed(() => props.trips.find((t) => t.id === props.currentTripId))
const tripToRemoveDetails = computed(() => props.trips.find((t) => t.id === tripToRemove.value))
const tripConfirmMessage = computed(() =>
  tripToRemoveDetails.value
    ? `Delete "${tripToRemoveDetails.value.destination}" and its entire packing list? This cannot be undone.`
    : ''
)

const today = new Date().toISOString().slice(0, 10)

function openAdd() {
  newDestination.value = ''
  newDate.value = today
  showAdd.value = true
}

function submitAdd() {
  const dest = newDestination.value.trim() || 'New trip'
  emit('add', dest, newDate.value || today)
  showAdd.value = false
}

function openEdit(trip) {
  editingId.value = trip.id
  editDestination.value = trip.destination
  editDate.value = trip.date || today
}

function submitEdit() {
  if (!editingId.value) return
  emit('edit', editingId.value, { destination: editDestination.value.trim(), date: editDate.value })
  editingId.value = null
}

function cancelEdit() {
  editingId.value = null
}

function requestRemoveTrip() {
  if (currentTrip.value) {
    tripToRemove.value = currentTrip.value.id
    showTripConfirm.value = true
  }
}

function confirmRemoveTrip() {
  if (tripToRemove.value) {
    emit('remove', tripToRemove.value)
    tripToRemove.value = null
  }
  showTripConfirm.value = false
}

function cancelTripConfirm() {
  showTripConfirm.value = false
  tripToRemove.value = null
}

function formatDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' })
  } catch {
    return iso
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-2">
      <label class="text-sm font-medium text-stone-600">Trip:</label>
      <select
        :value="currentTripId"
        class="input-base max-w-xs"
        @change="$emit('select', ($event.target).value)"
      >
        <option v-for="t in trips" :key="t.id" :value="t.id">
          {{ t.destination }} — {{ formatDate(t.date) }}
        </option>
      </select>
      <button type="button" class="btn-secondary text-sm" @click="openAdd">
        + Add trip
      </button>
      <button
        v-if="currentTrip"
        type="button"
        class="btn-secondary text-sm"
        @click="openEdit(currentTrip)"
      >
        Edit trip
      </button>
      <button
        v-if="currentTrip && trips.length > 1"
        type="button"
        class="text-red-600 hover:underline text-sm"
        @click="requestRemoveTrip"
      >
        Delete trip
      </button>
    </div>

    <div v-if="showAdd" class="p-4 bg-white rounded-xl border border-stone-200 space-y-3">
      <h4 class="font-medium text-stone-800">New trip</h4>
      <input
        v-model="newDestination"
        type="text"
        class="input-base"
        placeholder="Destination (e.g. Travel to Mecca)"
      />
      <input v-model="newDate" type="date" class="input-base max-w-xs" />
      <div class="flex gap-2">
        <button type="button" class="btn-primary" @click="submitAdd">Add</button>
        <button type="button" class="btn-secondary" @click="showAdd = false">Cancel</button>
      </div>
    </div>

    <div v-if="editingId" class="p-4 bg-white rounded-xl border border-stone-200 space-y-3">
      <h4 class="font-medium text-stone-800">Edit trip</h4>
      <input
        v-model="editDestination"
        type="text"
        class="input-base"
        placeholder="Destination"
      />
      <input v-model="editDate" type="date" class="input-base max-w-xs" />
      <div class="flex gap-2">
        <button type="button" class="btn-primary" @click="submitEdit">Save</button>
        <button type="button" class="btn-secondary" @click="cancelEdit">Cancel</button>
      </div>
    </div>
    <ConfirmModal
      :show="showTripConfirm"
      title="Delete trip"
      :message="tripConfirmMessage"
      confirm-label="Delete trip"
      @confirm="confirmRemoveTrip"
      @cancel="cancelTripConfirm"
    />
  </div>
</template>
