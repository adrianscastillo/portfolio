// Clock functionality
function formatNow() {
  const now = new Date()
  const date = now.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  })
  const time = now.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit'
  })
  return `${date} ${time}`
}

let timer
function startClock() {
  const el = document.getElementById('clock')
  if (!el) {
    console.log('Clock element not found')
    return
  }
  el.textContent = formatNow()
  timer = setInterval(() => { 
    el.textContent = formatNow() 
  }, 30_000)
  console.log('Clock started')
}

// Start clock when script loads
startClock()

if (import.meta.hot) import.meta.hot.dispose(() => clearInterval(timer))
