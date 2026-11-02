import { env } from "cloudflare:workers";

async function signature(params: Record<string, string>, secret: string) {
  const serialized = Object.entries(params)
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  const digest = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(`${serialized}${secret}`));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  const cloudName = env.CLOUDINARY_CLOUD_NAME;
  const apiKey = env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return Response.json({ error: "Cloudinary n’est pas encore configuré." }, { status: 500 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return Response.json({ error: "Sélectionnez une image valide." }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return Response.json({ error: "L’image doit faire moins de 10 Mo." }, { status: 400 });
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const params = { timestamp };
  const uploadData = new FormData();
  uploadData.append("file", file);
  uploadData.append("api_key", apiKey);
  uploadData.append("timestamp", timestamp);
  uploadData.append("signature", await signature(params, apiSecret));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: uploadData,
  });
  const result = await response.json();

  if (!response.ok || !result.secure_url) {
    return Response.json({ error: "Cloudinary n’a pas pu enregistrer l’image." }, { status: 502 });
  }

  return Response.json({ url: result.secure_url });
}
