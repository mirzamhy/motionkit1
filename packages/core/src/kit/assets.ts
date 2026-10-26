export type AssetType =
  | 'character'
  | 'vehicle'
  | 'building'
  | 'prop'
  | 'environment'
  | 'effect'
  | 'audio';

export type MotionKitAsset = {
  id: string;
  type: AssetType;
  source: string;
  license: string;
  model?: string;
  preview?: string;
  scale: number;
  origin: readonly [number, number, number];
  bounds?: readonly [number, number, number];
  animations?: readonly string[];
  variants?: readonly string[];
  materials?: readonly string[];
  dependencies?: readonly string[];
};

export const defineAsset = (asset: MotionKitAsset): MotionKitAsset => asset;
