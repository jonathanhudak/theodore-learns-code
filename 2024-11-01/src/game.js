import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

class CaptureTheKing {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(
      window.innerWidth / -32,
      window.innerWidth / 32,
      window.innerHeight / 32,
      window.innerHeight / -32,
      1,
      1000
    );

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.currentPlayer = "red";
    this.moveCount = 0;
    this.isMoving = false;
    this.diceRolling = false;
    this.canRebuildKingdom = true;

    // Create number display
    this.createNumberDisplay();

    this.init();

    this.audio = {
      rebuild: new Audio("/stack-fall.mp3"), // Add a wood blocks sound effect
      stackFall: new Audio("/stack-fall.mp3"),
      step: new Audio("/step.mp3"), // Add step sound
    };
  }

  init() {
    // Setup scene
    this.setupLights();
    this.createSkybox();
    this.createGround();
    this.createGameBoard();
    this.createPieces();
    this.setupControls();

    // Position camera
    this.camera.position.set(50, 50, 50);
    this.camera.lookAt(0, 0, 0);

    // Setup event listeners
    this.setupEventListeners();

    // Start animation loop
    this.animate();
  }

  createNumberDisplay() {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 200;
    const context = canvas.getContext("2d");

    this.numberTexture = new THREE.CanvasTexture(canvas);
    const numberGeometry = new THREE.PlaneGeometry(8, 8);
    const numberMaterial = new THREE.MeshBasicMaterial({
      map: this.numberTexture,
      transparent: true,
    });

    this.numberDisplay = new THREE.Mesh(numberGeometry, numberMaterial);
    this.numberDisplay.position.set(-25, 5, 0);
    this.scene.add(this.numberDisplay);
  }

  updateNumberDisplay(number) {
    const canvas = this.numberTexture.image;
    const context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.beginPath();
    context.arc(
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2.5,
      0,
      Math.PI * 2
    );
    context.fillStyle = "white";
    context.fill();

    context.fillStyle = "black";
    context.font = "bold 120px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(number.toString(), canvas.width / 2, canvas.height / 2);

    this.numberTexture.needsUpdate = true;
  }

  rollDice() {
    if (this.isMoving || this.diceRolling) return;

    this.diceRolling = true;
    let frames = 20;
    let currentFrame = 0;

    const diceDisplay = document.getElementById("dice-display");

    const animate = () => {
      if (currentFrame < frames) {
        const randomRoll = Math.floor(Math.random() * 6) + 1;
        diceDisplay.textContent = `Dice: ${randomRoll}`;
        currentFrame++;
        requestAnimationFrame(animate);
      } else {
        this.moveCount = Math.floor(Math.random() * 6) + 1;
        diceDisplay.textContent = `Dice: ${this.moveCount}`;
        this.diceRolling = false;
        this.isMoving = true;
        console.log(`Rolled: ${this.moveCount}`);
      }
    };

    animate();
  }

  setupEventListeners() {
    window.addEventListener("resize", () => this.onWindowResize());
    window.addEventListener("keydown", (e) => this.handleKeyPress(e));

    const diceButton = document.getElementById("dice-roll");
    diceButton.addEventListener("click", () => this.rollDice());
  }

  handleKeyPress(event) {
    if (event.key.toLowerCase() === "r" && this.canRebuildKingdom) {
      const kingdomToRebuild =
        this.currentPlayer === "red" ? this.redBlocks : this.blueBlocks;
      const position =
        this.currentPlayer === "red"
          ? new THREE.Vector3(-20, 1, 20)
          : new THREE.Vector3(20, 1, -20);
      const team = this.currentPlayer;

      // Remove old blocks
      kingdomToRebuild.forEach((block) => {
        this.scene.remove(block);
      });

      // Play sound with user interaction
      this.audio.stackFall.currentTime = 0; // Reset audio to start
      this.audio.stackFall.play().catch((error) => {
        console.log("Audio play failed:", error);
      });

      // Create new stack immediately
      const material =
        this.currentPlayer === "red"
          ? new THREE.MeshPhongMaterial({
              color: 0xff0000,
              shininess: 30,
              transparent: true,
              opacity: 0.9,
            })
          : new THREE.MeshPhongMaterial({
              color: 0x0000ff,
              shininess: 30,
              transparent: true,
              opacity: 0.9,
            });

      this.createRandomStack(
        new THREE.BoxGeometry(1.5, 0.5, 6),
        material,
        position,
        team
      );

      this.canRebuildKingdom = false; // Prevent multiple rebuilds in one turn
      return;
    }

    if (!this.isMoving) return;

    const currentSoldier =
      this.currentPlayer === "red" ? this.redSoldier : this.blueSoldier;
    const moveDistance = 5; // Same as square size
    let moved = false;

    switch (event.key) {
      case "ArrowUp":
        if (this.moveCount > 0) {
          currentSoldier.position.z -= moveDistance;
          moved = true;
        }
        break;
      case "ArrowDown":
        if (this.moveCount > 0) {
          currentSoldier.position.z += moveDistance;
          moved = true;
        }
        break;
      case "ArrowLeft":
        if (this.moveCount > 0) {
          currentSoldier.position.x -= moveDistance;
          moved = true;
        }
        break;
      case "ArrowRight":
        if (this.moveCount > 0) {
          currentSoldier.position.x += moveDistance;
          moved = true;
        }
        break;
      case " ": // Spacebar for jumping
        if (this.moveCount > 0) {
          currentSoldier.position.y += 3;
          moved = true;
          setTimeout(() => {
            currentSoldier.position.y -= 3;
          }, 500);
        }
        break;
    }

    if (moved) {
      // Play step sound
      this.audio.step.currentTime = 0; // Reset audio to start
      this.audio.step.play().catch((error) => {
        console.log("Step sound failed:", error);
      });
      this.moveCount--;
    }

    if (this.moveCount === 0) {
      this.isMoving = false;
      this.switchTurn();
    }

    // Check for king capture
    const oppositeKing =
      this.currentPlayer === "red" ? this.blueKing : this.redKing;

    if (this.kingCaptured === null) {
      // Check if soldier touches king
      const distance = currentSoldier.position.distanceTo(
        oppositeKing.position
      );
      if (distance < 3) {
        this.kingCaptured = oppositeKing;
        console.log("King captured!");
      }
    } else {
      // Move captured king with soldier
      this.kingCaptured.position.copy(currentSoldier.position);
      this.kingCaptured.position.x += 2;

      // Check for win condition (reaching home base)
      const homeBase =
        this.currentPlayer === "red"
          ? new THREE.Vector3(-15, 0, 15)
          : new THREE.Vector3(15, 0, -15);

      if (currentSoldier.position.distanceTo(homeBase) < 5) {
        this.winner = this.currentPlayer;
        alert(`${this.currentPlayer} team wins!`);
      }
    }
  }

  switchTurn() {
    this.currentPlayer = this.currentPlayer === "red" ? "blue" : "red";
    this.canRebuildKingdom = true; // Allow kingdom rebuilding for new turn
    document.getElementById(
      "turn-display"
    ).textContent = `Current Turn: ${this.currentPlayer}`;
  }

  onWindowResize() {
    this.camera.left = window.innerWidth / -32;
    this.camera.right = window.innerWidth / 32;
    this.camera.top = window.innerHeight / 32;
    this.camera.bottom = window.innerHeight / -32;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  setupLights() {
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(10, 20, 0);
    this.scene.add(directionalLight);
  }

  createSkybox() {
    // Create simple blue sky
    this.scene.background = new THREE.Color(0x87ceeb);
  }

  createGround() {
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshPhongMaterial({
      color: 0x3c8f3c, // Green color
      side: THREE.DoubleSide,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = Math.PI / 2;
    ground.position.y = -0.5;
    this.scene.add(ground);
  }

  createGameBoard() {
    const squareSize = 5;

    // Create the path layout (only outer square now)
    const pathLayout = [
      // Outer square only
      ...[...Array(8)].map((_, i) => ({ x: i - 3, z: -3 })), // Bottom row
      ...[...Array(6)].map((_, i) => ({ x: 4, z: i - 2 })), // Right side
      ...[...Array(8)].map((_, i) => ({ x: 3 - i, z: 3 })), // Top row
      ...[...Array(6)].map((_, i) => ({ x: -3, z: 2 - i })), // Left side
    ];

    // Create squares for the path
    pathLayout.forEach((pos, index) => {
      const squareGeometry = new THREE.BoxGeometry(squareSize, 0.5, squareSize);
      const squareMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
      });
      const square = new THREE.Mesh(squareGeometry, squareMaterial);

      // Position the square
      square.position.set(pos.x * squareSize, 0, pos.z * squareSize);

      this.scene.add(square);
    });

    // Create starting positions (larger, thicker platforms)
    const baseGeometry = new THREE.BoxGeometry(
      squareSize * 2,
      2,
      squareSize * 2
    );
    const redBaseMaterial = new THREE.MeshPhongMaterial({
      color: 0xff9999,
      transparent: true,
      opacity: 0.9, // Increased opacity to reduce flickering
    });
    const blueBaseMaterial = new THREE.MeshPhongMaterial({
      color: 0x9999ff,
      transparent: true,
      opacity: 0.9, // Increased opacity to reduce flickering
    });

    // // Red base (bottom left, slightly elevated)
    // const redBase = new THREE.Mesh(baseGeometry, redBaseMaterial);
    // redBase.position.set(-15, 1, 15); // Raised position
    // this.scene.add(redBase);

    // // Blue base (top right, slightly elevated)
    // const blueBase = new THREE.Mesh(baseGeometry, blueBaseMaterial);
    // blueBase.position.set(15, 1, -15); // Raised position
    // this.scene.add(blueBase);
  }

  createPieces() {
    // Create soldiers
    const soldierGeometry = new THREE.CylinderGeometry(0.8, 0.8, 3, 32);
    const redMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const blueMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });

    // Position soldiers on the corner squares of the board
    this.redSoldier = new THREE.Mesh(soldierGeometry, redMaterial);
    this.redSoldier.position.set(-15, 1.5, 15); // On corner square
    this.scene.add(this.redSoldier);

    this.blueSoldier = new THREE.Mesh(soldierGeometry, blueMaterial);
    this.blueSoldier.position.set(15, 1.5, -15); // On corner square
    this.scene.add(this.blueSoldier);

    // Add kings
    const kingGeometry = new THREE.CylinderGeometry(1.2, 1.2, 4, 32);
    this.redKing = new THREE.Mesh(kingGeometry, redMaterial);
    this.blueKing = new THREE.Mesh(kingGeometry, blueMaterial);

    this.scene.add(this.redKing);
    this.scene.add(this.blueKing);

    // Initialize game state
    this.kingCaptured = null;
    this.winner = null;

    // Create the Jenga-like kingdoms
    this.createKingdoms();
  }

  createKingdoms() {
    const blockGeometry = new THREE.BoxGeometry(1.5, 0.5, 6);

    // Create colored materials for each team
    const redBlockMaterial = new THREE.MeshPhongMaterial({
      color: 0xff0000,
      shininess: 30,
      transparent: true,
      opacity: 0.9,
    });

    const blueBlockMaterial = new THREE.MeshPhongMaterial({
      color: 0x0000ff,
      shininess: 30,
      transparent: true,
      opacity: 0.9,
    });

    // Create red kingdom stack (completely off board)
    this.redBlocks = this.createRandomStack(
      blockGeometry,
      redBlockMaterial,
      new THREE.Vector3(-20, 1, 20), // Position off the board
      "red"
    );

    // Create blue kingdom stack (completely off board)
    this.blueBlocks = this.createRandomStack(
      blockGeometry,
      blueBlockMaterial,
      new THREE.Vector3(20, 1, -20), // Position off the board
      "blue"
    );

    // Add instruction text to the UI
    const instructions = document.createElement("div");
    instructions.style.position = "fixed";
    instructions.style.bottom = "20px";
    instructions.style.left = "200px";
    instructions.style.color = "white";
    instructions.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    instructions.style.padding = "10px";
    instructions.style.borderRadius = "5px";
    instructions.textContent =
      "Press R to rebuild your kingdom during your turn";
    document.body.appendChild(instructions);
  }

  createRandomStack(blockGeometry, blockMaterial, basePosition, team) {
    const blocks = [];
    const numBlocks = 15; // Reduced number of blocks
    const maxHeight = 8; // Maximum height of the stack

    for (let i = 0; i < numBlocks; i++) {
      const block = new THREE.Mesh(blockGeometry, blockMaterial);

      // Calculate height progress (0 to 1)
      const heightProgress = i / numBlocks;

      // Create even vertical distribution with some randomness
      const xOffset = (Math.random() - 0.5) * 4; // Horizontal spread
      const yPos = heightProgress * maxHeight; // Even vertical distribution
      const zOffset = (Math.random() - 0.5) * 4; // Depth spread

      // Start blocks below ground for rising animation
      block.position.set(
        basePosition.x + xOffset,
        basePosition.y - 5, // Start below ground
        basePosition.z + zOffset
      );

      // Random rotation for natural look
      block.rotation.x = (Math.random() - 0.5) * 0.5;
      block.rotation.y = Math.random() * Math.PI; // Full rotation possible
      block.rotation.z = (Math.random() - 0.5) * 0.5;

      this.scene.add(block);
      blocks.push(block);

      // Animate each block with a delay
      setTimeout(() => {
        this.animateBlockRise(block, yPos);
      }, i * 50);
    }

    // Place king slightly above the stack
    const finalKingY = maxHeight + 1;
    setTimeout(() => {
      if (team === "red") {
        this.animateKingPosition(
          this.redKing,
          basePosition.x,
          finalKingY,
          basePosition.z
        );
      } else {
        this.animateKingPosition(
          this.blueKing,
          basePosition.x,
          finalKingY,
          basePosition.z
        );
      }
    }, numBlocks * 50 + 200);

    return blocks;
  }

  animateBlockRise(block, targetY) {
    const startY = block.position.y;
    const startRotation = block.rotation.clone();
    const duration = 1000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutBack = (t) => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
      };

      if (progress < 1) {
        // Rise with bounce effect
        block.position.y = startY + (targetY - startY) * easeOutBack(progress);

        // Add slight rotation during rise for more natural settling
        block.rotation.x = startRotation.x + Math.sin(progress * Math.PI) * 0.1;
        block.rotation.z = startRotation.z + Math.sin(progress * Math.PI) * 0.1;

        requestAnimationFrame(animate);
      } else {
        block.position.y = targetY;
        block.rotation.copy(startRotation);
      }
    };

    animate();
  }

  animateKingPosition(king, x, y, z) {
    const startPos = king.position.clone();
    const duration = 1000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutBounce = (t) => {
        const n1 = 7.5625;
        const d1 = 2.75;

        if (t < 1 / d1) {
          return n1 * t * t;
        } else if (t < 2 / d1) {
          return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
          return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
          return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
      };

      if (progress < 1) {
        // Animate position with bounce effect
        king.position.x = startPos.x + (x - startPos.x) * progress;
        king.position.y =
          startPos.y + (y - startPos.y) * easeOutBounce(progress);
        king.position.z = startPos.z + (z - startPos.z) * progress;

        requestAnimationFrame(animate);
      } else {
        king.position.set(x, y, z);
      }
    };

    animate();
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 20;
    this.controls.maxDistance = 100;
    this.controls.maxPolarAngle = Math.PI / 2;
  }
}

const game = new CaptureTheKing();
