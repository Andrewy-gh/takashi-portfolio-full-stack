import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUD_NAME;
const apiKey = process.env.API_KEY;
const apiSecret = process.env.API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error("CLOUD_NAME, API_KEY, and API_SECRET must be set");
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

const MAX_NOTIFICATION_AGE_SECONDS = 2 * 60 * 60;

export const cloudinaryConfig = {
  cloudName,
  apiKey,
};

export const buildUploadSignature = (
  params: Record<string, string | number | boolean | undefined>
) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      paramsToSign[key] = value;
    }
  }

  const signature = cloudinary.utils.api_sign_request(
    { ...paramsToSign, timestamp },
    apiSecret
  );

  return { signature, timestamp, paramsToSign };
};

const safeEqual = (a: string, b: string) => {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufferA, bufferB);
};

export const verifyNotificationSignature = ({
  rawBody,
  timestamp,
  signature,
}: {
  rawBody: string;
  timestamp: string | undefined;
  signature: string | undefined;
}) => {
  if (!timestamp || !signature) {
    return { ok: false, reason: "missing_headers" as const };
  }

  const timestampNumber = Number(timestamp);
  if (!Number.isFinite(timestampNumber)) {
    return { ok: false, reason: "invalid_timestamp" as const };
  }

  const ageSeconds = Math.abs(Date.now() / 1000 - timestampNumber);
  if (ageSeconds > MAX_NOTIFICATION_AGE_SECONDS) {
    return { ok: false, reason: "expired" as const };
  }

  const algorithm = signature.length === 64 ? "sha256" : "sha1";
  const expected = crypto
    .createHash(algorithm)
    .update(`${rawBody}${timestamp}${apiSecret}`)
    .digest("hex");

  if (!safeEqual(expected, signature)) {
    return { ok: false, reason: "signature_mismatch" as const };
  }

  return { ok: true as const };
};
