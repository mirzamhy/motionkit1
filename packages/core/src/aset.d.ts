// Gambar yang diimpor langsung dibundel webpack Remotion dan menjadi URL.
declare module '*.webp' {
  const url: string;
  export default url;
}
