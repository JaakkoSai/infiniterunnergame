import Phaser from "phaser";
import Player from "./player";
// import { createNoise2D } from "simplex-noise";
// import alea from "alea";

// const prng = alea("seed");
// const noise2D = createNoise2D(prng);

export default class MainScene extends Phaser.Scene {
  private player!: Player;
  private score = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private obstacles!: Phaser.Physics.Arcade.Group;
  private ground!: Phaser.Physics.Arcade.StaticGroup;
  // private lastX = 0;
  private scoreTimer!: Phaser.Time.TimerEvent;
  private spawnTimer?: Phaser.Time.TimerEvent;
  private obstacleSpeed = -100;
  private maxSpeed = -500;
  private speedIncrement = -20;
  private increaseSpeedTimer?: Phaser.Time.TimerEvent;
  private maxDelay: number = 5000;
  private minDelay: number = 3000;
  private minimumPossibleDelay: number = 1000;
  private delayDecrement: number = 100;

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
    this.load.spritesheet("tree", "assets/tree.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("ground", "assets/groundsolid.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("bat", "assets/BatIdleMoving.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create(): void {
    this.score = 0;
    this.obstacleSpeed = -100;
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

    this.increaseSpeedTimer = this.time.addEvent({
      delay: 5000,
      callback: () => {
        if (this.obstacleSpeed > this.maxSpeed) {
          this.obstacleSpeed += this.speedIncrement;
        }
      },
      callbackScope: this,
      loop: true,
    });

    this.scheduleNextObstacle();
  }
  initializeAnimations(): void {
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

    if (!this.anims.exists("fly")) {
      this.anims.create({
        key: "fly",
        frames: this.anims.generateFrameNumbers("bat", { start: 0, end: 2 }),
        frameRate: 10,
        repeat: -1,
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
  }

  spawnObstacle(): void {
    const x = (this.sys.game.config.width as number) + 50;
    const isFlying = Phaser.Math.Between(0, 1);
    const y = isFlying
      ? (this.game.config.height as number) / 1.3
      : (this.sys.game.config.height as number) - 48;
    const obstacleKey = isFlying ? "bat" : "tree";
    const obstacle = this.obstacles.create(x, y, obstacleKey);
    obstacle.setVelocityX(this.obstacleSpeed);

    if (isFlying) {
      obstacle.play("fly");
    }

    // Automatically remove the obstacle when it goes off screen
    obstacle.setInteractive().on("pointerdown", () => {
      obstacle.destroy();
    });
  }

  increaseObstacleSpeed(): void {
    if (this.obstacleSpeed > this.maxSpeed) {
      this.obstacleSpeed += this.speedIncrement;
    }
  }

  scheduleNextObstacle(): void {
    if (this.spawnTimer) {
      this.spawnTimer.remove();
      console.log("Existing timer removed");
    }

    this.minDelay = Math.max(
      this.minimumPossibleDelay,
      this.minDelay - this.delayDecrement
    );
    this.maxDelay = Math.max(
      this.minDelay,
      this.maxDelay - this.delayDecrement
    );

    const delay = Phaser.Math.Between(this.minDelay, this.maxDelay);
    console.log(`Next obstacle will spawn in ${delay / 1000} seconds.`);

    this.spawnTimer = this.time.delayedCall(
      delay,
      () => {
        console.log("Spawning obstacle now.");
        this.spawnObstacle();
        this.scheduleNextObstacle();
      },
      [],
      this
    );
  }

  update(time: number, delta: number): void {
    this.player.update();
    // this.handleObstacles();
  }

  // handleObstacles(): void {
  //   this.lastX += 0.02; // Adjust for desired frequency
  //   let noiseValue = noise2D(this.lastX, 0);

  //   if (noiseValue > 0.8 && this.obstacles.getChildren().length < 5) {
  //     let obstacle = this.obstacles.create(
  //       800,
  //       (this.game.config.height as number) - 50,
  //       "tree"
  //     );
  //     obstacle.setVelocityX(-100);
  //   }

  //   // Cleanup
  //   this.obstacles.getChildren().forEach((obstacle) => {
  //     if ((obstacle as Phaser.Physics.Arcade.Sprite).x < -50) {
  //       obstacle.destroy();
  //     }
  //   });
  // }

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
