function init () {
  //! Grid Creation:

  // Variables:

  const grid = document.querySelector('.grid')
  const width = 25
  const cellCount = width ** 2
  const cells = []

  // Functions:

  function createGrid () {
    for (let i = 0; i < cellCount; i++) {
      const cell = document.createElement('div')
      grid.appendChild(cell)
      cell.classList.add('freshCell')
      cells.push(cell)
    }
  }

  // Event Listeners

  // Invocations

  createGrid()

  //! Pacman Inital
  // Variables

  let pacmanPosition = Math.round((cellCount * 179) / 256) // NOT TO BE CONFUSED WITH PACMANCELL
  let pacmanDirection = undefined

  // Functions

  function addPacmanToCell (position) {
    cells[position].classList.remove('freshCell')
    cells[position].classList.add('pacman')
  }

  // Invocations

  addPacmanToCell(pacmanPosition)

  //! Pacman Behaviour

  // Variables
  let movementTimer = undefined
  let currentRotation = 0
  const pacmanCell = document.querySelector('div.pacman')

  // Functions

  function removePacman (position) {
    cells[position].classList.remove('pacman')
  }

  function rotatePacman (degrees, directionOfTravel) {
    pacmanCell.style.transform = `rotate(${degrees}deg)`
    pacmanDirection = directionOfTravel
    console.log(
      'RotatePacman Function says',
      pacmanCell.style.transform,
      pacmanDirection
    )
  }
  
  function assignPacmanRotationAndDirection (event) {
    if (movementTimer) {
      clearInterval(movementTimer)
    }
    switch (event.key) {
      case 'ArrowUp':
        currentRotation = 90
        pacmanDirection = 'up'
        break
      case 'ArrowRight':
        currentRotation = 180
        pacmanDirection = 'right'
        break
      case 'ArrowDown':
        currentRotation = 270
        pacmanDirection = 'down'
        break
      case 'ArrowLeft':
        currentRotation = 0
        pacmanDirection = 'left'
        break
      default:
        console.log('INVALID KEY')
    }
    movePacman(pacmanDirection)
    movementTimer = setInterval(movePacman, 155, pacmanDirection)
  }

  function movePacman (direction) {
    if (!direction) {
      return
    }
    removePacman(pacmanPosition)
    switch (direction) {
      case 'up':
        addPacmanToCell((pacmanPosition -= 25))
        break
      case 'right':
        addPacmanToCell((pacmanPosition += 1))
        break
      case 'down':
        addPacmanToCell((pacmanPosition += 25))
        break
      case 'left':
        addPacmanToCell((pacmanPosition -= 1))
        break
      default:
        console.log('eek')
    }
    rotatePacman(currentRotation, pacmanDirection)
    console.log('timer works')
  }

  //Event Listeners
  document.addEventListener('keydown', assignPacmanRotationAndDirection)
}
window.addEventListener('DOMContentLoaded', init)
