import { Loader } from '@pixi/loaders';

export async function loadGameAssets(): Promise<void> {
  return new Promise((resolve, _reject) => {
    Loader.shared.add('jumper.png', `${import.meta.env.BASE_URL}jumper.png`);
    Loader.shared.add('meteor-large.png', `${import.meta.env.BASE_URL}meteor-large.png`);
    Loader.shared.add('trail.png', `${import.meta.env.BASE_URL}trail.png`);

    Loader.shared.load((_loader, _resources) => {
      resolve();
    });
  });
}
