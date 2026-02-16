<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 class="text-xl font-bold">Mes Business Plans</h1>
        <router-link 
          to="/funnel"
          class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          + Nouveau
        </router-link>
      </div>
    </header>

    <!-- Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="businessPlans.length === 0" class="text-center py-12">
        <p class="text-gray-500">Vous n'avez pas encore de business plan.</p>
        <router-link 
          to="/funnel"
          class="mt-4 inline-block text-primary-600 hover:text-primary-700"
        >
          Créer mon premier →
        </router-link>
      </div>

      <div v-else class="grid gap-4">
        <div 
          v-for="plan in businessPlans" 
          :key="plan.id"
          class="bg-white p-6 rounded-xl shadow-sm flex items-center justify-between"
        >
          <div>
            <h3 class="font-semibold text-lg">{{ plan.name }}</h3>
            <p class="text-sm text-gray-500">
              Progression: {{ plan.progress }}% • {{ plan.status }}
            </p>
          </div>
          <div class="flex gap-2">
            <router-link 
              :to="`/funnel/${plan.id}`"
              class="text-primary-600 hover:text-primary-700 px-3 py-1"
            >
              Modifier
            </router-link>
            <button 
              @click="exportPDF(plan.id)"
              class="text-gray-600 hover:text-gray-900 px-3 py-1"
            >
              PDF
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const businessPlans = ref([])

onMounted(async () => {
  // TODO: Fetch from API
  businessPlans.value = [
    { id: 'bp-1', name: 'Mon Startup', progress: 45, status: 'draft' }
  ]
})

function exportPDF(id) {
  // TODO: Call export API
  alert('Export PDF: ' + id)
}
</script>