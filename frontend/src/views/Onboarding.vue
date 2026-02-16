<template>
  <div class="min-h-screen relative overflow-hidden bg-[#0b0b17] text-white">
    <div class="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-purple-500/30 blur-[120px]"></div>
    <div class="absolute top-40 -right-24 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-[140px]"></div>
    <div class="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-amber-400/20 blur-[120px]"></div>

    <div class="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-16">
      <div class="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div class="flex flex-col justify-center">
          <div class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/70">
            Onboarding SaaS
          </div>
          <h1 class="mt-6 text-4xl font-semibold leading-tight sm:text-5xl">
            Donnez du contexte a votre business plan.
          </h1>
          <p class="mt-4 text-base text-white/70 sm:text-lg">
            Quelques informations suffisent pour personnaliser vos recommandations et accelerer la generation du plan.
          </p>

          <div class="mt-8 grid gap-4 sm:grid-cols-2">
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-sm font-medium text-white/90">Personnalisation intelligente</p>
              <p class="mt-2 text-sm text-white/60">
                Des hypotheses finance et go-to-market adaptees a votre profil.
              </p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-sm font-medium text-white/90">Gain de temps</p>
              <p class="mt-2 text-sm text-white/60">
                Un plan structure en moins de 10 minutes.
              </p>
            </div>
          </div>

          <div class="mt-10 flex items-center gap-3 text-sm text-white/60">
            <div class="h-2 w-16 rounded-full bg-white/10">
              <div class="h-2 w-full rounded-full bg-gradient-to-r from-purple-400 via-fuchsia-400 to-amber-400"></div>
            </div>
            Etape 1 sur 1
          </div>
        </div>

        <div class="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-semibold">Votre persona</h2>
              <p class="mt-1 text-sm text-white/60">Cela prend moins d'une minute.</p>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <svg class="h-6 w-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.232 5.232a3 3 0 11-4.243 4.243 3 3 0 014.243-4.243z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 20a6 6 0 0112 0"></path>
              </svg>
            </div>
          </div>

          <form class="mt-6 space-y-5" @submit.prevent="submitOnboarding">
            <div>
              <label class="text-sm font-medium text-white/80">Nom complet</label>
              <input
                v-model="form.name"
                type="text"
                required
                autocomplete="name"
                placeholder="Camille Durand"
                class="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 shadow-inner shadow-black/20 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40"
              />
            </div>

            <div>
              <label class="text-sm font-medium text-white/80">Entreprise</label>
              <input
                v-model="form.company"
                type="text"
                required
                autocomplete="organization"
                placeholder="NovaCloud"
                class="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 shadow-inner shadow-black/20 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40"
              />
            </div>

            <div>
              <label class="text-sm font-medium text-white/80">Objectif principal</label>
              <textarea
                v-model="form.goal"
                rows="4"
                required
                placeholder="Ex: Structurer notre levee de fonds et clarifier notre strategie de croissance."
                class="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 shadow-inner shadow-black/20 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40"
              ></textarea>
            </div>

            <button
              type="submit"
              :disabled="isSubmitting || !isValid"
              class="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_20px_40px_-20px_rgba(245,158,11,0.6)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>{{ isSubmitting ? 'Enregistrement...' : 'Acceder au dashboard' }}</span>
              <svg class="h-4 w-4 transition group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </button>
          </form>

          <p v-if="submitError" class="mt-4 text-sm text-red-300">
            {{ submitError }}
          </p>

          <p class="mt-4 text-xs text-white/50">
            Vos informations restent privees et servent uniquement a personnaliser votre experience.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  name: '',
  company: '',
  goal: ''
})

const isSubmitting = ref(false)
const submitError = ref(null)

const isValid = computed(() => {
  return !!(form.name.trim() && form.company.trim() && form.goal.trim())
})

async function submitOnboarding() {
  if (!isValid.value || isSubmitting.value) return

  isSubmitting.value = true
  submitError.value = null
  
  try {
    const data = await authStore.completeOnboarding({
      name: form.name.trim(),
      company: form.company.trim(),
      goal: form.goal.trim()
    })
    
    if (data?.businessPlanId) {
      router.push(`/funnel/${data.businessPlanId}`)
    } else {
      router.push('/dashboard')
    }
  } catch (e) {
    submitError.value = authStore.error || e.message
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    localStorage.setItem('bp_redirect_after_login', '/onboarding')
    router.replace('/login')
    return
  }
  
  try {
    await authStore.fetchOnboardingStatus()
  } catch (e) {
    // Ignore status errors for now
  }
  
  if (authStore.onboardingCompleted) {
    router.replace('/dashboard')
  }
})
</script>
