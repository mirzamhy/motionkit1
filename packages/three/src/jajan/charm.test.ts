import assert from 'node:assert/strict'
import test from 'node:test'
import * as THREE from 'three'

test('klepon has no continuous raised seam across the plush body', async () => {
  const context = new Proxy({}, { get: () => () => {} })
  const canvas = { width: 512, height: 512, getContext: () => context }
  Object.assign(globalThis, { document: { createElement: () => canvas } })

  const { buatCharm } = await import('./charm')
  const charm = buatCharm('klepon')
  const raisedSeams: THREE.Mesh[] = []
  charm.grup.traverse((object) => {
    if (object instanceof THREE.Mesh && !(object instanceof THREE.InstancedMesh) && object.geometry instanceof THREE.TubeGeometry) {
      raisedSeams.push(object)
    }
  })

  assert.equal(raisedSeams.length, 0)
})
