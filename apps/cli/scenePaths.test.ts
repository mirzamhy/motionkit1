import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { projectRoot, resolveScenePublicDir } from './scenePaths';

test('MK_PROJECTS overrides the default project root without a legacy fallback', () => {
  const root = join('C:', 'motionkit');
  assert.equal(projectRoot(root, { MK_PROJECTS: join('D:', 'films'), ROS_PROJECTS: join('E:', 'legacy') }), join('D:', 'films'));
  assert.equal(projectRoot(root, { ROS_PROJECTS: join('E:', 'legacy') }), join(root, 'projects'));
});

test('scene media resolves to the manifest project public folder when it exists', () => {
  const root = mkdtempSync(join(tmpdir(), 'motionkit-paths-'));
  try {
    const projects = join(root, 'work');
    const publicDir = join(projects, 'film-a', 'public');
    mkdirSync(publicDir, { recursive: true });
    assert.equal(resolveScenePublicDir(root, 'film-a', { MK_PROJECTS: projects }), publicDir);
    assert.equal(resolveScenePublicDir(root, 'missing', { MK_PROJECTS: projects }), join(root, 'out', 'scenes'));
    assert.equal(resolveScenePublicDir(root, undefined, { MK_PROJECTS: projects }), join(root, 'out', 'scenes'));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
