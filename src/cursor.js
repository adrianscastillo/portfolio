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
    this.canvas.style.zIndex = '999999'
    this.canvas.style.pointerEvents = 'none'
    
    document.body.appendChild(this.canvas)
    
    this.ctx = this.canvas.getContext('2d')
    this.mouse = { x: 0, y: 0 }
    this.trail = []
    this.maxTrailLength = 40
    
    // Tooltip and hold animation properties
    this.tooltipTimeout = null
    this.showTooltip = false
    this.holdStartTime = null
    this.holdProgress = 0
    this.isHolding = false
    
    this.init()
    this.bindEvents()
    this.animate()
  }

  init() {
    this.resize()
    window.addEventListener('resize', () => this.resize())
    
    // Hide default cursor only after confirming canvas is working and visible
    setTimeout(() => {
      if (this.canvas && this.ctx) {
        // Force canvas to be visible and properly sized
        this.canvas.style.display = 'block'
        this.canvas.style.visibility = 'visible'
        
        // Double-check that canvas is actually visible
        const rect = this.canvas.getBoundingClientRect()
        
        if (rect.width > 0 && rect.height > 0) {
          document.body.style.cursor = 'none'
          this.isInitialized = true
        } else {
          // Force initialization even if rect check fails
          document.body.style.cursor = 'none'
          this.isInitialized = true
        }
      } else {
        // Canvas failed to initialize, restore system cursor
        this.restoreSystemCursor()
      }
    }, 200) // Increased delay to ensure canvas is fully ready

    // Disable native context menu globally
    document.addEventListener('contextmenu', (e) => e.preventDefault())
    
    // Add visibility check every 5 seconds
    this.visibilityCheckInterval = setInterval(() => {
      this.checkCursorVisibility()
    }, 5000)
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
      this.clearTooltip()
    })
    
    // Add mouse events for gallery images
    document.addEventListener('mouseover', (e) => {
      if (e.target.classList.contains('gallery-photo')) {
        this.startTooltipTimer()
      }
    })
    
    document.addEventListener('mouseout', (e) => {
      if (e.target.classList.contains('gallery-photo')) {
        this.clearTooltip()
      }
    })
    
    // Add mouse events for drag scroll areas
    document.addEventListener('mouseover', (e) => {
      if (e.target.hasAttribute('data-drag-scroll')) {
        this.clearTooltip()
      }
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
    
    // Special handling for drag scroll areas
    if (element.hasAttribute('data-drag-scroll')) {
      const dragState = element.getAttribute('data-drag-state')
      if (dragState === 'grabbing') {
        return 'black'
      } else {
        return 'black' // Show grab cursor as black for visibility
      }
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

  drawGrabCursor(x, y) {
    this.ctx.save()
    
    // Draw a simple grab cursor (open hand)
    this.ctx.lineWidth = 2
    this.ctx.strokeStyle = 'black'
    this.ctx.fillStyle = 'white'
    
    // Draw hand outline
    this.ctx.beginPath()
    this.ctx.arc(x, y, 8, 0, Math.PI * 2)
    this.ctx.stroke()
    this.ctx.fill()
    
    // Draw fingers
    this.ctx.beginPath()
    this.ctx.moveTo(x - 4, y - 6)
    this.ctx.lineTo(x - 2, y - 8)
    this.ctx.moveTo(x - 1, y - 6)
    this.ctx.lineTo(x + 1, y - 8)
    this.ctx.moveTo(x + 2, y - 6)
    this.ctx.lineTo(x + 4, y - 8)
    this.ctx.stroke()
    
    this.ctx.restore()
  }

    drawGrabbingCursor(x, y) {
      this.ctx.save()
      
      // Draw a grabbing cursor (closed hand)
      this.ctx.lineWidth = 2
      this.ctx.strokeStyle = 'black'
      this.ctx.fillStyle = 'white'
      
      // Draw closed fist
      this.ctx.beginPath()
      this.ctx.arc(x, y, 8, 0, Math.PI * 2)
      this.ctx.stroke()
      this.ctx.fill()
      
      // Draw closed fingers (lines across the circle)
      this.ctx.beginPath()
      this.ctx.moveTo(x - 6, y - 2)
      this.ctx.lineTo(x + 6, y - 2)
      this.ctx.moveTo(x - 6, y + 2)
      this.ctx.lineTo(x + 6, y + 2)
      this.ctx.stroke()
      
      this.ctx.restore()
    }

    drawDragScrollCursor(x, y) {
      this.ctx.save()
      
      // Draw circle in center
      this.ctx.lineWidth = 1
      this.ctx.beginPath()
      this.ctx.arc(x, y, 8, 0, Math.PI * 2)
      this.ctx.stroke()
      
      // Draw left arrow (<)
      this.ctx.beginPath()
      this.ctx.moveTo(x - 16, y)
      this.ctx.lineTo(x - 12, y - 4)
      this.ctx.lineTo(x - 12, y)
      this.ctx.lineTo(x - 12, y + 4)
      this.ctx.closePath()
      this.ctx.fill()
      
      // Draw right arrow (>)
      this.ctx.beginPath()
      this.ctx.moveTo(x + 16, y)
      this.ctx.lineTo(x + 12, y - 4)
      this.ctx.lineTo(x + 12, y)
      this.ctx.lineTo(x + 12, y + 4)
      this.ctx.closePath()
      this.ctx.fill()
      
      this.ctx.restore()
    }

    drawGalleryImageCursor(x, y) {
      this.ctx.save()
      
      // Draw left arrow (<)
      this.ctx.beginPath()
      this.ctx.moveTo(x - 16, y)
      this.ctx.lineTo(x - 12, y - 4)
      this.ctx.lineTo(x - 12, y)
      this.ctx.lineTo(x - 12, y + 4)
      this.ctx.closePath()
      this.ctx.fill()
      
      // Draw right arrow (>)
      this.ctx.beginPath()
      this.ctx.moveTo(x + 16, y)
      this.ctx.lineTo(x + 12, y - 4)
      this.ctx.lineTo(x + 12, y)
      this.ctx.lineTo(x + 12, y + 4)
      this.ctx.closePath()
      this.ctx.fill()
      
      // Draw hold animation if holding
      if (this.isHolding && this.holdProgress > 0) {
        this.ctx.lineWidth = 1
        this.ctx.strokeStyle = this.getColorAtPosition(x, y) || 'white'
        this.ctx.beginPath()
        this.ctx.arc(x, y, 8, -Math.PI / 2, -Math.PI / 2 + (this.holdProgress * Math.PI * 2))
        this.ctx.stroke()
      } else {
        // Draw circle outline only when not holding
        this.ctx.lineWidth = 1
        this.ctx.beginPath()
        this.ctx.arc(x, y, 8, 0, Math.PI * 2)
        this.ctx.stroke()
      }
      
      // Draw tooltip if showing
      if (this.showTooltip) {
        this.drawTooltip(x, y)
      }
      
      this.ctx.restore()
    }

    drawTooltip(x, y) {
      this.ctx.save()
      
      // Set tooltip style
      this.ctx.font = '12px Arial'
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'middle'
      this.ctx.fillStyle = 'black'
      
      const text = 'hold'
      const tooltipY = y + 25
      
      // Draw tooltip text (no background)
      this.ctx.fillText(text, x, tooltipY)
      
      this.ctx.restore()
    }

    startTooltipTimer() {
      this.clearTooltip()
      this.tooltipTimeout = setTimeout(() => {
        this.showTooltip = true
      }, 1000) // 1000ms delay
    }

    clearTooltip() {
      if (this.tooltipTimeout) {
        clearTimeout(this.tooltipTimeout)
        this.tooltipTimeout = null
      }
      this.showTooltip = false
      this.isHolding = false
      this.holdProgress = 0
      this.holdStartTime = null
    }

    startHoldAnimation() {
      this.isHolding = true
      this.holdStartTime = Date.now()
      this.holdProgress = 0
    }

    updateHoldAnimation() {
      if (this.isHolding && this.holdStartTime) {
        const elapsed = Date.now() - this.holdStartTime
        this.holdProgress = Math.min(elapsed / 500, 1) // 500ms duration to match hold delay
        
        if (this.holdProgress >= 1) {
          this.isHolding = false
          this.holdProgress = 0
          this.holdStartTime = null
        }
      }
    }

  checkCursorVisibility() {
    // Check if cursor is still working properly
    if (!this.canvas || !this.ctx || !this.isInitialized) {
      this.restoreSystemCursor()
      return
    }
    
    // Check if canvas is still visible
    const rect = this.canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) {
      this.restoreSystemCursor()
      return
    }
    
    // Check if canvas is still in DOM
    if (!document.body.contains(this.canvas)) {
      this.restoreSystemCursor()
      return
    }
  }
  
  restoreSystemCursor() {
    // Restore system cursor immediately
    document.body.style.cursor = 'auto'
    document.documentElement.style.cursor = 'auto'
    
    // Clear any intervals
    if (this.visibilityCheckInterval) {
      clearInterval(this.visibilityCheckInterval)
    }
    
    // Mark as not initialized
    this.isInitialized = false
    
    // Try to reinitialize after a delay
    setTimeout(() => {
      if (!this.isInitialized) {
        this.attemptReinitialization()
      }
    }, 2000)
  }
  
  attemptReinitialization() {
    try {
      // Remove existing canvas
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas)
      }
      
      // Try to create new cursor
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
      
      if (this.ctx) {
        this.init()
        this.bindEvents()
        this.animate()
      } else {
        // Canvas context failed, keep system cursor
        document.body.style.cursor = 'auto'
      }
    } catch (error) {
      // Reinitialization failed, keep system cursor
      document.body.style.cursor = 'auto'
    }
  }

  animate() {
    // Check if cursor is still initialized before animating
    if (!this.isInitialized || !this.canvas || !this.ctx) {
      requestAnimationFrame(() => this.animate())
      return
    }
    
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
    
    // Check for drag scroll areas
    const isDragScrollArea = element && element.hasAttribute('data-drag-scroll')
    const dragState = isDragScrollArea ? element.getAttribute('data-drag-state') : null
    
    // Check for gallery images
    const isGalleryImage = element && element.classList.contains('gallery-photo')
    
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
    } else if (isDragScrollArea) {
      // Draw drag scroll cursor with arrows
      this.drawDragScrollCursor(this.mouse.x, this.mouse.y)
    } else if (isGalleryImage) {
      // Draw circle outline for gallery images with hold animation
      this.drawGalleryImageCursor(this.mouse.x, this.mouse.y)
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
    
    // Update hold animation
    this.updateHoldAnimation()
    
    requestAnimationFrame(() => this.animate())
  }
  
  // Method to clean up and restore default cursor
  destroy() {
    // Clear visibility check interval
    if (this.visibilityCheckInterval) {
      clearInterval(this.visibilityCheckInterval)
    }
    
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas)
    }
    
    document.body.style.cursor = 'auto'
    document.documentElement.style.cursor = 'auto'
    this.isInitialized = false
  }
}

// Initialize the custom cursor with proper error handling and fallback
function initializeCursor() {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return
    }
    
    // Check if this is a touch device - disable cursor on touch devices
    const isTouchDevice = 'ontouchstart' in window || 
                         navigator.maxTouchPoints > 0 || 
                         window.matchMedia('(pointer: coarse)').matches
    
    if (isTouchDevice) {
      // Ensure default cursor is restored on touch devices
      document.body.style.cursor = 'auto'
      document.documentElement.style.cursor = 'auto'
      return
    }
    
    // Check if canvas is supported
    const canvas = document.createElement('canvas')
    if (!canvas.getContext || !canvas.getContext('2d')) {
      // Restore default cursor
      document.body.style.cursor = 'auto'
      document.documentElement.style.cursor = 'auto'
      return
    }
    
    window.customCursor = new CustomCursor()
  } catch (error) {
    console.error('Custom cursor initialization failed:', error)
    // Fallback: restore default cursor
    document.body.style.cursor = 'auto'
    document.documentElement.style.cursor = 'auto'
    
    // Remove any existing cursor: none styles and force system cursor
    const style = document.createElement('style')
    style.id = 'cursor-fallback'
    style.textContent = `
      * { cursor: auto !important; }
      body { cursor: auto !important; }
      html { cursor: auto !important; }
      a, button, input, textarea, select, label, summary { cursor: pointer !important; }
    `
    document.head.appendChild(style)
    
    // Also force cursor styles directly on elements
    document.body.style.cursor = 'auto'
    document.documentElement.style.cursor = 'auto'
    
    // Add a global function to manually restore cursor if needed
    window.restoreCursor = function() {
      document.body.style.cursor = 'auto'
      document.documentElement.style.cursor = 'auto'
      if (window.customCursor) {
        window.customCursor.destroy()
        window.customCursor = null
      }
    }
    
    // Add emergency cursor restoration on any user interaction
    const emergencyRestore = () => {
      if (document.body.style.cursor === 'none' && !window.customCursor) {
        document.body.style.cursor = 'auto'
        document.documentElement.style.cursor = 'auto'
      }
    }
    
    // Listen for any user interaction to restore cursor if needed
    document.addEventListener('mousemove', emergencyRestore, { once: true })
    document.addEventListener('click', emergencyRestore, { once: true })
    document.addEventListener('keydown', emergencyRestore, { once: true })
    
  }
}

// Initialize when DOM is ready with multiple fallbacks
function ensureCursorInitialization() {
  // Prevent multiple initialization attempts
  if (window.cursorInitializationAttempted) {
    return
  }
  window.cursorInitializationAttempted = true
  
  // Try multiple times to ensure initialization
  let attempts = 0
  const maxAttempts = 3
  
  function tryInitialize() {
    attempts++
    try {
      initializeCursor()
      if (window.customCursor) {
        return
      }
    } catch (error) {
    }
    
    // If not successful and we haven't reached max attempts, try again
    if (attempts < maxAttempts) {
      setTimeout(tryInitialize, 100 * attempts) // Increasing delay
    } else {
      // Force fallback cursor
      document.body.style.cursor = 'auto'
      document.documentElement.style.cursor = 'auto'
    }
  }
  
  tryInitialize()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ensureCursorInitialization)
} else {
  // DOM is already ready
  ensureCursorInitialization()
}

// Additional fallback - try again after a short delay
setTimeout(() => {
  if (!window.customCursor && !window.cursorInitializationAttempted) {
    ensureCursorInitialization()
  }
}, 500)

// Global cursor visibility monitor - emergency fallback
let cursorVisibilityMonitor = null
function startCursorVisibilityMonitor() {
  if (cursorVisibilityMonitor) return
  
  cursorVisibilityMonitor = setInterval(() => {
    // Check if cursor is hidden but no custom cursor is active
    if (document.body.style.cursor === 'none' && 
        (!window.customCursor || !window.customCursor.isInitialized)) {
      
      // Emergency restore system cursor
      document.body.style.cursor = 'auto'
      document.documentElement.style.cursor = 'auto'
      
      // Try to reinitialize custom cursor
      if (!window.customCursor) {
        setTimeout(() => {
          if (!window.customCursor) {
            ensureCursorInitialization()
          }
        }, 1000)
      }
    }
  }, 2000) // Check every 2 seconds
}

// Start the monitor after a delay
setTimeout(startCursorVisibilityMonitor, 3000)

// Stop monitor when page unloads
window.addEventListener('beforeunload', () => {
  if (cursorVisibilityMonitor) {
    clearInterval(cursorVisibilityMonitor)
  }
})
