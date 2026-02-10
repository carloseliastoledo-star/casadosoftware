<template>
  <div class="eletrokeys-theme min-h-screen bg-[#070b14] text-white bg-background overflow-x-hidden">
    <header
      class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      :class="isScrolled ? 'bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-lg' : 'bg-transparent'"
    >
      <div class="section-container">
        <nav class="flex items-center justify-between h-20">
          <a
            href="#inicio"
            class="flex items-center gap-2 group"
            @click.prevent="scrollToSection('#inicio')"
          >
            <div
              class="w-10 h-10 rounded-lg bg-primary flex items-center justify-center group-hover:shadow-[0_0_20px_hsl(187_100%_50%_/_0.5)] transition-shadow duration-300"
            >
              <svg class="w-6 h-6 text-primary-foreground" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M13 2L3 14h7l-1 8 12-14h-7l-1-6Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <span class="font-display font-bold text-xl text-foreground">
              Licenças<span class="text-primary">Digitais</span>
            </span>
          </a>

          <div class="hidden md:flex items-center gap-8">
            <a
              v-for="link in navLinks"
              :key="link.href"
              :href="link.href"
              class="text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium relative group"
              @click.prevent="scrollToSection(link.href)"
            >
              {{ link.label }}
              <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
          </div>

          <div class="hidden md:block">
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-2xl bg-[#00e5ff] px-6 py-3 font-semibold text-[#07131a] shadow-[0_0_35px_rgba(0,229,255,0.35)] transition-all duration-300 hover:shadow-[0_0_55px_rgba(0,229,255,0.55)]"
              @click="scrollToSection('#contato')"
            >
              Fale Conosco
            </button>
          </div>

          <button class="md:hidden p-2 text-foreground" type="button" @click="toggleMobileMenu" aria-label="Toggle menu">
            <svg v-if="isMobileMenuOpen" class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
            <svg v-else class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </nav>

        <div
          v-if="isMobileMenuOpen"
          class="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border/50 py-4"
        >
          <div class="section-container flex flex-col gap-4">
            <a
              v-for="link in navLinks"
              :key="link.href"
              :href="link.href"
              class="text-muted-foreground hover:text-foreground transition-colors py-2 font-medium"
              @click.prevent="scrollToSection(link.href)"
            >
              {{ link.label }}
            </a>
            <button type="button" class="btn-hero mt-2" @click="scrollToSection('#contato')">Fale Conosco</button>
          </div>
        </div>
      </div>
    </header>

    <main>
      <section id="inicio" class="relative min-h-screen flex items-center justify-center overflow-hidden hero-glow">
        <div class="absolute inset-0 grid-pattern opacity-30" />
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />

        <div class="section-container relative z-10 py-32">
          <div class="max-w-4xl mx-auto text-center">
            <h1 class="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight md:leading-[1.05] mb-8 fade-in-up delay-100">
              Soluções em
              <span class="text-[#00e5ff]">Conectividade</span>
              <br />
              e Tecnologia
            </h1>

            <p class="text-lg sm:text-xl md:text-2xl text-[#9aa6b2] max-w-3xl mx-auto mb-12 leading-relaxed fade-in-up delay-200">
              A Licenças Digitais oferece licenças de software originais, suporte técnico
              especializado e soluções digitais completas para empresas e profissionais.
            </p>

            <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 fade-in-up delay-300">
              <button
                type="button"
                class="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-[#00e5ff] px-8 py-4 text-base font-semibold text-[#07131a] shadow-[0_0_35px_rgba(0,229,255,0.35)] transition-all duration-300 hover:shadow-[0_0_55px_rgba(0,229,255,0.55)]"
                @click="scrollToSection('#solucoes')"
              >
                Conheça Nossas Soluções
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                  <path d="M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                class="inline-flex w-full sm:w-auto items-center justify-center rounded-2xl border border-[#00e5ff]/70 bg-transparent px-8 py-4 text-base font-semibold text-[#00e5ff] shadow-[0_0_22px_rgba(0,229,255,0.12)] transition-all duration-300 hover:bg-[#00e5ff]/10 hover:shadow-[0_0_40px_rgba(0,229,255,0.22)]"
                @click="scrollToSection('#contato')"
              >
                Entre em Contato
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 fade-in-up delay-400">
              <div class="glass-card p-6 rounded-xl interactive-card">
                <svg class="w-8 h-8 text-primary mb-3 mx-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M13 2L3 14h7l-1 8 12-14h-7l-1-6Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linejoin="round"
                  />
                </svg>
                <h3 class="font-display font-semibold text-foreground mb-1">Licenças Originais</h3>
                <p class="text-sm text-muted-foreground">Software oficial e legalizado</p>
              </div>
              <div class="glass-card p-6 rounded-xl interactive-card">
                <svg class="w-8 h-8 text-primary mb-3 mx-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linejoin="round"
                  />
                </svg>
                <h3 class="font-display font-semibold text-foreground mb-1">Segurança Garantida</h3>
                <p class="text-sm text-muted-foreground">Transações protegidas e seguras</p>
              </div>
              <div class="glass-card p-6 rounded-xl interactive-card">
                <svg class="w-8 h-8 text-primary mb-3 mx-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" />
                  <path d="M3 12h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                  <path d="M12 3c3 3.5 3 14 0 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
                <h3 class="font-display font-semibold text-foreground mb-1">Suporte Nacional</h3>
                <p class="text-sm text-muted-foreground">Atendimento em todo Brasil</p>
              </div>
            </div>
          </div>
        </div>

        <div class="absolute bottom-8 left-1/2 -translate-x-1/2 float-animation">
          <div class="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <div class="w-1 h-2 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
      </section>

      <section id="solucoes" class="relative py-24 overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />

        <div class="section-container relative z-10">
          <div class="text-center mb-16">
            <span class="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">Nossas Soluções</span>
            <h2 class="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Tecnologia sob medida para <span class="gradient-text">seu negócio</span>
            </h2>
            <p class="text-muted-foreground text-lg max-w-2xl mx-auto">
              Oferecemos soluções completas em conectividade, licenciamento de software e suporte técnico para impulsionar sua produtividade.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="(s, idx) in solutions" :key="s.title" class="glass-card rounded-2xl p-8 interactive-card group" :style="{ animationDelay: `${idx * 100}ms` }">
              <div class="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                <component :is="s.icon" class="w-7 h-7 text-primary" />
              </div>
              <h3 class="font-display text-xl font-semibold text-foreground mb-3">{{ s.title }}</h3>
              <p class="text-muted-foreground mb-6 leading-relaxed">{{ s.description }}</p>
              <ul class="space-y-2">
                <li v-for="f in s.features" :key="f" class="flex items-center gap-2 text-sm text-muted-foreground">
                  <div class="w-1.5 h-1.5 rounded-full bg-primary" />
                  {{ f }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="sobre" class="relative py-24 overflow-hidden">
        <div class="absolute inset-0 grid-pattern opacity-20" />
        <div class="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

        <div class="section-container relative z-10">
          <div class="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span class="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">Sobre Nós</span>
              <h2 class="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
                Conheça a <span class="gradient-text">Licenças Digitais</span>
              </h2>
              <p class="text-muted-foreground text-lg mb-6 leading-relaxed">
                Somos uma empresa brasileira especializada em licenças de software e soluções digitais. Atuamos com foco em legalidade, transparência e suporte.
              </p>
              <p class="text-muted-foreground text-lg mb-8 leading-relaxed">
                Comercializamos produtos licenciados e oferecemos atendimento para apoiar sua operação e produtividade.
              </p>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div v-for="h in highlights" :key="h" class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <span class="text-foreground text-sm">{{ h }}</span>
                </div>
              </div>
            </div>

            <div class="space-y-6">
              <div v-for="(v, idx) in values" :key="v.title" class="glass-card rounded-2xl p-6 interactive-card" :style="{ animationDelay: `${idx * 100}ms` }">
                <div class="flex items-start gap-4">
                  <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <component :is="v.icon" class="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 class="font-display text-xl font-semibold text-foreground mb-2">{{ v.title }}</h3>
                    <p class="text-muted-foreground leading-relaxed">{{ v.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-16 glass-card rounded-2xl p-8">
            <h3 class="font-display text-2xl font-bold text-foreground mb-6 text-center">Dados Empresariais</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div>
                <p class="text-muted-foreground text-sm mb-1">Razão Social</p>
                <p class="text-foreground font-semibold">Eletrokeys LTDA</p>
              </div>
              <div>
                <p class="text-muted-foreground text-sm mb-1">CNPJ</p>
                <p class="text-foreground font-semibold">44.694.356/0001-48</p>
              </div>
              <div>
                <p class="text-muted-foreground text-sm mb-1">Localização</p>
                <p class="text-foreground font-semibold">São Paulo - SP</p>
              </div>
              <div>
                <p class="text-muted-foreground text-sm mb-1">Atuação</p>
                <p class="text-foreground font-semibold">Nacional</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contato" class="relative py-24 overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
        <div class="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

        <div class="section-container relative z-10">
          <div class="text-center mb-16">
            <span class="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">Contato</span>
            <h2 class="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Fale com a <span class="gradient-text">Licenças Digitais</span>
            </h2>
            <p class="text-muted-foreground text-lg max-w-2xl mx-auto">
              Entre em contato conosco para tirar dúvidas, solicitar orçamentos ou conhecer melhor nossas soluções.
            </p>
          </div>

          <div class="max-w-5xl mx-auto">
            <div class="glass-card rounded-2xl p-8 md:p-10">
              <h3 class="font-display text-2xl font-bold text-foreground mb-6">Envie sua mensagem</h3>

              <div v-if="isSubmitted" class="flex flex-col items-center justify-center py-16 text-center">
                <div class="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <svg class="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </div>
                <h4 class="font-display text-xl font-semibold text-foreground mb-2">Mensagem Enviada!</h4>
                <p class="text-muted-foreground">Obrigado pelo contato. Responderemos em breve.</p>
              </div>

              <form v-else class="space-y-5" @submit.prevent="handleSubmit">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label for="name" class="block text-sm font-medium text-foreground mb-2">Nome *</label>
                    <input
                      id="name"
                      v-model="form.name"
                      class="w-full rounded-md border border-border/50 bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Seu nome completo"
                      maxlength="100"
                    />
                  </div>
                  <div>
                    <label for="email" class="block text-sm font-medium text-foreground mb-2">Email *</label>
                    <input
                      id="email"
                      v-model="form.email"
                      type="email"
                      class="w-full rounded-md border border-border/50 bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="seu@email.com"
                      maxlength="255"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label for="phone" class="block text-sm font-medium text-foreground mb-2">Telefone</label>
                    <input
                      id="phone"
                      v-model="form.phone"
                      class="w-full rounded-md border border-border/50 bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="(11) 99999-9999"
                      maxlength="20"
                    />
                  </div>
                  <div>
                    <label for="subject" class="block text-sm font-medium text-foreground mb-2">Assunto</label>
                    <input
                      id="subject"
                      v-model="form.subject"
                      class="w-full rounded-md border border-border/50 bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Assunto da mensagem"
                      maxlength="150"
                    />
                  </div>
                </div>

                <div>
                  <label for="message" class="block text-sm font-medium text-foreground mb-2">Mensagem *</label>
                  <textarea
                    id="message"
                    v-model="form.message"
                    rows="5"
                    class="w-full rounded-md border border-border/50 bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    placeholder="Descreva como podemos ajudá-lo..."
                    maxlength="1000"
                  />
                </div>

                <button type="submit" class="btn-hero btn-hero-lg w-full" :disabled="isSubmitting">
                  <template v-if="isSubmitting">
                    <span class="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Enviando...
                  </template>
                  <template v-else>
                    Enviar Mensagem
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 2 11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                      <path d="M22 2 15 22l-4-9-9-4 20-7Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
                    </svg>
                  </template>
                </button>

                <p v-if="formError" class="text-sm text-red-300">{{ formError }}</p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="relative bg-secondary/30 border-t border-border/50">
      <div class="section-container py-16">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div class="lg:col-span-2">
            <a href="#inicio" class="flex items-center gap-2 mb-4" @click.prevent="scrollToSection('#inicio')">
              <div class="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <svg class="w-6 h-6 text-primary-foreground" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M13 2L3 14h7l-1 8 12-14h-7l-1-6Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <span class="font-display font-bold text-xl text-foreground">Licenças<span class="text-primary">Digitais</span></span>
            </a>
            <p class="text-muted-foreground mb-4 max-w-md leading-relaxed">
              Soluções em conectividade e tecnologia. Oferecemos licenças de software, suporte técnico e serviços digitais.
            </p>
            <div class="space-y-1 text-sm text-muted-foreground">
              <p><span class="text-foreground font-medium">Razão Social:</span> Eletrokeys LTDA</p>
              <p><span class="text-foreground font-medium">CNPJ:</span> 44.694.356/0001-48</p>
            </div>
          </div>

          <div>
            <h3 class="font-display font-semibold text-foreground mb-4">Links Rápidos</h3>
            <ul class="space-y-3">
              <li v-for="link in navLinks" :key="`footer-${link.href}`">
                <a
                  :href="link.href"
                  class="text-muted-foreground hover:text-primary transition-colors"
                  @click.prevent="scrollToSection(link.href)"
                >
                  {{ link.label }}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="font-display font-semibold text-foreground mb-4">Legal</h3>
            <ul class="space-y-3">
              <li>
                <NuxtLink to="/privacidade" class="text-muted-foreground hover:text-primary transition-colors">
                  Política de Privacidade
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/termos" class="text-muted-foreground hover:text-primary transition-colors">
                  Termos de Uso
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-12 pt-8 border-t border-border/50">
          <div class="flex flex-col md:flex-row justify-between items-center gap-4">
            <div class="text-center md:text-left">
              <p class="text-muted-foreground text-sm">
                <span class="text-foreground font-medium">Endereço:</span> AV PAULISTA, 1471 - Conj. 1110, Sala - Bela Vista, São Paulo - SP, CEP: 01311-927
              </p>
            </div>
            <button
              type="button"
              class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              aria-label="Voltar ao topo"
              @click="scrollToTop"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 19V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                <path d="m5 12 7-7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div class="mt-8 pt-8 border-t border-border/50 text-center">
          <p class="text-muted-foreground text-sm">© {{ new Date().getFullYear() }} Licenças Digitais. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { defineComponent } from 'vue'

const navLinks = [
  { href: '#inicio', label: 'Início' },
  { href: '#solucoes', label: 'Soluções' },
  { href: '#sobre', label: 'Sobre' },
  { href: '#contato', label: 'Contato' }
]

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

const onScroll = () => {
  try {
    isScrolled.value = window.scrollY > 20
  } catch {
    isScrolled.value = false
  }
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function scrollToSection(href: string) {
  try {
    const el = document.querySelector(href)
    if (el) {
      ;(el as HTMLElement).scrollIntoView({ behavior: 'smooth' })
    }
  } catch {
    // ignore
  }
  isMobileMenuOpen.value = false
}

function scrollToTop() {
  try {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch {
    // ignore
  }
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll)
})

onBeforeUnmount(() => {
  try {
    window.removeEventListener('scroll', onScroll)
  } catch {
    // ignore
  }
})

const solutions = [
  {
    icon: defineComponent({
      props: { class: { type: String, default: '' } },
      template:
        '<svg :class="class" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h16v16H4V4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 8h8M8 12h8M8 16h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
    }),
    title: 'Licenças de Software',
    description:
      'Licenças originais de sistemas operacionais, pacotes Office e softwares profissionais com garantia de autenticidade.',
    features: ['Windows 10/11', 'Office', 'Softwares Adobe', 'Antivírus']
  },
  {
    icon: defineComponent({
      props: { class: { type: String, default: '' } },
      template:
        '<svg :class="class" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2"/><path d="M8 20h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 18v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
    }),
    title: 'Sistemas Operacionais',
    description: 'Instalação e configuração de sistemas Windows com suporte e orientação.',
    features: ['Windows Server', 'Windows Pro', 'Migração de dados', 'Backup']
  },
  {
    icon: defineComponent({
      props: { class: { type: String, default: '' } },
      template:
        '<svg :class="class" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>'
    }),
    title: 'Segurança Digital',
    description: 'Soluções para proteger sua empresa contra ameaças digitais.',
    features: ['Firewall', 'Antivírus', 'VPN', 'Backup em nuvem']
  },
  {
    icon: defineComponent({
      props: { class: { type: String, default: '' } },
      template:
        '<svg :class="class" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 8h20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6 8c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6 8a6 6 0 0 0 12 0" stroke="currentColor" stroke-width="0"/></svg>'
    }),
    title: 'Conectividade',
    description: 'Infraestrutura de rede e conectividade para ambientes corporativos e residenciais.',
    features: ['Redes Wi-Fi', 'Cabeamento', 'Roteadores', 'Access Points']
  },
  {
    icon: defineComponent({
      props: { class: { type: String, default: '' } },
      template:
        '<svg :class="class" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 12a8 8 0 0 1 16 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6 12a6 6 0 0 1 12 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M8 12a4 4 0 0 1 8 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
    }),
    title: 'Suporte Remoto',
    description: 'Assistência técnica especializada remota para resolução rápida de problemas.',
    features: ['Atendimento', 'Acesso remoto', 'Manutenção', 'Consultoria']
  },
  {
    icon: defineComponent({
      props: { class: { type: String, default: '' } },
      template:
        '<svg :class="class" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2"/><path d="M8 8h8M8 12h8M8 16h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
    }),
    title: 'Infraestrutura Digital',
    description: 'Planejamento e implementação de infraestrutura de TI para empresas.',
    features: ['Servidores', 'Cloud', 'Virtualização', 'Storage']
  }
]

const highlights = [
  'Empresa brasileira legalmente constituída',
  'Comercialização de softwares licenciados',
  'Suporte técnico especializado',
  'Atendimento em todo território nacional',
  'Transparência em todas as transações',
  'Compromisso com a legalidade e ética'
]

const values = [
  {
    icon: defineComponent({
      props: { class: { type: String, default: '' } },
      template:
        '<svg :class="class" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5 7h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7 21h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
    }),
    title: 'Missão',
    description:
      'Fornecer soluções tecnológicas de qualidade, com licenciamento e suporte, contribuindo para o crescimento digital de nossos clientes.'
  },
  {
    icon: defineComponent({
      props: { class: { type: String, default: '' } },
      template:
        '<svg :class="class" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>'
    }),
    title: 'Visão',
    description:
      'Ser referência nacional em soluções digitais, reconhecida pela excelência no atendimento e compromisso com a legalidade.'
  },
  {
    icon: defineComponent({
      props: { class: { type: String, default: '' } },
      template:
        '<svg :class="class" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 21s-8-4.5-8-11a5 5 0 0 1 8-4 5 5 0 0 1 8 4c0 6.5-8 11-8 11Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>'
    }),
    title: 'Valores',
    description:
      'Transparência, ética, qualidade e respeito ao cliente são os pilares que norteiam nossos relacionamentos comerciais.'
  }
]

const isSubmitting = ref(false)
const isSubmitted = ref(false)
const formError = ref('')
const form = reactive({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
})

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

async function handleSubmit() {
  formError.value = ''

  if (!String(form.name || '').trim() || !String(form.email || '').trim() || !String(form.message || '').trim()) {
    formError.value = 'Por favor, preencha os campos obrigatórios.'
    return
  }

  if (!isValidEmail(String(form.email || '').trim())) {
    formError.value = 'Por favor, insira um e-mail válido.'
    return
  }

  isSubmitting.value = true
  try {
    await new Promise((r) => setTimeout(r, 900))
    isSubmitted.value = true
    setTimeout(() => {
      isSubmitted.value = false
      form.name = ''
      form.email = ''
      form.phone = ''
      form.subject = ''
      form.message = ''
    }, 2500)
  } finally {
    isSubmitting.value = false
  }
}
</script>
