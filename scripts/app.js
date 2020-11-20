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

  let pacmanPosition = Math.round((cellCount * 179) / 256) + 50 // NOT TO BE CONFUSED WITH PACMANCELL
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
    movementTimer = setInterval(movePacman, 155, pacmanDirection)
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
    for (let i = 200; i < 206; i++) {
      wallCells.push(cells[i])
    }
    for (let i = 205; i <= 280; i += 25) {
      wallCells.push(cells[i])
    }
    for (let i = 276; i < 280; i++) {
      wallCells.push(cells[i])
    }

    for (let i = 326; i < 330; i++) {
      wallCells.push(cells[i])
    }
    for (let i = 330; i <= 405; i += 25) {
      wallCells.push(cells[i])
    }
    for (let i = 400; i < 406; i++) {
      wallCells.push(cells[i])
    }

    // RIGHT WALL INDENTS
    for (let i = 224; i > 218; i--) {
      wallCells.push(cells[i])
    }
    for (let i = 219; i < 294; i += 25) {
      wallCells.push(cells[i])
    }
    for (let i = 294; i < 299; i++) {
      wallCells.push(cells[i])
    }
    for (let i = 344; i < 349; i++) {
      wallCells.push(cells[i])
    }
    for (let i = 344; i <= 419; i += 25) {
      wallCells.push(cells[i])
    }
    for (let i = 424; i > 418; i--) {
      wallCells.push(cells[i])
    }

    // SOUTH CENTER
    for (let i = 509; i <= 515; i++) {
      wallCells.push(cells[i])
    }
    for (let i = 512; i < 587; i += 25) {
      wallCells.push(cells[i])
    }

    // SOUTH WEST CORNER
    for (let i = 500; i <= 503; i++) {
      wallCells.push(cells[i])
    }
    for (let i = 452; i < 454; i++) {
      wallCells.push(cells[i])
    }
    for (let i = 455; i < 530; i += 25) {
      wallCells.push(cells[i])
    }
    for (let i = 552; i <= 560; i++) {
      wallCells.push(cells[i])
    }
    for (let i = 507; i <= 532; i += 25) {
      wallCells.push(cells[i])
    }
    for (let i = 457; i <= 460; i++) {
      wallCells.push(cells[i])
    }

    // SOUTH EAST CORNER
    for (let i = 521; i < 524; i++) {
      wallCells.push(cells[i])
    }
    for (let i = 564; i < 573; i++) {
      wallCells.push(cells[i])
    }
    for (let i = 471; i < 473; i++) {
      wallCells.push(cells[i])
    }
    for (let i = 469; i <= 519; i += 25) {
      wallCells.push(cells[i])
    }
    for (let i = 464; i <= 467; i++) {
      wallCells.push(cells[i])
    }
    for (let i = 517; i <= 542; i += 25) {
      wallCells.push(cells[i])
    }

    // MIDSECTION
    for (let i = 332; i <= 407; i += 25) {
      wallCells.push(cells[i])
    }
    for (let i = 342; i <= 417; i += 25) {
      wallCells.push(cells[i])
    }
    for (let i = 409; i <= 415; i++) {
      wallCells.push(cells[i])
    }
    for (let i = 437; i <= 462; i += 25) {
      wallCells.push(cells[i])
    }
    for (let i = 12; i <= 112; i += 25) {
      wallCells.push(cells[i])
    }
    for (let i = 159; i <= 165; i++) {
      wallCells.push(cells[i])
    }
    for (let i = 187; i <= 212; i += 25) {
      wallCells.push(cells[i])
    }

    // GHOST HOUSE
    for (let i = 359; i <= 365; i++) {
      wallCells.push(cells[i])
    }
    for (let i = 259; i <= 334; i += 25) {
      wallCells.push(cells[i])
    }
    for (let i = 265; i <= 340; i += 25) {
      wallCells.push(cells[i])
    }

    // NORTH WEST CORNER
    for (let i = 52; i <= 55; i++) {
      wallCells.push(cells[i])
    }
    for (let i = 102; i <= 105; i++) {
      wallCells.push(cells[i])
    }
    for (let i = 152; i <= 155; i++) {
      wallCells.push(cells[i])
    }
    for (let i = 132; i <= 282; i += 25) {
      wallCells.push(cells[i])
    }
    for (let i = 57; i <= 60; i++) {
      wallCells.push(cells[i])
    }
    for (let i = 82; i <= 85; i++) {
      wallCells.push(cells[i])
    }
    for (let i = 208; i <= 210; i++) {
      wallCells.push(cells[i])
    }
    for (let i = 134; i <= 135; i++) {
      wallCells.push(cells[i])
    }

    // NORTH EAST CORNER
    for (let i = 64; i <= 67; i++) {
      wallCells.push(cells[i])
    }
    for (let i = 89; i <= 92; i++) {
      wallCells.push(cells[i])
    }
    for (let i = 69; i <= 72; i++) {
      wallCells.push(cells[i])
    }
    for (let i = 119; i <= 122; i++) {
      wallCells.push(cells[i])
    }
    for (let i = 169; i <= 172; i++) {
      wallCells.push(cells[i])
    }
    for (let i = 142; i <= 292; i += 25) {
      wallCells.push(cells[i])
    }
    for (let i = 214; i <= 216; i++) {
      wallCells.push(cells[i])
    }
    for (let i = 139; i <= 140; i++) {
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
