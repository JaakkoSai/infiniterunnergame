// Game.ts
import Phaser from "phaser";
import MainScene from "./mainScene";

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 300 },
      debug: true, // Set to false in production
    },
  },
  scene: [MainScene],
};

export default new Phaser.Game(gameConfig);
