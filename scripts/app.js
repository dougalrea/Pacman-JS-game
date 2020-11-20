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

  let pacmanPosition = Math.round((cellCount * 179) / 256) + 75 // NOT TO BE CONFUSED WITH PACMANCELL
  let currentRotation = 180
  let pacmanDirection = undefined

  // Functions

  function addPacmanToCell (position, rotation) {
    cells[position].classList.remove('freshCell')
    cells[position].classList.add(`pacman${rotation}`)
  }

  // Invocations

  addPacmanToCell(pacmanPosition, currentRotation)

  //! Pacman Behaviour

  // Variables
  let movementTimer = undefined
  let pendingRotation = 0
  const pacmanCell = document.querySelector('div.pacman')

  // Functions

  function removePacman (position, rotation) {
    cells[position].classList.remove(`pacman${rotation}`)
  }

  // function rotatePacman (direction) {
  //   switch (direction) {
  //     case 'up':
  //       removePacman(pacmanPosition, currentRotation)
  //       currentRotation = 90
  //       addPacmanToCell(pacmanPosition, currentRotation)
  //       break
  //     case 'right':
  //       removePacman(pacmanPosition, currentRotation)
  //       currentRotation = 180
  //       addPacmanToCell(pacmanPosition, currentRotation)
  //       break
  //     case 'down':
  //       removePacman(pacmanPosition, currentRotation)
  //       currentRotation = 270
  //       addPacmanToCell(pacmanPosition, currentRotation)
  //       break
  //     case 'left':
  //       removePacman(pacmanPosition, currentRotation)
  //       currentRotation = 0
  //       addPacmanToCell(pacmanPosition, currentRotation)
  //   }
  // }

  function assignPacmanRotationAndDirection (event) {
    if (movementTimer) {
      clearInterval(movementTimer)
    }
    removePacman(pacmanPosition, currentRotation)
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
    movePacman(pacmanDirection, currentRotation)
    movementTimer = setInterval(movePacman, 600, pacmanDirection)
  }

  function stopRightThereMister () {
    clearInterval(movementTimer)
    addPacmanToCell(pacmanPosition, currentRotation)
  }

  function movePacman (direction) {
    if (!direction) {
      return
    }

    let adjacentCellUp = undefined
    let adjacentCellRight = undefined
    let adjacentCellDown = undefined
    let adjacentCellLeft = undefined

    removePacman(pacmanPosition, currentRotation)

    switch (direction) {
      case 'up':
        adjacentCellUp = pacmanPosition - width
        if (cells[adjacentCellUp].classList.contains('wall')) {
          stopRightThereMister()
        } else addPacmanToCell((pacmanPosition -= width), 90)
        break
      case 'right':
        adjacentCellRight = pacmanPosition + 1
        if (cells[adjacentCellRight].classList.contains('wall')) {
          stopRightThereMister()
        } else addPacmanToCell((pacmanPosition += 1), 180)
        break
      case 'down':
        adjacentCellDown = pacmanPosition + width
        if (cells[adjacentCellDown].classList.contains('wall')) {
          stopRightThereMister()
        } else addPacmanToCell((pacmanPosition += width), 270)
        break
      case 'left':
        adjacentCellLeft = pacmanPosition - 1
        if (cells[adjacentCellLeft].classList.contains('wall')) {
          stopRightThereMister()
        } else addPacmanToCell((pacmanPosition -= 1), 0)
        break
      default:
        console.log('eek')
    }
    console.log(
      'cell to the right is',
      adjacentCellRight,
      'current position is',
      pacmanPosition
    )
  }

  //Event Listeners
  document.addEventListener('keydown', assignPacmanRotationAndDirection)

  //! Map Generation

  // Variables
  const wallCells = []

  function generateMapOne () {
    for (let i = 0; i < width; i++) {
      // TOP WALL
      wallCells.push(cells[i])
    }
    for (let i = 600; i < width ** 2; i++) {
      // BOTTOM WALL
      wallCells.push(cells[i])
    }
    for (let i = 24; i < 225; i += 25) {
      // RIGHT WALL (TOP)
      wallCells.push(cells[i])
    }
    for (let i = 424; i < width ** 2; i += 25) {
      // ROGHT WALL (BOTTOM)
      wallCells.push(cells[i])
    }
    for (let i = 25; i < 200; i += 25) {
      // LEFT WALL (TOP)
      wallCells.push(cells[i])
    }
    for (let i = 400; i < 600; i += 25) {
      // LEFT WALL (BOTTOM)
      wallCells.push(cells[i])
    }

    // LEFT WALL INDENTS
    for (let i = 400; i < 406; i++) {
      wallCells.push(cells[i])
    }
    for (let i = 200; i < 206; i++) {
      wallCells.push(cells[i])
    }

    // RIGHT WALL INDENTS
    for (let i = 224; i > 218; i--) {
      wallCells.push(cells[i])
    }
    for (let i = 424; i > 418; i--) {
      wallCells.push(cells[i])
    }

    wallCells.forEach(cell => {
      cell.classList.remove('freshCell')
      cell.classList.add('wall')
    })
  }
  generateMapOne()
}
window.addEventListener('DOMContentLoaded', init)
