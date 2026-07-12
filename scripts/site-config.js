(function () {
  const CONFIG_KEY = 'suxin-site-config'
  const CONSULT_SUBMISSIONS_KEY = 'suxin-consult-submissions'
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

  function setImage(image, src, alt) {
    if (!image) return
    if (src) image.setAttribute('src', src)
    if (alt) image.setAttribute('alt', alt)
  }

  function createIcon(className) {
    const icon = document.createElement('i')
    icon.className = className || 'ri-links-line'
    return icon
  }

  function createTextElement(tagName, className, text) {
    const element = document.createElement(tagName)
    if (className) element.className = className
    element.textContent = text || ''
    return element
  }

  function appendIconText(element, iconClass, label, trailingIconClass) {
    element.innerHTML = ''
    if (iconClass) {
      element.appendChild(createIcon(iconClass))
    }
    element.append(document.createTextNode(label || '未命名'))
    if (trailingIconClass) {
      const trailingIcon = createIcon(trailingIconClass)
      trailingIcon.classList.add('right')
      element.appendChild(trailingIcon)
    }
  }

  function ensureRuntimeStyle(id, cssText) {
    if (document.getElementById(id)) return

    const style = document.createElement('style')
    style.id = id
    style.textContent = cssText
    document.head.appendChild(style)
  }

  function applyHero(pageConfig) {
    const hero = pageConfig.hero || {
      title: pageConfig.heroTitle,
      subtitle: pageConfig.heroSubtitle,
    }

    setText('.head h1, .title h1, .page-head h1', hero.title)
    setText('.head p, .title p, .page-head p', hero.subtitle)
  }

  function createSectionTitle(text) {
    return createTextElement('h2', 'section-title', text || '未命名区块')
  }

  function createFormPanel(panel, panelClass, buttonClass, interactive) {
    const form = document.createElement('form')
    form.className = panelClass
    if (interactive) form.dataset.consultForm = panel.id || 'consult-form'

    const title = createTextElement('h2', '', panel.title || '未命名表单')
    if (panel.titleIconClass) {
      title.append(document.createTextNode(' '))
      title.appendChild(createIcon(panel.titleIconClass))
    }
    form.appendChild(title)

    const grid = document.createElement('div')
    grid.className = 'form-grid'
    ;(panel.fields || []).forEach((field) => {
      const inputId = `${panel.id || 'consult'}-${field.id || 'field'}`
      const label = createTextElement('label', '', field.label || '字段')
      label.htmlFor = inputId
      const inputLike = interactive ? document.createElement('input') : createTextElement('div', 'field', field.placeholder || '输入内容')
      if (interactive) {
        inputLike.className = 'field form-input'
        inputLike.id = inputId
        inputLike.name = field.id || inputId
        inputLike.type = /phone|contact/i.test(field.id || '') ? 'tel' : 'text'
        inputLike.placeholder = field.placeholder || '请输入'
        inputLike.required = true
      }
      if (field.wide) inputLike.style.gridColumn = 'span 3'
      if (field.suffixIconClass) {
        if (interactive) {
          inputLike.dataset.suffixIcon = field.suffixIconClass
        } else {
          inputLike.append(document.createTextNode(' '))
          inputLike.appendChild(createIcon(field.suffixIconClass))
        }
      }
      grid.append(label, inputLike)
    })

    const buttonRow = document.createElement('div')
    buttonRow.className = 'btn-row'
    const button = document.createElement('button')
    button.className = buttonClass
    button.type = interactive ? 'submit' : 'button'
    button.textContent = panel.buttonLabel || '提交'
    buttonRow.appendChild(button)
    grid.appendChild(buttonRow)
    form.appendChild(grid)
    return form
  }

  function applyFormPanels(selector, panels, panelClass, buttonClass, interactive) {
    if (!Array.isArray(panels) || !panels.length) return

    document.querySelectorAll(selector).forEach((container) => {
      container.innerHTML = ''
      panels.forEach((panel) => {
        if (!panel) return
        container.appendChild(createFormPanel(panel, panelClass, buttonClass, interactive))
      })
    })
  }

  function readConsultSubmissions() {
    try {
      const saved = window.localStorage.getItem(CONSULT_SUBMISSIONS_KEY)
      const submissions = saved ? JSON.parse(saved) : []
      return Array.isArray(submissions) ? submissions : []
    } catch {
      return []
    }
  }

  function saveConsultSubmission(submission) {
    const submissions = readConsultSubmissions()
    submissions.unshift(submission)
    window.localStorage.setItem(CONSULT_SUBMISSIONS_KEY, JSON.stringify(submissions))
  }

  function bindConsultSubmissionForms() {
    document.querySelectorAll('.forms form').forEach((form, index) => {
      if (form.dataset.submissionBound === 'true') return
      form.dataset.submissionBound = 'true'
      form.dataset.consultForm = form.dataset.consultForm || (index === 0 ? 'scenario-estimate' : 'room-visit')

      form.addEventListener('submit', (event) => {
        event.preventDefault()
        const fields = Array.from(form.querySelectorAll('input, select, textarea')).map((input) => {
          const label = input.id ? form.querySelector(`label[for="${input.id}"]`) : null
          return {
            name: input.name || input.id || 'field',
            label: label ? label.textContent.trim() : input.name || '字段',
            value: input.value.trim(),
          }
        }).filter((field) => field.value)

        saveConsultSubmission({
          id: `consult-${Date.now()}`,
          formId: form.dataset.consultForm,
          formTitle: form.querySelector('h2')?.textContent.trim() || '应用场景咨询',
          submittedAt: new Date().toISOString(),
          fields,
        })

        form.reset()
        let feedback = form.querySelector('.form-feedback')
        if (!feedback) {
          feedback = createTextElement('p', 'form-feedback', '')
          feedback.setAttribute('role', 'status')
          form.appendChild(feedback)
        }
        feedback.textContent = '提交成功，我们会尽快与您联系。'
      })
    })
  }

  function applyDownloadSection(selector, section, gridClass) {
    if (!section || !Array.isArray(section.items)) return

    document.querySelectorAll(selector).forEach((container) => {
      container.innerHTML = ''
      container.appendChild(createTextElement('h2', '', section.title || '资料下载'))

      const grid = document.createElement('div')
      grid.className = gridClass
      section.items.forEach((item) => {
        if (!item) return
        const link = createTextElement('a', 'download-card', item.label || '未命名资料')
        link.href = item.href || '#'
        grid.appendChild(link)
      })
      container.appendChild(grid)
    })
  }

  function loadHeroVideo(video, source) {
    if (!video || !source || video.dataset.loadedSource === source) return

    const startLoading = () => {
      if (video.dataset.loadedSource === source) return
      video.dataset.loadedSource = source
      video.muted = true
      video.defaultMuted = true
      video.playsInline = true
      video.src = source
      video.load()
      const playVideo = () => video.play().catch(() => {})
      video.addEventListener('canplay', playVideo, { once: true })
      playVideo()
    }

    window.requestAnimationFrame(startLoading)
  }

  function applyHomeHeroVideo(hero) {
    if (!hero) return

    setText('.hero-video-copy h1', hero.title)
    setText('.hero-video-copy p', hero.subtitle)
    updateLink('.hero-video-copy .hero-actions a:first-child', {
      label: hero.primaryLabel,
      href: hero.primaryHref,
    })
    updateLink('.hero-video-copy .hero-actions a:last-child', {
      label: hero.secondaryLabel,
      href: hero.secondaryHref,
    })

    document.querySelectorAll('.hero-video').forEach((video) => {
      if (hero.posterSrc) video.setAttribute('poster', hero.posterSrc)
      if (hero.posterAlt) video.setAttribute('aria-label', hero.posterAlt)
      const shell = video.closest('.hero-video-shell')
      if (shell) {
        if (hero.maxWidth) shell.style.setProperty('--hero-video-max-width', hero.maxWidth)
        if (hero.aspectRatio) shell.style.setProperty('--hero-video-aspect', hero.aspectRatio)
      }
      loadHeroVideo(video, hero.videoSrc || video.dataset.src)
    })
  }

  function applyHomeFeatureCards(cards) {
    if (!Array.isArray(cards) || !cards.length) return

    document.querySelectorAll('.feature-tabs').forEach((container) => {
      container.innerHTML = ''
      cards.forEach((card) => {
        if (!card) return
        const link = document.createElement('a')
        link.className = card.highlighted ? 'feature-tab active' : 'feature-tab'
        link.href = card.href || 'index.html'
        link.appendChild(createIcon(card.iconClass))

        const copy = document.createElement('span')
        const title = document.createElement('strong')
        title.textContent = card.title || '未命名推荐'
        copy.appendChild(title)
        copy.append(document.createTextNode(card.subtitle || ''))
        link.appendChild(copy)
        container.appendChild(link)
      })
    })
  }

  function applyHomeEntrances(items) {
    if (!Array.isArray(items) || !items.length) return

    document.querySelectorAll('.entrances').forEach((container) => {
      container.innerHTML = ''
      items.forEach((item) => {
        if (!item) return
        const link = document.createElement('a')
        link.href = item.href || 'index.html'
        link.appendChild(createIcon(item.iconClass === 'ri-handshake-line' ? 'ri-team-line' : item.iconClass))
        const label = document.createElement('span')
        label.textContent = item.label || '未命名入口'
        link.appendChild(label)
        container.appendChild(link)
      })
    })
  }

  function applyHomeMediaCards(cards) {
    if (!Array.isArray(cards) || !cards.length) return

    const cardSelectors = ['.media-card', '.news-card']
    cardSelectors.forEach((selector, index) => {
      const card = cards[index]
      if (!card) return
      setText(`${selector} .panel-title`, card.title)
      document.querySelectorAll(selector).forEach((element) => {
        const image = element.querySelector('img')
        setImage(image, card.imageSrc, card.imageAlt)

        let link = element.querySelector('.panel-media-link')
        if (!link && image) {
          link = document.createElement('a')
          link.className = 'panel-media-link'
          image.replaceWith(link)
          link.appendChild(image)
        }

        if (link) {
          link.href = card.href || 'index.html'
          link.setAttribute('aria-label', `查看${card.title || '内容'}`)
        }
      })
    })
  }

  function applyAboutPage(pageConfig) {
    applyHero(pageConfig)

    const intro = pageConfig.intro
    if (intro) {
      document.querySelectorAll('.intro-copy').forEach((container) => {
        container.innerHTML = ''
        container.appendChild(createSectionTitle(intro.title))
        ;(intro.paragraphs || []).forEach((paragraph) => {
          if (!paragraph) return
          container.appendChild(createTextElement('p', '', paragraph))
        })
        if (intro.highlight) {
          const paragraph = document.createElement('p')
          const mark = createTextElement('mark', '', intro.highlight)
          paragraph.appendChild(mark)
          container.appendChild(paragraph)
        }
      })
      document.querySelectorAll('.intro img').forEach((image) => {
        setImage(image, intro.imageSrc, intro.imageAlt)
      })
    }

    const timeline = pageConfig.timeline
    if (timeline && Array.isArray(timeline.items)) {
      setText('.timeline .section-title', timeline.title)
      document.querySelectorAll('.steps').forEach((container) => {
        container.innerHTML = ''
        timeline.items.forEach((item) => {
          if (!item) return
          const step = document.createElement('div')
          step.className = 'step'
          step.appendChild(createTextElement('strong', '', item.label || '未命名历程'))
          step.appendChild(document.createElement('span'))
          container.appendChild(step)
        })
      })
    }

    if (Array.isArray(pageConfig.panels)) {
      document.querySelectorAll('.cards').forEach((container) => {
        container.innerHTML = ''
        pageConfig.panels.forEach((panel) => {
          if (!panel) return
          const article = document.createElement('article')
          article.className = 'panel'
          article.appendChild(createSectionTitle(panel.title))

          if (panel.variant === 'chips') {
            const capability = document.createElement('div')
            capability.className = 'capability'
            ;(panel.chips || []).forEach((chip) => {
              capability.appendChild(createTextElement('div', 'chip', chip))
            })
            article.appendChild(capability)
          } else {
            const image = document.createElement('img')
            setImage(image, panel.imageSrc, panel.imageAlt)
            article.appendChild(image)
          }

          container.appendChild(article)
        })
      })
    }
  }

  function applyBusinessPage(pageConfig) {
    applyHero(pageConfig)

    if (Array.isArray(pageConfig.businessCards)) {
      document.querySelectorAll('.business-grid').forEach((container) => {
        container.innerHTML = ''
        pageConfig.businessCards.forEach((card) => {
          if (!card) return
          const article = document.createElement('article')
          article.className = 'business-card'
          article.appendChild(createIcon(card.iconClass))
          article.appendChild(createTextElement('h2', '', card.title || '未命名业务'))
          article.appendChild(createTextElement('p', '', card.description || ''))

          const link = document.createElement('a')
          link.href = card.href || 'consult.html'
          link.append(document.createTextNode(card.linkLabel || '查看详情 '))
          link.appendChild(createIcon('ri-arrow-right-s-line'))
          article.appendChild(link)
          container.appendChild(article)
        })
      })
    }

    const booking = pageConfig.bookingForm
    if (booking) {
      document.querySelectorAll('.booking').forEach((form) => {
        const label = form.querySelector('label')
        if (label) appendIconText(label, booking.iconClass, booking.label)
        const inputs = form.querySelectorAll('input')
        if (inputs[0]) inputs[0].setAttribute('placeholder', booking.namePlaceholder || '')
        if (inputs[1]) inputs[1].setAttribute('placeholder', booking.demandPlaceholder || '')
        const button = form.querySelector('button')
        if (button) button.textContent = booking.buttonLabel || '提交预约'
      })
    }
  }

  function applyConsultPage(pageConfig) {
    applyHero(pageConfig)

    if (Array.isArray(pageConfig.quickLinks)) {
      document.querySelectorAll('.quick').forEach((container) => {
        container.innerHTML = ''
        pageConfig.quickLinks.forEach((item) => {
          if (!item) return
          const link = document.createElement('a')
          link.href = item.href || '#'
          appendIconText(link, item.iconClass, item.label)
          container.appendChild(link)
        })
      })
    }

    applyFormPanels('.forms', pageConfig.formPanels, 'panel', 'btn', true)
    bindConsultSubmissionForms()
    applyDownloadSection('main.wrap > section.panel', pageConfig.downloadSection, 'downloads')
  }

  function applyCasesPage(pageConfig) {
    applyHero(pageConfig)

    const tabs = pageConfig.tabs
    if (tabs && Array.isArray(tabs.items)) {
      document.querySelectorAll('.tabs').forEach((container) => {
        container.innerHTML = ''
        tabs.items.forEach((item, index) => {
          if (!item) return
          const button = createTextElement('button', index === 0 ? 'active' : '', item.label || '未命名分类')
          button.type = 'button'
          button.addEventListener('click', () => {
            container.querySelectorAll('button').forEach((current) => current.classList.remove('active'))
            button.classList.add('active')
          })
          container.appendChild(button)
        })
      })
    }

    if (Array.isArray(pageConfig.filters)) {
      document.querySelectorAll('.filters').forEach((container) => {
        container.innerHTML = ''
        pageConfig.filters.forEach((item) => {
          if (!item) return
          const row = document.createElement('div')
          row.className = 'filter-row'
          appendIconText(row, item.iconClass, item.label, item.trailingIconClass)
          container.appendChild(row)
        })
      })
    }

    if (Array.isArray(pageConfig.caseCards)) {
      document.querySelectorAll('.case-grid').forEach((container) => {
        container.innerHTML = ''
        pageConfig.caseCards.forEach((item) => {
          if (!item) return
          const article = document.createElement('article')
          article.className = item.highlighted ? 'case-card dark' : 'case-card'
          article.appendChild(createTextElement('span', 'tag', item.tag))
          article.appendChild(createTextElement('span', 'corner', item.corner))
          const image = document.createElement('img')
          setImage(image, item.imageSrc, item.imageAlt)
          article.appendChild(image)
          article.appendChild(createTextElement('h2', '', item.title || '未命名案例'))
          if (item.status) {
            const status = createTextElement('span', '', item.status)
            if (item.mutedStatus) status.style.color = '#8a948e'
            article.appendChild(status)
          }
          container.appendChild(article)
        })
      })
    }

    if (pageConfig.downloadCta) {
      updateLink('.download a', {
        label: pageConfig.downloadCta.label,
        href: pageConfig.downloadCta.href,
      })
    }
  }

  function applyNewsPage(pageConfig) {
    applyHero(pageConfig)

    const lead = pageConfig.leadArticle
    if (lead) {
      document.querySelectorAll('.lead').forEach((article) => {
        setImage(article.querySelector('img'), lead.imageSrc, lead.imageAlt)
        const copy = article.querySelector('.lead-copy')
        if (!copy) return
        copy.innerHTML = ''
        copy.appendChild(createTextElement('span', 'kicker', lead.kicker || '资讯'))
        copy.appendChild(createTextElement('h2', '', lead.title || '未命名资讯'))
        copy.appendChild(createTextElement('p', '', lead.description || ''))
      })
    }

    const topics = pageConfig.topics
    if (topics && Array.isArray(topics.items)) {
      document.querySelectorAll('.side').forEach((container) => {
        container.innerHTML = ''
        container.appendChild(createTextElement('h2', '', topics.title || '资讯分类'))
        topics.items.forEach((item) => {
          if (!item) return
          const link = document.createElement('a')
          link.className = 'topic'
          link.href = item.href || '#'
          appendIconText(link, item.iconClass, item.label)
          container.appendChild(link)
        })
      })
    }

    if (Array.isArray(pageConfig.newsCards)) {
      document.querySelectorAll('.list').forEach((container) => {
        container.innerHTML = ''
        pageConfig.newsCards.forEach((item) => {
          if (!item) return
          const article = document.createElement('article')
          article.className = 'news-card'
          article.appendChild(createIcon(item.iconClass))
          article.appendChild(createTextElement('h3', '', item.title || '未命名资讯'))
          article.appendChild(createTextElement('p', '', item.description || ''))
          container.appendChild(article)
        })
      })
    }
  }

  function applyCooperationPage(pageConfig) {
    applyHero(pageConfig)

    if (Array.isArray(pageConfig.partnerCards)) {
      document.querySelectorAll('.partner-grid').forEach((container) => {
        container.innerHTML = ''
        pageConfig.partnerCards.forEach((item) => {
          if (!item) return
          const link = document.createElement('a')
          link.className = 'partner-card'
          link.href = item.href || '#forms'
          link.appendChild(createIcon(item.iconClass))
          link.appendChild(createTextElement('strong', '', item.label || '未命名合作'))
          container.appendChild(link)
        })
      })
    }

    applyFormPanels('.forms', pageConfig.formPanels, 'form-panel', 'primary-btn', false)
    applyDownloadSection('.download-panel', pageConfig.downloadSection, 'download-grid')
  }

  function applyGalleryPage(pageConfig) {
    applyHero(pageConfig)

    if (!Array.isArray(pageConfig.photos)) return

    ensureRuntimeStyle(
      'suxin-gallery-featured-style',
      '.photo.featured{grid-column:span 2}.photo.featured img{height:280px}@media(max-width:720px){.photo.featured{grid-column:auto}.photo.featured img{height:230px}}',
    )
    document.querySelectorAll('.gallery').forEach((container) => {
      container.innerHTML = ''
      pageConfig.photos.forEach((item) => {
        if (!item) return
        const article = document.createElement('article')
        article.className = item.featured ? 'photo featured' : 'photo'
        const image = document.createElement('img')
        setImage(image, item.imageSrc, item.imageAlt)
        const copy = document.createElement('div')
        copy.appendChild(createTextElement('h2', '', item.title || '未命名图片'))
        copy.appendChild(createTextElement('p', '', item.description || ''))
        article.append(image, copy)
        container.appendChild(article)
      })
    })
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
      if (pageConfig.heroVideo) {
        applyHomeHeroVideo(pageConfig.heroVideo)
      } else {
        applyHomeHeroVideo({
          title: pageConfig.heroTitle,
          subtitle: pageConfig.heroSubtitle,
          primaryLabel: pageConfig.primaryCtaLabel,
          primaryHref: 'consult.html',
          secondaryLabel: pageConfig.secondaryCtaLabel,
          secondaryHref: 'cooperation.html',
        })
      }

      applyHomeFeatureCards(pageConfig.featureCards)
      applyHomeEntrances(pageConfig.businessEntrances)
      applyHomeMediaCards(pageConfig.mediaCards)
      return
    }

    if (page === 'about') {
      applyAboutPage(pageConfig)
      return
    }

    if (page === 'business') {
      applyBusinessPage(pageConfig)
      return
    }

    if (page === 'consult') {
      applyConsultPage(pageConfig)
      return
    }

    if (page === 'cases') {
      applyCasesPage(pageConfig)
      return
    }

    if (page === 'news') {
      applyNewsPage(pageConfig)
      return
    }

    if (page === 'cooperation') {
      applyCooperationPage(pageConfig)
      return
    }

    if (page === 'gallery') {
      applyGalleryPage(pageConfig)
      return
    }

    applyHero(pageConfig)
  }

  function applyConfig() {
    const sections = readConfig()
    const page = document.body.dataset.page
    applyNavigation(sections.navigation)
    applyBranding(sections.branding)
    applyFooter(sections.footer)
    applyPage(sections[pageToSection[page]])
    if (page === 'home' && !sections.pageHome) {
      document.querySelectorAll('.hero-video').forEach((video) => loadHeroVideo(video, video.dataset.src))
    }
    if (page === 'consult') bindConsultSubmissionForms()
  }

  window.SuxinSiteConfig = { apply: applyConfig, key: CONFIG_KEY }
  document.addEventListener('DOMContentLoaded', applyConfig)
})()
