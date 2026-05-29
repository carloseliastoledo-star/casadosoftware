<template>
  <div class="min-h-screen" style="background: #f4f7fc; color: #1e2a3e; font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.5;">
    <!-- Header -->
    <div class="header" style="background: #2c5f7a; color: white; padding: 1rem 2rem; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; border-bottom: 3px solid #e6b800;">
      <div class="logo">
        <h1 style="font-size: 1.5rem; font-weight: 600; margin: 0;">Casa do Software</h1>
        <p style="font-size: 0.75rem; color: #cce7f0; margin: 0;">Licenças de Software Originais</p>
      </div>
    </div>

    <!-- Container -->
    <div class="container" style="max-width: 1200px; margin: 2rem auto; padding: 0 1.5rem;">
      
      <!-- Hero -->
      <div class="hero" style="background: linear-gradient(135deg, #2c5f7a 0%, #1a3f5e 100%); border-radius: 24px; padding: 2.5rem 2rem; margin-bottom: 2rem; color: white;">
        <h2 style="font-size: 2rem; margin: 0 0 0.75rem 0;">Licenças de Software Originais e Garantidas</h2>
        <p style="font-size: 1.1rem; max-width: 700px; opacity: 0.9; margin: 0;">Oferecemos licenças originais de Microsoft Office, Windows e outros softwares com entrega imediata e suporte técnico especializado.</p>
      </div>

      <!-- Card: Sobre -->
      <div class="card" style="background: white; border-radius: 20px; padding: 1.8rem; margin-bottom: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
        <h2 style="color: #2c5f7a; border-left: 5px solid #e6b800; padding-left: 1rem; margin: 0 0 1.5rem 0; font-size: 1.6rem;">📌 Sobre a Casa do Software</h2>
        <div class="info-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
          <div class="info-item" style="background: #f8fafc; padding: 1rem 1.2rem; border-radius: 14px; border-left: 3px solid #e6b800;">
            <strong style="color: #2c5f7a; display: block; margin-bottom: 0.3rem;">Licenças Originais</strong>
            Todas as licenças são 100% originais e garantidas
          </div>
          <div class="info-item" style="background: #f8fafc; padding: 1rem 1.2rem; border-radius: 14px; border-left: 3px solid #e6b800;">
            <strong style="color: #2c5f7a; display: block; margin-bottom: 0.3rem;">Entrega Imediata</strong>
            Receba sua licença por e-mail em minutos
          </div>
          <div class="info-item" style="background: #f8fafc; padding: 1rem 1.2rem; border-radius: 14px; border-left: 3px solid #e6b800;">
            <strong style="color: #2c5f7a; display: block; margin-bottom: 0.3rem;">Suporte Técnico</strong>
            Suporte especializado para instalação e ativação
          </div>
        </div>
      </div>

      <!-- Card: Produtos -->
      <div class="card" style="background: white; border-radius: 20px; padding: 1.8rem; margin-bottom: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
        <h2 style="color: #2c5f7a; border-left: 5px solid #e6b800; padding-left: 1rem; margin: 0 0 1.5rem 0; font-size: 1.6rem;">📦 Produtos em Destaque</h2>
        <div class="servicos-grid" style="display: flex; flex-wrap: wrap; gap: 1.5rem; margin-top: 1rem;">
          <div class="servico" style="flex: 1; min-width: 200px; background: #ffffff; padding: 1.5rem; border-radius: 18px; text-align: center; box-shadow: 0 2px 6px rgba(0,0,0,0.05); border: 1px solid #eef2f6; transition: transform 0.2s;">
            <div class="servico-icon" style="font-size: 2rem; margin-bottom: 0.8rem;">📝</div>
            <h3 style="margin: 0 0 0.5rem 0; color: #2c5f7a;">Microsoft Office 365</h3>
            <p style="font-size: 0.9rem; color: #666; margin: 0;">Licença vitalícia para 5 dispositivos</p>
          </div>
          <div class="servico" style="flex: 1; min-width: 200px; background: #ffffff; padding: 1.5rem; border-radius: 18px; text-align: center; box-shadow: 0 2px 6px rgba(0,0,0,0.05); border: 1px solid #eef2f6; transition: transform 0.2s;">
            <div class="servico-icon" style="font-size: 2rem; margin-bottom: 0.8rem;">🪟</div>
            <h3 style="margin: 0 0 0.5rem 0; color: #2c5f7a;">Windows 11 Pro</h3>
            <p style="font-size: 0.9rem; color: #666; margin: 0;">Sistema operacional mais recente</p>
          </div>
          <div class="servico" style="flex: 1; min-width: 200px; background: #ffffff; padding: 1.5rem; border-radius: 18px; text-align: center; box-shadow: 0 2px 6px rgba(0,0,0,0.05); border: 1px solid #eef2f6; transition: transform 0.2s;">
            <div class="servico-icon" style="font-size: 2rem; margin-bottom: 0.8rem;">💻</div>
            <h3 style="margin: 0 0 0.5rem 0; color: #2c5f7a;">Windows 10 Pro</h3>
            <p style="font-size: 0.9rem; color: #666; margin: 0;">Sistema operacional estável</p>
          </div>
        </div>
      </div>

      <!-- Card: Contato -->
      <div class="card" style="background: white; border-radius: 20px; padding: 1.8rem; margin-bottom: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
        <h2 style="color: #2c5f7a; border-left: 5px solid #e6b800; padding-left: 1rem; margin: 0 0 1.5rem 0; font-size: 1.6rem;">📞 Entre em Contato</h2>
        <div class="contato-info" style="background: #eef2f9; border-radius: 20px; padding: 1.5rem; margin-top: 0.5rem;">
          <p style="margin: 0.5rem 0;"><strong>WhatsApp:</strong> (11) 99999-9999</p>
          <p style="margin: 0.5rem 0;"><strong>E-mail:</strong> contato@casadosoftware.com.br</p>
          <p style="margin: 0.5rem 0;"><strong>Horário:</strong> Segunda a sexta, das 9h às 18h</p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer style="background: #2c5f7a; color: #cbd5e6; text-align: center; padding: 2rem; margin-top: 2rem; font-size: 0.85rem;">
      <p style="margin: 0.5rem 0;"><strong>Casa do Software</strong> | Licenças Originais e Garantidas</p>
      <p style="margin: 0.5rem 0;">📞 (11) 99999-9999 | ✉️ contato@casadosoftware.com.br</p>
      <p style="margin: 0.5rem 0;">© 2024 - Todos os direitos reservados</p>
    </footer>
  </div>
</template>
