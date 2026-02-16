<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
    <!-- Background Effects -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-purple-500/20 blur-[150px]"></div>
      <div class="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-fuchsia-500/15 blur-[150px]"></div>
      <div class="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-blue-500/15 blur-[150px]"></div>
    </div>

    <!-- Navigation -->
    <nav class="relative z-10 border-b border-white/10 backdrop-blur-lg">
      <div class="mx-auto max-w-7xl px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <span class="text-xl font-bold">Business Plan SaaS</span>
          </div>
          <div class="flex items-center gap-4">
            <router-link to="/login" class="text-sm text-white/70 hover:text-white transition">
              Connexion
            </router-link>
            <router-link to="/funnel" class="group relative rounded-lg bg-gradient-to-r from-amber-400 via-orange-500 to-fuchsia-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all duration-300 overflow-hidden hover:shadow-orange-500/30 hover:-translate-y-0.5">
              <span class="relative flex items-center gap-1.5">
                Commencer
                <svg class="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative z-10 pt-20 pb-32">
      <div class="mx-auto max-w-7xl px-6 text-center">
        <div class="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm text-amber-300 mb-8">
          <span class="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
          🔥 Offre de lancement : -50% sur l'abonnement annuel
        </div>

        <h1 class="mx-auto max-w-4xl text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl">
          Votre business plan professionnel <span class="bg-gradient-to-r from-amber-400 via-orange-400 to-fuchsia-400 bg-clip-text text-transparent">en 5 minutes</span>, pas en 5 jours
        </h1>

        <p class="mx-auto mt-6 max-w-2xl text-lg text-white/60">
          Propulsé par IA. Conçu par des experts. Approuvé par les banques. Obtenez un PDF prêt à présenter en quelques clics.
        </p>
        
        <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <router-link to="/funnel" class="group relative w-full sm:w-auto rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-fuchsia-500 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-orange-500/30 transition-all duration-300 overflow-hidden hover:shadow-2xl hover:shadow-orange-500/40 hover:-translate-y-1">
            <!-- Shimmer effect -->
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <span class="relative flex items-center justify-center gap-2">
              🚀 Créer mon business plan
              <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </router-link>
          <a href="#features" class="w-full sm:w-auto rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-lg font-medium hover:bg-white/10 hover:border-white/30 transition-all duration-300">
            Voir comment ça marche
          </a>
        </div>

        <!-- Social Proof -->
        <div class="mt-12 flex items-center justify-center gap-8 text-white/40">
          <div class="flex -space-x-3">
            <div class="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-slate-900"></div>
            <div class="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-slate-900"></div>
            <div class="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-slate-900"></div>
            <div class="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-slate-900"></div>
          </div>
          <p class="text-sm">Rejoint par <strong class="text-white">500+</strong> entrepreneurs</p>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="relative z-10 border-t border-white/10 bg-white/5 py-24">
      <div class="mx-auto max-w-7xl px-6">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold sm:text-4xl">Tout ce qu'il faut pour convaincre</h2>
          <p class="mt-4 text-white/60">Un business plan complet, de l'analyse de marché aux projections financières</p>
        </div>

        <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <!-- Feature 1 -->
          <div class="rounded-2xl border border-white/10 bg-white/5 p-8 hover:bg-white/10 transition">
            <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold">Génération IA rapide</h3>
            <p class="mt-2 text-white/60">Rédaction automatique basée sur votre secteur et votre modèle économique.</p>
          </div>

          <!-- Feature 2 -->
          <div class="rounded-2xl border border-white/10 bg-white/5 p-8 hover:bg-white/10 transition">
            <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold">Projections financières</h3>
            <p class="mt-2 text-white/60">Tableaux de bord et prévisions sur 3 ans générés automatiquement.</p>
          </div>

          <!-- Feature 3 -->
          <div class="rounded-2xl border border-white/10 bg-white/5 p-8 hover:bg-white/10 transition">
            <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold">Analyse de marché</h3>
            <p class="mt-2 text-white/60">Données sectorielles et études de marché intégrées.</p>
          </div>

          <!-- Feature 4 -->
          <div class="rounded-2xl border border-white/10 bg-white/5 p-8 hover:bg-white/10 transition">
            <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold">Export PDF professionnel</h3>
            <p class="mt-2 text-white/60">Téléchargez votre business plan formaté prêt à présenter.</p>
          </div>

          <!-- Feature 5 -->
          <div class="rounded-2xl border border-white/10 bg-white/5 p-8 hover:bg-white/10 transition">
            <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold">Multi-utilisateurs</h3>
            <p class="mt-2 text-white/60">Collaborez avec votre équipe en temps réel.</p>
          </div>

          <!-- Feature 6 -->
          <div class="rounded-2xl border border-white/10 bg-white/5 p-8 hover:bg-white/10 transition">
            <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold">Conseils personnalisés</h3>
            <p class="mt-2 text-white/60">Recommandations IA pour améliorer votre stratégie.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="relative z-10 py-24">
      <div class="mx-auto max-w-4xl px-6 text-center">
        <div class="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300 mb-6">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Plus de 500 entrepreneurs ont déjà créé leur plan
        </div>
        <h2 class="text-3xl font-bold sm:text-4xl">Prêt à convaincre les investisseurs ?</h2>
        <p class="mt-4 text-lg text-white/60">En 5 minutes, obtenez un business plan professionnel qui fait la différence.</p>
        <div class="mt-10">
          <router-link to="/funnel" class="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-fuchsia-500 px-10 py-5 text-lg font-bold text-white shadow-xl shadow-orange-500/30 transition-all duration-300 overflow-hidden hover:shadow-2xl hover:shadow-orange-500/40 hover:-translate-y-1">
            <!-- Shimmer effect -->
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <span class="relative flex items-center gap-2">
              Commencer maintenant — 2,90€
              <svg class="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </span>
          </router-link>
        </div>
        <div class="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-white/40">
          <span class="flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Généré en 2 min
          </span>
          <span>•</span>
          <span class="flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Garantie 30 jours
          </span>
          <span>•</span>
          <span class="flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Sans engagement
          </span>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="relative z-10 border-t border-white/10 py-12">
      <div class="mx-auto max-w-7xl px-6">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600">
              <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <span class="font-semibold">Business Plan SaaS</span>
          </div>
          <p class="text-sm text-white/40">© 2026 Business Plan SaaS. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
// Landing page - No specific logic needed
</script>
