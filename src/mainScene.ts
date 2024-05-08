import Phaser from "phaser";
import Player from "./player";
import { createNoise2D } from "simplex-noise";
import alea from "alea";

const prng = alea("seed");
const noise2D = createNoise2D(prng);

export default class MainScene extends Phaser.Scene {
  private player!: Player;
  private score = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private obstacles!: Phaser.Physics.Arcade.Group;
  private ground!: Phaser.Physics.Arcade.StaticGroup;
  private lastX = 0;
  private scoreTimer!: Phaser.Time.TimerEvent;
  private spawnTimer?: Phaser.Time.TimerEvent;
  private obstacleSpeed = -200; // Initial speed of obstacles
  private maxSpeed = -600; // Maximum speed of obstacles
  private speedIncrement = -10; // Amount to increase speed each time

  constructor() {
    super("main-scene");
  }

  preload(): void {
    this.load.image("sky", "assets/sky.png");
    this.load.spritesheet("adventurer_idle", "assets/Adventurer_Idle.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet(
      "adventurer_walking",
      "assets/Adventurer_Walking.png",
      { frameWidth: 32, frameHeight: 32 }
    );
    this.load.spritesheet(
      "adventurer_running",
      "assets/Adventurer_Running.png",
      { frameWidth: 32, frameHeight: 32 }
    );
    this.load.spritesheet(
      "adventurer_jumping",
      "assets/Adventurer_Flying.png",
      { frameWidth: 32, frameHeight: 32 }
    );
    this.load.spritesheet("warrior", "assets/WarriorIdle.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("ground", "assets/groundtile.png", {
      frameWidth: 30,
      frameHeight: 30,
    });
  }

  create(): void {
    this.score = 0;
    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "32px",
      color: "#fff",
    });

    this.add.image(200, 300, "sky");
    this.ground = this.physics.add.staticGroup({
      key: "ground",
      repeat: 32,
      setXY: { x: 16, y: (this.game.config.height as number) - 16, stepX: 32 },
    });
    this.player = new Player(
      this,
      100,
      (this.game.config.height as number) - 64
    );
    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "32px",
      color: "#fff",
    });

    this.initializeAnimations();
    this.setupObstacles();

    this.physics.add.collider(this.player.sprite, this.ground);

    this.scoreTimer = this.time.addEvent({
      delay: 1000,
      callback: () => this.updateScore(10),
      callbackScope: this,
      loop: true,
    });

    this.scheduleNextObstacle();
  }
  initializeAnimations(): void {
    // Initialize animations for different states
    if (!this.anims.exists("idle")) {
      this.anims.create({
        key: "idle",
        frames: this.anims.generateFrameNumbers("adventurer_idle", {
          start: 0,
          end: 3,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }

    if (!this.anims.exists("walk")) {
      this.anims.create({
        key: "walk",
        frames: this.anims.generateFrameNumbers("adventurer_walking", {
          start: 0,
          end: 5,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }

    if (!this.anims.exists("run")) {
      this.anims.create({
        key: "run",
        frames: this.anims.generateFrameNumbers("adventurer_running", {
          start: 0,
          end: 5,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }

    if (!this.anims.exists("jump")) {
      this.anims.create({
        key: "jump",
        frames: this.anims.generateFrameNumbers("adventurer_jumping", {
          start: 0,
          end: 1,
        }),
        frameRate: 5,
        repeat: 0,
      });
    }
  }

  setupObstacles(): void {
    // Setup for obstacles
    this.obstacles = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    // Collider for obstacles
    this.physics.add.collider(
      this.player.sprite,
      this.obstacles,
      this.hitObstacle,
      null,
      this
    );

    this.physics.add.collider(this.player.sprite, this.ground);

    // Generate obstacles dynamically
    this.time.addEvent({
      delay: 2000, // every 2000 milliseconds
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true,
    });
  }

  spawnObstacle(): void {
    // Example of spawning an obstacle at the right edge of the screen and it moves left
    const x = (this.sys.game.config.width as number) + 50;
    const y = (this.sys.game.config.height as number) - 50; // Adjust height as needed
    const obstacle = this.obstacles.create(x, y, "warrior");
    obstacle.setVelocityX(this.obstacleSpeed); // Adjust speed as necessary

    // Automatically remove the obstacle when it goes off screen
    obstacle.setInteractive().on("pointerdown", () => {
      obstacle.destroy();
    });
    this.increaseObstacleSpeed(); // Increase speed for next spawn
    this.scheduleNextObstacle(); // Schedule the next obstacle
  }

  increaseObstacleSpeed(): void {
    if (this.obstacleSpeed > this.maxSpeed) {
      this.obstacleSpeed += this.speedIncrement; // Decrease the speed value (more negative)
    }
  }

  scheduleNextObstacle(): void {
    const minDelay = 1000; // Minimum delay in milliseconds
    const maxDelay = 3000; // Maximum delay in milliseconds
    const delay = Phaser.Math.Between(minDelay, maxDelay); // Get a random delay

    this.spawnTimer = this.time.delayedCall(
      delay,
      this.spawnObstacle,
      [],
      this
    );
  }

  update(time: number, delta: number): void {
    this.player.update();
    this.handleObstacles();
  }

  handleObstacles(): void {
    this.lastX += 0.02; // Adjust for desired frequency
    let noiseValue = noise2D(this.lastX, 0);

    if (noiseValue > 0.8 && this.obstacles.getChildren().length < 5) {
      let obstacle = this.obstacles.create(
        800,
        (this.game.config.height as number) - 50,
        "warrior"
      );
      obstacle.setVelocityX(-100);
    }

    // Cleanup
    this.obstacles.getChildren().forEach((obstacle) => {
      if ((obstacle as Phaser.Physics.Arcade.Sprite).x < -50) {
        obstacle.destroy();
      }
    });
  }

  hitObstacle(
    player: Phaser.Physics.Arcade.Sprite,
    obstacle: Phaser.Physics.Arcade.Sprite
  ): void {
    obstacle.destroy();
    player.setTint(0xff0000);
    this.scoreTimer.remove();
    this.time.delayedCall(100, () => {
      player.clearTint();
      window.alert(`Your score was ${this.score}. Click OK to restart.`);
      this.scene.restart();
    });
  }

  updateScore(points: number): void {
    this.score += points;
    this.scoreText.setText("Score: " + this.score);
  }
}
