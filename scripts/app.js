function init () {
  //! Sound effects! //

  // These are at the start because the sound variables have to be defined before use and their uses are littered throughout the code. This isn't the first thing I worked on I promise.

  class Sound {
    constructor (sound, src) {
      this.sound = document.createElement('audio')
      this.sound.src = src
      this.sound.setAttribute('preload', 'auto')
      this.sound.setAttribute('controls', 'none')
      this.sound.style.display = 'none'
      document.body.appendChild(this.sound)
    }

    play () {
      this.sound.play()
    }
    stop () {
      this.sound.pause()
      this.sound.currentTime = 0
    }
  }

  // The Sound class ensures each sound element exists only once, and is replayed from the beginning where necessary instead of being readded each time.

  const wakaSound = new Sound('wakaSound', 'sounds/waka-start.wav')
  const pacmanGetsEatenSound = new Sound('ohNo', 'sounds/ohNo.wav')
  const sickoModeSound = new Sound('sickoMode', 'sounds/sicko mode.wav')
  const ghostGetsEatenSound = new Sound('brap', 'sounds/gotcha1.wav')
  const victorySound = new Sound('victory', 'sounds/victory.wav')
  const defeatSound = new Sound('defeat', 'sounds/defeat.wav')

  //! Grid Creation //

  // Variables:

  const grid = document.querySelector('.grid')
  const width = 25
  const cellCount = width ** 2
  const cells = [] // This array is very important and is used to reference every game character's position. It is crucial to the movement behaviour of all ghosts, pacman, and for collision detection. Every div on the grid can be referenced and styled according to its cells[position number]

  // Functions:

  function createGrid () {
    for (let i = 0; i < cellCount; i++) {
      const cell = document.createElement('div')
      grid.appendChild(cell)
      cell.classList.add('freshCell')
      cells.push(cell)
    }
  }

  // The grid is loaded automatically on page load. All cells begin as freshCells, only to be replaced by either empty cells, wall cells, energizee cells etc during Map Generation.

  createGrid()

  // Map generation section is separate.

  //! Pacman Inital //

  // Variables

  let pacmanPosition = Math.round((cellCount * 179) / 256) + 50 // Position variables such as this one relate to the cell number, not the div itself. The div is therefore accessed via cells[position].
  let currentRotation = 180 // Pacman starts off facing right
  let pacmanDirection = undefined

  // Functions

  function addPacmanToCell (position, rotation) {
    if (cells[position].classList.contains('freshCell')) {
      cells[position].classList.remove('freshCell')
      cells[position].classList.add(`pacman${rotation}`)
      wakaSound.play()
    } else cells[position].classList.remove('freshCell')
    cells[position].classList.add(`pacman${rotation}`)

    if (cells[position].classList.contains('energizer')) {
      cells[position].classList.remove('energizer')
      triggerSickoMode() // Sicko Mode converts all ghosts to 'frightened' ghosts and enables pacman to eat them.
      sickoModeSound.play() // Sicko mode is set on a timer to rapidly replace ghost profiles as they are created, so the sound is played here, outside the jurisdiction of the setInterval to allow interruption & prevent repetition
    }
  }

  // Invocations

  addPacmanToCell(pacmanPosition, currentRotation) //Pacman is ready and waiting at his starting position when the page loads

  //! Pacman Behaviour //

  // Variables

  let movementTimer = undefined

  // Functions

  function removePacman (position, rotation) {
    cells[position].classList.remove(`pacman${rotation}`)
  } // Removes Pacman from the cell he is currently in. This must be repeated every time Pacman is added to a new cell to give the effect of moving.

  function resetPacman () {
    removePacman(pacmanPosition, currentRotation)
    pacmanPosition = Math.round((cellCount * 179) / 256) + 50
    currentRotation = 180
    pacmanDirection = undefined
    addPacmanToCell(pacmanPosition, currentRotation)
    clearInterval(movementTimer)
  }

  // Pacman's current rotation and direction is important to allow for continuous movement in one direction without repeatedly pressing the same arrow key. Pacman is to move continuously in his given direction, stopping only when he encounters a wall.
  function assignPacmanRotationAndDirection (event) {
    if (
      event.key === 'ArrowUp' ||
      event.key === 'ArrowRight' ||
      event.key === 'ArrowDown' ||
      event.key === 'ArrowLeft'
    ) {
      // The following IF clause prevents the user from speeding pacman up in straight corridors. If pacman is moving right, and the player presses right arrow key, do nothing (since the setInterval timer will take care of pacmans movement)
      if (
        (event.key === 'ArrowUp' && pacmanDirection === 'up') ||
        (event.key === 'ArrowRight' && pacmanDirection === 'right') ||
        (event.key === 'ArrowDown' && pacmanDirection === 'down') ||
        (event.key === 'ArrowLeft' && pacmanDirection === 'left')
      ) {
        return
      } else if (movementTimer) {
        clearInterval(movementTimer)
      }
      // The function assigns pacmans rotation and direction so that the next div to be given the pacman icon can A) be identified from other adjacent divs and B) be assigned the right rotation of the icon such that pacman appears to always be moving forwards.
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
      // Once rotation and direction have been assigned, pacman can be moved according to these parameters
      movePacman(pacmanDirection, currentRotation)
      movementTimer = setInterval(
        movePacman,
        170,
        pacmanDirection,
        currentRotation
      )
    } else return
  }

  // This function prevents pacman from being moved when the designated requested next cell is a wall.
  function stopRightThereMister () {
    clearInterval(movementTimer)
    addPacmanToCell(pacmanPosition, currentRotation) // Since pacman is removed from his current cell upon every move request, he must be added back to his current cell if the move requested is into a wall cell.
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
        } else addPacmanToCell((pacmanPosition -= width), 90) // Add pacman to cell converts the numerical rotation argument to the appropriate CSS style class for the rotated icon.
        break

      case 'right':
        adjacentCellRight = pacmanPosition + 1

        // Special case for teleporting edge (right side):

        if (pacmanPosition === 324) {
          addPacmanToCell(300, 180)
          pacmanPosition = 300
        }

        // End special case
        else if (cells[adjacentCellRight].classList.contains('wall')) {
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

        // Special Case for teleporting edge (left side):

        if (pacmanPosition === 300) {
          addPacmanToCell(324, 0)
          pacmanPosition = 324
        }

        // End special case
        else if (cells[adjacentCellLeft].classList.contains('wall')) {
          stopRightThereMister()
        } else addPacmanToCell((pacmanPosition -= 1), 0)
        break
      default:
        console.log('pyjamas')
    }
  }

  //! Map Generation

  // Variables - Cell Types

  const wallCells = []
  const ghostHouseInternalWalls = []
  const ghostHouseGates = [
    cells[260],
    cells[261],
    cells[262],
    cells[263],
    cells[264]
  ]
  const energizerCells = [cells[76], cells[476], cells[98], cells[498]]
  const emptyCells = [
    225,
    226,
    227,
    228,
    229,
    233,
    234,
    235,
    236,
    237,
    238,
    239,
    240,
    241,
    245,
    246,
    247,
    248,
    249,
    250,
    251,
    252,
    253,
    254,
    258,
    266,
    270,
    271,
    272,
    273,
    274,
    275,
    283,
    285,
    287,
    289,
    291,
    299,
    300,
    301,
    301,
    302,
    303,
    304,
    305,
    307,
    308,
    310,
    312,
    314,
    316,
    317,
    319,
    320,
    321,
    322,
    323,
    324,
    325,
    333,
    335,
    337,
    339,
    341,
    349,
    350,
    351,
    352,
    353,
    354,
    358,
    366,
    370,
    371,
    372,
    373,
    374,
    375,
    376,
    377,
    378,
    379,
    383,
    384,
    385,
    386,
    387,
    388,
    389,
    390,
    391,
    395,
    396,
    397,
    398,
    399
  ]

  function generateMapOne () {
    // Begin by assigning every cell the 'freshCell' class. This makes the map regeneratable and therefore replayable without page refresh

    for (let i = 0; i < cellCount; i++) {
      cells.forEach(cell => {
        cell.classList.add('freshCell')
      })
    }

    // WALL GENERATION
    // there may well be an easier way of doing this but 625 is a lot of cells and listing all wall positions out by hand may have been even more arduous. Every straight line of walls is generated by its own FOR loop.

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
    for (let i = 275; i < 280; i++) {
      wallCells.push(cells[i])
    }

    for (let i = 325; i < 330; i++) {
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
    for (let i = 294; i <= 299; i++) {
      wallCells.push(cells[i])
    }
    for (let i = 344; i <= 349; i++) {
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
    for (let i = 261; i <= 336; i += 25) {
      ghostHouseInternalWalls.push(cells[i])
    }
    for (let i = 263; i <= 338; i += 25) {
      ghostHouseInternalWalls.push(cells[i])
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
    ghostHouseGates.forEach(cell => {
      cell.classList.remove('wall')
      cell.classList.remove('freshCell')
      cell.classList.add('wallGates')
    })
    ghostHouseInternalWalls.forEach(cell => {
      cell.classList.remove('freshCell')
      cell.classList.add('wall')
      cell.classList.add('ghostHouseInternalWalls')
    })
    emptyCells.forEach(cell => {
      cells[cell].classList.remove('freshCell')
    })
    energizerCells.forEach(cell => {
      cell.classList.remove('freshCell')
      cell.classList.add('energizer')
    })
  }

  // The trickiest part of map generation and reset is the operation of the ghost house gates. Ghosts are sent to the ghost house every time the player begins afresh or loses a life, and must be able to exit the ghost house without being able to re-enter during gameplay. The gates must therefore be timed carefully to only change to wall cells after the ghosts have had anough time to escape. Invisible walls within the ghost house prevent the ghosts from travelling in any direction other than towards the exit.

  function closeTheGates () {
    ghostHouseGates.forEach(cell => {
      cell.classList.add('wall')
    })
  }

  function resetGhostHouse () {
    ghostHouseGates.forEach(cell => {
      cell.classList.remove('wall')
      cell.classList.remove('freshCell')
      cell.classList.add('wallGates')
    })
    ghostHouseInternalWalls.forEach(cell => {
      cell.classList.remove('freshCell')
      cell.classList.add('wall')
      cell.classList.add('ghostHouseInternalWalls')
    })
    setTimeout(closeTheGates, 1005)
  }

  generateMapOne()

  //! Ghosts

  // VARIABLES

  // A slight refactoring may allow all ghost movement timers to be merged into one variable, since they all move at the same rate. However, structured this way, the ghost's individual speed may be varied as is the case in the original pacman.
  let chaserMovementTimer = undefined
  let lostGhostMovementTimer = undefined
  let interceptorGhostMovementTimer = undefined
  let randomGhostMovementTimer = undefined

  // I have structured ghost behaviour in a way which allows all ghosts to follow the same movmement principles while still allowing each ghost to have its own personality.

  class Ghost {
    constructor (
      name,
      position,
      targetPosition,
      currentDirection,
      currentEnvironment,
      newCell
    ) {
      this.name = name
      this.position = position
      this.targetPosition = targetPosition
      this.currentDirection = currentDirection
      this.currentEnvironment = currentEnvironment
      this.newCell = newCell
    }

    //! GHOST MOVEMENT

    // There are three environments on the map: Corners, Corridors, and Junctions. All ghosts are to behave the same way in corridors and corners - no u-turns allowed, must continue to the next juntion. At junctions however, ghosts must make decisions depending on their personality. Every time the ghost enters a new cell, it must therefore check it's environment to see how to behave on its next move.

    assignEnvironment () {
      const adjacentCellUp = cells[this.position - width]
      const adjacentCellRight = cells[this.position + 1]
      const adjacentCellDown = cells[this.position + width]
      const adjacentCellLeft = cells[this.position - 1]

      const environmentArray = []

      if (adjacentCellUp.classList.contains('wall')) {
        environmentArray.push('wall')
      }
      if (adjacentCellRight.classList.contains('wall')) {
        environmentArray.push('wall')
      }
      if (adjacentCellDown.classList.contains('wall')) {
        environmentArray.push('wall')
      }
      if (adjacentCellLeft.classList.contains('wall')) {
        environmentArray.push('wall')
      }

      if (environmentArray.length < 2) {
        this.currentEnvironment = 'junction'
      } else if (
        environmentArray.length >= 2 &&
        ((adjacentCellUp.classList.contains('wall') &&
          adjacentCellDown.classList.contains('wall')) ||
          (adjacentCellRight.classList.contains('wall') &&
            adjacentCellLeft.classList.contains('wall')))
      ) {
        this.currentEnvironment = 'corridor'
      } else this.currentEnvironment = 'corner'
    }

    addGhostToCell (newCell) {
      cells[newCell].classList.add(this.name)
    }
    removeGhostFromCell () {
      cells[this.position].classList.remove(this.name)
      cells[this.position].classList.remove('vulnerable') // this line accounts for sicko mode, when all ghosts are given the style class 'vulnerable'
    }

    moveUp () {
      this.removeGhostFromCell()
      this.newCell = this.position - width
      this.position -= width
      this.currentDirection = 'up'
      this.addGhostToCell(this.newCell)
    }
    moveRight () {
      this.removeGhostFromCell()

      /// Special Case for teleporting edge

      if (this.position === 324) {
        this.newCell = 301
        this.position = 300
        this.currentDirection = 'right'
        this.addGhostToCell(this.newCell)
      }

      /// End Special Case
      else this.newCell = this.position + 1
      this.position += 1
      this.currentDirection = 'right'
      this.addGhostToCell(this.newCell)
    }
    moveDown () {
      this.removeGhostFromCell()
      this.newCell = this.position + width
      this.position += width
      this.currentDirection = 'down'
      this.addGhostToCell(this.newCell)
    }
    moveLeft () {
      this.removeGhostFromCell()

      /// Special Case for teleporting edge

      if (this.position === 300) {
        this.newCell = 323
        this.position = 324
        this.currentDirection = 'left'
        this.addGhostToCell(this.newCell)
      }

      /// End Special Case

      this.newCell = this.position - 1
      this.position -= 1
      this.currentDirection = 'left'
      this.addGhostToCell(this.newCell)
    }

    moveThroughCorridor (direction) {
      // This is the simplest environment. If a ghost finds itself in a corridor, continue in current direction
      switch (direction) {
        case 'up':
          this.moveUp()
          break
        case 'right':
          this.moveRight()
          break
        case 'down':
          this.moveDown()
          break
        case 'left':
          this.moveLeft()
          break
        default:
          return
      }
    }

    moveAroundCorner (direction) {
      const adjacentCellUp = cells[this.position - width]
      const adjacentCellRight = cells[this.position + 1]
      const adjacentCellDown = cells[this.position + width]
      const adjacentCellLeft = cells[this.position - 1]

      // Corridors entered from both sides of the same axis (horizontal or vertical) can be treated together
      switch (direction) {
        case 'up':
        case 'down':
          if (adjacentCellRight.classList.contains('wall')) {
            this.moveLeft()
          } else if (adjacentCellLeft.classList.contains('wall')) {
            this.moveRight()
          }
          break
        case 'left':
        case 'right':
          if (adjacentCellUp.classList.contains('wall')) {
            this.moveDown()
          } else if (adjacentCellDown.classList.contains('wall')) {
            this.moveUp()
          }
          break
        default:
          return
      }
    }

    // The process for determining which exit to take at junctions is the same for all ghosts. What differs between them, and what effectively gives them 'personality', is their unique 'target cell' variable. Every ghost will take the junction exit that will bring them immediately closer to their target cell.
    decideJunctionExit () {
      // Since a ghost's target is usually never in the same position for more than a moment, the position of the target must be re-evaluated at every junction.

      function checkTargetPosition () {
        chaserGhost.targetPosition = pacmanPosition
        randomGhost.targetPosition = Math.round(Math.random() * cellCount)
        lostGhost.targetPosition = Math.round(pacmanPosition / 2)

        // The red ghost 'chaser' targets pacman's current position. He will usually appear to be following pacman. The blue ghost, 'interceptor' targets the cell four steps ahead of pacman, depending on his current direction. If pacman is moving up, for example, interceptor's target is four cells above him.
        // The yellow ghost, 'lost', targets pacmans tile number devided by two. He is therefore usually quite harmless, but becomes increasingly dangerous towards the top of the maze. Pink ghost 'random' identifies a new random cell at every junction and is therefore completely unpredictable.

        if (pacmanDirection === 'right') {
          interceptorGhost.targetPosition = pacmanPosition + 4
        } else if (pacmanDirection === 'left') {
          interceptorGhost.targetPosition = pacmanPosition - 4
        } else if (pacmanDirection === 'up' && pacmanPosition > 100) {
          interceptorGhost.targetPosition = pacmanPosition - 4 * width
        } else if (pacmanDirection === 'down' && pacmanPosition <= 524) {
          interceptorGhost.targetPosition = pacmanPosition + width * 4
        }
      }
      checkTargetPosition()

      const ghostAdjacentCellUp = this.position - width
      const ghostAdjacentCellRight = this.position + 1
      const ghostAdjacentCellDown = this.position + width
      const ghostAdjacentCellLeft = this.position - 1

      // To locate the direction of the target relative to the ghost, cell positions must be converted to coordinates. Subtracting the coordinates defines whether the target is above-left, above-right, below-left, or below-right. But what if the target is above-right and the ghost can exit a junction going up or going right - which way should it chose? This is determined by finding the mod of the coordinate difference. If the difference (between ghost and target) in x coordinates is greater than the difference in y coordinates (for example the red ghost sees pacman's position is one row above his own, and 12 columns to the right),  the ghost will take the direction with the greatest difference, ie right.

      const xCoordGhost = this.position % width
      const yCoordGhost = Math.floor(this.position / width)
      const xCoordTarget = this.targetPosition % width
      const yCoordTarget = Math.floor(this.targetPosition / width)

      const xRelative = xCoordGhost - xCoordTarget
      const yRelative = yCoordGhost - yCoordTarget

      // But it's not a perfect world and we can't always go where we want. When the ghost has identified its target position and the best junciton exit, it is still restricted by walls and the no U-turn rule. A priority list of directions is therefore assigned and the ghost takes the highest ranking diretion which is neither a wall not the direction it entered the junction from. 8 possible direction priority rankings exist:

      const directionPriority = []

      if (xRelative >= 0 && yRelative >= 0) {
        // If pacman is North West of Ghost
        if (Math.abs(xRelative) >= Math.abs(yRelative)) {
          directionPriority.push(
            ghostAdjacentCellLeft,
            ghostAdjacentCellUp,
            ghostAdjacentCellDown,
            ghostAdjacentCellRight
          )
        } else
          directionPriority.push(
            ghostAdjacentCellUp,
            ghostAdjacentCellLeft,
            ghostAdjacentCellRight,
            ghostAdjacentCellDown
          )
      } else if (xRelative <= 0 && yRelative >= 0) {
        // If pacman is North East of Ghost
        if (Math.abs(xRelative) >= Math.abs(yRelative)) {
          directionPriority.push(
            ghostAdjacentCellRight,
            ghostAdjacentCellUp,
            ghostAdjacentCellDown,
            ghostAdjacentCellLeft
          )
        } else
          directionPriority.push(
            ghostAdjacentCellUp,
            ghostAdjacentCellRight,
            ghostAdjacentCellLeft,
            ghostAdjacentCellDown
          )
      } else if (xRelative <= 0 && yRelative <= 0) {
        // If pacman is South West of Ghost
        if (Math.abs(xRelative) >= Math.abs(yRelative)) {
          directionPriority.push(
            ghostAdjacentCellRight,
            ghostAdjacentCellDown,
            ghostAdjacentCellUp,
            ghostAdjacentCellLeft
          )
        } else
          directionPriority.push(
            ghostAdjacentCellDown,
            ghostAdjacentCellRight,
            ghostAdjacentCellLeft,
            ghostAdjacentCellUp
          )
      } else if (xRelative >= 0 && yRelative <= 0) {
        // If pacman is South East of Ghost
        if (Math.abs(xRelative) >= Math.abs(yRelative)) {
          directionPriority.push(
            ghostAdjacentCellLeft,
            ghostAdjacentCellDown,
            ghostAdjacentCellUp,
            ghostAdjacentCellRight
          )
        } else
          directionPriority.push(
            ghostAdjacentCellDown,
            ghostAdjacentCellLeft,
            ghostAdjacentCellRight,
            ghostAdjacentCellUp
          )
      }

      // The following string of if/else clauses is simply to identify and act upon the highest priority direction which is neither a wall nor the direction the ghost entered the junction from.

      if (directionPriority[0] === ghostAdjacentCellUp) {
        if (
          !cells[directionPriority[0]].classList.contains('wall') &&
          this.currentDirection !== 'down'
        ) {
          this.moveUp()
        } else if (
          directionPriority[1] === ghostAdjacentCellRight &&
          !cells[directionPriority[1]].classList.contains('wall') &&
          this.currentDirection !== 'left'
        ) {
          this.moveRight()
        } else if (
          directionPriority[1] === ghostAdjacentCellLeft &&
          !cells[directionPriority[1]].classList.contains('wall') &&
          this.currentDirection !== 'right'
        ) {
          this.moveLeft()
        } else if (
          directionPriority[2] === ghostAdjacentCellRight &&
          !cells[directionPriority[2]].classList.contains('wall') &&
          this.currentDirection !== 'left'
        ) {
          this.moveRight()
        } else if (
          directionPriority[2] === ghostAdjacentCellLeft &&
          !cells[directionPriority[2]].classList.contains('wall') &&
          this.currentDirection !== 'right'
        ) {
          this.moveLeft()
        } else this.moveDown()
      } else if (directionPriority[0] === ghostAdjacentCellDown) {
        if (
          !cells[directionPriority[0]].classList.contains('wall') &&
          this.currentDirection !== 'up'
        ) {
          this.moveDown()
        } else if (
          directionPriority[1] === ghostAdjacentCellRight &&
          !cells[directionPriority[1]].classList.contains('wall') &&
          this.currentDirection !== 'left'
        ) {
          this.moveRight()
        } else if (
          directionPriority[1] === ghostAdjacentCellLeft &&
          !cells[directionPriority[1]].classList.contains('wall') &&
          this.currentDirection !== 'right'
        ) {
          this.moveLeft()
        } else if (
          directionPriority[2] === ghostAdjacentCellRight &&
          !cells[directionPriority[2]].classList.contains('wall') &&
          this.currentDirection !== 'left'
        ) {
          this.moveRight()
        } else if (
          directionPriority[2] === ghostAdjacentCellLeft &&
          !cells[directionPriority[2]].classList.contains('wall') &&
          this.currentDirection !== 'right'
        ) {
          this.moveLeft()
        } else this.moveUp()
      } else if (directionPriority[0] === ghostAdjacentCellRight) {
        if (
          !cells[directionPriority[0]].classList.contains('wall') &&
          this.currentDirection !== 'left'
        ) {
          this.moveRight()
        } else if (
          directionPriority[1] === ghostAdjacentCellUp &&
          !cells[directionPriority[1]].classList.contains('wall') &&
          this.currentDirection !== 'down'
        ) {
          this.moveUp()
        } else if (
          directionPriority[1] === ghostAdjacentCellDown &&
          !cells[directionPriority[1]].classList.contains('wall') &&
          this.currentDirection !== 'up'
        ) {
          this.moveDown()
        } else if (
          directionPriority[2] === ghostAdjacentCellUp &&
          !cells[directionPriority[2]].classList.contains('wall') &&
          this.currentDirection !== 'down'
        ) {
          this.moveUp()
        } else if (
          directionPriority[2] === ghostAdjacentCellDown &&
          !cells[directionPriority[2]].classList.contains('wall') &&
          this.currentDirection !== 'up'
        ) {
          this.moveDown()
        } else this.moveLeft()
      } else if (directionPriority[0] === ghostAdjacentCellLeft) {
        if (
          !cells[directionPriority[0]].classList.contains('wall') &&
          this.currentDirection !== 'right'
        ) {
          this.moveLeft()
        } else if (
          directionPriority[1] === ghostAdjacentCellUp &&
          !cells[directionPriority[1]].classList.contains('wall') &&
          this.currentDirection !== 'down'
        ) {
          this.moveUp()
        } else if (
          directionPriority[1] === ghostAdjacentCellDown &&
          !cells[directionPriority[1]].classList.contains('wall') &&
          this.currentDirection !== 'up'
        ) {
          this.moveDown()
        } else if (
          directionPriority[2] === ghostAdjacentCellUp &&
          !cells[directionPriority[2]].classList.contains('wall') &&
          this.currentDirection !== 'down'
        ) {
          this.moveUp()
        } else if (
          directionPriority[2] === ghostAdjacentCellDown &&
          !cells[directionPriority[2]].classList.contains('wall') &&
          this.currentDirection !== 'up'
        ) {
          this.moveDown()
        } else this.moveRight()
      }
      this.assignEnvironment()
    }
  }

  // And so all ghost behaviour in all environments has been handled. The only thing left to do is group them all together and set it on a timer so that ghost movement is fluid and contnuous.
  function moveGeneric (ghostObject) {
    if (ghostObject.currentEnvironment === 'corridor') {
      ghostObject.moveThroughCorridor(ghostObject.currentDirection)
    } else if (ghostObject.currentEnvironment === 'corner') {
      ghostObject.removeGhostFromCell()
      ghostObject.moveAroundCorner(ghostObject.currentDirection)
      ghostObject.addGhostToCell(ghostObject.newCell)
    } else if (ghostObject.currentEnvironment === 'junction') {
      ghostObject.decideJunctionExit()
    }
    ghostObject.assignEnvironment()
  }

  const chaserGhost = new Ghost(
    'chaser',
    137,
    pacmanPosition,
    'right',
    undefined,
    undefined
  )
  const randomGhost = new Ghost(
    'randomGhost',
    337,
    Math.random() * width ** 2,
    'up',
    undefined,
    undefined
  )
  const interceptorGhost = new Ghost(
    'interceptorGhost',
    335,
    2, // The interceptor ghost's target depends on pacman's current direction, but at game initiation pacmans direction is undefined. This value, 2, is just a place holder until the player makes their first move.
    'up',
    undefined,
    undefined
  )
  const lostGhost = new Ghost(
    'lostGhost',
    339,
    pacmanPosition / 2,
    'up',
    undefined,
    undefined
  )

  // Useful for life loss, game restart etc

  function resetGhosts () {
    chaserGhost.position = 137
    chaserGhost.currentDirection = 'right'
    chaserGhost.currentEnvironment = undefined
    chaserGhost.newCell = undefined

    lostGhost.position = 339
    lostGhost.currentDirection = 'up'
    lostGhost.currentEnvironment = undefined
    lostGhost.newCell = undefined

    interceptorGhost.position = 335
    interceptorGhost.currentDirection = 'up'
    interceptorGhost.currentEnvironment = undefined
    interceptorGhost.newCell = undefined

    randomGhost.position = 337
    randomGhost.currentDirection = 'up'
    randomGhost.currentEnvironment = undefined
    randomGhost.newCell = undefined
  }

  /// ORDER OF MOVEMENT SEQUENCE (LOOPED):
  /// CHECK ENVIRONMENT ;; CHECK DIRECTION ;; REMOVE GHOST (CURRENT CELL) ;; ADD GHOST (NEW CELL) ;; REASSIGN ENVIRONMENT ;; REASSIGN DIRECTION

  function removeAllGhostsFromMap () {
    chaserGhost.removeGhostFromCell()
    lostGhost.removeGhostFromCell()
    randomGhost.removeGhostFromCell()
    interceptorGhost.removeGhostFromCell()
  }

  function addGhostsToStartingPositions () {
    lostGhost.addGhostToCell(lostGhost.position)
    chaserGhost.addGhostToCell(chaserGhost.position)
    interceptorGhost.addGhostToCell(interceptorGhost.position)
    randomGhost.addGhostToCell(randomGhost.position)
  }

  // interceptorGhost.addGhostToCell(interceptorGhost.position)
  // chaserGhost.assignEnvironment()
  // chaserGhost.decideJunctionExit()

  function beginGhostMovement () {
    randomGhostMovementTimer = setInterval(moveGeneric, 200, randomGhost)
    chaserMovementTimer = setInterval(moveGeneric, 200, chaserGhost)
    lostGhostMovementTimer = setInterval(moveGeneric, 200, lostGhost)
    interceptorGhostMovementTimer = setInterval(
      moveGeneric,
      200,
      interceptorGhost
    )
  }

  addGhostsToStartingPositions()

  //! Energizer! Let poor old pacman fight back!

  // Just like the rest of us, when Pacman consumes a Red Bull he is able to face his demons. After consumption of a Red Bull, the ghosts enter 'Vulnerable Mode' for 4.5 seconds. If a collision occurs with Pacman during this time, the ghost will be banished to the opposite corner of the map.

  let energizerCooldownTimer = undefined
  let endSickoModeTimer = undefined

  function triggerSickoMode () {
    // Sicko Mode needs to be triggered repeatedly for its duration so that original ghost icons are rapidly replaced with vulnerable ghosts as they move around the map. Ghost movement is essentially just the removing and adding of the ghosts' style classes to sequential cells, and this will keep occurring even when Sicko Mode is active. So Sicko Mode needs to "keep up" with new ghost classes being added and quickly replace them with vulnerable classes

    // The timer for Sicko Mode is contained within the trigger function so that it will only initiate the first time. The endSickoMode timeout is also contined here so that sicko mode will end only after it has begun.
    if (!energizerCooldownTimer) {
      energizerCooldownTimer = setInterval(triggerSickoMode, 5)
    }
    if (!endSickoModeTimer) {
      endSickoModeTimer = setTimeout(endSickoMode, 4500)
    }

    // This is what converts the ghosts original images to the vulnerable ghost image. This need to be repeated very rapidly to keep up with new ghost images being added to the maze as the ghosts move.

    cells[chaserGhost.position].classList.remove('chaser')
    cells[chaserGhost.position].classList.add('vulnerable')

    cells[lostGhost.position].classList.remove('lostGhost')
    cells[lostGhost.position].classList.add('vulnerable')

    cells[interceptorGhost.position].classList.remove('interceptorGhost')
    cells[interceptorGhost.position].classList.add('vulnerable')

    cells[randomGhost.position].classList.remove('randomGhost')
    cells[randomGhost.position].classList.add('vulnerable')

    // Collisions
    // Collisions may have to be treated individually so that only the consumed ghost is banished. Consuming vulnerable ghosts does not send them back to the ghost house, but rather to a far corner of the map. This is becuase I am lazy and don't want to mess with the ghost house gates individually. This also eliminates the possibility that ghosts could enter the ghost house during a brief window of time after one ghost has been banished.

    if (pacmanPosition === chaserGhost.position) {
      sendToOppositeCorner(chaserGhost)
    }
    if (pacmanPosition === lostGhost.position) {
      sendToOppositeCorner(lostGhost)
    }
    if (pacmanPosition === randomGhost.position) {
      sendToOppositeCorner(randomGhost)
    }
    if (pacmanPosition === interceptorGhost.position) {
      sendToOppositeCorner(interceptorGhost)
    }

    // Ghosts are banished to whichever corner of the map is furthest from pacmans current position.

    function sendToOppositeCorner (ghost) {
      ghostGetsEatenSound.play()
      if (pacmanPosition % 25 < 12 && Math.floor(pacmanPosition / 25) < 12) {
        sendToSouthEastCorner(ghost)
      } else if (
        pacmanPosition % 25 >= 12 &&
        Math.floor(pacmanPosition / 25) < 12
      ) {
        sendToSouthWestCorner(ghost)
      } else if (
        pacmanPosition % 25 < 12 &&
        Math.floor(pacmanPosition / 25) >= 12
      ) {
        sendToNorthEastCorner(ghost)
      } else if (
        pacmanPosition % 25 >= 12 &&
        Math.floor(pacmanPosition / 25) >= 12
      ) {
        sendToNorthWestCorner(ghost)
      }
    }

    function sendToSouthEastCorner (ghost) {
      ghost.removeGhostFromCell()
      ghost.position = 598
      ghost.currentDirection = 'down'
      ghost.currentEnvironment = undefined
      ghost.newCell = undefined
      ghost.addGhostToCell(ghost.position)
    }
    function sendToSouthWestCorner (ghost) {
      ghost.removeGhostFromCell()
      ghost.position = 576
      ghost.currentDirection = 'down'
      ghost.currentEnvironment = undefined
      ghost.newCell = undefined
      ghost.addGhostToCell(ghost.position)
    }
    function sendToNorthEastCorner (ghost) {
      ghost.removeGhostFromCell()
      ghost.position = 48
      ghost.currentDirection = 'right'
      ghost.currentEnvironment = undefined
      ghost.newCell = undefined
      ghost.addGhostToCell(ghost.position)
    }
    function sendToNorthWestCorner (ghost) {
      ghost.removeGhostFromCell()
      ghost.position = 26
      ghost.currentDirection = 'left'
      ghost.currentEnvironment = undefined
      ghost.newCell = undefined
      ghost.addGhostToCell(ghost.position)
    }
  }

  function endSickoMode () {
    clearInterval(energizerCooldownTimer)
    clearTimeout(endSickoModeTimer)
    sickoModeSound.stop()
    energizerCooldownTimer = undefined
    endSickoModeTimer = undefined
  }

  //! SCORING, WIN/LOSS, & LIFE-LOSS MECHANICS
  // Fresh Cells contain food to keep Pacman big and strong. Each piece of food eaten awards the player 10 points. The game ends when Pacman has eaten all the food in the map. The foodScore is recorded by the array freshCells which is re-evaluated every time pacman moves.

  // Red bull awards extra points (200) but isn't a necessary dietary requirement for pacman and therefore doesn't count towards game completion

  let checkScoreInterval = undefined
  let foodScore = 0
  let redBullScore = 0
  let livesRemaining = 3

  const livesRemainingElement = document.querySelector('.livesRemainingValue')
  const scoreCounterElement = document.querySelector('.scoreValue')

  const victoryWindowElement = document.querySelector('.victory')
  const defeatWindowElement = document.querySelector('.defeat')
  const lifeLostElement = document.querySelector('.lifelost')

  scoreCounterElement.innerHTML = foodScore
  livesRemainingElement.innerHTML = livesRemaining

  function endgameVictory () {
    clearInterval(chaserMovementTimer)
    clearInterval(lostGhostMovementTimer)
    clearInterval(randomGhostMovementTimer)
    clearInterval(interceptorGhostMovementTimer)
    clearInterval(movementTimer)
    clearInterval(checkScoreInterval)

    sickoModeSound.stop()
    victorySound.play()

    document.removeEventListener('keydown', assignPacmanRotationAndDirection)

    victoryWindowElement.style.visibility = 'visible'
    window.addEventListener('keydown', startFresh)
  }

  // Endgame victory and endgame defeat are virtualy identical except for the message displayed.

  function endgameDefeat () {
    lifeLostElement.style.visibility = 'hidden'
    clearInterval(chaserMovementTimer)
    clearInterval(lostGhostMovementTimer)
    clearInterval(randomGhostMovementTimer)
    clearInterval(interceptorGhostMovementTimer)
    clearInterval(movementTimer)
    clearInterval(checkScoreInterval)

    sickoModeSound.stop()
    defeatSound.play()

    document.removeEventListener('keydown', assignPacmanRotationAndDirection)

    defeatWindowElement.style.visibility = 'visible'
    window.addEventListener('keydown', startFresh)
  }

  function startFresh (event) {
    if (event.key === 'Enter') {
      location.reload()
    }
  }

  // Losing a life resets the positions of all game characters without resetting the score or maze.

  function loseALife () {
    document.removeEventListener('keydown', assignPacmanRotationAndDirection)

    clearInterval(chaserMovementTimer)
    clearInterval(lostGhostMovementTimer)
    clearInterval(randomGhostMovementTimer)
    clearInterval(interceptorGhostMovementTimer)

    livesRemaining--
    resetPacman()
    removeAllGhostsFromMap()
    resetGhosts()
    addGhostsToStartingPositions()

    window.addEventListener('keyup', resumeGame)
  }

  function resumeGame (event) {
    if (event.key === 'Enter') {
      window.removeEventListener('keyup', resumeGame)
      lifeLostElement.style.visibility = 'hidden'
      resetGhostHouse()
      setTimeout(closeTheGates, 1005)
      randomGhostMovementTimer = setInterval(moveGeneric, 200, randomGhost)
      chaserMovementTimer = setInterval(moveGeneric, 200, chaserGhost)
      lostGhostMovementTimer = setInterval(moveGeneric, 200, lostGhost)
      interceptorGhostMovementTimer = setInterval(
        moveGeneric,
        200,
        interceptorGhost
      )

      document.addEventListener('keydown', assignPacmanRotationAndDirection)
    }
  }

  // To keep a live count of score and continually monitor for collisions, a player performance funtion must be performed on a very fast timer. This timer is balanced with the Sicko Mode timer in a compromise between minimising uncaught life-losses during regular mode and minimising incorrectly registered collisions in Sicko Mode. For player QOL, higher priority lies with preventing life-loss during sicko mode than with preventing uncaught life-loss collisions during regular mode.

  function checkPlayerPerformance () {
    const freshCells = document.querySelectorAll('.freshCell')
    const redBullCells = document.querySelectorAll('.energizer')
    foodScore = (220 - freshCells.length) * 10
    redBullScore = (4 - redBullCells.length) * 200

    if (freshCells.length < 1) {
      endgameVictory()
    }
    if (livesRemaining < 1) {
      endgameDefeat()
    }

    scoreCounterElement.innerHTML = foodScore + redBullScore
    livesRemainingElement.innerHTML = livesRemaining

    // A different message is displayed on each life loss depending on the Ghost pacman was caught by.

    const chaserGhostCollisions = document.querySelectorAll(
      '.pacman180.chaser,.pacman90.chaser,.pacman0.chaser,.pacman270.chaser'
    )
    if (chaserGhostCollisions.length > 0) {
      pacmanGetsEatenSound.play()

      lifeLostElement.innerHTML =
        'Oh no! You got caught by the Chaser ghost. He\'s a persistent one. <br /> <br /> <br /> Press Enter to continue'

      loseALife()

      if (livesRemaining) {
        lifeLostElement.style.visibility = 'visible'
      }
    }
    const lostGhostCollisions = document.querySelectorAll(
      '.pacman180.lostGhost,.pacman90.lostGhost,.pacman0.lostGhost,.pacman270.lostGhost'
    )
    if (lostGhostCollisions.length > 0) {
      pacmanGetsEatenSound.play()

      lifeLostElement.innerHTML =
        'Oh no! You got caught by the Lost ghost. That\'s pretty embarrassing... <br /> <br /> <br /> Press Enter to continue'

      loseALife()

      if (livesRemaining) {
        lifeLostElement.style.visibility = 'visible'
      }
    }
    const randomGhostCollisions = document.querySelectorAll(
      '.pacman180.randomGhost,.pacman90.randomGhost,.pacman0.randomGhost,.pacman270.randomGhost'
    )
    if (randomGhostCollisions.length > 0) {
      pacmanGetsEatenSound.play()

      lifeLostElement.innerHTML =
        'Oh no! You got caught by the Random ghost. What are the odds?? <br /> <br /> <br /> Press Enter to continue'

      loseALife()

      if (livesRemaining) {
        lifeLostElement.style.visibility = 'visible'
      }
    }
    const interceptorGhostCollisions = document.querySelectorAll(
      '.pacman180.interceptorGhost,.pacman90.interceptorGhost,.pacman0.interceptorGhost,.pacman270.interceptorGhost'
    )
    if (interceptorGhostCollisions.length > 0) {
      pacmanGetsEatenSound.play()

      lifeLostElement.innerHTML =
        'Oh no! You got caught by the Interceptor ghost. She\'s a cunning one. <br /> <br /> <br /> Press Enter to continue'

      loseALife()

      if (livesRemaining) {
        lifeLostElement.style.visibility = 'visible'
      }
    }
  }

  // Initially the endgame message was navigated awy from by pressing the enter key, which also initiated a new game. To give the player one more step between ending a game and starting a new one, the page has been set to refresh upon exiting the endgame message. A slight rework would enable the player to reset the maze, score, and characters without refreshing the page.

  function initiateGame (event) {
    if (event.key === 'Enter') {
      window.removeEventListener('keydown', initiateGame)
      window.removeEventListener('keyup', resumeGame)

      if (chaserMovementTimer) {
        clearInterval(movementTimer)
        clearInterval(chaserMovementTimer)
        clearInterval(lostGhostMovementTimer)
        clearInterval(randomGhostMovementTimer)
        clearInterval(interceptorGhostMovementTimer)
      }

      defeatWindowElement.style.visibility = 'hidden'
      victoryWindowElement.style.visibility = 'hidden'
      lifeLostElement.style.visibility = 'hidden'

      livesRemaining = 3

      generateMapOne()

      resetPacman()

      removeAllGhostsFromMap()

      checkScoreInterval = setInterval(checkPlayerPerformance, 65)
      resetGhosts()
      addGhostsToStartingPositions()
      beginGhostMovement()
      setTimeout(closeTheGates, 1005)
      document.addEventListener('keydown', assignPacmanRotationAndDirection)
    }
  }

  window.addEventListener('keydown', initiateGame)

  // Responsivity
}
window.addEventListener('DOMContentLoaded', init)
