/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

declare module 'filepond/locale/zh-cn.js' {}
declare module '@/lib/pngtiny' {
  export function tiny(file: File, quality?: number): Promise<File>;
}
