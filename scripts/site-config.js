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

  function updateLink(selector, config) {
    document.querySelectorAll(selector).forEach((element) => {
      if (config.label) {
        const icon = element.querySelector('i')
        element.textContent = config.label
        if (icon) element.prepend(icon)
      }

      if (config.href) element.setAttribute('href', config.href)

      if (config.newTab) {
        element.setAttribute('target', '_blank')
        element.setAttribute('rel', 'noopener noreferrer')
        return
      }

      element.removeAttribute('target')
      element.removeAttribute('rel')
    })
  }

  function updateLinkTarget(element, newTab) {
    if (newTab) {
      element.setAttribute('target', '_blank')
      element.setAttribute('rel', 'noopener noreferrer')
      return
    }

    element.removeAttribute('target')
    element.removeAttribute('rel')
  }

  function toCssSize(value, fallback) {
    const text = String(value || '').trim()
    if (!text) return fallback
    if (/^\d+(\.\d+)?$/.test(text)) return `${text}px`
    if (/^\d+(\.\d+)?(px|rem|em|%)$/.test(text)) return text
    return fallback
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
    const logoSize = toCssSize(branding.logoImageSize, '34px')
    const logoTextSize = toCssSize(branding.logoTextSize, '21px')

    document.querySelectorAll('.brand-text').forEach((element) => {
      element.style.fontSize = logoTextSize
    })

    document.querySelectorAll('.brand').forEach((element) => {
      element.style.width = 'auto'
      element.style.minWidth = 'max-content'
      element.style.flexShrink = '0'
    })

    if (branding.siteTitle) document.title = branding.siteTitle
    document.querySelectorAll('.brand-mark').forEach((element) => {
      const imageSrc = String(branding.logoImageSrc || '').trim()
      const iconClass = String(branding.logoIconClass || 'ri-stack-line').trim()
      element.style.display = branding.showBrandMark === false ? 'none' : ''
      element.style.width = logoSize
      element.style.height = logoSize
      element.style.minWidth = logoSize
      element.style.flexShrink = '0'

      if (imageSrc) {
        element.innerHTML = ''
        const image = document.createElement('img')
        image.alt = branding.brandName || 'Logo'
        image.src = imageSrc
        image.style.width = '100%'
        image.style.height = '100%'
        image.style.objectFit = 'contain'
        image.style.display = 'block'
        element.appendChild(image)
        return
      }

      element.innerHTML = ''
      if (iconClass) {
        const icon = document.createElement('i')
        icon.className = iconClass
        element.appendChild(icon)
      }
    })
  }

  function applyFooter(footer) {
    if (!footer) return

    if (Array.isArray(footer.menuItems)) {
      const defaultIconClasses = [
        'ri-customer-service-2-line',
        'ri-wechat-line',
        'ri-map-pin-line',
        'ri-video-chat-line',
      ]

      document.querySelectorAll('.footer-actions').forEach((container) => {
        const existingIconClasses = Array.from(container.querySelectorAll('a i')).map((icon) => icon.className)
        container.innerHTML = ''

        footer.menuItems.forEach((item, index) => {
          if (!item || !item.label) return

          const link = document.createElement('a')
          link.href = item.href || 'index.html'
          updateLinkTarget(link, item.newTab)

          const iconClass = existingIconClasses[index] || defaultIconClasses[index] || 'ri-links-line'
          if (iconClass) {
            const icon = document.createElement('i')
            icon.className = iconClass
            link.appendChild(icon)
          }

          link.append(document.createTextNode(item.label))
          container.appendChild(link)
        })
      })

      return
    }

    updateLink('.footer-actions a:nth-child(1)', {
      label: footer.phone,
      href: footer.phoneHref,
      newTab: footer.phoneNewTab,
    })
    updateLink('.footer-actions a:nth-child(2)', {
      label: footer.wechat,
      href: footer.wechatHref,
      newTab: footer.wechatNewTab,
    })
    updateLink('.footer-actions a:nth-child(3)', {
      label: footer.address,
      href: footer.addressHref,
      newTab: footer.addressNewTab,
    })
    updateLink('.footer-actions a:nth-child(4)', {
      label: footer.videoConsult,
      href: footer.videoConsultHref,
      newTab: footer.videoConsultNewTab,
    })

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
