# **General Assembly Project 1: Pacman** ![General Assembly](https://camo.githubusercontent.com/6ce15b81c1f06d716d753a61f5db22375fa684da/68747470733a2f2f67612d646173682e73332e616d617a6f6e6177732e636f6d2f70726f64756374696f6e2f6173736574732f6c6f676f2d39663838616536633963333837313639306533333238306663663535376633332e706e67)


## Overview
Pacman is a challenging arcade-style survival game hosted in a web browser. Guide Pacman through the haunted maze, eating food and avoiding ghosts as you go. Accumulate points and buy yourself some breathing space by consuming Red Bull™ and attacking ghosts during 'sicko-mode'. Collect all food items on the map to win the game.


Check out the GitHub [Repo](https://github.com/dougalrea/sei-project-1) and launch the game on [GitHub Pages](https://dougalrea.github.io/sei-project-1/).

![Gameplay demo](/readme_stuff/gameplay_demo.gif)

## Brief

#### Project brief

* Render a game in the browser
* Design logic for winning / losing & visually display game results
* Include separate HTML / CSS / JavaScript files
* Use Javascript for DOM manipulation
* HTML Canvas is **not** to be used during this project.
* Deploy your game online, where the rest of the world can access it
* Use **semantic markup** for HTML and CSS (adhere to best practices)

#### Game-specific brief

* The player should be able to clear at least one board
* The player's score should be displayed at the end of the game

#### Game-enhancing targets I set myself

* Mimic the gameplay mechanics of the original 80s arcade game as much as possible to ensure the game is actually enjoyable
* Give each ghost a unique 'personality' or hunting style such that the player must learn their behaviours and play to their weaknesses
* Include a power-up which when eaten by pacman, allows the player to eat the ghosts and banish them to the opposite corner of the map

## Technologies Used

* HTML5 with HTML5 audio
* CSS3
* JavaScript (ES6)
* Git
* GitHub
* VSCode
* Google Fonts

## Approach 

### Gameplay Environment & Appearance

The gameplay area is made up of 625 divs in a 25 x 25 square grid. The grid is generated automatically on page load. All cells begin as freshCells (pathways with food) but are replaced by either empty cells, wall cells, energizer (Red Bull™) cells etc during Map Generation.

```   function createGrid () {
    for (let i = 0; i < cellCount; i++) {
      const cell = document.createElement('div')
      grid.appendChild(cell)
      cell.classList.add('freshCell')
      cells.push(cell)
    }
  }
```
Each div element is assigned a class to define not only its appearance on the screen but also its behaviour during gameplay. For example, all characters' movement within the maze is restricted by any adjacent cells with a class of 'wall'.

### Maze Functionality

The trickiest part of map generation and reset is the operation of the ghost house gates. Ghosts are sent to the ghost house every time the player begins afresh or loses a life. Ghosts must be able to exit the ghost house but mustn't re-enter it during gameplay. The gates must therefore be timed carefully to change to wall cells after the ghosts have had anough time to escape. Invisible walls within the ghost house prevent the ghosts from travelling in any direction other than towards the exit.

### Pacman Movement

To mimic the continuous flow and instant responsiveness of the original Pacman, the player's movement in this game is triggered by 'keydown' events and fired repeatedly by setInterval timers. Pacman's current rotation and direction must always be known to allow for continuous movement in one direction without repeatedly pressing the same arrow key, stopping only when he encounters a wall. 

Pacman's currentRotation takes a value of either 0, 90, 180, or 270, and instructs which CSS class should be added to the next div Pacman will enter. In this way, Pacman appears to always be facing the way he is moving, just like in the original game.

### Ghosts

#### Constructor

Each ghost is a member of the Ghost class, and is contructed with the following parameters and methods:
``` 
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
```

#### Movement

Each ghost's movement is dependent on both their current environment and their current direction. There are three environment types in the maze, namely corridors, corners, and junctions. The assignEnvironment function checks the number and position of any adjacent wall cells and assigns each ghost's currentEnvironment parameter accordingly. 

Since ghosts aren't allowed to make U-turns, their behaviour in corridors is fairly straight forward (if you'll pardon the pun). If the currentDirection is up, and their currentEnvironment is a corridor, they should continue moving up.

Similarly, when a ghost finds itself in a corner, it must continue round and exit the corner without turning back on itself.

All ghosts follow the same rules in corridors and corners, so where they really begin to show individuality is at junctions. The ghosts move automatically but not randomly. To minimise repetition of code, I structured their junction decision making as follows: The junction exit a ghost should take must be the exit that brings the ghost immediately closest to its target cell. Upon entering a junction environment, each ghost will:
1. Check its own currentPosition (a number between 1 & 625)
2. Check the position of its target (also 1 - 625)
3. Convert both positions to X/Y coordinates
4. Subtract X coordinates to determine if the target is right or the left of the ghost, and subtract Y coordinates to determine if the target is above or below
5. Compare the moduli or absolute values of the X and Y subtractions 
6. Assign a priority order of exit directions, with the first in the array being the direction which brings the ghost immediately closest to its target
7. Take the highest ranking exit direction which is neither a wall nor the direction it came from

The conversion of cell numbers to X/Y coordinates is achieved as follows:
```
      const xCoordGhost = this.position % width
      const yCoordGhost = Math.floor(this.position / width)
      const xCoordTarget = this.targetPosition % width
      const yCoordTarget = Math.floor(this.targetPosition / width)

      const xRelative = xCoordGhost - xCoordTarget
      const yRelative = yCoordGhost - yCoordTarget
```
The exit direction priority order (dependent on the moduli of X/Y subtractions) is assigned as follows, repeated for a total of 8 different order possibilities:
```
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
        }
```
Subtracting the coordinates defines whether the target is above-left, above-right, below-left, or below-right. But what if the target is above-right and the ghost can exit a junction going up or going right - which way should it chose? This is determined by finding the mod of the coordinate difference. If the difference (between ghost and target) in x coordinates is greater than the difference in y coordinates (for example the red ghost sees pacman's position is one row above his own, and 12 columns to the right),  the ghost will take the direction with the greatest difference, ie right.

Therefore, their individuality comes entirely from each ghost's assigned target. 
* The red ghost, Chaser, targets Pacman and will re-check Pacman's current position at every junction to directly hunt him down. 
* The yellow ghost, Lost, targets Pacman's position divided by 2, and therefore generally stays out of the player's way but becomes considerably more dangerous towards the top left corner of the maze, as Pacman's position approaches 1. 
* The blue ghost, Interceptor, has the most complex target calculation. As its name suggests, this ghost targets Pacman's current position plus 4 cells *in the direction he is facing*. If Pacman is facing left or right, Interceptors' target position is Pacman's position - 4 or + 4 respectively, but if Pacman is facing up or down, the target position is Pacman's position -100 or + 100 respectively. 
* Lastly, the pink ghost, Random, targets a new random number between 1 and 625 at each junction it comes to, and therefore moves completely unpredictably.

### Sicko Mode

Without any means of defending oneself other than fleeing, it quickly became apparent that the behaviour of the Chaser and Interceptor ghosts made playing the game an incredibly stressful and difficult experience. Four Red Bull™ cans were threfore introduced to the maze to replicate the original Pacman game's 'energizers'. When consumed, Sicko Mode is activated. During this mode, all ghosts become 'frightened' and are vulnerable to attack by Pacman. Where before Pacman would lose a life upon collision with a ghost, collisions during Sicko Mode banish the unfortunate ghost to the far corner of the maze and allow Pacman to continue his journey without character position reset. 

### Audio

All audio effects for the game are vocals recorded and edited myself. The following events trigger audio effects:
* Pacman eating food
* Pacman losing a life
* Sicko mode (audio effect for duration)
* Pacman banishing a ghost during Sicko Mode
* Winning the game (no food left in the maze)
* Losing the game (Pacman running out of lives)

### Bugs

* Very very rarely, the collision detection timer doesn't detect collisions between ghosts & Pacman. This only occurs when the two characters are adjacent and swap cells at virtually the same time, meaning that no cell with both a ghost class and a Pacman class existed, at least not for longer than 65 miliseconds. This is an attribute of tile-based browser games which cannot be completely ironed out, although I have minimised the occurence of this bug by careful adjustment of the movement and collision detection timers.
* When Sicko Mode is already active, consuming another Red Bull™ has no effect - the duration of sicko mode is not extended. My quick solution was to have the duration of Sicko Mode last only 4.5 seconds, and to have the Redd Bull™ cans positioned some distance apart such that the likelihood of Pacman consuming another Red Bull™ while Sicko Mode is already active is minimal.
* Since Interceptor calculates its target depenent on Pacman's current position and current direction, two bugs have arisen:
  * Between beginning the game (pressing Enter) and moving pacman (pressing an arrow key), Pacman's current direction is undefined. Interceptor therefore targets cell number 2 until the player moves Pacman from his starting position. Since the player will certainly move Pacman very soon after beginning the game, this bug is of no consequence.
  * When Pacman is moving upwards or downwards, Interceptors target is Pacman's position - 100 or Pacman's position + 100 respectively. Since the interceptor cannot target a cell number less than 0 or greater than 625, this limits the Interceptor's functionality to when neither of the following are true:

    * Pacman's position is less than 100 **and** his direction is **up** 
    * Pacman's position is greater than 525 **and** his direction is **down**

    Since these circumstances are quite rare, this also has minimal impact on the ghost's functionality.

There are no known bugs which cause the game to break. Besides the rare instances of collisions not being detected, there are no known bugs which would be noticable to the casual player.

### Wins and Hurdles

Achieving true individuality among the ghosts' behaviour was immensely satisfying, and structuring the logic in a way that allowed each new ghost to behave uniquely depending on only one or two lines of code to define its target cell mean that any 'personaility' can be assigned to a ghost with relative ease.

Another huge win was Pacman's movement. The rotation of the Pacman image, the continuous flow of movement and the instant responsiveness align closely to what I had hoped for when first imagining how I wanted the game to feel.

The most difficult part was finding an efficient and functional way to determine junction exits for ghosts. The method for assigning the exit direction priority order is rather long-winded and can probably be achieved with smarter code, but I am happy with the functionality and readability of the logic I used.

### Future Content

The majority of the logic has been structured in a way that makes the addition of new levels and increasing difficulties relatively straight forward. For example, each ghost's movement speed is defined by a unique setInterval, so increasing the speed of certain ghosts under certain conditions, as  in the original Pacman gmae, would only be a matter of adding functions to adjust the interval timer associated with each ghost. The most time-consuming part of creating new levels would be map design, as each cell type (wall, food, Red Bull™ etc) requires a hard-coded input array.

There is definitely room to improve on the styling and general appearance of the space surrounding the game grid, as my main priority during this exercise was on the logic and enjoyability of the game itself. 
