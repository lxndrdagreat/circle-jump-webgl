import { Container, Graphics } from 'pixi.js';
import Jumper from './jumper';
import {
  distanceBetweenVectors,
  randomInt,
  SimpleVector2,
  Vector2
} from './utils';

export default class Circle extends Container {
  orbitPivot: Container = new Container();
  orbitPosition: Container = new Container();
  private rotationSpeed: number = Math.PI;

  constructor(public readonly radius: number = 50) {
    super();

    this.rotationSpeed *= Math.pow(-1, randomInt(0, 2) % 2);

    const g = new Graphics();
    g.beginFill(0xff0000);
    g.drawCircle(0, 0, radius);
    g.endFill();

    this.addChild(g);

    this.orbitPivot.position.set(0, 0);
    this.orbitPivot.addChild(this.orbitPosition);
    this.orbitPosition.position.set(this.radius + 25, 0);
    this.addChild(this.orbitPivot);

    const g2 = new Graphics();
    g2.beginFill(0xffff00);
    g2.drawCircle(0, 0, 2);
    this.orbitPosition.addChild(g2);
  }

  static spawn(position: SimpleVector2, radius: number = 50): Circle {
    const circle = new Circle(radius);
    circle.position.set(position.x, position.y);
    return circle;
  }

  update(delta: number): void {
    this.orbitPivot.rotation += this.rotationSpeed * delta;
  }

  checkJumperCollision(jumper: Jumper): boolean {
    if (
      distanceBetweenVectors(this.position, jumper.position) <=
      this.radius + 32
    ) {
      this.orbitPivot.rotation = new Vector2(
        this.position.x,
        this.position.y
      ).angleBetween(new Vector2(jumper.position.x, jumper.position.y));
      jumper.onAreaEntered(this);
      return true;
    }

    return false;
  }
}
