class DraggableBoxes {
  constructor() {
    this.boxes = Array.from(document.querySelectorAll('.draggable-box'))
    if (!this.boxes.length) {
      return
    }
    
    // Cache DOM elements for better performance
    this.container = document.querySelector('.projects-container')
    this.tooltip = document.getElementById('tooltip')
    this.scatterButton = document.querySelector('.scatter')
    
    // If scatter button not found, try to find it after a short delay
    if (!this.scatterButton) {
      setTimeout(() => {
        this.scatterButton = document.querySelector('.scatter')
        if (this.scatterButton) {
          this.bindScatterButton()
        }
      }, 100)
    } else {
      // Button found immediately, bind it
      this.bindScatterButton()
    }
    
    // Project data array for better performance
    this.projectData = [
      { title: 'DX10', heroImage: '/assets/images/dx10 cover-CMCuynen.jpg' },
      { title: 'Terb', heroImage: '/assets/images/terb cover-h_QUVJyr.gif' },
      { title: 'National Media Office', heroImage: '/assets/images/nmo cover-C14L-Tp_.jpg' },
      { title: 'The Founders Office', heroImage: '/assets/images/tfo cover-BIASUizX.jpg' },
      { title: 'Sheikh Zayed', heroImage: '/assets/images/zayed cover-D8pDKJav.jpg' },
      { title: 'Kojinn', heroImage: '/assets/images/kojinn cover-CN2NiazX.jpg' },
      { title: 'Hotaling & Co.', heroImage: '/assets/images/hc cover-Csbse1z4.gif' },
      { title: 'Farm Sanctuary', heroImage: '/assets/images/fs cover-6t3d6SLl.jpg' },
      { title: 'Relief International', heroImage: '/assets/images/ri-cover-BwIK5Nl6.jpg' }
    ]
    
    this.draggedBox = null
    this.isDragging = false
    this.mouseStartX = 0
    this.mouseStartY = 0
    this.highestZIndex = 1000
    this.tooltipsEnabled = false
    
    this.init()
    this.setBoxSizes()
  }
  
  init() {
    if (!this.container) return
    this.bindEvents()
  }
  
  bindEvents() {
    this.boxes.forEach(box => {
      box.addEventListener('mousedown', (e) => this.startDrag(e, box))
      box.addEventListener('mouseenter', (e) => this.showTooltip(e, box))
      box.addEventListener('mouseleave', () => this.hideTooltip())
      box.addEventListener('mousemove', (e) => this.updateTooltipPosition(e))
    })
    document.addEventListener('mousemove', (e) => this.drag(e))
    document.addEventListener('mouseup', (e) => this.stopDrag(e))
    
    // Add global scroll handler for the projects container
    document.addEventListener('wheel', (e) => this.handleScroll(e), { passive: false })
    
    // Add window resize handler to recalculate project sizes
    window.addEventListener('resize', () => this.setBoxSizes())
  }
  
  bindScatterButton() {
    if (!this.scatterButton) {
      return
    }
    
    this.scatterButton.addEventListener('click', (e) => {
        e.preventDefault()
        
        const isScattered = this.boxes.some((box, index) => {
          // Skip hidden project 10 (index 9)
          if (index === 9) return false
          
          // Simple detection: check if transform contains scale(0.7) or rotation
          const transform = box.style.transform || ''
          const hasScale = transform.includes('scale(0.7)')
          const hasRotation = transform.includes('rotate(')
          
          // Also check if left position is not 80vw (organized position)
          const left = box.style.left || ''
          const isNotOrganized = !left.includes('80vw')
          
          const isBoxScattered = hasScale || hasRotation || isNotOrganized
          
          return isBoxScattered
        })
        
        if (isScattered) {
          // Boxes are scattered, so clean them up
          this.putBackBoxes()
        } else {
          // Boxes are organized, so scatter them
          this.scatterBoxes()
        }
      })
  }
  
  handleBoxClick(e, box) {
    // Find the box index from the boxes array
    const boxIndex = Array.from(this.boxes).indexOf(box)
    
    // Prevent visual jitter by maintaining current transform
    const currentTransform = box.style.transform
    box.style.transform = currentTransform
    
    // Navigate to project page and scroll to specific project
    setTimeout(() => {
      // All projects are now on the same page (work.html)
      // Map boxIndex to correct project ID (0-based indexing)
      window.location.href = `/work#project-${boxIndex}`
    }, 50)
  }
  
  showTooltip(e, box) {
    if (!this.tooltip || !this.tooltipsEnabled) return
    
    // Get project data from cached array using box index
    const boxIndex = Array.from(this.boxes).indexOf(box)
    const projectData = this.projectData[boxIndex] || { title: `Project ${boxIndex + 1}`, heroImage: null }
    
    // Set text directly and show tooltip
    this.tooltip.textContent = projectData.title
    this.tooltip.classList.add('visible')
    
    // Position tooltip below cursor
    this.updateTooltipPosition(e)
  }
  

  
  hideTooltip() {
    if (!this.tooltip) return
    this.tooltip.classList.remove('visible')
  }
  
  updateTooltipPosition(e) {
    if (!this.tooltip) return
    
    const tooltipRect = this.tooltip.getBoundingClientRect()
    
    // Position tooltip directly below cursor, centered horizontally
    let x = e.clientX - (tooltipRect.width / 2)
    let y = e.clientY + 5 // Just 5px below cursor
    
    // Keep tooltip within viewport bounds
    if (x < 0) {
      x = 0
    } else if (x + tooltipRect.width > window.innerWidth) {
      x = window.innerWidth - tooltipRect.width
    }
    
    if (y + tooltipRect.height > window.innerHeight) {
      y = e.clientY - tooltipRect.height - 5 // Above cursor if below viewport
    }
    
    this.tooltip.style.left = `${x}px`
    this.tooltip.style.top = `${y}px`
  }
  
  startDrag(e, box) {
    e.preventDefault()
    e.stopPropagation()
    
    this.isDragging = true
    this.draggedBox = box
    this.mouseStartX = e.clientX
    this.mouseStartY = e.clientY
    box.style.cursor = 'grabbing'
    
    // Increment z-index to bring this box to the very front
    this.highestZIndex += 1
    box.style.zIndex = this.highestZIndex.toString()
    box.classList.add('dragging')
    
    // Store initial mouse position for click detection
    this.mouseStartX = e.clientX
    this.mouseStartY = e.clientY
    
    // Store initial box offset for drag calculations
    const rect = box.getBoundingClientRect()
    this.boxStartX = e.clientX - rect.left
    this.boxStartY = e.clientY - rect.top
  }
  
  drag(e) {
    if (!this.isDragging || !this.draggedBox) return
    
    e.preventDefault()
    e.stopPropagation()
    
    // Get the projects container scroll position
    const scrollTop = this.container ? this.container.scrollTop : 0
    
    // Calculate position relative to the initial mouse offset
    const x = e.clientX - this.boxStartX
    const y = e.clientY - this.boxStartY + scrollTop
    
    // Get the current rotation and scale from the box
    const currentTransform = this.draggedBox.style.transform
    const rotationMatch = currentTransform.match(/rotate\(([^)]+)deg\)/)
    const scaleMatch = currentTransform.match(/scale\(([^)]+)\)/)
    const rotation = rotationMatch ? rotationMatch[1] : '0'
    const scale = scaleMatch ? scaleMatch[1] : '1'
    
    // Check if we're in scatter state (scale < 1) to use viewport units
    const isScattered = parseFloat(scale) < 1
    
    if (isScattered) {
      // For scattered state, use the mouse position directly as the center point
      // Convert mouse position to viewport units
      const xVw = (e.clientX / window.innerWidth) * 100
      this.draggedBox.style.left = `${xVw}vw`
      this.draggedBox.style.top = `${y}px`
      this.draggedBox.style.transform = `translateX(-50%) rotate(${rotation}deg) scale(${scale})`
    } else {
      // Use pixel positioning for normal state
      this.draggedBox.style.left = `${x}px`
      this.draggedBox.style.top = `${y}px`
      this.draggedBox.style.transform = `rotate(${rotation}deg) scale(${scale})`
    }
  }
  
  stopDrag(e) {
    if (!this.isDragging || !this.draggedBox) return
    
    // Check if this was a click (no movement) or a drag
    const moved = Math.abs(e.clientX - this.mouseStartX) > 5 || Math.abs(e.clientY - this.mouseStartY) > 5
    
    if (!moved) {
      this.handleBoxClick(e, this.draggedBox)
    } else {
      // Box was dragged, update button text
      this.updateButtonText()
    }
    
    this.isDragging = false
    this.draggedBox.style.cursor = 'grab'
    this.draggedBox.classList.remove('dragging')
    this.draggedBox = null
  }
  
  handleScroll(e) {
    // Only handle scroll if not currently dragging
    if (this.isDragging) return
    
    // Check if the mouse is over the projects container (right side of screen)
    const mouseX = e.clientX
    const rightColumnStart = window.innerWidth * 0.6 // 60% from left (start of right column)
    
    // Only handle scroll if mouse is in the right column (projects area)
    if (mouseX >= rightColumnStart && this.container) {
      e.preventDefault()
      this.container.scrollTop += e.deltaY
    }
    // If mouse is in left column, let the default scroll behavior happen (don't prevent)
  }
  
    setBoxSizes() {
    // Calculate cream column width (40% of viewport)
    const creamColumnWidth = window.innerWidth * 0.4
    // Make project width relative to cream column (60% of cream column width)
    const targetWidth = creamColumnWidth * 0.6
    // Ensure minimum and maximum sizes for usability
    const minWidth = 200
    const maxWidth = 400
    const finalWidth = Math.max(minWidth, Math.min(maxWidth, targetWidth))
    
    // Debug logging
    console.log('setBoxSizes debug:', {
      viewportWidth: window.innerWidth,
      creamColumnWidth,
      targetWidth,
      finalWidth,
      isMobile: window.innerWidth <= 768
    })

    // Store box dimensions for proper ordering
    const boxDimensions = []
    let loadedCount = 0
    const totalBoxes = this.boxes.filter((_, index) => index !== 9).length // Exclude hidden project 10
    
    this.boxes.forEach((box, index) => {
      // Hide project 10 (index 9)
      if (index === 9) {
        box.style.display = 'none'
        return
      }
      
      // Remove number from the box - clean visual
      box.textContent = ''
      
      // Set background image if available
      const projectData = this.projectData[index]
      if (projectData && projectData.heroImage) {
        box.style.backgroundImage = `url('${projectData.heroImage}')`
        box.style.backgroundSize = 'contain' // Show full image without cropping
        box.style.backgroundRepeat = 'no-repeat'
        box.style.backgroundPosition = 'center'
        
        // Debug logging
        console.log(`Setting background for box ${index}:`, {
          projectTitle: projectData.title,
          heroImage: projectData.heroImage,
          backgroundImage: box.style.backgroundImage,
          viewportWidth: window.innerWidth
        })
        
        // Create image element to get natural dimensions
        const img = new Image()
        img.onload = () => {
          // Calculate dimensions maintaining aspect ratio
          const aspectRatio = img.width / img.height
          let boxWidth, boxHeight
          
          // Use the cream column relative width
          boxWidth = finalWidth
          boxHeight = finalWidth / aspectRatio
          
          // Store dimensions with index for proper ordering
          boxDimensions[index] = { width: boxWidth, height: boxHeight }
          loadedCount++
          
          // When all images are loaded, position boxes in correct order
          if (loadedCount === totalBoxes) {
            this.positionBoxesInOrder(boxDimensions)
          }
        }
        img.onerror = () => {
          console.error(`Failed to load image: ${projectData.heroImage}`)
          // Ensure background image is still set even if preloading fails
          box.style.backgroundImage = `url('${projectData.heroImage}')`
          // Fallback for failed images
          boxDimensions[index] = { width: finalWidth, height: finalWidth }
          loadedCount++
          
          if (loadedCount === totalBoxes) {
            this.positionBoxesInOrder(boxDimensions)
          }
        }
        img.src = projectData.heroImage
      } else {
        // Fallback for boxes without images - use square size
        boxDimensions[index] = { width: finalWidth, height: finalWidth }
        loadedCount++
        
        // When all images are loaded, position boxes in correct order
        if (loadedCount === totalBoxes) {
          this.positionBoxesInOrder(boxDimensions)
        }
      }
    })
  }
  
  positionBoxesInOrder(boxDimensions) {
    let currentTop = 100 // Starting position
    
    this.boxes.forEach((box, index) => {
      // Skip hidden project 10 (index 9)
      if (index === 9) return
      
      const dimensions = boxDimensions[index]
      if (dimensions) {
        // Apply dimensions
        box.style.width = `${dimensions.width}px`
        box.style.height = `${dimensions.height}px`
        box.style.left = `80vw` // Center aligned x position
        box.style.top = `${currentTop}px`
        box.style.transform = `translateX(-50%)`
        
        // Update currentTop for next box
        currentTop += dimensions.height + 12
      }
    })
    
    // Update button text after initial positioning
    this.updateButtonText()
    
    // Force boxes into organized state if they're not already
    setTimeout(() => {
      const isScattered = this.boxes.some((box, index) => {
        if (index === 9) return false
        
        // Simple detection: check if transform contains scale(0.7) or rotation
        const transform = box.style.transform || ''
        const hasScale = transform.includes('scale(0.7)')
        const hasRotation = transform.includes('rotate(')
        
        // Also check if left position is not 80vw (organized position)
        const left = box.style.left || ''
        const isNotOrganized = !left.includes('80vw')
        
        return hasScale || hasRotation || isNotOrganized
      })
      
      if (isScattered) {
        this.putBackBoxes()
      }
    }, 100)
  }
  
  scatterBoxes() {
    if (this.boxes.length === 0) {
      return
    }
    
    // Ensure scatter button is always on top
    if (this.scatterButton) {
      this.scatterButton.style.zIndex = '9999'
    }
    
    // Randomly scatter the boxes around the screen
    this.boxes.forEach((box, index) => {
      // Skip hidden project 10 (index 9)
      if (index === 9) return
      
      // Remove any existing transitions for instant changes
      box.style.transition = 'none'
      
      // Get current y position to check distance from adjacent boxes
      const currentTop = parseInt(box.style.top) || 0
      
      // Find boxes above and below this one
      let boxAbove = null
      let boxBelow = null
      
      this.boxes.forEach((otherBox, otherIndex) => {
        if (otherIndex !== index) {
          const otherTop = parseInt(otherBox.style.top) || 0
          if (otherTop < currentTop && (!boxAbove || otherTop > parseInt(boxAbove.style.top))) {
            boxAbove = otherBox
          }
          if (otherTop > currentTop && (!boxBelow || otherTop < parseInt(boxBelow.style.top))) {
            boxBelow = otherBox
          }
        }
      })
      
      // Random x position across full viewport width (more scattered)
      const boxWidth = parseInt(box.style.width) || 250
      const boxHeight = parseInt(box.style.height) || 220
      const maxX = 95 // Use almost full viewport width (95vw)
      const minX = 5  // Start from 5vw (more spread)
      const maxY = window.innerHeight - boxHeight - 20 // Keep box within viewport (minus padding)
      const minY = 20 // Minimum y position (accounting for padding)
      
      let xPosition, yPosition
      let attempts = 0
      const maxAttempts = 100 // More attempts to find good positions
      
      do {
        xPosition = Math.random() * (maxX - minX) + minX
        yPosition = Math.random() * (maxY - minY) + minY
        attempts++
        
              // Check distance from adjacent boxes (optimized) - increased minimum distance
      const minDistance = 80 // Increased from 30 to 80 for more spread
      const minDistanceSquared = minDistance * minDistance // Avoid square root for performance
      
      if (boxAbove) {
        const aboveX = parseFloat(boxAbove.style.left) || 80
        const aboveY = parseInt(boxAbove.style.top) || 0
        const deltaX = xPosition - aboveX
        const deltaY = yPosition - aboveY
        const distanceSquared = deltaX * deltaX + deltaY * deltaY
        if (distanceSquared < minDistanceSquared) continue
      }
      
      if (boxBelow) {
        const belowX = parseFloat(boxBelow.style.left) || 80
        const belowY = parseInt(boxBelow.style.top) || 0
        const deltaX = xPosition - belowX
        const deltaY = yPosition - belowY
        const distanceSquared = deltaX * deltaX + deltaY * deltaY
        if (distanceSquared < minDistanceSquared) continue
      }
        
        break // Found a good position
      } while (attempts < maxAttempts)
      
      // Random rotation between -5 and +5 degrees
      const rotation = (Math.random() * 10 - 5).toFixed(1)
      
      // Set z-index so first project (index 0) is on top, last project is at back
      const zIndex = 1000 + (this.boxes.length - index)
      box.style.zIndex = zIndex.toString()
      
      box.style.left = `${xPosition}vw`
      box.style.top = `${yPosition}px`
      box.style.transform = `translateX(-50%) rotate(${rotation}deg) scale(0.7)`
    })
    
    this.updateButtonText()
  }
  
  updateButtonText() {
    if (this.scatterButton) {
      const isScattered = this.boxes.some((box, index) => {
        // Skip hidden project 10 (index 9)
        if (index === 9) return false
        
        // Simple detection: check if transform contains scale(0.7) or rotation
        const transform = box.style.transform || ''
        const hasScale = transform.includes('scale(0.7)')
        const hasRotation = transform.includes('rotate(')
        
        // Also check if left position is not 80vw (organized position)
        const left = box.style.left || ''
        const isNotOrganized = !left.includes('80vw')
        
        const boxIsScattered = hasScale || hasRotation || isNotOrganized
        
        return boxIsScattered
      })
      
      this.scatterButton.textContent = isScattered ? 'Clean up' : 'Scatter'
    }
  }
  
  putBackBoxes() {
    // Reset boxes to their original positions
    let currentTop = 100 // Starting position
    
    this.boxes.forEach((box, index) => {
      // Skip hidden project 10 (index 9)
      if (index === 9) return
      
      // Remove any existing transitions for instant changes
      box.style.transition = 'none'
      
      // Center aligned x position (same as original positioning)
      const xPosition = 80 // 80vw (center of cream column)
      
      // Calculate original y position based on box height
      const boxHeight = parseInt(box.style.height) || 220
      const yPosition = currentTop
      currentTop += boxHeight + 12 // Add box height + 12px gap
      
      box.style.left = `${xPosition}vw`
      box.style.top = `${yPosition}px`
      box.style.transform = `translateX(-50%) scale(1)` // Center the box and return to original size
      box.style.zIndex = '' // Reset z-index
    })
    
    // Update button text after all boxes are reset
    this.updateButtonText()
  }
  
  // Enable tooltips after projects fade in
  enableTooltips() {
    this.tooltipsEnabled = true
  }
  
  // Cleanup method for removing event listeners
  destroy() {
    document.removeEventListener('mousemove', this.drag)
    document.removeEventListener('mouseup', this.stopDrag)
    document.removeEventListener('wheel', this.handleScroll)
    
    // Scatter button event listener cleanup removed since musings button was removed
  }
}

// Initialize draggable boxes when DOM is loaded with robust error handling
function initializeDraggableBoxes() {
  try {
    // Check if projects container exists
    const projectsContainer = document.querySelector('.projects-container')
    if (!projectsContainer) {
      setTimeout(initializeDraggableBoxes, 100)
      return
    }
    
    // Check if draggable boxes exist
    const draggableBoxes = document.querySelectorAll('.draggable-box')
    if (draggableBoxes.length === 0) {
      setTimeout(initializeDraggableBoxes, 100)
      return
    }
    
    // Check if scatter button exists
    const scatterButton = document.querySelector('.scatter')
    
    window.draggableBoxes = new DraggableBoxes()
  } catch (error) {
    // Retry once after a delay
    setTimeout(() => {
      try {
        window.draggableBoxes = new DraggableBoxes()
      } catch (retryError) {
        // Silent fail on retry
      }
    }, 200)
  }
}

function ensureDraggableBoxesInitialization() {
  // Try multiple times to ensure initialization
  let attempts = 0
  const maxAttempts = 5
  
  function tryInitialize() {
    attempts++
    try {
      initializeDraggableBoxes()
      if (window.draggableBoxes) {
        return
      }
    } catch (error) {
      // Silent fail
    }
    
    // If not successful and we haven't reached max attempts, try again
    if (attempts < maxAttempts) {
      setTimeout(tryInitialize, 150 * attempts) // Increasing delay
    }
  }
  
  tryInitialize()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ensureDraggableBoxesInitialization)
} else {
  ensureDraggableBoxesInitialization()
}

// Additional fallback - try again after a short delay
setTimeout(() => {
  if (!window.draggableBoxes) {
    ensureDraggableBoxesInitialization()
  }
}, 1000)
