import { Loader } from '@pixi/loaders';

export async function loadGameAssets(): Promise<void> {
  return new Promise((resolve, _reject) => {
    Loader.shared.add('/public/jumper.png');
    Loader.shared.add('/public/meteor-large.png');

    Loader.shared.load((_loader, _resources) => {
      resolve();
    });
  });
}
