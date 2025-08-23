class DraggableBoxes {
  constructor() {
    this.boxes = document.querySelectorAll('.draggable-box')
    if (!this.boxes.length) {
      console.log('Draggable boxes not found')
      return
    }
    
    this.draggedBox = null
    this.isDragging = false
    this.startX = 0
    this.startY = 0
    
    this.init()
    this.setRandomSizes()
  }
  
  init() {
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
    const scatterButton = document.querySelector('.musings')
    if (scatterButton) {
      scatterButton.addEventListener('click', (e) => {
        e.preventDefault()
        if (scatterButton.textContent === 'Scatter') {
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
    box.style.zIndex = '1001'
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
    const container = document.querySelector('.projects-container')
    const scrollTop = container ? container.scrollTop : 0
    
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
    this.draggedBox.style.zIndex = '1000'
    this.draggedBox.classList.remove('dragging')
    this.draggedBox = null
  }
  
  handleScroll(e) {
    // Only handle scroll if not currently dragging
    if (this.isDragging) return
    
    const container = document.querySelector('.projects-container')
    if (container) {
      e.preventDefault()
      container.scrollTop += e.deltaY
    }
  }
  
  setRandomSizes() {
    // Define 4 size variants
    const sizeVariants = [
      { width: 260, height: 330 }, // Small rectangle
      { width: 290, height: 220 }, // Medium rectangle
      { width: 330, height: 260 }, // Large rectangle
      { width: 370, height: 240 }  // Wide rectangle
    ]
    
    let currentTop = 100 // Starting position
    let previousIndex = -1 // Track previous size index
    
    this.boxes.forEach((box, index) => {
      // Select a different size from the previous box
      let randomIndex
      do {
        randomIndex = Math.floor(Math.random() * sizeVariants.length)
      } while (randomIndex === previousIndex)
      
      const variant = sizeVariants[randomIndex]
      previousIndex = randomIndex // Update for next iteration
      
      // Center aligned x position
      const xPosition = 80 // 80vw (center of cream column)
      
      box.style.width = `${variant.width}px`
      box.style.height = `${variant.height}px`
      box.style.left = `${xPosition}vw`
      box.style.top = `${currentTop}px`
      box.style.transform = `translateX(-50%)`
      
      // Calculate next position: current box bottom + 12px gap
      currentTop += variant.height + 12
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
        
        // Check distance from box above
        if (boxAbove) {
          const aboveX = parseFloat(boxAbove.style.left) || 80
          const aboveY = parseInt(boxAbove.style.top) || 0
          const distanceFromAbove = Math.sqrt(Math.pow(xPosition - aboveX, 2) + Math.pow(yPosition - aboveY, 2))
          if (distanceFromAbove < 30) continue
        }
        
        // Check distance from box below
        if (boxBelow) {
          const belowX = parseFloat(boxBelow.style.left) || 80
          const belowY = parseInt(boxBelow.style.top) || 0
          const distanceFromBelow = Math.sqrt(Math.pow(xPosition - belowX, 2) + Math.pow(yPosition - belowY, 2))
          if (distanceFromBelow < 30) continue
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
    const button = document.querySelector('.musings')
    if (button) {
      button.textContent = text
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
  

}

// Initialize draggable boxes when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new DraggableBoxes())
} else {
  new DraggableBoxes()
}
