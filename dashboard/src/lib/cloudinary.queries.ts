import type { InferResponseType } from 'hono/client';
import { client } from './api';
import { assertOk, readErrorMessage } from './http';

const signatureRequest = client.api.cloudinary.signature.$post;
const configRequest = client.api.cloudinary.config.$get;

export type CloudinarySignatureResponse = InferResponseType<
  typeof signatureRequest,
  200
>;

export type CloudinaryConfigResponse = InferResponseType<
  typeof configRequest,
  200
>;

export type CloudinarySignaturePayload = {
  folder?: string;
  public_id?: string;
  upload_preset?: string;
  context?: Record<string, string>;
  tags?: string[] | string;
};

export async function getCloudinaryConfig() {
  const res = await configRequest();
  await assertOk(res);
  return await res.json();
}

export async function getUploadSignature(payload?: CloudinarySignaturePayload) {
  const res = await signatureRequest({
    json: payload ?? {},
  });
  await assertOk(res);
  return await res.json();
}

const buildUploadUrl = (cloudName: string) =>
  `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

export async function uploadToCloudinary(
  file: File,
  options?: CloudinarySignaturePayload
) {
  const signature = await getUploadSignature(options);
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signature.apiKey);
  formData.append('timestamp', String(signature.timestamp));
  formData.append('signature', signature.signature);

  Object.entries(signature.params ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(key, String(value));
  });

  const res = await fetch(buildUploadUrl(signature.cloudName), {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }

  return await res.json();
}
