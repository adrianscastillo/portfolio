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
    this.maxTrailLength = 12
    
    this.init()
    this.bindEvents()
    this.animate()
  }

  init() {
    this.resize()
    window.addEventListener('resize', () => this.resize())
    
    // Hide default cursor
    document.body.style.cursor = 'none'
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
  }

  getColorAtPosition(x, y) {
    // Get the color of the element at cursor position
    const element = document.elementFromPoint(x, y)
    if (!element) return 'white'
    
    const computedStyle = window.getComputedStyle(element)
    const backgroundColor = computedStyle.backgroundColor
    
    // Parse RGB values
    if (backgroundColor.startsWith('rgb')) {
      const rgb = backgroundColor.match(/\d+/g)
      if (rgb && rgb.length >= 3) {
        const r = parseInt(rgb[0])
        const g = parseInt(rgb[1])
        const b = parseInt(rgb[2])
        
        // Check if background is light (high RGB values)
        if (r > 200 && g > 200 && b > 200) {
          return 'black'
        }
      }
    }
    
    // Check for white keyword
    if (backgroundColor === 'white' || backgroundColor === '#ffffff' || backgroundColor === '#fff') {
      return 'black'
    }
    
    return 'white'
  }

  animate() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    
    // Draw trail as a line
    if (this.trail.length > 1) {
      this.ctx.save()
      this.ctx.lineWidth = 1
      this.ctx.lineCap = 'butt'
      this.ctx.lineJoin = 'miter'
      
      this.ctx.beginPath()
      this.ctx.moveTo(this.trail[0].x, this.trail[0].y)
      
      for (let i = 1; i < this.trail.length; i++) {
        const point = this.trail[i]
        
        // Get color for this trail point
        const trailColor = this.getColorAtPosition(point.x, point.y)
        this.ctx.strokeStyle = trailColor
        this.ctx.globalAlpha = 0.4
        this.ctx.lineTo(point.x, point.y)
      }
      
      this.ctx.stroke()
      this.ctx.restore()
    }
    
    // Draw cursor
    const cursorColor = this.getColorAtPosition(this.mouse.x, this.mouse.y) || 'white'
    
    this.ctx.save()
    this.ctx.fillStyle = cursorColor
    this.ctx.beginPath()
    this.ctx.arc(this.mouse.x, this.mouse.y, 3, 0, Math.PI * 2)
    this.ctx.fill()
    this.ctx.restore()
    
    requestAnimationFrame(() => this.animate())
  }
}

// Initialize the custom cursor
console.log('Initializing custom cursor...')
try {
  new CustomCursor()
  console.log('Custom cursor initialized successfully')
} catch (error) {
  console.error('Error initializing custom cursor:', error)
}
