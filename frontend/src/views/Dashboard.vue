<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 class="text-xl font-bold">Mes Business Plans</h1>
        <div class="flex items-center gap-4">
          <span v-if="authStore.user" class="text-sm text-gray-600">
            {{ authStore.user.email }}
          </span>
          <button 
            @click="showCreateModal = true"
            class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            + Nouveau
          </button>
          <button 
            @click="authStore.logout(); $router.push('/')"
            class="text-gray-600 hover:text-gray-900"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading -->
      <div v-if="bpStore.loading" class="text-center py-12">
        <div class="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>

      <!-- Empty state -->
      <div v-else-if="!bpStore.hasPlans" class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <p class="text-gray-500">Vous n'avez pas encore de business plan.</p>
        <button 
          @click="showCreateModal = true"
          class="mt-4 text-primary-600 hover:text-primary-700"
        >
          Créer mon premier →
        </button>
      </div>

      <!-- List -->
      <div v-else class="grid gap-4">
        <div 
          v-for="plan in bpStore.businessPlans" 
          :key="plan.id"
          class="bg-white p-6 rounded-xl shadow-sm flex items-center justify-between"
        >
          <div>
            <h3 class="font-semibold text-lg">{{ plan.name }}</h3>
            <div class="flex items-center gap-4 mt-1">
              <span class="text-sm text-gray-500">
                Progression: {{ plan.progress }}%
              </span>
              <span class="text-sm text-gray-400">
                {{ new Date(plan.updated_at).toLocaleDateString('fr-FR') }}
              </span>
            </div>
            <!-- Progress bar -->
            <div class="w-48 h-2 bg-gray-200 rounded-full mt-2">
              <div 
                class="h-full bg-primary-600 rounded-full transition-all"
                :style="{ width: `${plan.progress}%` }"
              />
            </div>
          </div>
          <div class="flex gap-2">
            <router-link 
              :to="`/funnel/${plan.id}`"
              class="text-primary-600 hover:text-primary-700 px-3 py-1"
            >
              {{ plan.progress > 0 ? 'Continuer' : 'Commencer' }}
            </router-link>
            <button 
              @click="exportPDF(plan.id)"
              class="text-gray-600 hover:text-gray-900 px-3 py-1"
            >
              PDF
            </button>
            <button 
              @click="bpStore.deleteBusinessPlan(plan.id)"
              class="text-red-600 hover:text-red-700 px-3 py-1"
            >
              Suppr
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Create Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">Nouveau Business Plan</h2>
        <input 
          v-model="newPlanName"
          type="text"
          placeholder="Nom du projet"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 mb-4"
          @keyup.enter="createPlan"
        />
        <div class="flex justify-end gap-2">
          <button 
            @click="showCreateModal = false"
            class="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Annuler
          </button>
          <button 
            @click="createPlan"
            :disabled="!newPlanName || bpStore.loading"
            class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {{ bpStore.loading ? 'Création...' : 'Créer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useBusinessPlanStore } from '../stores/businessPlan.js'

const router = useRouter()
const authStore = useAuthStore()
const bpStore = useBusinessPlanStore()

const showCreateModal = ref(false)
const newPlanName = ref('')

onMounted(() => {
  bpStore.fetchBusinessPlans()
})

async function createPlan() {
  if (!newPlanName.value) return
  
  try {
    const plan = await bpStore.createBusinessPlan(newPlanName.value)
    showCreateModal.value = false
    newPlanName.value = ''
    router.push(`/funnel/${plan.id}`)
  } catch (e) {
    // Error handled in store
  }
}

function exportPDF(id) {
  alert('Export PDF à implémenter - Issue #27')
}
</script>