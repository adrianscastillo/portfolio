// Drag Scroll Implementation for Photo Galleries
class DragScroll {
  constructor() {
    this.galleries = document.querySelectorAll('.photo-gallery')
    this.isDragging = false
    this.startX = 0
    this.scrollLeft = 0
    this.velocity = 0
    this.lastX = 0
    this.lastTime = 0
    this.animationId = null
    this.dragThreshold = 5 // pixels - minimum drag distance before scrolling starts
    this.scrollbarTimeout = null // timeout for hiding scrollbars
    
    this.init()
  }
  
  init() {
    this.galleries.forEach((gallery, index) => {
      this.setupGallery(gallery, index)
    })
  }
  
  setupGallery(gallery, index) {
    const container = gallery.querySelector('.gallery-container')
    if (!container) return
    
    // Add visual feedback for draggable state
    container.style.userSelect = 'none'
    container.setAttribute('data-drag-scroll', 'true')
    container.setAttribute('data-drag-state', 'grab')
    
    // Store reference to the scrollable parent (photo-gallery)
    container.scrollableParent = gallery
    
    // Add event listeners
    container.addEventListener('mousedown', (e) => this.startDrag(e, container))
    container.addEventListener('mousemove', (e) => this.drag(e, container))
    container.addEventListener('mouseup', () => this.endDrag(container))
    container.addEventListener('mouseleave', () => this.endDrag(container))
    
    // Prevent context menu on drag
    container.addEventListener('contextmenu', (e) => {
      if (this.isDragging) {
        e.preventDefault()
      }
    })
  }
  
  startDrag(e, container) {
    // Only start drag on left mouse button
    if (e.button !== 0) return
    
    this.isDragging = true
    this.startX = e.pageX - container.offsetLeft
    this.scrollLeft = container.scrollableParent.scrollLeft
    this.velocity = 0
    this.lastX = e.pageX
    this.lastTime = Date.now()
    
    // Change cursor to grabbing (custom cursor will handle display)
    container.setAttribute('data-drag-state', 'grabbing')
    
    // Clear any existing scrollbar timeout
    if (this.scrollbarTimeout) {
      clearTimeout(this.scrollbarTimeout)
      this.scrollbarTimeout = null
    }
    
    // Show scrollbars during dragging
    const scrollableParent = container.scrollableParent
    scrollableParent.classList.add('show-scrollbars')
    
    // Prevent text selection
    e.preventDefault()
  }
  
  drag(e, container) {
    if (!this.isDragging) return
    
    e.preventDefault()
    
    const x = e.pageX - container.offsetLeft
    const walk = (x - this.startX) * 1.5 // Sensitivity multiplier for smooth feel
    
    // Calculate velocity for inertia
    const currentTime = Date.now()
    const deltaTime = currentTime - this.lastTime
    if (deltaTime > 0) {
      this.velocity = (e.pageX - this.lastX) / deltaTime
    }
    this.lastX = e.pageX
    this.lastTime = currentTime
    
    // Check if we've exceeded the drag threshold
    const dragDistance = Math.abs(e.pageX - (this.startX + container.offsetLeft))
    if (dragDistance < this.dragThreshold) {
      return // Don't scroll yet, might be a click
    }
    
    // Calculate new scroll position using the scrollable parent
    const scrollableParent = container.scrollableParent
    const newScrollLeft = this.scrollLeft - walk
    const maxScroll = scrollableParent.scrollWidth - scrollableParent.clientWidth
    
    // Apply boundaries (no bounce back)
    let finalScrollLeft = newScrollLeft
    if (newScrollLeft < 0) {
      finalScrollLeft = 0
    } else if (newScrollLeft > maxScroll) {
      finalScrollLeft = maxScroll
    }
    
    scrollableParent.scrollLeft = finalScrollLeft
  }
  
  endDrag(container) {
    if (!this.isDragging) return
    
    this.isDragging = false
    container.setAttribute('data-drag-state', 'grab')
    
    // Keep scrollbars visible for 2 seconds after drag ends
    const scrollableParent = container.scrollableParent
    scrollableParent.classList.add('show-scrollbars')
    
    // Clear any existing timeout
    if (this.scrollbarTimeout) {
      clearTimeout(this.scrollbarTimeout)
    }
    
    // Hide scrollbars after 2 seconds
    this.scrollbarTimeout = setTimeout(() => {
      scrollableParent.classList.remove('show-scrollbars')
    }, 2000) // 2 seconds delay
    
    // Apply inertia/momentum
    if (Math.abs(this.velocity) > 0.1) {
      this.applyInertia(container)
    }
  }
  
  applyInertia(container) {
    const friction = 0.95 // Friction coefficient (0.95 = 5% velocity loss per frame)
    const minVelocity = 0.1 // Stop when velocity is very low
    
    const animate = () => {
      if (Math.abs(this.velocity) < minVelocity) {
        this.velocity = 0
        return
      }
      
      // Apply velocity to scroll
      const scrollableParent = container.scrollableParent
      const newScrollLeft = scrollableParent.scrollLeft - this.velocity * 16 // 16ms frame time
      const maxScroll = scrollableParent.scrollWidth - scrollableParent.clientWidth
      
      // Handle boundaries (no bounce back)
      let finalScrollLeft = newScrollLeft
      if (newScrollLeft < 0) {
        finalScrollLeft = 0
        this.velocity = 0 // Stop at boundary
      } else if (newScrollLeft > maxScroll) {
        finalScrollLeft = maxScroll
        this.velocity = 0 // Stop at boundary
      }
      
      scrollableParent.scrollLeft = finalScrollLeft
      
      // Apply friction
      this.velocity *= friction
      
      // Continue animation
      this.animationId = requestAnimationFrame(animate)
    }
    
    // Cancel any existing animation
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    
    animate()
  }
  
  // Method to check if we're currently dragging (for external use)
  isCurrentlyDragging() {
    return this.isDragging
  }
  
  // Cleanup method
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    
    this.galleries.forEach(gallery => {
      const container = gallery.querySelector('.gallery-container')
      if (container) {
        container.removeEventListener('mousedown', (e) => this.startDrag(e, container))
        container.removeEventListener('mousemove', (e) => this.drag(e, container))
        container.removeEventListener('mouseup', () => this.endDrag(container))
        container.removeEventListener('mouseleave', () => this.endDrag(container))
        container.removeEventListener('contextmenu', (e) => {
          if (this.isDragging) {
            e.preventDefault()
          }
        })
      }
    })
  }
}

// Initialize drag scroll when DOM is ready
function initializeDragScroll() {
  // Only initialize on desktop (not mobile/touch devices)
  const isTouchDevice = 'ontouchstart' in window || 
                       navigator.maxTouchPoints > 0 || 
                       window.matchMedia('(pointer: coarse)').matches
  
  if (isTouchDevice) {
    return // Let mobile devices use native scrolling
  }
  
  // Wait for galleries to be available
  const galleries = document.querySelectorAll('.photo-gallery')
  if (galleries.length === 0) {
    setTimeout(initializeDragScroll, 100)
    return
  }
  
  window.dragScroll = new DragScroll()
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeDragScroll)
} else {
  initializeDragScroll()
}