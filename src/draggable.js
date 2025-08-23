class DraggableBoxes {
  constructor() {
    this.boxes = document.querySelectorAll('.draggable-box')
    if (!this.boxes.length) {
      console.log('Draggable boxes not found')
      return
    }
    
    // Cache DOM elements for better performance
    this.container = document.querySelector('.projects-container')
    this.scatterButton = document.querySelector('.musings')
    
    this.draggedBox = null
    this.isDragging = false
    this.startX = 0
    this.startY = 0
    this.highestZIndex = 1000 // Track the highest z-index used
    
    this.init()
    this.setRandomSizes()
  }
  
  init() {
    if (!this.container) {
      console.error('Projects container not found')
      return
    }
    this.bindEvents()
  }
  
  bindEvents() {
    this.boxes.forEach(box => {
      box.addEventListener('mousedown', (e) => this.startDrag(e, box))
    })
    document.addEventListener('mousemove', (e) => this.drag(e))
    document.addEventListener('mouseup', () => this.stopDrag())
    
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
    
    const rect = box.getBoundingClientRect()
    this.startX = e.clientX - rect.left
    this.startY = e.clientY - rect.top
  }
  
  drag(e) {
    if (!this.isDragging || !this.draggedBox) return
    
    e.preventDefault()
    e.stopPropagation()
    
    // Get the projects container scroll position
    const scrollTop = this.container ? this.container.scrollTop : 0
    
    const x = e.clientX - this.startX
    const y = e.clientY - this.startY + scrollTop
    
    // Get the current rotation from the box
    const currentTransform = this.draggedBox.style.transform
    const rotationMatch = currentTransform.match(/rotate\(([^)]+)deg\)/)
    const rotation = rotationMatch ? rotationMatch[1] : '0'
    
    this.draggedBox.style.left = `${x}px`
    this.draggedBox.style.top = `${y}px`
    this.draggedBox.style.transform = `rotate(${rotation}deg)`
  }
  
  stopDrag() {
    if (!this.isDragging || !this.draggedBox) return
    
    this.isDragging = false
    this.draggedBox.style.cursor = 'grab'
    // Keep the box at its current z-index so it stays in front
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
    const boxWidth = creamColumnWidth - 80 // Subtract padding (40px on each side)
    
    // All boxes use the same square size (10% smaller)
    const boxSize = boxWidth * 0.9

    let currentTop = 100 // Starting position
    
    this.boxes.forEach((box, index) => {
      // Center aligned x position (no random scatter)
      const xPosition = 80 // 80vw (center of cream column)

      box.style.width = `${boxSize}px`
      box.style.height = `${boxSize}px`
      box.style.left = `${xPosition}vw`
      box.style.top = `${currentTop}px`
      box.style.transform = `translateX(-50%)`
      
      // Add number to the box (1-10)
      box.textContent = (index + 1).toString()
      
      // Calculate next position: current box bottom + 12px gap
      currentTop += boxSize + 12
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
  document.addEventListener('DOMContentLoaded', () => new DraggableBoxes())
} else {
  new DraggableBoxes()
}
