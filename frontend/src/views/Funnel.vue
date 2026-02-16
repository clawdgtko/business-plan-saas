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
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400/20 to-emerald-500/20 mb-4">
                <svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-white">Récapitulatif</h2>
              <p class="text-white/60 mt-2">Vérifiez vos informations avant de continuer</p>
            </div>
            
            <div class="space-y-4">
              <div class="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                <div class="flex justify-between items-center pb-3 border-b border-white/10">
                  <span class="text-white/60">Entreprise</span>
                  <span class="text-white font-medium">{{ formData.businessName || '-' }}</span>
                </div>
                <div class="flex justify-between items-center pb-3 border-b border-white/10">
                  <span class="text-white/60">Secteur</span>
                  <span class="text-white font-medium">{{ getSectorLabel(formData.sector) || '-' }}</span>
                </div>
                <div class="flex justify-between items-center pb-3 border-b border-white/10">
                  <span class="text-white/60">Marché</span>
                  <span class="text-white font-medium">{{ formData.marketSize || '-' }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-white/60">Financement</span>
                  <span class="text-white font-medium">{{ formData.fundingNeeded ? `€${formData.fundingNeeded}` : '-' }}</span>
                </div>
              </div>
              
              <div class="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
                <div class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div>
                    <p class="text-amber-300 font-medium">Presque terminé !</p>
                    <p class="text-amber-200/70 text-sm mt-1">
                      Passez à l'abonnement pour générer votre PDF professionnel et accéder à toutes les fonctionnalités.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </StepTransition>
      </div>
    </main>

    <!-- Sticky Navigation Footer -->
    <footer class="fixed bottom-0 left-0 right-0 bg-white/5 backdrop-blur-lg border-t border-white/10">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <button 
            v-if="currentStepIndex > 0"
            @click="prevStep"
            class="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Précédent
          </button>
          <div v-else />
          
          <button 
            v-if="currentStepIndex < steps.length - 1"
            @click="nextStep"
            :disabled="!isCurrentStepValid"
            class="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-fuchsia-500 text-white font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:translate-y-[-1px]"
          >
            Suivant
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <button 
            v-else
            @click="goToCheckout"
            class="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:translate-y-[-1px]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Débloquer mon plan
          </button>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGuestStore } from '../stores/guest.js'
import { useBusinessPlanStore } from '../stores/businessPlan.js'
import AutoSaveIndicator from '../components/AutoSaveIndicator.vue'
import StepTransition from '../components/StepTransition.vue'

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

const formData = reactive({
  businessName: '',
  description: '',
  sector: '',
  marketSize: '',
  competitors: '',
  revenueYear1: '',
  revenueYear2: '',
  revenueYear3: '',
  fundingNeeded: ''
})

const competitorsList = ref([''])

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
</script>
