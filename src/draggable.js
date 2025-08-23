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
  }
  
  startDrag(e, box) {
    e.preventDefault()
    e.stopPropagation()
    
    this.isDragging = true
    this.draggedBox = box
    box.style.cursor = 'grabbing'
    box.style.zIndex = '1001'
    
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
    
    this.draggedBox.style.left = `${x}px`
    this.draggedBox.style.top = `${y}px`
    this.draggedBox.style.transform = 'none'
  }
  
  stopDrag() {
    if (!this.isDragging || !this.draggedBox) return
    
    this.isDragging = false
    this.draggedBox.style.cursor = 'grab'
    this.draggedBox.style.zIndex = '1000'
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
}

// Initialize draggable boxes when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new DraggableBoxes())
} else {
  new DraggableBoxes()
}
