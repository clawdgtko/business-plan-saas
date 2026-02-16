<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center space-x-4">
            <h1 class="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <span class="px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
              {{ stats?.users?.total || 0 }} utilisateurs
            </span>
          </div>
          <div class="flex items-center space-x-4">
            <button
              @click="fetchStats"
              :disabled="loading"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Rafraîchir
            </button>
            <router-link to="/dashboard" class="text-sm text-gray-500 hover:text-gray-700">
              Retour au dashboard
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Error Alert -->
      <div v-if="error" class="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">{{ error }}</h3>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading && !stats" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>

      <template v-else-if="stats">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Total Users -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="bg-indigo-500 rounded-md p-3">
                    <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Utilisateurs totaux</dt>
                    <dd class="text-3xl font-semibold text-gray-900">{{ formatNumber(stats.users.total) }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <!-- Paying Users -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="bg-green-500 rounded-md p-3">
                    <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Clients payants</dt>
                    <dd class="text-3xl font-semibold text-gray-900">{{ formatNumber(stats.funnel.payingUsers) }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <!-- MRR -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="bg-blue-500 rounded-md p-3">
                    <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">MRR</dt>
                    <dd class="text-3xl font-semibold text-gray-900">€{{ formatNumber(stats.subscriptions.mrr) }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <!-- Conversion Rate -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="bg-purple-500 rounded-md p-3">
                    <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Taux de conversion</dt>
                    <dd class="text-3xl font-semibold text-gray-900">{{ stats.funnel.conversionRate }}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts & Tables Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <!-- User Growth Chart -->
          <div class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Croissance des utilisateurs</h3>
            <div class="h-64 flex items-end justify-between space-x-2">
              <div 
                v-for="(day, index) in userGrowthData" 
                :key="index"
                class="flex-1 flex flex-col items-center"
              >
                <div 
                  class="w-full bg-indigo-500 rounded-t hover:bg-indigo-600 transition-colors relative group"
                  :style="{ height: `${Math.max(day.count * maxBarHeight, 4)}px` }"
                >
                  <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                    {{ day.count }} utilisateurs
                  </div>
                </div>
                <span class="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left">{{ formatDate(day.date) }}</span>
              </div>
            </div>
          </div>

          <!-- Funnel -->
          <div class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Funnel de conversion</h3>
            <div class="space-y-4">
              <div class="relative">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium text-gray-700">Inscriptions</span>
                  <span class="text-sm text-gray-500">{{ formatNumber(stats.funnel.totalUsers) }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-8">
                  <div class="bg-indigo-500 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium" style="width: 100%">
                    100%
                  </div>
                </div>
              </div>
              
              <div class="relative">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium text-gray-700">Business Plans créés</span>
                  <span class="text-sm text-gray-500">{{ formatNumber(stats.funnel.usersWithBusinessPlan) }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-8">
                  <div 
                    class="bg-blue-500 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    :style="{ width: `${Math.min((stats.funnel.usersWithBusinessPlan / Math.max(stats.funnel.totalUsers, 1)) * 100, 100)}%` }"
                  >
                    {{ Math.round((stats.funnel.usersWithBusinessPlan / Math.max(stats.funnel.totalUsers, 1)) * 100) }}%
                  </div>
                </div>
              </div>
              
              <div class="relative">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium text-gray-700">Clients payants</span>
                  <span class="text-sm text-gray-500">{{ formatNumber(stats.funnel.payingUsers) }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-8">
                  <div 
                    class="bg-green-500 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    :style="{ width: `${Math.min((stats.funnel.payingUsers / Math.max(stats.funnel.totalUsers, 1)) * 100 * 5, 100)}%` }"
                  >
                    {{ stats.funnel.conversionRate }}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Subscriptions by Plan -->
        <div class="bg-white shadow rounded-lg p-6 mb-8">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Répartition des plans</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div 
              v-for="plan in stats.subscriptions.byPlan" 
              :key="plan.plan"
              class="border rounded-lg p-4"
              :class="getPlanColorClass(plan.plan)"
            >
              <div class="text-sm font-medium capitalize">{{ plan.plan }}</div>
              <div class="text-2xl font-bold mt-1">{{ plan.count }}</div>
              <div class="text-xs opacity-75 mt-1">{{ plan.status }}</div>
            </div>
          </div>
        </div>

        <!-- Users Table -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <h3 class="text-lg font-medium text-gray-900">Liste des utilisateurs</h3>
              
              <!-- Filters -->
              <div class="flex flex-wrap items-center space-x-2">
                <input
                  v-model="filters.search"
                  type="text"
                  placeholder="Rechercher..."
                  class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  @keyup.enter="fetchUsers"
                />
                <select
                  v-model="filters.plan"
                  class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  @change="fetchUsers"
                >
                  <option value="">Tous les plans</option>
                  <option value="free">Free</option>
                  <option value="starter">Starter</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
                <button
                  @click="fetchUsers"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
                >
                  Filtrer
                </button>
              </div>
            </div>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BPs</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inscription</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.email }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getPlanBadgeClass(user.subscriptionPlan || 'free')">
                      {{ user.subscriptionPlan || 'free' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusBadgeClass(user.subscriptionStatus || 'inactive')">
                      {{ user.subscriptionStatus || 'inactive' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ user.businessPlansCount }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDateTime(user.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      @click="viewUser(user.id)"
                      class="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Voir
                    </button>
                    <button
                      @click="deleteUser(user.id)"
                      class="text-red-600 hover:text-red-900"
                    >
                      Suppr.
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div class="text-sm text-gray-500">
              Affichage de {{ (pagination.page - 1) * pagination.limit + 1 }} à 
              {{ Math.min(pagination.page * pagination.limit, pagination.total) }} 
              sur {{ pagination.total }} utilisateurs
            </div>
            <div class="flex space-x-2">
              <button
                @click="prevPage"
                :disabled="pagination.page <= 1"
                class="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Précédent
              </button>
              <span class="px-3 py-1 text-sm text-gray-700">
                Page {{ pagination.page }} / {{ pagination.totalPages }}
              </span>
              <button
                @click="nextPage"
                :disabled="pagination.page >= pagination.totalPages"
                class="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const stats = ref(null)
const users = ref([])
const filters = ref({
  search: '',
  plan: '',
  dateFrom: '',
  dateTo: ''
})
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
})

const maxBarHeight = computed(() => {
  if (!stats.value?.users?.byDate?.length) return 0
  const max = Math.max(...stats.value.users.byDate.map(d => d.count))
  return max > 0 ? 200 / max : 0
})

const userGrowthData = computed(() => {
  if (!stats.value?.users?.byDate) return []
  return stats.value.users.byDate.slice(-14) // Last 14 days
})

function formatNumber(num) {
  if (num === undefined || num === null) return '0'
  return new Intl.NumberFormat('fr-FR').format(num)
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

function formatDateTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: '2-digit',
    year: '2-digit'
  })
}

function getPlanColorClass(plan) {
  const classes = {
    free: 'border-gray-200 bg-gray-50 text-gray-700',
    starter: 'border-blue-200 bg-blue-50 text-blue-700',
    professional: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    enterprise: 'border-purple-200 bg-purple-50 text-purple-700'
  }
  return classes[plan] || classes.free
}

function getPlanBadgeClass(plan) {
  const classes = {
    free: 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800',
    starter: 'px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800',
    professional: 'px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800',
    enterprise: 'px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800'
  }
  return classes[plan] || classes.free
}

function getStatusBadgeClass(status) {
  const classes = {
    active: 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800',
    inactive: 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800',
    cancelled: 'px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800',
    past_due: 'px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800'
  }
  return classes[status] || classes.inactive
}

async function fetchStats() {
  loading.value = true
  error.value = ''
  
  try {
    const token = authStore.token
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Accès interdit - Vous devez être admin')
      }
      throw new Error('Erreur lors de la récupération des statistiques')
    }
    
    const data = await response.json()
    if (data.success) {
      stats.value = data.stats
    }
  } catch (err) {
    error.value = err.message
    if (err.message.includes('admin')) {
      setTimeout(() => router.push('/dashboard'), 2000)
    }
  } finally {
    loading.value = false
  }
}

async function fetchUsers() {
  loading.value = true
  
  try {
    const token = authStore.token
    const params = new URLSearchParams({
      page: pagination.value.page,
      limit: pagination.value.limit,
      ...(filters.value.search && { search: filters.value.search }),
      ...(filters.value.plan && { plan: filters.value.plan })
    })
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des utilisateurs')
    }
    
    const data = await response.json()
    if (data.success) {
      users.value = data.users
      pagination.value = data.pagination
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

function prevPage() {
  if (pagination.value.page > 1) {
    pagination.value.page--
    fetchUsers()
  }
}

function nextPage() {
  if (pagination.value.page < pagination.value.totalPages) {
    pagination.value.page++
    fetchUsers()
  }
}

function viewUser(userId) {
  router.push(`/admin/users/${userId}`)
}

async function deleteUser(userId) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
    return
  }
  
  try {
    const token = authStore.token
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression')
    }
    
    await fetchUsers()
    await fetchStats()
  } catch (err) {
    error.value = err.message
  }
}

onMounted(() => {
  fetchStats()
  fetchUsers()
})
</script>
