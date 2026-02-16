<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Progress Header -->
    <header class="bg-white border-b sticky top-0 z-10">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-lg font-semibold">{{ currentStep.title }}</h1>
          <span class="text-sm text-gray-500">
            Étape {{ currentStepIndex + 1 }} / {{ steps.length }}
          </span>
        </div>
        <div class="h-2 bg-gray-200 rounded-full">
          <div 
            class="h-full bg-primary-600 rounded-full transition-all"
            :style="{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }"
          />
        </div>
      </div>
    </header>

    <!-- Form Content -->
    <main class="max-w-4xl mx-auto px-4 py-8">
      <div class="bg-white rounded-xl shadow-sm p-8">
        <!-- Step: Business Info -->
        <div v-if="currentStep.id === 'business-info'" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Nom de l'entreprise
            </label>
            <input 
              v-model="formData.businessName"
              type="text"
              class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Ma Super Entreprise"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea 
              v-model="formData.description"
              rows="4"
              class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Décrivez votre activité..."
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Secteur d'activité
            </label>
            <select 
              v-model="formData.sector"
              class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="">Sélectionnez...</option>
              <option value="tech">Technologie / SaaS</option>
              <option value="ecommerce">E-commerce</option>
              <option value="services">Services</option>
              <option value="industry">Industrie</option>
              <option value="other">Autre</option>
            </select>
          </div>
        </div>

        <!-- Step: Market -->
        <div v-else-if="currentStep.id === 'market'" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Taille du marché (TAM)
            </label>
            <input 
              v-model="formData.marketSize"
              type="text"
              class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Ex: 10 milliards €"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Concurrents principaux
            </label>
            <textarea 
              v-model="formData.competitors"
              rows="4"
              class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Listez vos principaux concurrents..."
            />
          </div>
        </div>

        <!-- Step: Financial -->
        <div v-else-if="currentStep.id === 'financial'" class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">
                CA Année 1
              </label>
              <input 
                v-model="formData.revenueYear1"
                type="number"
                class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="0"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">
                CA Année 3
              </label>
              <input 
                v-model="formData.revenueYear3"
                type="number"
                class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Besoin en financement
            </label>
            <input 
              v-model="formData.fundingNeeded"
              type="number"
              class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="0"
            />
          </div>
        </div>

        <!-- Step: Review -->
        <div v-else-if="currentStep.id === 'review'" class="space-y-6">
          <h3 class="font-semibold">Récapitulatif</h3>
          <div class="bg-gray-50 p-4 rounded-lg">
            <pre class="text-sm">{{ JSON.stringify(formData, null, 2) }}</pre>
          </div>
          <div class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p class="text-sm text-yellow-800">
              🎉 Vous avez complété toutes les étapes ! 
              Passez à l'abonnement pour télécharger votre PDF.
            </p>
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex justify-between mt-8 pt-6 border-t">
          <button 
            v-if="currentStepIndex > 0"
            @click="prevStep"
            class="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            ← Précédent
          </button>
          <div v-else />
          
          <button 
            v-if="currentStepIndex < steps.length - 1"
            @click="nextStep"
            class="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Suivant →
          </button>
          
          <button 
            v-else
            @click="goToCheckout"
            class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Payer et télécharger →
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGuestStore } from '../stores/guest.js'

const route = useRoute()
const router = useRouter()
const guestStore = useGuestStore()

const steps = [
  { id: 'business-info', title: 'Informations de l\'entreprise' },
  { id: 'market', title: 'Analyse de marché' },
  { id: 'financial', title: 'Prévisions financières' },
  { id: 'review', title: 'Récapitulatif' }
]

const currentStepIndex = ref(0)
const currentStep = computed(() => steps[currentStepIndex.value])

const formData = reactive({
  businessName: '',
  description: '',
  sector: '',
  marketSize: '',
  competitors: '',
  revenueYear1: '',
  revenueYear3: '',
  fundingNeeded: ''
})

function nextStep() {
  if (currentStepIndex.value < steps.length - 1) {
    guestStore.saveFunnelData({ ...formData })
    currentStepIndex.value++
  }
}

function prevStep() {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--
  }
}

function goToCheckout() {
  guestStore.saveFunnelData({ ...formData })
  router.push('/checkout')
}

// Load existing data if editing
onMounted(async () => {
  if (route.params.id) {
    // TODO: Load business plan data
    console.log('Loading BP:', route.params.id)
  }
  
  if (guestStore.hasFunnelData) {
    Object.assign(formData, guestStore.getFunnelData())
  }
})
</script>
