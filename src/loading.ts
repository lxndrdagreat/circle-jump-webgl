import { Loader } from '@pixi/loaders';

export async function loadGameAssets(): Promise<void> {
  return new Promise((resolve, _reject) => {
    Loader.shared.add('/jumper.png');
    Loader.shared.add('/meteor-large.png');
    Loader.shared.add('/trail.png');

    Loader.shared.load((_loader, _resources) => {
      resolve();
    });
  });
}
