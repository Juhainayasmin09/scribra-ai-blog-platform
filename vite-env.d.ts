/// <reference types="vite/client" />

// Fix: Removed redundant SVG module declaration that conflicts with the one provided by vite/client to resolve Duplicate identifier 'src' error.
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
}
