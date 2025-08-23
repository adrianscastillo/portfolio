class UndulatingBackground {
  constructor() {
    console.log('Creating canvas...')
    this.canvas = document.createElement('canvas')
    this.canvas.id = 'background-canvas'
    this.canvas.style.position = 'fixed'
    this.canvas.style.top = '0'
    this.canvas.style.left = '0'
    this.canvas.style.width = '100vw'
    this.canvas.style.height = '100vh'
    this.canvas.style.zIndex = '-1'
    this.canvas.style.pointerEvents = 'none'
    
    document.body.insertBefore(this.canvas, document.body.firstChild)
    console.log('Canvas created and inserted')
    
    this.ctx = this.canvas.getContext('2d')
    this.time = 0
    this.waves = []
    
    this.init()
    this.createWaves()
    this.bindEvents()
    this.animate()
  }

  init() {
    this.resize()
    window.addEventListener('resize', () => this.resize())
  }

  resize() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  createWaves() {
    this.waves = [
      {
        x: window.innerWidth * 0.2,
        y: window.innerHeight * 0.3,
        radius: 200 + Math.random() * 300,
        color: '#0002AA',
        speed: 0.003,
        noise: Math.random() * 1000,
        opacity: 0.15 + Math.random() * 0.2
      },
      {
        x: window.innerWidth * 0.8,
        y: window.innerHeight * 0.7,
        radius: 250 + Math.random() * 400,
        color: '#000000',
        speed: 0.004,
        noise: Math.random() * 1000,
        opacity: 0.1 + Math.random() * 0.15
      },
      {
        x: window.innerWidth * 0.5,
        y: window.innerHeight * 0.2,
        radius: 180 + Math.random() * 250,
        color: '#0002AA',
        speed: 0.0025,
        noise: Math.random() * 1000,
        opacity: 0.12 + Math.random() * 0.18
      },
      {
        x: window.innerWidth * 0.1,
        y: window.innerHeight * 0.8,
        radius: 300 + Math.random() * 350,
        color: '#000000',
        speed: 0.0035,
        noise: Math.random() * 1000,
        opacity: 0.08 + Math.random() * 0.12
      },
      {
        x: window.innerWidth * 0.9,
        y: window.innerHeight * 0.1,
        radius: 220 + Math.random() * 280,
        color: '#0002AA',
        speed: 0.0028,
        noise: Math.random() * 1000,
        opacity: 0.14 + Math.random() * 0.16
      },
      {
        x: window.innerWidth * 0.3,
        y: window.innerHeight * 0.6,
        radius: 270 + Math.random() * 320,
        color: '#000000',
        speed: 0.0032,
        noise: Math.random() * 1000,
        opacity: 0.09 + Math.random() * 0.13
      },
      {
        x: window.innerWidth * 0.7,
        y: window.innerHeight * 0.4,
        radius: 240 + Math.random() * 280,
        color: '#000000',
        speed: 0.0038,
        noise: Math.random() * 1000,
        opacity: 0.07 + Math.random() * 0.11
      },
      {
        x: window.innerWidth * 0.4,
        y: window.innerHeight * 0.9,
        radius: 190 + Math.random() * 260,
        color: '#000000',
        speed: 0.0029,
        noise: Math.random() * 1000,
        opacity: 0.06 + Math.random() * 0.1
      }
    ]
  }

  bindEvents() {
    // Add any event listeners if needed
  }

  noise(x, y, time) {
    const X = Math.floor(x) & 255
    const Y = Math.floor(y) & 255
    const T = Math.floor(time) & 255
    
    const n00 = this.gradP(X, Y, T)
    const n01 = this.gradP(X, Y + 1, T)
    const n10 = this.gradP(X + 1, Y, T)
    const n11 = this.gradP(X + 1, Y + 1, T)
    
    const u = this.fade(x - Math.floor(x))
    const v = this.fade(y - Math.floor(y))
    const w = this.fade(time - Math.floor(time))
    
    const nx0 = this.lerp(n00, n10, u)
    const nx1 = this.lerp(n01, n11, u)
    const nxy0 = this.lerp(nx0, nx1, v)
    
    return this.lerp(nxy0, this.lerp(nx0, nx1, v), w)
  }

  gradP(i, j, k) {
    const hash = (i * 73856093) ^ (j * 19349663) ^ (k * 83492791)
    return (hash & 0xffff) / 0xffff
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  lerp(a, b, t) {
    return a + t * (b - a)
  }

  drawWave(wave) {
    const time = this.time * wave.speed
    
    // Create undulating movement
    const floatX = Math.sin(time * 0.5) * 2 + Math.sin(time * 0.3) * 1.5
    const floatY = Math.cos(time * 0.4) * 2 + Math.cos(time * 0.6) * 1.5
    
    // Update position with random drift
    wave.x += floatX + (Math.random() - 0.5) * 0.8
    wave.y += floatY + (Math.random() - 0.5) * 0.8
    
    // Keep waves within screen bounds
    if (wave.x < wave.radius) wave.x = wave.radius
    if (wave.x > window.innerWidth - wave.radius) wave.x = window.innerWidth - wave.radius
    if (wave.y < wave.radius) wave.y = wave.radius
    if (wave.y > window.innerHeight - wave.radius) wave.y = window.innerHeight - wave.radius
    
    // Draw multiple layers for soft blending
    this.ctx.save()
    this.ctx.globalCompositeOperation = 'lighten'
    
    const layers = 80
    for (let i = 0; i < layers; i++) {
      const progress = i / layers
      const opacity = Math.pow(1 - progress, 0.6) * wave.opacity * 0.08
      const sizeMultiplier = 1 + (progress * 2.5)
      
      this.ctx.globalAlpha = opacity
      
      // Create undulating shape with noise
      this.ctx.beginPath()
             const points = 32
      for (let j = 0; j < points; j++) {
        const angle = (j / points) * Math.PI * 2
                 const noiseValue = this.noise(
           Math.cos(angle) * 6 + wave.noise,
           Math.sin(angle) * 6 + wave.noise,
           time
         )
        
                 const radius = wave.radius * sizeMultiplier + noiseValue * 600
        const x = wave.x + Math.cos(angle) * radius
        const y = wave.y + Math.sin(angle) * radius
        
        if (j === 0) {
          this.ctx.moveTo(x, y)
        } else {
          this.ctx.lineTo(x, y)
        }
      }
      this.ctx.closePath()
      this.ctx.fillStyle = wave.color
      this.ctx.fill()
    }
    
    this.ctx.restore()
  }

  animate() {
    this.time += 1
    
    // Clear canvas with black background
    this.ctx.fillStyle = '#000000'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    
    // Draw all waves
    this.waves.forEach(wave => this.drawWave(wave))
    
    // Add slight noise effect
    this.addNoise()
    
    requestAnimationFrame(() => this.animate())
  }

  addNoise() {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    const data = imageData.data
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 15 // Slight noise
      data[i] = Math.max(0, Math.min(255, data[i] + noise))     // R
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)) // G
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)) // B
    }
    
    this.ctx.putImageData(imageData, 0, 0)
  }
}

// Initialize the background
console.log('Initializing undulating background...')
try {
  new UndulatingBackground()
  console.log('Background initialized successfully')
} catch (error) {
  console.error('Error initializing background:', error)
}
