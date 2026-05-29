<template>
  <div class="min-h-screen" style="background: #f4f7fc; color: #1e2a3e; font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.5;">
    <!-- Header -->
    <div class="header" style="background: #2c5f7a; color: white; padding: 1rem 2rem; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; border-bottom: 3px solid #e6b800;">
      <div class="logo">
        <h1 style="font-size: 1.5rem; font-weight: 600; margin: 0;">Casa do Software</h1>
        <p style="font-size: 0.75rem; color: #cce7f0; margin: 0;">Licenças de Software Originais</p>
      </div>
      <div class="nav" style="display: flex; gap: 2rem;">
        <a href="/" style="color: white; text-decoration: none; font-weight: 500;">Início</a>
        <a href="/produto/microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive" style="color: white; text-decoration: none; font-weight: 500;">Office 365</a>
      </div>
    </div>

    <!-- Container -->
    <div class="container" style="max-width: 1200px; margin: 2rem auto; padding: 0 1.5rem;">
      
      <!-- Hero -->
      <div class="hero" style="background: linear-gradient(135deg, #2c5f7a 0%, #1a3f5e 100%); border-radius: 24px; padding: 2.5rem 2rem; margin-bottom: 2rem; color: white;">
        <h2 style="font-size: 2rem; margin: 0 0 0.75rem 0;">Microsoft Office 365 Vitalício</h2>
        <p style="font-size: 1.1rem; max-width: 700px; opacity: 0.9; margin: 0;">5 Licenças - PC, Mac, Android ou iOS com 1 TB OneDrive incluído. Licença original com entrega imediata.</p>
      </div>

      <!-- Card: Detalhes do Produto -->
      <div class="card" style="background: white; border-radius: 20px; padding: 1.8rem; margin-bottom: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
        <h2 style="color: #2c5f7a; border-left: 5px solid #e6b800; padding-left: 1rem; margin: 0 0 1.5rem 0; font-size: 1.6rem;">📌 Detalhes do Produto</h2>
        <div class="info-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
          <div class="info-item" style="background: #f8fafc; padding: 1rem 1.2rem; border-radius: 14px; border-left: 3px solid #e6b800;">
            <strong style="color: #2c5f7a; display: block; margin-bottom: 0.3rem;">5 Licenças</strong>
            Para dispositivos diferentes (PC, Mac, Android, iOS)
          </div>
          <div class="info-item" style="background: #f8fafc; padding: 1rem 1.2rem; border-radius: 14px; border-left: 3px solid #e6b800;">
            <strong style="color: #2c5f7a; display: block; margin-bottom: 0.3rem;">1 TB OneDrive</strong>
            Armazenamento na nuvem incluído
          </div>
          <div class="info-item" style="background: #f8fafc; padding: 1rem 1.2rem; border-radius: 14px; border-left: 3px solid #e6b800;">
            <strong style="color: #2c5f7a; display: block; margin-bottom: 0.3rem;">Ativação Vitalícia</strong>
            Sem assinatura mensal ou anual
          </div>
          <div class="info-item" style="background: #f8fafc; padding: 1rem 1.2rem; border-radius: 14px; border-left: 3px solid #e6b800;">
            <strong style="color: #2c5f7a; display: block; margin-bottom: 0.3rem;">Aplicativos Completos</strong>
            Word, Excel, PowerPoint, Outlook e mais
          </div>
        </div>
      </div>

      <!-- Card: Aplicativos -->
      <div class="card" style="background: white; border-radius: 20px; padding: 1.8rem; margin-bottom: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
        <h2 style="color: #2c5f7a; border-left: 5px solid #e6b800; padding-left: 1rem; margin: 0 0 1.5rem 0; font-size: 1.6rem;">📦 Aplicativos Incluídos</h2>
        <div class="servicos-grid" style="display: flex; flex-wrap: wrap; gap: 1.5rem; margin-top: 1rem;">
          <div class="servico" style="flex: 1; min-width: 200px; background: #ffffff; padding: 1.5rem; border-radius: 18px; text-align: center; box-shadow: 0 2px 6px rgba(0,0,0,0.05); border: 1px solid #eef2f6; transition: transform 0.2s;">
            <div class="servico-icon" style="font-size: 2rem; margin-bottom: 0.8rem;">📝</div>
            <h3 style="margin: 0 0 0.5rem 0; color: #2c5f7a;">Word</h3>
            <p style="font-size: 0.9rem; color: #666; margin: 0;">Processador de texto</p>
          </div>
          <div class="servico" style="flex: 1; min-width: 200px; background: #ffffff; padding: 1.5rem; border-radius: 18px; text-align: center; box-shadow: 0 2px 6px rgba(0,0,0,0.05); border: 1px solid #eef2f6; transition: transform 0.2s;">
            <div class="servico-icon" style="font-size: 2rem; margin-bottom: 0.8rem;">📊</div>
            <h3 style="margin: 0 0 0.5rem 0; color: #2c5f7a;">Excel</h3>
            <p style="font-size: 0.9rem; color: #666; margin: 0;">Planilhas eletrônicas</p>
          </div>
          <div class="servico" style="flex: 1; min-width: 200px; background: #ffffff; padding: 1.5rem; border-radius: 18px; text-align: center; box-shadow: 0 2px 6px rgba(0,0,0,0.05); border: 1px solid #eef2f6; transition: transform 0.2s;">
            <div class="servico-icon" style="font-size: 2rem; margin-bottom: 0.8rem;">📈</div>
            <h3 style="margin: 0 0 0.5rem 0; color: #2c5f7a;">PowerPoint</h3>
            <p style="font-size: 0.9rem; color: #666; margin: 0;">Apresentações</p>
          </div>
          <div class="servico" style="flex: 1; min-width: 200px; background: #ffffff; padding: 1.5rem; border-radius: 18px; text-align: center; box-shadow: 0 2px 6px rgba(0,0,0,0.05); border: 1px solid #eef2f6; transition: transform 0.2s;">
            <div class="servico-icon" style="font-size: 2rem; margin-bottom: 0.8rem;">📧</div>
            <h3 style="margin: 0 0 0.5rem 0; color: #2c5f7a;">Outlook</h3>
            <p style="font-size: 0.9rem; color: #666; margin: 0;">Email e calendário</p>
          </div>
        </div>
      </div>

      <!-- Card: Por que comprar -->
      <div class="card" style="background: white; border-radius: 20px; padding: 1.8rem; margin-bottom: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
        <h2 style="color: #2c5f7a; border-left: 5px solid #e6b800; padding-left: 1rem; margin: 0 0 1.5rem 0; font-size: 1.6rem;">✓ Por que comprar na Casa do Software?</h2>
        <div class="info-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
          <div class="info-item" style="background: #f8fafc; padding: 1rem 1.2rem; border-radius: 14px; border-left: 3px solid #e6b800;">
            <strong style="color: #2c5f7a; display: block; margin-bottom: 0.3rem;">Licenças Originais</strong>
            100% originais e garantidas pela Microsoft
          </div>
          <div class="info-item" style="background: #f8fafc; padding: 1rem 1.2rem; border-radius: 14px; border-left: 3px solid #e6b800;">
            <strong style="color: #2c5f7a; display: block; margin-bottom: 0.3rem;">Entrega Imediata</strong>
            Receba por e-mail em minutos
          </div>
          <div class="info-item" style="background: #f8fafc; padding: 1rem 1.2rem; border-radius: 14px; border-left: 3px solid #e6b800;">
            <strong style="color: #2c5f7a; display: block; margin-bottom: 0.3rem;">Suporte Técnico</strong>
            Ajuda na instalação e ativação
          </div>
          <div class="info-item" style="background: #f8fafc; padding: 1rem 1.2rem; border-radius: 14px; border-left: 3px solid #e6b800;">
            <strong style="color: #2c5f7a; display: block; margin-bottom: 0.3rem;">Preço Justo</strong>
            Melhor preço com garantia
          </div>
        </div>
      </div>

      <!-- Card: Contato -->
      <div class="card" style="background: white; border-radius: 20px; padding: 1.8rem; margin-bottom: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
        <h2 style="color: #2c5f7a; border-left: 5px solid #e6b800; padding-left: 1rem; margin: 0 0 1.5rem 0; font-size: 1.6rem;">📞 Comprar Agora</h2>
        <div class="contato-info" style="background: #eef2f9; border-radius: 20px; padding: 1.5rem; margin-top: 0.5rem;">
          <p style="margin: 0.5rem 0;"><strong>WhatsApp:</strong> (11) 99999-9999</p>
          <p style="margin: 0.5rem 0;"><strong>E-mail:</strong> contato@casadosoftware.com.br</p>
          <p style="margin: 0.5rem 0;"><strong>Horário:</strong> Segunda a sexta, das 9h às 18h</p>
          <a href="https://wa.me/5511999999999" target="_blank" class="whatsapp-btn" style="background: #25D366; color: white; padding: 0.5rem 1.2rem; border-radius: 40px; text-decoration: none; display: inline-block; margin-top: 0.5rem; font-weight: 500; font-size: 0.9rem;">📱 Comprar no WhatsApp</a>
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
