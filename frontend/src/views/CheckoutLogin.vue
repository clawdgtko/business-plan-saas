<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
    <!-- Background Effects -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-purple-500/20 blur-[150px]"></div>
      <div class="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-fuchsia-500/15 blur-[150px]"></div>
    </div>

    <div class="relative z-10 w-full max-w-md">
      <!-- Progress indicator -->
      <div class="mb-8 flex items-center justify-center gap-2">
        <div class="h-2 w-2 rounded-full bg-green-400"></div>
        <div class="h-0.5 w-8 bg-green-400"></div>
        <div class="h-2 w-2 rounded-full bg-green-400"></div>
        <div class="h-0.5 w-8 bg-white/30"></div>
        <div class="h-2 w-2 rounded-full bg-white/30"></div>
      </div>

      <div class="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        <div class="text-center mb-8">
          <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600">
            <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h1 class="text-2xl font-bold">Presque terminé !</h1>
          <p class="mt-2 text-white/60">
            Connectez-vous pour sauvegarder votre business plan et accéder au paiement sécurisé.
          </p>
        </div>

        <!-- Magic Link Form -->
        <form v-if="!authStore.isAuthenticated" @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-white/80 mb-2">Votre email</label>
            <input 
              v-model="email" 
              type="email" 
              required
              class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="vous@exemple.com"
            >
          </div>

          <button 
            type="submit" 
            :disabled="loading"
            class="w-full rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-600 px-6 py-3 font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            <span v-if="loading">Envoi en cours...</span>
            <span v-else>Recevoir mon lien magique</span>
          </button>
        </form>

        <div v-else class="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <p class="text-sm text-white/80">Redirection vers le paiement sécurisé...</p>
          <div class="mt-3 h-8 w-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>

        <!-- Success State -->
        <div v-if="magicLinkSent" class="mt-6 rounded-xl bg-green-500/20 border border-green-500/30 p-4 text-center">
          <p class="text-green-300 font-medium">✓ Lien envoyé !</p>
          <p class="text-sm text-green-200/70 mt-1">Vérifiez votre boîte mail pour continuer.</p>
        </div>

        <div v-if="checkoutError" class="mt-6 rounded-xl bg-red-500/20 border border-red-500/30 p-4 text-center">
          <p class="text-red-200 text-sm">{{ checkoutError }}</p>
        </div>

        <!-- Info -->
        <div class="mt-6 text-center">
          <p class="text-xs text-white/40">
            🔒 Connexion sécurisée • Pas de mot de passe requis
          </p>
        </div>

        <!-- Back to funnel -->
        <div class="mt-6 text-center">
          <router-link to="/funnel" class="text-sm text-purple-400 hover:text-purple-300">
            ← Retour au funnel
          </router-link>
        </div>
      </div>

      <!-- Summary of what they're buying -->
      <div class="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
        <h3 class="font-semibold mb-3">Récapitulatif</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-white/60">Business Plan généré</span>
            <span class="text-green-400">✓</span>
          </div>
          <div class="flex justify-between">
            <span class="text-white/60">Projections financières</span>
            <span class="text-green-400">✓</span>
          </div>
          <div class="flex justify-between">
            <span class="text-white/60">Export PDF</span>
            <span class="text-white/40">À débloquer</span>
          </div>
        </div>
        <div class="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
          <span class="font-medium">Total</span>
          <span class="text-2xl font-bold">29€<span class="text-sm font-normal text-white/60">/mois</span></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useGuestStore } from '../stores/guest.js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'
const STRIPE_PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID || 'price_premium_monthly'

const authStore = useAuthStore()
const guestStore = useGuestStore()

const email = ref(guestStore.getGuestEmail() || '')
const loading = ref(false)
const magicLinkSent = ref(false)
const checkoutError = ref(null)
const checkoutLoading = ref(false)

async function startCheckout() {
  if (!authStore.isAuthenticated || checkoutLoading.value) return
  
  checkoutLoading.value = true
  checkoutError.value = null
  
  try {
    const res = await fetch(`${API_URL}/api/stripe/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        priceId: STRIPE_PRICE_ID,
        successUrl: `${window.location.origin}/dashboard?success=true`,
        cancelUrl: `${window.location.origin}/checkout?canceled=true`
      })
    })
    
    const data = await res.json()
    
    if (!res.ok) {
      throw new Error(data.error || 'Erreur paiement')
    }
    
    if (data?.url) {
      window.location.href = data.url
      return
    }
    
    throw new Error('URL de paiement manquante')
  } catch (e) {
    checkoutError.value = e.message
  } finally {
    checkoutLoading.value = false
  }
}

async function handleSubmit() {
  loading.value = true
  localStorage.setItem('bp_redirect_after_login', '/checkout')
  
  try {
    // Save email to guest store
    guestStore.setGuestEmail(email.value)
    
    // Request magic link
    await authStore.requestMagicLink(email.value)
    magicLinkSent.value = true
  } catch (e) {
    console.error('Error:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    startCheckout()
  } else if (!localStorage.getItem('bp_redirect_after_login')) {
    localStorage.setItem('bp_redirect_after_login', '/checkout')
  }
})
</script>
