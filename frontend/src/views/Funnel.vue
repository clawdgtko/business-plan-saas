<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <!-- Progress Header -->
    <header class="bg-white/5 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
      <div class="max-w-4xl mx-auto px-4 py-3">
        <!-- Top row: Back + Title + Save indicator -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <button 
              v-if="currentStepIndex > 0"
              @click="prevStep"
              class="group p-2 rounded-xl hover:bg-white/10 transition-all duration-200 text-white/60 hover:text-white"
              title="Retour"
            >
              <svg class="w-5 h-5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 class="text-lg font-semibold text-white">{{ currentStep.title }}</h1>
              <p class="text-xs text-white/50">Étape {{ currentStepIndex + 1 }} sur {{ steps.length }}</p>
            </div>
          </div>
          
          <div class="flex items-center gap-4">
            <!-- Auto-save indicator -->
            <AutoSaveIndicator 
              :status="saveStatus" 
              :last-saved="lastSaved"
            />
          </div>
        </div>
        
        <!-- Enhanced Progress bar -->
        <div class="relative">
          <!-- Step indicators -->
          <div class="flex justify-between mb-2 px-1">
            <button
              v-for="(step, index) in steps"
              :key="step.id"
              @click="goToStep(index)"
              :disabled="index > currentStepIndex && !canNavigateToStep(index)"
              class="flex flex-col items-center gap-1 transition-all duration-300 group"
              :class="{
                'cursor-pointer': index <= currentStepIndex || canNavigateToStep(index),
                'cursor-not-allowed opacity-40': index > currentStepIndex && !canNavigateToStep(index)
              }"
            >
              <div 
                class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                :class="getStepIndicatorClass(index)"
              >
                <svg v-if="isStepCompleted(index)" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
                <span v-else>{{ index + 1 }}</span>
              </div>
            </button>
          </div>
          
          <!-- Progress bar track -->
          <div class="relative h-2 bg-white/10 rounded-full overflow-hidden">
            <!-- Animated gradient progress -->
            <div 
              class="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 via-orange-500 to-fuchsia-500 rounded-full transition-all duration-700 ease-out"
              :style="{ width: `${((currentStepIndex) / (steps.length - 1)) * 100}%` }"
            >
              <!-- Shimmer effect -->
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
            
            <!-- Current position indicator -->
            <div 
              class="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg shadow-orange-500/50 transition-all duration-500"
              :style="{ left: `calc(${((currentStepIndex) / (steps.length - 1)) * 100}% - 8px)` }"
            >
              <div class="absolute inset-0 bg-white rounded-full animate-ping opacity-30"></div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Form Content -->
    <main class="max-w-4xl mx-auto px-4 py-8 pb-32">
      <div class="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-2xl p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)]">
        
        <StepTransition :direction="transitionDirection">
          <!-- Step: Business Info -->
          <div v-if="currentStep.id === 'business-info'" key="business-info" class="space-y-6">
            <div class="text-center mb-8">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 mb-4 ring-1 ring-amber-400/30 animate-pulse-slow">
                <svg class="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-white">Parlez-moi de votre projet 🚀</h2>
              <p class="text-white/60 mt-2">Plus je vous connais, mieux je peux vous aider. Commençons par l'essentiel.</p>
            </div>
            
            <div class="space-y-5">
              <!-- Business Name Input -->
              <div class="group/input">
                <label class="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                  <span>Quel est le nom de votre entreprise ?</span>
                  <span class="text-fuchsia-400">*</span>
                </label>
                <div class="relative">
                  <input 
                    v-model="formData.businessName"
                    type="text"
                    :class="[
                      'w-full rounded-xl border bg-white/5 px-4 py-3.5 text-white placeholder:text-white/30 transition-all duration-300',
                      'focus:outline-none focus:ring-2',
                      validationErrors.businessName 
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-white/10 focus:border-amber-400 focus:ring-amber-400/30 hover:border-white/20'
                    ]"
                    placeholder="Ex: EcoDelivery, TechFlow, BioSaveurs..."
                    @blur="validateField('businessName')"
                    @input="onFieldInput('businessName')"
                  />
                  <!-- Success indicator -->
                  <div v-if="formData.businessName && !validationErrors.businessName" class="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 animate-bounce-in">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <p v-if="validationErrors.businessName" class="mt-1.5 text-sm text-red-400 flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ validationErrors.businessName }}
                </p>
              </div>
              
              <!-- Description Input -->
              <div class="group/input">
                <label class="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                  <span>Décrivez votre activité en quelques lignes</span>
                  <span class="text-fuchsia-400">*</span>
                </label>
                <div class="relative">
                  <textarea 
                    v-model="formData.description"
                    rows="4"
                    :class="[
                      'w-full rounded-xl border bg-white/5 px-4 py-3.5 text-white placeholder:text-white/30 transition-all duration-300 resize-none',
                      'focus:outline-none focus:ring-2',
                      validationErrors.description 
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-white/10 focus:border-amber-400 focus:ring-amber-400/30 hover:border-white/20'
                    ]"
                    placeholder="Ex: Nous développons une app de livraison écologique pour les commerces de proximité..."
                    @blur="validateField('description')"
                    @input="onFieldInput('description')"
                  />
                </div>
                <div class="flex justify-between mt-2">
                  <p v-if="validationErrors.description" class="text-sm text-red-400 flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ validationErrors.description }}
                  </p>
                  <div v-else class="flex items-center gap-2">
                    <p class="text-xs text-white/40">
                      <span :class="formData.description.length > 400 ? 'text-amber-400' : formData.description.length > 10 ? 'text-emerald-400' : ''">
                        {{ formData.description.length }}
                      </span>
                      /500 caractères
                    </p>
                  </div>
                </div>
              </div>
              
              <!-- Sector Selection -->
              <div class="group/input">
                <label class="block text-sm font-medium text-white/80 mb-3">
                  Dans quel secteur évoluez-vous ? <span class="text-fuchsia-400">*</span>
                </label>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <button
                    v-for="sector in sectors"
                    :key="sector.value"
                    type="button"
                    @click="selectSector(sector.value)"
                    :class="[
                      'relative p-4 rounded-xl border text-sm font-medium transition-all duration-300 overflow-hidden group',
                      formData.sector === sector.value
                        ? 'border-amber-400 bg-gradient-to-br from-amber-400/20 to-orange-500/20 text-white shadow-lg shadow-amber-500/20'
                        : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]'
                    ]"
                  >
                    <!-- Selected indicator -->
                    <div v-if="formData.sector === sector.value" class="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center animate-scale-in">
                      <svg class="w-3 h-3 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span class="block text-2xl mb-2 transition-transform group-hover:scale-110">{{ sector.icon }}</span>
                    <span class="block">{{ sector.label }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Step: Market -->
          <div v-else-if="currentStep.id === 'market'" key="market" class="space-y-6">
            <div class="text-center mb-8">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-fuchsia-400/20 to-purple-500/20 mb-4 ring-1 ring-fuchsia-400/30">
                <svg class="w-8 h-8 text-fuchsia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-white">Votre marché, votre terrain 📊</h2>
              <p class="text-white/60 mt-2">Comprendre votre écosystème, c'est déjà prendre de l'avance sur la concurrence.</p>
            </div>
            
            <div class="space-y-5">
              <!-- Market Size Input -->
              <div class="group/input">
                <label class="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                  <span>Taille du marché (TAM)</span>
                  <span class="px-2 py-0.5 rounded-full bg-white/10 text-xs text-white/60">Optionnel</span>
                </label>
                <div class="relative">
                  <input 
                    v-model="formData.marketSize"
                    type="text"
                    class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 pl-12 text-white placeholder:text-white/30 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/30 transition-all duration-300 hover:border-white/20"
                    placeholder="Ex: 10 milliards €"
                  />
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg">€</span>
                </div>
                <p class="mt-1.5 text-xs text-white/50 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Total Addressable Market - l'estimation globale de votre marché
                </p>
              </div>
              
              <!-- Target Customers -->
              <div class="group/input">
                <label class="block text-sm font-medium text-white/80 mb-2">
                  Qui sont vos clients cibles ?
                </label>
                <input 
                  v-model="formData.targetCustomers"
                  type="text"
                  class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder:text-white/30 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/30 transition-all duration-300 hover:border-white/20"
                  placeholder="Ex: PME du e-commerce, 10-50 salariés, CA 1-5M€"
                />
              </div>
              
              <!-- Competitors -->
              <div class="group/input">
                <label class="block text-sm font-medium text-white/80 mb-3 flex items-center justify-between">
                  <span>Vos concurrents principaux</span>
                  <span class="text-xs text-white/40">{{ competitorsList.filter(c => c.trim()).length }} ajouté(s)</span>
                </label>
                <div class="space-y-2">
                  <div 
                    v-for="(competitor, index) in competitorsList" 
                    :key="index"
                    class="flex items-center gap-2 group/competitor"
                  >
                    <div class="relative flex-1">
                      <input 
                        v-model="competitorsList[index]"
                        type="text"
                        class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pl-10 text-white placeholder:text-white/30 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/30 transition-all"
                        :placeholder="`Concurrent ${index + 1} (ex: Uber, Airbnb...)`"
                      />
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">#{{ index + 1 }}</span>
                    </div>
                    <button 
                      @click="removeCompetitor(index)"
                      class="p-2.5 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 opacity-0 group-hover/competitor:opacity-100"
                      title="Supprimer"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <button 
                    @click="addCompetitor"
                    class="flex items-center gap-2 text-sm text-fuchsia-400 hover:text-fuchsia-300 transition-all duration-200 py-2 px-3 rounded-lg hover:bg-fuchsia-400/10 w-full justify-center"
                  >
                    <div class="w-6 h-6 rounded-full bg-fuchsia-400/20 flex items-center justify-center">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    Ajouter un concurrent
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Step: Financial -->
          <div v-else-if="currentStep.id === 'financial'" key="financial" class="space-y-6">
            <div class="text-center mb-8">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 mb-4 ring-1 ring-emerald-400/30">
                <svg class="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-white">Les chiffres qui comptent 💰</h2>
              <p class="text-white/60 mt-2">Des projections réalistes pour convaincre banquiers et investisseurs.</p>
            </div>
            
            <div class="space-y-5">
              <!-- Revenue Projections -->
              <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
                <label class="block text-sm font-medium text-white/80 mb-4 flex items-center gap-2">
                  <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Projections de chiffre d'affaires
                </label>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div 
                    v-for="(year, idx) in [1, 2, 3]" 
                    :key="year"
                    class="group/year relative"
                  >
                    <label class="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                      Année {{ year }}
                    </label>
                    <div class="relative">
                      <input 
                        v-model="formData[`revenueYear${year}`]"
                        type="number"
                        class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pl-10 text-white placeholder:text-white/30 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 transition-all duration-300 hover:border-white/20"
                        placeholder="0"
                        min="0"
                        step="1000"
                      />
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 font-medium">€</span>
                    </div>
                    <!-- Quick preset buttons -->
                    <div class="flex gap-1 mt-2">
                      <button 
                        v-for="preset in [50000, 100000, 500000]"
                        :key="preset"
                        @click="formData[`revenueYear${year}`] = preset"
                        class="text-[10px] px-2 py-1 rounded-md bg-white/5 text-white/40 hover:bg-emerald-400/20 hover:text-emerald-400 transition-colors"
                      >
                        {{ formatNumber(preset) }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Funding Needed -->
              <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
                <label class="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                  <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Besoin en financement
                </label>
                <div class="relative">
                  <input 
                    v-model="formData.fundingNeeded"
                    type="number"
                    class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 pl-10 text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all duration-300 hover:border-white/20"
                    placeholder="Ex: 50000"
                    min="0"
                    step="1000"
                  />
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 font-medium">€</span>
                </div>
                <p class="mt-2 text-xs text-white/50 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Montant nécessaire pour lancer ou développer votre projet
                </p>
              </div>
              
              <!-- Quick tip -->
              <div class="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 flex items-start gap-3">
                <div class="w-8 h-8 rounded-full bg-emerald-400/20 flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm text-emerald-300 font-medium">💡 Conseil pro</p>
                  <p class="text-xs text-emerald-200/70 mt-1">
                    Soyez réaliste mais ambitieux. Les investisseurs préfèrent des projections conservatrices que vous dépassez plutôt que l'inverse.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Step: Review -->
          <div v-else-if="currentStep.id === 'review'" key="review" class="space-y-6">
            <div class="text-center mb-8">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400/20 to-emerald-500/20 mb-4 ring-1 ring-green-400/30 animate-bounce-in">
                <svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-white">Votre business plan est prêt ! 🎉</h2>
              <p class="text-white/60 mt-2">Voici un aperçu de ce que nous allons générer pour vous</p>
            </div>
            
            <div class="space-y-4">
              <!-- Summary Card -->
              <div class="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
                <h3 class="text-sm font-semibold text-white/80 uppercase tracking-wider flex items-center gap-2">
                  <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Récapitulatif de votre projet
                </h3>
                
                <div class="space-y-3">
                  <div class="flex justify-between items-center py-2 border-b border-white/5">
                    <span class="text-white/50 text-sm">Entreprise</span>
                    <span class="text-white font-medium">{{ formData.businessName || '-' }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-white/5">
                    <span class="text-white/50 text-sm">Secteur</span>
                    <span class="text-white font-medium flex items-center gap-2">
                      <span v-if="formData.sector">{{ getSectorIcon(formData.sector) }}</span>
                      {{ getSectorLabel(formData.sector) || '-' }}
                    </span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-white/5">
                    <span class="text-white/50 text-sm">Marché estimé</span>
                    <span class="text-white font-medium">{{ formData.marketSize || 'À définir' }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2">
                    <span class="text-white/50 text-sm">Besoin de financement</span>
                    <span class="text-emerald-400 font-semibold">
                      {{ formData.fundingNeeded ? `€${formatNumber(formData.fundingNeeded)}` : '-' }}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- What's included -->
              <div class="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-5">
                <h3 class="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Ce que vous allez recevoir
                </h3>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div v-for="(item, idx) in includedItems" :key="idx" class="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span class="text-sm text-white/80">{{ item }}</span>
                  </div>
                </div>
              </div>
              
              <!-- CTA Preview Card -->
              <div class="rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-400/10 to-orange-500/10 p-5 relative overflow-hidden">
                <!-- Background glow -->
                <div class="absolute -top-20 -right-20 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl"></div>
                
                <div class="relative flex items-start gap-4">
                  <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/30">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-amber-300 font-bold text-lg">Débloquez votre business plan maintenant</p>
                    <p class="text-amber-200/70 text-sm mt-1">
                      Accès immédiat à votre PDF professionnel prêt pour les banques et investisseurs.
                    </p>
                    <div class="flex items-center gap-4 mt-3 text-xs text-amber-300/60">
                      <span class="flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Généré en 2 min
                      </span>
                      <span class="flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Garantie 30 jours
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </StepTransition>
      </div>
    </main>

    <!-- Sticky Navigation Footer -->
    <footer class="fixed bottom-0 left-0 right-0 bg-white/5 backdrop-blur-xl border-t border-white/10 z-40">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <!-- Previous Button -->
          <button 
            v-if="currentStepIndex > 0"
            @click="prevStep"
            class="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span class="hidden sm:inline">Retour</span>
          </button>
          <div v-else class="w-20" />
          
          <!-- Next Button -->
          <button 
            v-if="currentStepIndex < steps.length - 1"
            @click="nextStep"
            :disabled="!isCurrentStepValid"
            class="group relative flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:shadow-xl hover:-translate-y-0.5"
            :class="isCurrentStepValid ? 'shadow-orange-500/30 hover:shadow-orange-500/50' : ''"
          >
            <!-- Button gradient background -->
            <div class="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-fuchsia-500 transition-opacity duration-300" 
                 :class="isCurrentStepValid ? 'opacity-100' : 'opacity-60'"></div>
            <!-- Hover glow effect -->
            <div v-if="isCurrentStepValid" class="absolute inset-0 bg-gradient-to-r from-amber-300 via-orange-400 to-fuchsia-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <span class="relative">Continuer</span>
            <svg class="w-4 h-4 relative transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <!-- CTA Button (Final Step) -->
          <button 
            v-else
            @click="goToCheckout"
            class="group relative flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white shadow-xl shadow-emerald-500/30 transition-all duration-300 overflow-hidden hover:shadow-2xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 animate-pulse-glow"
          >
            <!-- Button gradient background -->
            <div class="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500"></div>
            <!-- Shimmer effect -->
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <!-- Pulse ring -->
            <div class="absolute inset-0 rounded-xl ring-2 ring-emerald-400/50 animate-ping opacity-0 group-hover:opacity-30"></div>
            
            <svg class="w-5 h-5 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span class="relative">Débloquer mon plan — 2,90€</span>
            <svg class="w-4 h-4 relative transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
        
        <!-- Trust badges -->
        <div class="flex justify-center items-center gap-4 mt-3 text-[10px] text-white/40">
          <span class="flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Paiement sécurisé
          </span>
          <span class="flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            30 jours garantie
          </span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGuestStore } from '../stores/guest.js'
import { useBusinessPlanStore } from '../stores/businessPlan.js'
import AutoSaveIndicator from '../components/AutoSaveIndicator.vue'
import StepTransition from '../components/StepTransition.vue'
import { useABTest, ABTests } from '../utils/ab-testing.js'
import { 
  trackOnboardingStep, 
  OnboardingSteps,
  trackFormError,
  trackStepBack,
  trackDropoff,
  useStepTimer,
  useFieldTracker,
  sendFinalReport
} from '../utils/onboarding-analytics.js'
import { trackConversion } from '../utils/analytics.js'

const route = useRoute()
const router = useRouter()
const guestStore = useGuestStore()
const bpStore = useBusinessPlanStore()

// Steps configuration
const steps = [
  { id: 'business-info', title: 'Votre entreprise' },
  { id: 'market', title: 'Marché' },
  { id: 'financial', title: 'Finances' },
  { id: 'review', title: 'Récapitulatif' }
]

const sectors = [
  { value: 'tech', label: 'Tech / SaaS', icon: '💻' },
  { value: 'ecommerce', label: 'E-commerce', icon: '🛒' },
  { value: 'services', label: 'Services', icon: '🤝' },
  { value: 'industry', label: 'Industrie', icon: '🏭' },
  { value: 'food', label: 'Restauration', icon: '🍽️' },
  { value: 'other', label: 'Autre', icon: '✨' }
]

// State
const currentStepIndex = ref(0)
const transitionDirection = ref('forward')
const saveStatus = ref('idle')
const lastSaved = ref(null)
const saveTimeout = ref(null)
const validationErrors = reactive({})
const touchedFields = reactive({})

const formData = reactive({
  businessName: '',
  description: '',
  sector: '',
  marketSize: '',
  targetCustomers: '',
  competitors: '',
  revenueYear1: '',
  revenueYear2: '',
  revenueYear3: '',
  fundingNeeded: ''
})

const competitorsList = ref([''])

// Included items for review step
const includedItems = [
  'PDF professionnel complet',
  'Analyse de marché détaillée',
  'Projections financières sur 3 ans',
  'Modèle Excel téléchargeable',
  'Éditions illimitées',
  'Support email prioritaire'
]

const currentStep = computed(() => steps[currentStepIndex.value])

const isCurrentStepValid = computed(() => {
  switch (currentStep.value.id) {
    case 'business-info':
      return !!(formData.businessName.trim() && formData.description.trim() && formData.sector)
    case 'market':
      return true // Optional fields
    case 'financial':
      return true // Optional fields
    default:
      return true
  }
})

// Methods
function validateField(field) {
  validationErrors[field] = null
  touchedFields[field] = true

  switch (field) {
    case 'businessName':
      if (!formData.businessName.trim()) {
        validationErrors.businessName = 'Le nom de l\'entreprise est requis'
      } else if (formData.businessName.trim().length < 2) {
        validationErrors.businessName = 'Le nom doit contenir au moins 2 caractères'
      }
      break
    case 'description':
      if (!formData.description.trim()) {
        validationErrors.description = 'La description est requise'
      } else if (formData.description.trim().length < 10) {
        validationErrors.description = 'La description doit contenir au moins 10 caractères'
      }
      break
  }
}

function onFieldInput(field) {
  // Clear error when user starts typing
  if (touchedFields[field] && validationErrors[field]) {
    validateField(field)
  }
}

function selectSector(value) {
  formData.sector = value
  // Trigger save after selection
  debouncedSave()
}

function goToStep(index) {
  if (index < currentStepIndex.value || canNavigateToStep(index)) {
    transitionDirection.value = index > currentStepIndex.value ? 'forward' : 'backward'
    saveProgress()
    currentStepIndex.value = index
  }
}

function canNavigateToStep(index) {
  // Allow navigation to any previous step or next step if current is valid
  if (index <= currentStepIndex.value) return true
  // For steps beyond current, check if all previous required steps are valid
  for (let i = 0; i < index; i++) {
    if (!isStepValid(i)) return false
  }
  return true
}

function isStepValid(stepIndex) {
  const step = steps[stepIndex]
  switch (step.id) {
    case 'business-info':
      return !!(formData.businessName.trim() && formData.description.trim() && formData.sector)
    default:
      return true
  }
}

function isStepCompleted(index) {
  return index < currentStepIndex.value || (index === currentStepIndex.value && isStepValid(index))
}

function getStepIndicatorClass(index) {
  if (index === currentStepIndex.value) {
    return 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/40 scale-110 ring-2 ring-white/20'
  } else if (isStepCompleted(index)) {
    return 'bg-emerald-500 text-white border-emerald-400'
  } else if (canNavigateToStep(index)) {
    return 'bg-white/10 text-white/60 border-white/20 hover:bg-white/20'
  }
  return 'bg-white/5 text-white/30 border-white/10'
}

function getSectorIcon(value) {
  const sector = sectors.find(s => s.value === value)
  return sector ? sector.icon : ''
}

function formatNumber(num) {
  if (!num) return '0'
  return new Intl.NumberFormat('fr-FR', { notation: 'compact', compactDisplay: 'short' }).format(num)
}

function addCompetitor() {
  competitorsList.value.push('')
}

function removeCompetitor(index) {
  competitorsList.value.splice(index, 1)
  if (competitorsList.value.length === 0) {
    competitorsList.value.push('')
  }
}

function getSectorLabel(value) {
  const sector = sectors.find(s => s.value === value)
  return sector ? sector.label : value
}

async function saveProgress() {
  if (saveStatus.value === 'saving') return
  
  saveStatus.value = 'saving'
  
  try {
    // Update competitors from list
    formData.competitors = competitorsList.value.filter(c => c.trim()).join(', ')
    
    // Save to store
    guestStore.saveFunnelData({ ...formData })
    
    // If authenticated with business plan ID, save to API
    if (route.params.id) {
      await bpStore.updateBusinessPlan(route.params.id, formData)
    }
    
    saveStatus.value = 'saved'
    lastSaved.value = new Date()
    
    // Reset to idle after 3 seconds
    setTimeout(() => {
      if (saveStatus.value === 'saved') {
        saveStatus.value = 'idle'
      }
    }, 3000)
  } catch (error) {
    saveStatus.value = 'error'
    console.error('Save error:', error)
  }
}

function debouncedSave() {
  clearTimeout(saveTimeout.value)
  saveTimeout.value = setTimeout(() => {
    saveProgress()
  }, 1000)
}

function nextStep() {
  if (currentStepIndex.value < steps.length - 1 && isCurrentStepValid.value) {
    // Validate current step
    if (currentStep.value.id === 'business-info') {
      validateField('businessName')
      validateField('description')
      if (validationErrors.businessName || validationErrors.description) {
        return
      }
    }
    
    transitionDirection.value = 'forward'
    saveProgress()
    currentStepIndex.value++
  }
}

function prevStep() {
  if (currentStepIndex.value > 0) {
    transitionDirection.value = 'backward'
    saveProgress()
    currentStepIndex.value--
  }
}

function goToCheckout() {
  saveProgress()
  router.push('/checkout')
}

// Watch for changes to auto-save
watch(formData, () => {
  debouncedSave()
}, { deep: true })

watch(competitorsList, () => {
  debouncedSave()
}, { deep: true })

// Load existing data
onMounted(async () => {
  // Initialize A/B Testing for funnel
  const funnelABTest = useABTest(ABTests.FUNNEL_CTA.id)
  const stepsABTest = useABTest(ABTests.FUNNEL_STEPS.id)
  
  // Track funnel start
  trackOnboardingStep(OnboardingSteps.FUNNEL_START, {
    variant: funnelABTest.variant,
    stepsVariant: stepsABTest.variant
  })
  
  // Start step timer
  stepTimer = useStepTimer('funnel_business_info')
  
  // Load from guest store
  if (guestStore.hasFunnelData) {
    const saved = guestStore.getFunnelData()
    Object.assign(formData, saved)
    if (saved.competitors) {
      const comps = saved.competitors.split(',').map(c => c.trim()).filter(c => c)
      competitorsList.value = comps.length > 0 ? comps : ['']
    }
  }

  // Load from API if editing
  if (route.params.id) {
    try {
      const plan = await bpStore.fetchBusinessPlan(route.params.id)
      if (plan) {
        Object.assign(formData, plan.data || {})
      }
    } catch (error) {
      console.error('Failed to load business plan:', error)
    }
  }
})

// Enhanced methods with tracking
let stepTimer = null

// Override nextStep with tracking
const originalNextStep = nextStep
nextStep = function() {
  if (currentStepIndex.value < steps.length - 1 && isCurrentStepValid.value) {
    // Track step completion
    const stepMapping = {
      'business-info': OnboardingSteps.FUNNEL_STEP_BUSINESS,
      'market': OnboardingSteps.FUNNEL_STEP_MARKET,
      'financial': OnboardingSteps.FUNNEL_STEP_FINANCIAL,
      'review': OnboardingSteps.FUNNEL_STEP_REVIEW
    }
    
    const currentStepId = currentStep.value.id
    if (stepTimer) {
      stepTimer.stop()
    }
    
    trackOnboardingStep(stepMapping[currentStepId] || currentStepId, {
      stepIndex: currentStepIndex.value,
      totalSteps: steps.length
    })
    
    // Track step transition
    trackConversion('funnel_step_complete', { 
      step: currentStepId, 
      stepIndex: currentStepIndex.value 
    })
    
    originalNextStep()
    
    // Start timer for next step
    const nextStepId = steps[currentStepIndex.value]?.id
    stepTimer = useStepTimer(`funnel_${nextStepId}`)
  }
}

// Override prevStep with tracking
const originalPrevStep = prevStep
prevStep = function() {
  if (currentStepIndex.value > 0) {
    const fromStep = steps[currentStepIndex.value]?.id
    const toStep = steps[currentStepIndex.value - 1]?.id
    trackStepBack(fromStep, toStep)
    originalPrevStep()
  }
}

// Override goToCheckout with tracking
const originalGoToCheckout = goToCheckout
goToCheckout = function() {
  // Track funnel completion
  trackOnboardingStep(OnboardingSteps.FUNNEL_COMPLETE)
  
  // Track conversion for A/B test
  const funnelABTest = useABTest(ABTests.FUNNEL_CTA.id)
  funnelABTest.trackConversion('funnel_complete', {
    stepsCompleted: currentStepIndex.value + 1,
    businessName: formData.businessName
  })
  
  // Track checkout start
  trackOnboardingStep(OnboardingSteps.CHECKOUT_START)
  trackConversion('checkout_start', { source: 'funnel' })
  
  // Send final report
  sendFinalReport()
  
  originalGoToCheckout()
}

// Track form errors
const originalValidateField = validateField
validateField = function(field) {
  originalValidateField(field)
  
  if (validationErrors[field]) {
    trackFormError(field, 'validation', validationErrors[field])
  }
}

// Track dropoff on unmount
onUnmounted(() => {
  // Check if funnel was completed
  const stats = JSON.parse(localStorage.getItem('onboarding_progress') || '{}')
  if (!stats[OnboardingSteps.CHECKOUT_START]) {
    trackDropoff(currentStep.value.id, 'page_leave')
  }
})
</script>

<style scoped>
/* Shimmer animation for progress bar */
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}

/* Bounce in animation */
@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-bounce-in {
  animation: bounce-in 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Scale in animation */
@keyframes scale-in {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scale-in 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Pulse glow animation */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 10px 40px -10px rgba(16, 185, 129, 0.3);
  }
  50% {
    box-shadow: 0 10px 40px -5px rgba(16, 185, 129, 0.5);
  }
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Slow pulse for icons */
@keyframes pulse-slow {
  0%, 100% {
    opacity: 0.8;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.02);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}

/* Smooth transitions for group inputs */
.group\/input:focus-within label {
  color: rgba(255, 255, 255, 0.95);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Input autofill styling for dark theme */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
textarea:-webkit-autofill,
textarea:-webkit-autofill:hover,
textarea:-webkit-autofill:focus {
  -webkit-text-fill-color: white;
  -webkit-box-shadow: 0 0 0px 1000px rgba(37, 37, 66, 0.8) inset;
  transition: background-color 5000s ease-in-out 0s;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .animate-shimmer,
  .animate-bounce-in,
  .animate-scale-in,
  .animate-pulse-glow,
  .animate-pulse-slow {
    animation: none;
  }
}
</style>
