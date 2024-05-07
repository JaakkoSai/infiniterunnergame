import Phaser from "phaser";
import Player from "./player";

export default class MainScene extends Phaser.Scene {
  private player!: Player;

  constructor() {
    super("main-scene");
  }

  preload(): void {
    this.load.image("sky", "assets/sky.png"); // Placeholder assets
    this.load.image("ground", "assets/platform.png"); // Placeholder assets
    this.load.image("star", "assets/star.png"); // Placeholder assets
    this.load.spritesheet("dude", "assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create(): void {
    this.add.image(400, 300, "sky");

    this.player = new Player(this, 100, 450);
  }

  update(time: number, delta: number): void {
    this.player.update();
  }
}
