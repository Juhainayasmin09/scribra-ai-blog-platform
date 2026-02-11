// Manually declare types usually provided by 'vite/client'
// This fixes the "Cannot find type definition file for 'vite/client'" error

// Ambient module declarations for assets
// Using ambient declarations in a global script allows for default exports
declare module '*.svg' {
  const src: string;
  export default src;
  export const ReactComponent: import('react').FunctionComponent<
    import('react').SVGProps<SVGSVGElement> & { title?: string }
  >;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.ico' {
  const src: string;
  export default src;
}

declare module '*.bmp' {
  const src: string;
  export default src;
}

// Global interface augmentations
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly [key: string]: string | boolean | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY?: string;
    [key: string]: string | undefined;
  }
  interface Process {
    env: ProcessEnv;
  }
}

declare var process: NodeJS.Process;
