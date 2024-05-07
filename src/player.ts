import Phaser from "phaser";

export default class Player {
  private sprite: Phaser.Physics.Arcade.Sprite;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, "dude");
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.sprite.setBounce(0.2);
    this.sprite.setCollideWorldBounds(true);
  }

  update(): void {
    if (this.cursors.left.isDown) {
      this.sprite.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.sprite.setVelocityX(160);
    } else {
      this.sprite.setVelocityX(0);
    }

    if (this.cursors.up.isDown && this.sprite.body!.touching.down) {
      this.sprite.setVelocityY(-330);
    }
  }
}
