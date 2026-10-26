import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

type SceneEnvironment = Record<string, string | undefined>;

export const projectRoot = (root: string, env: SceneEnvironment = process.env) =>
  env.MK_PROJECTS ? resolve(env.MK_PROJECTS) : join(root, 'projects');

export const resolveScenePublicDir = (root: string, project?: string, env: SceneEnvironment = process.env) => {
  if (project) {
    const candidate = join(projectRoot(root, env), project, 'public');
    if (existsSync(candidate)) return candidate;
  }
  return join(root, 'out', 'scenes');
};
