import { Loader } from '@pixi/loaders';

export async function loadGameAssets(): Promise<void> {
  return new Promise((resolve, _reject) => {
    Loader.shared.add(`${import.meta.env.BASE_URL}/jumper.png`);
    Loader.shared.add(`${import.meta.env.BASE_URL}/meteor-large.png`);
    Loader.shared.add(`${import.meta.env.BASE_URL}/trail.png`);

    Loader.shared.load((_loader, _resources) => {
      resolve();
    });
  });
}
