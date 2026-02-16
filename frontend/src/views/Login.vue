<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full p-6">
      <div class="bg-white rounded-xl shadow-sm p-8">
        <h1 class="text-2xl font-bold text-center">Connexion</h1>
        <p class="mt-2 text-gray-600 text-center">
          Entrez votre email pour recevoir un lien de connexion
        </p>
        
        <form @submit.prevent="handleLogin" class="mt-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input 
              v-model="email"
              type="email" 
              required
              class="mt-1 block w-full rounded-lg border-gray-300 border px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="vous@exemple.com"
            />
          </div>
          
          <button 
            type="submit"
            :disabled="loading"
            class="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {{ loading ? 'Envoi...' : 'Recevoir le lien' }}
          </button>
        </form>

        <p v-if="message" class="mt-4 text-center text-green-600">
          {{ message }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const loading = ref(false)
const message = ref('')

async function handleLogin() {
  loading.value = true
  
  // TODO: Call API to send magic link
  await new Promise(r => setTimeout(r, 1000))
  
  message.value = 'Lien envoyé ! Vérifiez votre email.'
  loading.value = false
}
</script>