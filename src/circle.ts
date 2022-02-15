import { Container } from 'pixi.js';
import { Sprite } from '@pixi/sprite';
import { Loader } from '@pixi/loaders';
import { Text, TextStyle } from '@pixi/text';
import { Jumper } from './jumper';
import {
  distanceBetweenVectors,
  randomChoice,
  randomFloat,
  randomInt,
  SimpleVector2,
  Vector2
} from './utils';
import { EventSystem } from './systems/event.system';

let circleUID = 0;

export enum CircleJumperState {
  Awaiting,
  HaveJumper,
  JumperJumped
}

const minOrbitSpeed: number = Math.PI * 0.65;
const maxOrbitSpeed: number = Math.PI * 1.25;

export default class Circle extends Container {
  orbitPivot: Container = new Container();
  orbitPosition: Container = new Container();
  private readonly orbitSpeed: number = randomFloat(
    minOrbitSpeed,
    maxOrbitSpeed
  );
  private readonly rotationSpeed: number = Math.PI * 0.02;
  private orbitStart: number = 0;
  private currentOrbits: number = 3;
  public jumperState: CircleJumperState = CircleJumperState.Awaiting;
  private readonly orbitsText: Text;
  private readonly spr: Sprite;
  public readonly uid: number = ++circleUID;

  constructor(public readonly radius: number = 50) {
    super();

    this.orbitSpeed *= Math.pow(-1, randomInt(0, 2) % 2);
    this.rotationSpeed *= Math.pow(-1, randomInt(0, 2) % 2);

    this.spr = new Sprite(Loader.shared.resources['meteor-large.png'].texture);
    // spr.texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
    this.spr.anchor.set(0.5, 0.5);
    const scale = (1.0 / 128) * (radius * 2);
    this.spr.scale.set(scale, scale);
    this.spr.tint = randomChoice([0xffff00, 0xff0000, 0xffaa00, 0xaaff00]);
    this.addChild(this.spr);

    this.orbitPivot.position.set(0, 0);
    this.orbitPivot.addChild(this.orbitPosition);
    this.orbitPosition.position.set(this.radius + 25, 0);
    this.addChild(this.orbitPivot);

    const style = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 36,
      fontStyle: 'italic',
      fontWeight: 'bold',
      fill: ['#ffffff', '#00ff99'], // gradient
      stroke: '#4a1850',
      strokeThickness: 3,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2,
      lineJoin: 'round'
    });
    this.orbitsText = new Text(`${this.currentOrbits}`, style);
    this.orbitsText.anchor.set(0.5, 0.5);
    this.orbitsText.visible = false;
    this.addChild(this.orbitsText);
  }

  static spawn(position: SimpleVector2, radius?: number): Circle {
    radius = radius || randomInt(30, 80);
    const circle = new Circle(radius);
    circle.position.set(position.x, position.y);
    return circle;
  }

  update(delta: number): void {
    this.spr.rotation += this.rotationSpeed * delta;
    this.orbitPivot.rotation += this.orbitSpeed * delta;
    this.orbitsText.visible = this.jumperState === CircleJumperState.HaveJumper;
    if (this.jumperState === CircleJumperState.HaveJumper) {
      if (Math.abs(this.orbitPivot.rotation - this.orbitStart) > Math.PI * 2) {
        // one full rotation
        this.currentOrbits -= 1;
        this.orbitsText.text = `${this.currentOrbits}`;
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
      this.jumperState = CircleJumperState.HaveJumper;
      jumper.onAreaEntered(this);
      return true;
    }
    return false;
  }

  implode(): void {
    EventSystem.shared.trigger('CircleImploded', this);
  }
}
