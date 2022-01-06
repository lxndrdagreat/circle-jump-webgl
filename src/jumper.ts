import {Graphics, Container} from 'pixi.js';
import {Point} from '@pixi/math';
import {Vector2} from './utils';
import Circle from './circle';
import {EventSystem} from './systems/event.system';

export default class Jumper extends Container {

  private velocity: Vector2 = new Vector2(100, 0);
  private readonly jumpSpeed: number = 500;
  attachedTo: Circle | null = null;

  constructor() {
    super();

    // TODO update Jumper with sprites
    const g = new Graphics();
    g.beginFill(0xFFFFFF);

    const size = 32;
    g.drawPolygon([
      new Point(size, 0.5 * size),
      new Point(0, size),
      new Point(0, 0)
    ]);
    // g.rotation = toRadians(90);

    this.pivot.set(0.5 * size, 0.5 * size);

    this.addChild(g);
  }

  jump(): void {
    if (this.attachedTo) {
      this.attachedTo = null;
      this.velocity = Vector2.fromRotation(this.rotation).multiply(this.jumpSpeed);
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
      let {x, y} = this.attachedTo.position;
      const direction = Vector2.fromRotation(this.attachedTo.orbitPivot.rotation);
      x += direction.x * (this.attachedTo.radius + 25);
      y += direction.y * (this.attachedTo.radius + 25);
      this.position.set(x, y);
      this.rotation = this.attachedTo.orbitPivot.rotation;
    } else {
      // move
      this.position.set(this.position.x + this.velocity.multiply(delta).x, this.position.y + this.velocity.multiply(delta).y);
    }
  }
}
