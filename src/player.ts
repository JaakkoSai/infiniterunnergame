import Phaser from "phaser";

export default class Player {
  public sprite: Phaser.Physics.Arcade.Sprite; // Changed to public for accessible collision detection
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, "dude");
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.sprite.setBounce(0.2);
    this.sprite.setCollideWorldBounds(true);
  }

  update(): void {
    if (this.cursors.left.isDown) {
      this.sprite.setVelocityX(-160);
      this.sprite.anims.play("walk", true);
    } else if (this.cursors.right.isDown) {
      this.sprite.setVelocityX(160);
      this.sprite.anims.play("run", true);
    } else {
      this.sprite.setVelocityX(0);
      this.sprite.anims.play("idle", true);
    }

    if (this.cursors.up.isDown && this.sprite.body.blocked.down) {
      // Ensure the player is on the ground
      this.sprite.setVelocityY(-200); // Adjust this value for jump height
      this.sprite.anims.play("jump", true);
    }
  }
}
