// Variables lues par le Worker via `import { env } from "cloudflare:workers"`.
// En local : `.dev.vars` (voir `.dev.vars.example`). En production : les variables du projet sur Hiraiship.
declare module "cloudflare:workers" {
  export const env: {
    CLOUDINARY_CLOUD_NAME?: string;
    CLOUDINARY_API_KEY?: string;
    CLOUDINARY_API_SECRET?: string;
  };
}
