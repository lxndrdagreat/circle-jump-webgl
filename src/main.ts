import './style.css';
import './stars.css';
import { autoDetectRenderer, Container, Ticker } from 'pixi.js';
import { CommonKeys, InputSystem } from './systems/input.system';
import { Transition } from './transition';
import Jumper from './jumper';
import Circle from './circle';
import { randomInt, SimpleVector2, Vector2 } from './utils';
import { EventSystem } from './systems/event.system';

document.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.querySelector<HTMLDivElement>('#app')!;

  const renderer = autoDetectRenderer({
    antialias: false,
    autoDensity: true,
    backgroundAlpha: 0,
    width: 480,
    height: 854
  });

  const stage = new Container();
  const playLayer = new Container();
  let activeTransition: Transition | null = null;

  const startPosition = new Vector2(240, 700);
  let cameraTargetPosition = new Vector2();
  let jumper: Jumper;
  let score = 0;

  // TODO: replace this with loading promise
  Promise.resolve().then(() => {
    stage.addChild(playLayer);

    // replace loading with scene
    while (wrapper.lastChild) {
      wrapper.removeChild(wrapper.lastChild);
    }
    wrapper.appendChild(renderer.view);

    function onJumperCaptured(eventArgs: unknown[]): void {
      const [circle] = eventArgs;
      const { x, y } = (circle as Circle).position;
      // playLayer.pivot.set(-240, -700);
      // playLayer.position.set(-x, -y);
      cameraTargetPosition.x = -240 + x;
      cameraTargetPosition.y = -700 + y;
      spawnCircle();
      score += 1;
      console.log('score', score);
    }
    EventSystem.shared.connect('JumperCaptured', onJumperCaptured);

    function newGame(): void {
      score = 0;
      playLayer.removeChildren();
      jumper = new Jumper();
      jumper.position.set(startPosition.x, startPosition.y);
      cameraTargetPosition.x = -240 + startPosition.x;
      cameraTargetPosition.y = -700 + startPosition.y;
      playLayer.pivot.set(cameraTargetPosition.x, cameraTargetPosition.y);
      playLayer.addChild(jumper);
      spawnCircle(startPosition);
    }

    function spawnCircle(position?: SimpleVector2): void {
      position = position || {
        x: (jumper.attachedTo?.position.x || 0) + randomInt(-150, 150),
        y: (jumper.attachedTo?.position.y || 0) + randomInt(-500, -400)
      };
      const newCircle = Circle.spawn(position);
      playLayer.addChild(newCircle);
    }

    newGame();

    // Start the game loop
    Ticker.shared.add(() => {
      const delta = Ticker.shared.elapsedMS * 0.001;

      if (activeTransition) {
        activeTransition.update(stage);
      } else {
        jumper.update(delta);

        for (const circle of playLayer.children.filter(
          (child) => child instanceof Circle
        )) {
          (circle as Circle).update(delta);
          if (!jumper.attachedTo) {
            (circle as Circle).checkJumperCollision(jumper);
          }
        }

        // ease camera
        const cameraMovement = 1000 * delta;
        const cameraPos = new Vector2(
          playLayer.pivot.x,
          playLayer.pivot.y
        ).moveTowards(cameraTargetPosition, cameraMovement);
        playLayer.pivot.set(cameraPos.x, cameraPos.y);

        if (InputSystem.shared.keyPressed(CommonKeys.Space)) {
          jumper.jump();
        }

        // check boundary for game over
        if (
          jumper.position.x < playLayer.pivot.x ||
          jumper.position.x > renderer.width + playLayer.pivot.x ||
          jumper.position.y < playLayer.pivot.y ||
          jumper.position.y > renderer.height + playLayer.pivot.y
        ) {
          newGame();
        }
      }

      renderer.render(stage);

      InputSystem.shared.flush();
    });
  });

  // TODO: remove for production
  /* @ts-ignore */
  (function () {
    var script = document.createElement('script');
    script.onload = function () {
      // @ts-ignore
      var stats = new Stats();
      document.body.appendChild(stats.dom);
      requestAnimationFrame(function loop() {
        stats.update();
        requestAnimationFrame(loop);
      });
    };
    script.src = '//mrdoob.github.io/stats.js/build/stats.min.js';
    document.head.appendChild(script);
  })();
});
