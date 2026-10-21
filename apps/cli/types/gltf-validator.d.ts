// Minimal types for the parts of Khronos glTF-Validator (npm gltf-validator) that apps/cli/asset.ts uses.
declare module 'gltf-validator' {
  type Message = { code: string; message: string; severity: number; pointer?: string };
  type Report = {
    issues: { numErrors: number; numWarnings: number; numInfos: number; messages: Message[] };
    info?: { totalTriangleCount?: number; materialCount?: number; animationCount?: number };
  };
  export function validateBytes(data: Uint8Array, options?: { uri?: string; maxIssues?: number; externalResourceFunction?: (uri: string) => Promise<Uint8Array> }): Promise<Report>;
}
