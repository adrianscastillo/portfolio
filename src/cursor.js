class CustomCursor {
  constructor() {
    // Check if cursor canvas already exists to prevent duplicates
    let existingCanvas = document.getElementById('cursor-canvas')
    if (existingCanvas) {
      existingCanvas.remove()
    }
    
    this.canvas = document.createElement('canvas')
    this.canvas.id = 'cursor-canvas'
    this.canvas.style.position = 'fixed'
    this.canvas.style.top = '0'
    this.canvas.style.left = '0'
    this.canvas.style.width = '100vw'
    this.canvas.style.height = '100vh'
    this.canvas.style.zIndex = '100001'
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
    
    // Hide default cursor only after confirming canvas is working
    setTimeout(() => {
      if (this.canvas && this.ctx) {
        document.body.style.cursor = 'none'
      }
    }, 100)

    // Disable native context menu globally
    document.addEventListener('contextmenu', (e) => e.preventDefault())
  }

  resize() {
    const dpr = window.devicePixelRatio || 1
    const rect = { width: window.innerWidth, height: window.innerHeight }
    
    // Set the canvas size in pixels (accounting for device pixel ratio)
    this.canvas.width = rect.width * dpr
    this.canvas.height = rect.height * dpr
    
    // Scale the context to match device pixel ratio
    this.ctx.scale(dpr, dpr)
    
    // Set the CSS size to maintain the same visual size
    this.canvas.style.width = rect.width + 'px'
    this.canvas.style.height = rect.height + 'px'
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

  drawArrow(x, y, direction, size) {
    this.ctx.save()
    
    // Chevron dimensions
    const chevronSize = size * 0.6
    
    this.ctx.lineCap = 'round'
    this.ctx.lineJoin = 'round'
    
    this.ctx.beginPath()
    
    if (direction === 'left') {
      // Left chevron: <
      this.ctx.moveTo(x + chevronSize/2, y - chevronSize/2)
      this.ctx.lineTo(x - chevronSize/2, y)
      this.ctx.lineTo(x + chevronSize/2, y + chevronSize/2)
    } else if (direction === 'right') {
      // Right chevron: >
      this.ctx.moveTo(x - chevronSize/2, y - chevronSize/2)
      this.ctx.lineTo(x + chevronSize/2, y)
      this.ctx.lineTo(x - chevronSize/2, y + chevronSize/2)
    }
    
    // Draw the white outline first (thicker)
    this.ctx.lineWidth = 4
    this.ctx.strokeStyle = 'white'
    this.ctx.stroke()
    
    // Draw the black chevron on top (thinner)
    this.ctx.lineWidth = 2
    this.ctx.strokeStyle = 'black'
    this.ctx.stroke()
    
    this.ctx.restore()
  }

  drawX(x, y, size) {
    this.ctx.save()
    
    // X dimensions
    const xSize = size * 0.6
    
    this.ctx.lineCap = 'round'
    this.ctx.lineJoin = 'round'
    
    // Draw the white outline first (thicker)
    this.ctx.lineWidth = 4
    this.ctx.strokeStyle = 'white'
    
    // First diagonal line (top-left to bottom-right)
    this.ctx.beginPath()
    this.ctx.moveTo(x - xSize/2, y - xSize/2)
    this.ctx.lineTo(x + xSize/2, y + xSize/2)
    this.ctx.stroke()
    
    // Second diagonal line (top-right to bottom-left)
    this.ctx.beginPath()
    this.ctx.moveTo(x + xSize/2, y - xSize/2)
    this.ctx.lineTo(x - xSize/2, y + xSize/2)
    this.ctx.stroke()
    
    // Draw the black X on top (thinner)
    this.ctx.lineWidth = 2
    this.ctx.strokeStyle = 'black'
    
    // First diagonal line (top-left to bottom-right)
    this.ctx.beginPath()
    this.ctx.moveTo(x - xSize/2, y - xSize/2)
    this.ctx.lineTo(x + xSize/2, y + xSize/2)
    this.ctx.stroke()
    
    // Second diagonal line (top-right to bottom-left)
    this.ctx.beginPath()
    this.ctx.moveTo(x + xSize/2, y - xSize/2)
    this.ctx.lineTo(x - xSize/2, y + xSize/2)
    this.ctx.stroke()
    
    this.ctx.restore()
  }

  animate() {
    // Clear canvas (use logical dimensions, not physical pixels)
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    
    // Check if we're in an image viewer with cursor direction classes
    const imageViewer = document.querySelector('.image-viewer.active')
    const element = document.elementFromPoint(this.mouse.x, this.mouse.y)
    const isInImageViewer = imageViewer && element && (element === imageViewer || imageViewer.contains(element))
    const viewerImage = document.getElementById('viewerImage')
    const isHoveringImage = imageViewer && element === viewerImage
    const hasLeftCursor = imageViewer && imageViewer.classList.contains('cursor-left')
    const hasRightCursor = imageViewer && imageViewer.classList.contains('cursor-right')
    const isShowingArrow = isInImageViewer && isHoveringImage && (hasLeftCursor || hasRightCursor)
    const isShowingX = isInImageViewer && !isHoveringImage
    
    // Draw trail as individual line segments (only if not showing arrow or X)
    if (this.trail.length > 1 && !isShowingArrow && !isShowingX) {
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
    const isInteractiveTag = element && ['A','BUTTON','INPUT','TEXTAREA','SELECT','LABEL','SUMMARY'].includes(element.tagName)
    const roleAttr = element && element.getAttribute && element.getAttribute('role')
    const isRoleInteractive = roleAttr && ['button','link','tab','switch','checkbox','radio','menuitem'].includes(roleAttr)
    const computedCursor = element ? window.getComputedStyle(element).cursor : ''
    const isHoverable = !!(element && (isInteractiveTag || isRoleInteractive || element.onclick || computedCursor === 'pointer'))
    
    this.ctx.save()
    this.ctx.strokeStyle = cursorColor
    this.ctx.fillStyle = cursorColor
    this.ctx.lineWidth = 1
    this.ctx.font = '16px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    
    if (isShowingArrow) {
      // Draw arrow for image viewer navigation
      const size = 24
      if (hasLeftCursor) {
        this.drawArrow(this.mouse.x, this.mouse.y, 'left', size)
      } else if (hasRightCursor) {
        this.drawArrow(this.mouse.x, this.mouse.y, 'right', size)
      }
    } else if (isShowingX) {
      // Draw X for closing image viewer
      const size = 24
      this.drawX(this.mouse.x, this.mouse.y, size)
    } else if (isHoverable) {
      // Draw circle outline when hovering over clickable elements
      this.ctx.beginPath()
      this.ctx.arc(this.mouse.x, this.mouse.y, 8, 0, Math.PI * 2)
      this.ctx.stroke()
    } else {
      // Draw filled dot for normal cursor
      this.ctx.beginPath()
      this.ctx.arc(this.mouse.x, this.mouse.y, 3, 0, Math.PI * 2)
      this.ctx.fill()
    }
    
    this.ctx.restore()
    
    requestAnimationFrame(() => this.animate())
  }
  
  // Method to clean up and restore default cursor
  destroy() {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas)
    }
    document.body.style.cursor = 'auto'
    document.documentElement.style.cursor = 'auto'
  }
}

// Initialize the custom cursor with proper error handling and fallback
function initializeCursor() {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.warn('Custom cursor: Not in browser environment')
      return
    }
    
    // Check if canvas is supported
    const canvas = document.createElement('canvas')
    if (!canvas.getContext || !canvas.getContext('2d')) {
      console.warn('Custom cursor: Canvas not supported, falling back to default cursor')
      // Restore default cursor
      document.body.style.cursor = 'auto'
      document.documentElement.style.cursor = 'auto'
      return
    }
    
    window.customCursor = new CustomCursor()
    console.log('Custom cursor initialized successfully')
  } catch (error) {
    console.error('Custom cursor failed to initialize:', error)
    // Fallback: restore default cursor
    document.body.style.cursor = 'auto'
    document.documentElement.style.cursor = 'auto'
    
    // Remove any existing cursor: none styles
    const style = document.createElement('style')
    style.id = 'cursor-fallback'
    style.textContent = `
      * { cursor: auto !important; }
      body { cursor: auto !important; }
    `
    document.head.appendChild(style)
    
    // Add a global function to manually restore cursor if needed
    window.restoreCursor = function() {
      document.body.style.cursor = 'auto'
      document.documentElement.style.cursor = 'auto'
      if (window.customCursor) {
        window.customCursor.destroy()
        window.customCursor = null
      }
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCursor)
} else {
  // DOM is already ready
  initializeCursor()
}
