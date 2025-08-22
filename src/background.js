// Animated background with undulating blobs
class BlobBackground {
  constructor() {
    this.canvas = document.getElementById('background-canvas')
    this.ctx = this.canvas.getContext('2d')
    this.mouse = { x: 0, y: 0 }
    this.blobs = []
    this.time = 0
    
    this.init()
    this.createBlobs()
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

  createBlobs() {
    // Create multiple blobs with different properties
    this.blobs = [
      {
        x: window.innerWidth * 0.3,
        y: window.innerHeight * 0.4,
        radius: 200,
        color: '#0002AA',
        speed: 0.002,
        noise: Math.random() * 1000,
        points: 12
      },
      {
        x: window.innerWidth * 0.7,
        y: window.innerHeight * 0.6,
        radius: 150,
        color: '#000000',
        speed: 0.003,
        noise: Math.random() * 1000,
        points: 10
      },
      {
        x: window.innerWidth * 0.5,
        y: window.innerHeight * 0.3,
        radius: 180,
        color: '#0002AA',
        speed: 0.0015,
        noise: Math.random() * 1000,
        points: 14
      },
      {
        x: window.innerWidth * 0.2,
        y: window.innerHeight * 0.7,
        radius: 120,
        color: '#000000',
        speed: 0.0025,
        noise: Math.random() * 1000,
        points: 8
      }
    ]
  }

  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX
      this.mouse.y = e.clientY
    })
  }

  // Generate noise for organic movement
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

  // Create grain effect
  addGrain() {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    const data = imageData.data
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 40
      data[i] = Math.max(0, Math.min(255, data[i] + noise))     // R
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)) // G
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)) // B
    }
    
    this.ctx.putImageData(imageData, 0, 0)
  }

  drawBlob(blob) {
    const points = []
    const mouseInfluence = 0.3
    
    // Generate blob points with noise
    for (let i = 0; i < blob.points; i++) {
      const angle = (i / blob.points) * Math.PI * 2
      const noiseValue = this.noise(
        Math.cos(angle) * 2 + blob.noise,
        Math.sin(angle) * 2 + blob.noise,
        this.time * blob.speed
      )
      
      const radius = blob.radius + noiseValue * 50
      
      // Add mouse influence
      const dx = this.mouse.x - blob.x
      const dy = this.mouse.y - blob.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const maxDistance = 300
      
      if (distance < maxDistance) {
        const influence = (1 - distance / maxDistance) * mouseInfluence
        const angleToMouse = Math.atan2(dy, dx)
        const x = blob.x + Math.cos(angle + angleToMouse * influence) * radius
        const y = blob.y + Math.sin(angle + angleToMouse * influence) * radius
        points.push({ x, y })
      } else {
        const x = blob.x + Math.cos(angle) * radius
        const y = blob.y + Math.sin(angle) * radius
        points.push({ x, y })
      }
    }
    
    // Draw blob with lighten blend mode
    this.ctx.save()
    this.ctx.globalCompositeOperation = 'lighten'
    
    this.ctx.beginPath()
    this.ctx.moveTo(points[0].x, points[0].y)
    
    for (let i = 1; i < points.length; i++) {
      const current = points[i]
      const next = points[(i + 1) % points.length]
      const midX = (current.x + next.x) / 2
      const midY = (current.y + next.y) / 2
      
      this.ctx.quadraticCurveTo(current.x, current.y, midX, midY)
    }
    
    this.ctx.closePath()
    
    // Create gradient for depth
    const gradient = this.ctx.createRadialGradient(
      blob.x, blob.y, 0,
      blob.x, blob.y, blob.radius
    )
    gradient.addColorStop(0, blob.color)
    gradient.addColorStop(1, this.adjustColor(blob.color, -0.3))
    
    this.ctx.fillStyle = gradient
    this.ctx.fill()
    
    this.ctx.restore()
  }

  adjustColor(color, factor) {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    
    const newR = Math.max(0, Math.min(255, r + factor * 255))
    const newG = Math.max(0, Math.min(255, g + factor * 255))
    const newB = Math.max(0, Math.min(255, b + factor * 255))
    
    return `rgb(${Math.round(newR)}, ${Math.round(newG)}, ${Math.round(newB)})`
  }

  animate() {
    this.time += 1
    
    // Clear canvas with black background
    this.ctx.fillStyle = '#000000'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    
    // Draw all blobs
    this.blobs.forEach(blob => this.drawBlob(blob))
    
    // Add grain effect
    this.addGrain()
    
    requestAnimationFrame(() => this.animate())
  }
}

// Initialize background when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new BlobBackground()
})
