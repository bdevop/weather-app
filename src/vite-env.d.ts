/// <reference types="vite/client" />
/// <reference types="vitest/globals" />

interface ImportMetaEnv {
  readonly VITE_WEATHERAPI_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}