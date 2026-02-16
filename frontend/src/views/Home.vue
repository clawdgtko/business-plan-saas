<template>
  <div class="min-h-screen">
    <!-- Navbar -->
    <nav class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-primary-600">Business Plan SaaS</h1>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/login" class="text-gray-600 hover:text-gray-900">
              Connexion
            </router-link>
            <router-link 
              to="/funnel" 
              class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              Commencer
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <main>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="text-center">
          <h2 class="text-4xl font-bold text-gray-900 sm:text-5xl">
            Créez votre business plan
            <span class="text-primary-600">en minutes</span>
          </h2>
          <p class="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Un outil simple et puissant pour créer des business plans professionnels 
            et obtenir un export PDF en quelques clics.
          </p>
          <div class="mt-8 flex justify-center gap-4">
            <router-link 
              to="/funnel" 
              class="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-primary-700"
            >
              Essai gratuit
            </router-link>
            <a href="#features" class="text-gray-600 px-8 py-3 text-lg hover:text-gray-900">
              En savoir plus
            </a>
          </div>
        </div>

        <!-- Features -->
        <div id="features" class="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-xl font-bold">
              1
            </div>
            <h3 class="mt-4 text-lg font-semibold">Funnel guidé</h3>
            <p class="mt-2 text-gray-600">
              Suivez nos étapes pour compléter chaque section de votre business plan.
            </p>
          </div>
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-xl font-bold">
              2
            </div>
            <h3 class="mt-4 text-lg font-semibold">Édition simple</h3>
            <p class="mt-2 text-gray-600">
              Interface intuitive pour modifier votre business plan à tout moment.
            </p>
          </div>
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-xl font-bold">
              3
            </div>
            <h3 class="mt-4 text-lg font-semibold">Export PDF</h3>
            <p class="mt-2 text-gray-600">
              Téléchargez votre business plan en PDF professionnel en un clic.
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
</script>