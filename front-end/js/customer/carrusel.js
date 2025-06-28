document.addEventListener('DOMContentLoaded', function () {
  function setupCarruselTruco () {
    const clicks = []
    const codigo = ['right', 'right', 'right', 'left', 'left', 'left']

    const botonDerecha = document.querySelector('.carousel-control-next')
    const botonIzquierda = document.querySelector('.carousel-control-prev')

    const botonSecreto = document.getElementById('secretButton')
    const carrusel = document.getElementById('petCarousel')

    function activarTruco () {
      carrusel.classList.add('carousel-flip')
      setTimeout(() => carrusel.classList.remove('carousel-flip'), 10000)

      botonSecreto.classList.remove('hidden')
      botonSecreto.classList.add('show')

      clicks.length = 0
      console.log('¡TRUCO ACTIVADO!')
    }

    botonDerecha?.addEventListener('click', () => {
      clicks.push('right')
      if (clicks.length > 6) clicks.shift()
      if (JSON.stringify(clicks) === JSON.stringify(codigo)) activarTruco()
    })

    botonIzquierda?.addEventListener('click', () => {
      clicks.push('left')
      if (clicks.length > 6) clicks.shift()
      if (JSON.stringify(clicks) === JSON.stringify(codigo)) activarTruco()
    })
  }
  setupCarruselTruco()
})
