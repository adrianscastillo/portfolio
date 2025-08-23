class ButtonColorManager {
  constructor() {
    this.buttons = document.querySelectorAll('.right-top-bar a')
    this.init()
  }

  init() {
    if (this.buttons.length === 0) {
      console.log('Buttons not found')
      return
    }
    
    this.bindEvents()
    this.updateButtonColors()
  }

  bindEvents() {
    // Update colors on mouse move
    document.addEventListener('mousemove', () => {
      this.updateButtonColors()
    })

    // Update colors on scroll
    document.addEventListener('scroll', () => {
      this.updateButtonColors()
    })

    // Update colors when project boxes are scattered or moved
    document.addEventListener('DOMNodeInserted', () => {
      this.updateButtonColors()
    })
  }

  getColorAtButtonPosition(button) {
    const rect = button.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    
    // Temporarily hide the button to see what's behind it
    const originalZIndex = button.style.zIndex
    button.style.zIndex = '-1'
    
    // Check if there's a project box at this position
    const elementAtPosition = document.elementFromPoint(x, y)
    const isOverProjectBox = elementAtPosition && elementAtPosition.classList.contains('draggable-box')
    
    // Restore the button's z-index
    button.style.zIndex = originalZIndex
    
    if (isOverProjectBox) {
      // Button is over a project box (dark background)
      return 'white' // White text for dark project box
    } else {
      // Button is over cream column area (light background)
      return '#0002aa' // Blue text for cream background
    }
  }



  updateButtonColors() {
    this.buttons.forEach(button => {
      const color = this.getColorAtButtonPosition(button)
      button.style.color = color
    })
  }
}

// Initialize the button color manager
document.addEventListener('DOMContentLoaded', () => {
  new ButtonColorManager()
})
