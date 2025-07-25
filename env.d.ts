/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_FB_API_KEY: string | undefined
    readonly VITE_FB_AUTH_DOMAIN: string | undefined
    readonly VITE_FB_PROJECT_ID: string | undefined
    readonly VITE_FB_STORAGE_BUCKET: string | undefined
    readonly VITE_FB_MESSAGING_SENDER_ID: string | undefined
    readonly VITE_FB_APP_ID: string | undefined
    readonly VITE_PUSH_APPLICATION_SERVER_KEY: string | undefined

    readonly VITE_THEME_COLOR: string | undefined
    readonly VITE_PRIVACY_POLICY: string | undefined
}
  
interface ImportMeta {
    readonly env: ImportMetaEnv
}