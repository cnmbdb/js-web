(function () {
  const CONFIG_KEY = 'suxin-site-config'
  const pageToSection = {
    home: 'pageHome',
    about: 'pageAbout',
    business: 'pageBusiness',
    consult: 'pageConsult',
    cases: 'pageCases',
    news: 'pageNews',
    cooperation: 'pageCooperation',
    gallery: 'pageGallery',
  }
  const navFieldMap = {
    home: 'homeLabel',
    about: 'aboutLabel',
    business: 'businessLabel',
    consult: 'consultLabel',
    cases: 'casesLabel',
    news: 'newsLabel',
    cooperation: 'cooperationLabel',
    gallery: 'galleryLabel',
  }

  function readConfig() {
    try {
      const saved = window.localStorage.getItem(CONFIG_KEY)
      return saved ? JSON.parse(saved).sections || {} : {}
    } catch {
      return {}
    }
  }

  function setText(selector, value) {
    if (!value) return
    document.querySelectorAll(selector).forEach((element) => {
      element.textContent = value
    })
  }

  function replaceActionText(selector, value) {
    if (!value) return
    document.querySelectorAll(selector).forEach((element) => {
      const icon = element.querySelector('i')
      element.textContent = value
      if (icon) element.prepend(icon)
    })
  }

  function applyNavigation(navigation) {
    if (!navigation) return

    if (Array.isArray(navigation.menuItems)) {
      document.querySelectorAll('.main-nav').forEach((nav) => {
        nav.innerHTML = ''
        navigation.menuItems
          .filter((item) => item && item.visible !== false)
          .forEach((item) => {
            const link = document.createElement('a')
            link.href = item.href || 'index.html'
            link.dataset.page = item.page || ''
            link.textContent = item.label || '未命名菜单'
            nav.appendChild(link)
          })
      })
    } else {
      Object.entries(navFieldMap).forEach(([page, field]) => {
        const label = navigation[field]
        if (label) setText(`.main-nav a[data-page="${page}"]`, label)
      })
    }

    const page = document.body.dataset.page
    document.querySelectorAll('.main-nav a').forEach((link) => {
      link.classList.toggle('active', link.dataset.page === page)
    })

    replaceActionText('.ghost-action', navigation.ghostActionLabel)
    replaceActionText('.solid-action', navigation.solidActionLabel)
  }

  function applyBranding(branding) {
    if (!branding) return

    setText('.brand-text', branding.brandName)
    if (branding.siteTitle) document.title = branding.siteTitle
    document.querySelectorAll('.brand-mark').forEach((element) => {
      element.style.display = branding.showBrandMark === false ? 'none' : ''
    })
  }

  function applyFooter(footer) {
    if (!footer) return

    replaceActionText('.footer-actions a:nth-child(1)', footer.phone)
    replaceActionText('.footer-actions a:nth-child(2)', footer.wechat)
    replaceActionText('.footer-actions a:nth-child(3)', footer.address)

    const footerItems = [
      footer.companyName,
      footer.serviceLine,
      footer.hostingLine,
      '企业AIGC降本',
      '跨境算力出海',
    ]
    document.querySelectorAll('.footer-meta span').forEach((element, index) => {
      if (footerItems[index]) element.textContent = footerItems[index]
    })

    document.querySelectorAll('.footer-meta').forEach((element) => {
      element.style.display = footer.showMeta === false ? 'none' : ''
    })
  }

  function applyPage(pageConfig) {
    if (!pageConfig) return

    const page = document.body.dataset.page
    if (page === 'home') {
      setText('.hero-copy > h1', pageConfig.heroTitle)
      setText('.hero-copy > p', pageConfig.heroSubtitle)
      setText('.carousel-slide:first-child .carousel-caption h2', pageConfig.heroTitle)
      setText('.carousel-slide:first-child .carousel-caption p', pageConfig.heroSubtitle)
      setText('.carousel-slide:first-child .hero-actions a:first-child', pageConfig.primaryCtaLabel)
      setText('.carousel-slide:first-child .hero-actions a:last-child', pageConfig.secondaryCtaLabel)
      return
    }

    setText('.head h1', pageConfig.heroTitle)
    setText('.head p', pageConfig.heroSubtitle)
  }

  function applyConfig() {
    const sections = readConfig()
    const page = document.body.dataset.page
    applyNavigation(sections.navigation)
    applyBranding(sections.branding)
    applyFooter(sections.footer)
    applyPage(sections[pageToSection[page]])
  }

  window.SuxinSiteConfig = { apply: applyConfig, key: CONFIG_KEY }
  document.addEventListener('DOMContentLoaded', applyConfig)
})()
