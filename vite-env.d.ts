// Manually declare types usually provided by 'vite/client'
// This fixes the "Cannot find type definition file for 'vite/client'" error

declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<React.SVGProps<
    SVGSVGElement
  > & { title?: string }>;
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

declare module '*.ico' {
  const content: string;
  export default content;
}

declare module '*.bmp' {
  const content: string;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly [key: string]: string | boolean | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Augment the global NodeJS namespace to provide types for process.env
// This resolves the "Cannot redeclare block-scoped variable 'process'" error 
// by using a global augmentation instead of a module-scoped 'declare const'.
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_KEY?: string;
      [key: string]: string | undefined;
    }
    interface Process {
      env: ProcessEnv;
    }
  }

  // Declaring 'process' as var allows it to safely merge with existing global declarations
  // avoiding the block-scoped redeclaration error.
  var process: NodeJS.Process;
}

// Export empty object to ensure this file is treated as a module
export {};
