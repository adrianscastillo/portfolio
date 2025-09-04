class CMSIntegration {
  constructor() {
    this.cmsUrl = 'http://localhost:1337'
    this.portfolioData = null
    this.init()
  }

  async init() {
    try {
      await this.fetchPortfolioData()
      this.updateFrontend()
    } catch (error) {
      console.error('Error loading CMS data:', error)
      // Fallback to static content if CMS is not available
    }
  }

  async fetchPortfolioData() {
    try {
      const response = await fetch(`${this.cmsUrl}/api/portfolio?populate=*`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      this.portfolioData = data.data.attributes
      console.log('CMS data loaded:', this.portfolioData)
    } catch (error) {
      console.error('Failed to fetch portfolio data:', error)
      throw error
    }
  }

  updateFrontend() {
    if (!this.portfolioData) return

    // Update name
    const nameElement = document.querySelector('.left-stack .name')
    if (nameElement && this.portfolioData.name) {
      nameElement.textContent = this.portfolioData.name
    }

    // Update tagline
    const taglineElement = document.querySelector('.left-stack .tagline')
    if (taglineElement && this.portfolioData.tagline) {
      taglineElement.textContent = this.portfolioData.tagline
    }

    // Update bio
    const bioElement = document.querySelector('.left-stack .bio')
    if (bioElement && this.portfolioData.bio) {
      // Convert rich text to HTML
      const bioHtml = this.convertRichTextToHtml(this.portfolioData.bio)
      bioElement.innerHTML = bioHtml
    }

    // Update location
    const locationElement = document.querySelector('.left-top-bar .location')
    if (locationElement && this.portfolioData.location) {
      locationElement.textContent = this.portfolioData.location
    }

    // Update social links
    this.updateSocialLinks()

    // Update client categories
    this.updateClientCategories()
  }

  updateSocialLinks() {
    if (!this.portfolioData.socialLinks) return

    const socialLinksContainer = document.querySelector('.left-stack .bio')
    if (!socialLinksContainer) return

    // Remove existing social links
    const existingSocialLinks = socialLinksContainer.querySelectorAll('.social-links')
    existingSocialLinks.forEach(link => link.remove())

    // Create new social links section
    if (this.portfolioData.socialLinks && this.portfolioData.socialLinks.length > 0) {
      const socialLinksSection = document.createElement('div')
      socialLinksSection.className = 'social-links'
      socialLinksSection.style.marginTop = '20px'

      this.portfolioData.socialLinks.forEach(socialLink => {
        const linkElement = document.createElement('a')
        linkElement.href = socialLink.url
        linkElement.target = '_blank'
        linkElement.rel = 'noopener noreferrer'
        linkElement.textContent = socialLink.platform
        linkElement.style.color = '#ffffff'
        linkElement.style.fontStyle = 'italic'
        linkElement.style.textTransform = 'uppercase'
        linkElement.style.textDecoration = 'none'
        linkElement.style.marginRight = '20px'
        linkElement.style.transition = 'color 0.2s ease'

        linkElement.addEventListener('mouseenter', () => {
          linkElement.style.color = '#85774B'
        })

        linkElement.addEventListener('mouseleave', () => {
          linkElement.style.color = '#ffffff'
        })

        socialLinksSection.appendChild(linkElement)
      })

      socialLinksContainer.appendChild(socialLinksSection)
    }
  }

  updateClientCategories() {
    if (!this.portfolioData.clientCategories) return

    const categoriesContainer = document.querySelector('.left-categories')
    if (!categoriesContainer) return

    // Clear existing categories
    categoriesContainer.innerHTML = ''

    if (this.portfolioData.clientCategories && this.portfolioData.clientCategories.length > 0) {
      this.portfolioData.clientCategories.forEach(category => {
        const categorySection = document.createElement('div')
        categorySection.className = 'cat-section'
        categorySection.style.marginBottom = '30px'

        // Category title
        const categoryTitle = document.createElement('div')
        categoryTitle.className = 'cat-title'
        categoryTitle.textContent = category.categoryName
        categorySection.appendChild(categoryTitle)

        // Category projects
        if (category.projects && category.projects.length > 0) {
          const projectsList = document.createElement('div')
          projectsList.className = 'cat-text'

          category.projects.forEach(project => {
            const projectElement = document.createElement('div')
            projectElement.style.marginBottom = '8px'

            if (project.link) {
              const projectLink = document.createElement('a')
              projectLink.href = project.link
              projectLink.target = '_blank'
              projectLink.rel = 'noopener noreferrer'
              projectLink.textContent = project.title
              projectLink.style.color = 'inherit'
              projectLink.style.textDecoration = 'underline'
              projectLink.style.transition = 'color 0.2s ease'

              projectLink.addEventListener('mouseenter', () => {
                projectLink.style.color = '#85774B'
              })

              projectLink.addEventListener('mouseleave', () => {
                projectLink.style.color = 'inherit'
              })

              projectElement.appendChild(projectLink)
            } else {
              projectElement.textContent = project.title
            }

            if (project.description) {
              const descriptionElement = document.createElement('div')
              descriptionElement.textContent = project.description
              descriptionElement.style.fontSize = '14px'
              descriptionElement.style.opacity = '0.8'
              descriptionElement.style.marginTop = '2px'
              projectElement.appendChild(descriptionElement)
            }

            projectsList.appendChild(projectElement)
          })

          categorySection.appendChild(projectsList)
        }

        categoriesContainer.appendChild(categorySection)
      })
    }
  }

  convertRichTextToHtml(richText) {
    if (!richText) return ''

    // Simple conversion - you might want to use a proper rich text parser
    // For now, just return the text content
    return richText.replace(/\n/g, '<br>')
  }

  // Method to refresh data
  async refresh() {
    try {
      await this.fetchPortfolioData()
      this.updateFrontend()
    } catch (error) {
      console.error('Error refreshing CMS data:', error)
    }
  }
}

// Initialize CMS integration when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.cmsIntegration = new CMSIntegration()
})
