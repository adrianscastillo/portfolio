class CustomCursor {
  constructor() {
    this.canvas = document.createElement('canvas')
    this.canvas.id = 'cursor-canvas'
    this.canvas.style.position = 'fixed'
    this.canvas.style.top = '0'
    this.canvas.style.left = '0'
    this.canvas.style.width = '100vw'
    this.canvas.style.height = '100vh'
    this.canvas.style.zIndex = '9999'
    this.canvas.style.pointerEvents = 'none'
    
    document.body.appendChild(this.canvas)
    
    this.ctx = this.canvas.getContext('2d')
    this.mouse = { x: 0, y: 0 }
    this.trail = []
    this.maxTrailLength = 40
    
    this.init()
    this.bindEvents()
    this.animate()
  }

  init() {
    this.resize()
    window.addEventListener('resize', () => this.resize())
    
    // Hide default cursor
    document.body.style.cursor = 'none'

    // Disable native context menu globally
    document.addEventListener('contextmenu', (e) => e.preventDefault())
  }

  resize() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX
      this.mouse.y = e.clientY
      
      // Add to trail
      this.trail.push({ x: e.clientX, y: e.clientY, time: Date.now() })
      
      // Keep trail length limited
      if (this.trail.length > this.maxTrailLength) {
        this.trail.shift()
      }
    })
    
    document.addEventListener('mouseleave', () => {
      this.trail = []
    })
    
    // Reset trail on click
    document.addEventListener('click', (e) => {
      // Only reset if clicking on non-interactive elements
      const element = e.target
      if (element.tagName !== 'A' && 
          element.tagName !== 'BUTTON' && 
          !element.onclick && 
          element.style.cursor !== 'pointer') {
        this.trail = []
      }
    })
  }

  getColorAtPosition(x, y) {
    // Get the element at cursor position
    const element = document.elementFromPoint(x, y)
    if (!element) return 'white'
    
    // Special handling for draggable boxes - analyze image color
    if (element.classList.contains('draggable-box')) {
      const bgImage = element.style.backgroundImage
      if (bgImage && bgImage !== 'none') {
        // For draggable boxes with images, use black cursor for better visibility
        return 'black'
      }
    }
    
    // Special handling for Work button
    if (element.classList.contains('work')) {
      return 'black'
    }
    
    // Special handling for Scatter button
    if (element.classList.contains('scatter')) {
      return 'black'
    }
    
    // Look for text elements first
    let textElement = element
    let depth = 0
    const maxDepth = 5 // Prevent infinite loops
    
    // Find the actual text element by traversing up the DOM
    while (textElement && depth < maxDepth) {
      // Check if this element has text content
      if (textElement.textContent && textElement.textContent.trim() && 
          textElement.tagName !== 'BODY' && textElement.tagName !== 'HTML') {
        
        const computedStyle = window.getComputedStyle(textElement)
        const color = computedStyle.color
        
        // If we found a text color, use it
        if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
          return color
        }
      }
      
      // Move up to parent element
      textElement = textElement.parentElement
      depth++
    }
    
    // Fallback to background color detection
    const computedStyle = window.getComputedStyle(element)
    const backgroundColor = computedStyle.backgroundColor
    
    // Check for transparent or rgba with alpha
    if (backgroundColor === 'transparent' || backgroundColor === 'rgba(0, 0, 0, 0)') {
      // Look at parent element
      const parent = element.parentElement
      if (parent) {
        const parentStyle = window.getComputedStyle(parent)
        const parentBg = parentStyle.backgroundColor
        return this.parseBackgroundColor(parentBg)
      }
    }
    
    return this.parseBackgroundColor(backgroundColor)
  }

  parseBackgroundColor(backgroundColor) {
    // Parse RGB values
    if (backgroundColor.startsWith('rgb')) {
      const rgb = backgroundColor.match(/\d+/g)
      if (rgb && rgb.length >= 3) {
        const r = parseInt(rgb[0])
        const g = parseInt(rgb[1])
        const b = parseInt(rgb[2])
        
        // Check if background is light (high RGB values)
        if (r > 180 && g > 180 && b > 180) {
          return '#0002aa'
        }
      }
    }
    
    // Check for white keyword
    if (backgroundColor === 'white' || backgroundColor === '#ffffff' || backgroundColor === '#fff') {
      return '#0002aa'
    }
    
    return 'white'
  }

  animate() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    
    // Draw trail as individual line segments
    if (this.trail.length > 1) {
      this.ctx.save()
      this.ctx.lineWidth = 1
      this.ctx.lineCap = 'round'
      this.ctx.lineJoin = 'round'
      this.ctx.globalAlpha = 1.0
      
      for (let i = 1; i < this.trail.length; i++) {
        const prevPoint = this.trail[i - 1]
        const point = this.trail[i]
        
        // Get color for the midpoint of this segment
        const midX = (prevPoint.x + point.x) / 2
        const midY = (prevPoint.y + point.y) / 2
        const trailColor = this.getColorAtPosition(midX, midY)
        
        this.ctx.strokeStyle = trailColor
        this.ctx.beginPath()
        this.ctx.moveTo(prevPoint.x, prevPoint.y)
        this.ctx.lineTo(point.x, point.y)
        this.ctx.stroke()
      }
      
      this.ctx.restore()
    }
    
    // Draw cursor
    const cursorColor = this.getColorAtPosition(this.mouse.x, this.mouse.y) || 'white'
    const element = document.elementFromPoint(this.mouse.x, this.mouse.y)
    const isInteractiveTag = element && ['A','BUTTON','INPUT','TEXTAREA','SELECT','LABEL','SUMMARY'].includes(element.tagName)
    const roleAttr = element && element.getAttribute && element.getAttribute('role')
    const isRoleInteractive = roleAttr && ['button','link','tab','switch','checkbox','radio','menuitem'].includes(roleAttr)
    const computedCursor = element ? window.getComputedStyle(element).cursor : ''
    const isHoverable = !!(element && (isInteractiveTag || isRoleInteractive || element.onclick || computedCursor === 'pointer'))
    
    this.ctx.save()
    this.ctx.strokeStyle = cursorColor
    this.ctx.lineWidth = 1
    
    if (isHoverable) {
      // Draw circle outline when hovering over clickable elements
      this.ctx.beginPath()
      this.ctx.arc(this.mouse.x, this.mouse.y, 8, 0, Math.PI * 2)
      this.ctx.stroke()
    } else {
      // Draw filled dot for normal cursor
      this.ctx.fillStyle = cursorColor
      this.ctx.beginPath()
      this.ctx.arc(this.mouse.x, this.mouse.y, 3, 0, Math.PI * 2)
      this.ctx.fill()
    }
    
    this.ctx.restore()
    
    requestAnimationFrame(() => this.animate())
  }
}

// Initialize the custom cursor
try {
  new CustomCursor()
} catch (error) {
}
