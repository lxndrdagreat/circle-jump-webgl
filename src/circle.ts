import { Container /*Graphics,*/ /*SCALE_MODES*/ } from 'pixi.js';
import { Sprite } from '@pixi/sprite';
import { Loader } from '@pixi/loaders';
import { Jumper } from './jumper';
import {
  distanceBetweenVectors,
  randomChoice,
  randomInt,
  SimpleVector2,
  Vector2
} from './utils';
import { EventSystem } from './systems/event.system';

export default class Circle extends Container {
  orbitPivot: Container = new Container();
  orbitPosition: Container = new Container();
  private readonly orbitSpeed: number = Math.PI;
  private readonly rotationSpeed: number = Math.PI * 0.02;
  private orbitStart: number = 0;
  private currentOrbits: number = 2;
  public haveJumper: boolean = false;

  constructor(public readonly radius: number = 50) {
    super();

    this.orbitSpeed *= Math.pow(-1, randomInt(0, 2) % 2);
    this.rotationSpeed *= Math.pow(-1, randomInt(0, 2) % 2);

    // const g = new Graphics();
    // g.beginFill(0xff0000);
    // g.drawCircle(0, 0, radius);
    // g.endFill();
    // this.addChild(g);

    const spr = new Sprite(
      Loader.shared.resources['/public/meteor-large.png'].texture
    );
    // spr.texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
    spr.anchor.set(0.5, 0.5);
    const scale = (1.0 / 128) * (radius * 2);
    spr.scale.set(scale, scale);
    spr.tint = randomChoice([0xffff00, 0xff0000, 0xffaa00, 0xaaff00]);
    this.addChild(spr);

    this.orbitPivot.position.set(0, 0);
    this.orbitPivot.addChild(this.orbitPosition);
    this.orbitPosition.position.set(this.radius + 25, 0);
    this.addChild(this.orbitPivot);

    // const g2 = new Graphics();
    // g2.beginFill(0xffff00);
    // g2.drawCircle(0, 0, 2);
    // this.orbitPosition.addChild(g2);
  }

  static spawn(position: SimpleVector2, radius?: number): Circle {
    radius = radius || randomInt(30, 80);
    const circle = new Circle(radius);
    circle.position.set(position.x, position.y);
    return circle;
  }

  update(delta: number): void {
    this.rotation += this.rotationSpeed * delta;
    this.orbitPivot.rotation += this.orbitSpeed * delta;
    if (this.haveJumper) {
      if (Math.abs(this.orbitPivot.rotation - this.orbitStart) > Math.PI * 2) {
        // one full rotation
        this.currentOrbits -= 1;
        if (this.currentOrbits <= 0) {
          // Fire event
          EventSystem.shared.trigger('OutOfOrbits', this);
          // TODO destroy this circle
        }
        this.orbitStart = this.orbitPivot.rotation;
      }
    }
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
      this.orbitStart = this.orbitPivot.rotation;
      this.haveJumper = true;
      jumper.onAreaEntered(this);
      return true;
    }
    return false;
  }
}
