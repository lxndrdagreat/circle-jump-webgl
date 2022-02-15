import { Sprite } from '@pixi/sprite';
import { Loader } from '@pixi/loaders';
import { Vector2 } from './utils';
import Circle, { CircleJumperState } from './circle';
import { EventSystem } from './systems/event.system';

export class Jumper extends Sprite {
  private velocity: Vector2 = new Vector2(100, 0);
  private readonly jumpSpeed: number = 500;
  attachedTo: Circle | null = null;

  constructor() {
    super(Loader.shared.resources['jumper.png'].texture);
    this.anchor.set(0.5, 0.5);
    this.pivot.set(0.5, 1);
  }

  jump(): void {
    if (this.attachedTo) {
      this.attachedTo.jumperState = CircleJumperState.JumperJumped;
      this.attachedTo = null;
      this.velocity = Vector2.fromRotation(this.rotation).multiply(
        this.jumpSpeed
      );
    }
  }

  onAreaEntered(target: Circle): void {
    this.attachedTo = target;
    this.velocity = new Vector2();
    EventSystem.shared.trigger('JumperCaptured', target);
  }

  update(delta: number): void {
    if (this.attachedTo) {
      // rotate around circle
      // NOTE: transform method is not working when moving the layer
      // this.transform.setFromMatrix(this.attachedTo.orbitPosition.transform.worldTransform);
      let { x, y } = this.attachedTo.position;
      const direction = Vector2.fromRotation(
        this.attachedTo.orbitPivot.rotation
      );
      x += direction.x * (this.attachedTo.radius + 25);
      y += direction.y * (this.attachedTo.radius + 25);
      this.position.set(x, y);
      this.rotation = this.attachedTo.orbitPivot.rotation;
    } else {
      // move
      this.position.set(
        this.position.x + this.velocity.multiply(delta).x,
        this.position.y + this.velocity.multiply(delta).y
      );
    }
  }
}
