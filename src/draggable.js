class DraggableBoxes {
  constructor() {
    this.boxes = document.querySelectorAll('.draggable-box')
    if (!this.boxes.length) return
    
    // Cache DOM elements for better performance
    this.container = document.querySelector('.projects-container')
    this.scatterButton = document.querySelector('.musings')
    this.tooltip = document.getElementById('tooltip')
    
    // Project names array for better performance
    this.projectNames = [
      'Project Alpha', 'Project Beta', 'Project Gamma', 'Project Delta', 'Project Echo',
      'Project Foxtrot', 'Project Golf', 'Project Hotel', 'Project India', 'Project Juliet'
    ]
    
    this.draggedBox = null
    this.isDragging = false
    this.startX = 0
    this.startY = 0
    this.highestZIndex = 1000
    this.tooltipsEnabled = false
    
    this.init()
    this.setRandomSizes()
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
    document.addEventListener('wheel', (e) => this.handleScroll(e))
    
    // Add scatter/put back button functionality
    if (this.scatterButton) {
      this.scatterButton.addEventListener('click', (e) => {
        e.preventDefault()
        if (this.scatterButton.textContent === 'Scatter') {
          this.scatterBoxes()
        } else {
          this.putBackBoxes()
        }
      })
    }
  }
  
  handleBoxClick(e, box) {
    const boxNumber = parseInt(box.textContent)
    
    // Prevent visual jitter by maintaining current transform
    const currentTransform = box.style.transform
    box.style.transform = currentTransform
    
    // Navigate after small delay to prevent jitter
    setTimeout(() => {
      if (boxNumber <= 2) {
        window.location.href = `projects/project-${boxNumber}.html`
      } else {
        window.location.href = `projects/404.html`
      }
    }, 50)
  }
  
  showTooltip(e, box) {
    if (!this.tooltip || !this.tooltipsEnabled) return
    
    // Get project name from cached array
    const boxNumber = parseInt(box.textContent) - 1
    const projectName = this.projectNames[boxNumber] || `Project ${boxNumber + 1}`
    
    // Set text directly and show tooltip
    this.tooltip.textContent = projectName
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
    box.style.cursor = 'grabbing'
    
    // Increment z-index to bring this box to the very front
    this.highestZIndex += 1
    box.style.zIndex = this.highestZIndex.toString()
    box.classList.add('dragging')
    
    // Change button text to "Put Back"
    this.updateButtonText('Put Back')
    
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
    
    // Get the current rotation from the box
    const currentTransform = this.draggedBox.style.transform
    const rotationMatch = currentTransform.match(/rotate\(([^)]+)deg\)/)
    const rotation = rotationMatch ? rotationMatch[1] : '0'
    
    this.draggedBox.style.left = `${x}px`
    this.draggedBox.style.top = `${y}px`
    this.draggedBox.style.transform = `rotate(${rotation}deg)`
  }
  
  stopDrag(e) {
    if (!this.isDragging || !this.draggedBox) return
    
    // Check if this was a click (no movement) or a drag
    const moved = Math.abs(e.clientX - this.mouseStartX) > 5 || Math.abs(e.clientY - this.mouseStartY) > 5
    
    if (!moved) {
      this.handleBoxClick(e, this.draggedBox)
    }
    
    this.isDragging = false
    this.draggedBox.style.cursor = 'grab'
    this.draggedBox.classList.remove('dragging')
    this.draggedBox = null
  }
  
  handleScroll(e) {
    // Only handle scroll if not currently dragging
    if (this.isDragging) return
    
    if (this.container) {
      e.preventDefault()
      this.container.scrollTop += e.deltaY
    }
  }
  
    setRandomSizes() {
    // Calculate cream column width (40% of viewport)
    const creamColumnWidth = window.innerWidth * 0.4
    const boxSize = creamColumnWidth - 80 // Subtract padding (40px on each side)
    
    // All projects are the same square size
    const projectSize = Math.min(boxSize * 1.2, 450) // Even bigger, cap at 450px

    let currentTop = 100 // Starting position
    
    this.boxes.forEach((box, index) => {
      // All boxes are the same square size
      box.style.width = `${projectSize}px`
      box.style.height = `${projectSize}px`
      box.style.left = `80vw` // Center aligned x position
      box.style.top = `${currentTop}px`
      box.style.transform = `translateX(-50%)`
      
      // Add number to the box (1-10)
      box.textContent = (index + 1).toString()
      
      // Calculate next position: current box bottom + 12px gap
      currentTop += projectSize + 12
    })
  }
  
  scatterBoxes() {
    // Change button text to "Put Back"
    this.updateButtonText('Put Back')
    
    this.boxes.forEach((box, index) => {
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
      
      // Random x position within viewport bounds (considering box width)
      const boxWidth = parseInt(box.style.width) || 250
      const boxHeight = parseInt(box.style.height) || 220
      const maxX = 100 - (boxWidth / window.innerWidth * 100) // Keep box within viewport
      const minX = boxWidth / window.innerWidth * 100
      const maxY = window.innerHeight - boxHeight - 40 // Keep box within viewport (minus padding)
      const minY = 40 // Minimum y position (accounting for padding)
      
      let xPosition, yPosition
      let attempts = 0
      const maxAttempts = 50
      
      do {
        xPosition = Math.random() * (maxX - minX) + minX
        yPosition = Math.random() * (maxY - minY) + minY
        attempts++
        
              // Check distance from adjacent boxes (optimized)
      const minDistance = 30
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
      
      box.style.left = `${xPosition}vw`
      box.style.top = `${yPosition}px`
      box.style.transform = `translateX(-50%) rotate(${rotation}deg)`
    })
  }
  
  updateButtonText(text) {
    if (this.scatterButton) {
      this.scatterButton.textContent = text
    }
  }
  
  putBackBoxes() {
    // Reset boxes to their original positions
    let currentTop = 100 // Starting position
    
    this.boxes.forEach((box, index) => {
      // Center aligned x position
      const xPosition = 80 // 80vw (center of cream column)
      
      // Calculate original y position based on box height
      const boxHeight = parseInt(box.style.height) || 220
      const yPosition = currentTop
      currentTop += boxHeight + 12 // Add box height + 12px gap
      
      box.style.left = `${xPosition}vw`
      box.style.top = `${yPosition}px`
      box.style.transform = `translateX(-50%)`
    })
    
    // Change button text back to "Scatter"
    this.updateButtonText('Scatter')
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
    
    if (this.scatterButton) {
      this.scatterButton.removeEventListener('click', this.handleScatterClick)
    }
  }
  

}

// Initialize draggable boxes when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.draggableBoxes = new DraggableBoxes()
  })
} else {
  window.draggableBoxes = new DraggableBoxes()
}
