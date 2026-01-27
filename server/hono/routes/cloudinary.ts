import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { images } from "../schema";
import {
  buildUploadSignature,
  cloudinaryConfig,
  verifyNotificationSignature,
} from "../cloudinary";

type CloudinaryNotification = {
  public_id?: string;
  secure_url?: string;
  original_filename?: string;
  context?: {
    custom?: Record<string, string>;
  };
};

const serializeContext = (value: unknown) => {
  if (!value) {
    return undefined;
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object") {
    return Object.entries(value as Record<string, string>)
      .map(([key, val]) => `${key}=${val}`)
      .join("|");
  }
  return undefined;
};

const serializeTags = (value: unknown) => {
  if (!value) {
    return undefined;
  }
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.join(",");
  }
  return undefined;
};

const buildTitle = (payload: CloudinaryNotification) => {
  if (payload.context?.custom?.title) {
    return payload.context.custom.title;
  }
  return payload.original_filename;
};

const cloudinaryRoutes = new Hono()
  .get("/config", (c) =>
    c.json({
      cloudName: cloudinaryConfig.cloudName,
      apiKey: cloudinaryConfig.apiKey,
    })
  )
  .post("/signature", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const notificationUrl = process.env.CLOUDINARY_NOTIFICATION_URL;

  const paramsToSign = {
    folder: typeof body.folder === "string" ? body.folder : undefined,
    public_id: typeof body.public_id === "string" ? body.public_id : undefined,
    upload_preset:
      typeof body.upload_preset === "string" ? body.upload_preset : undefined,
    context: serializeContext(body.context),
    tags: serializeTags(body.tags),
    notification_url: notificationUrl ?? undefined,
  };

  const { signature, timestamp, paramsToSign: signedParams } =
    buildUploadSignature(paramsToSign);

    return c.json({
      signature,
      timestamp,
      apiKey: cloudinaryConfig.apiKey,
      cloudName: cloudinaryConfig.cloudName,
      params: signedParams,
    });
  })
  .post("/webhook", async (c) => {
  const rawBody = await c.req.text();
  const signature = c.req.header("x-cld-signature");
  const timestamp = c.req.header("x-cld-timestamp");

  const verification = verifyNotificationSignature({
    rawBody,
    timestamp,
    signature,
  });

  if (!verification.ok) {
    return c.json({ ok: false, reason: verification.reason }, 401);
  }

  let payload: CloudinaryNotification;
  try {
    payload = JSON.parse(rawBody) as CloudinaryNotification;
  } catch {
    return c.json({ ok: false, reason: "invalid_json" }, 400);
  }

  if (!payload.public_id) {
    return c.json({ ok: true, skipped: true });
  }

  if (!payload.secure_url) {
    return c.json({ ok: true, skipped: true });
  }

  const existing = await db
    .select()
    .from(images)
    .where(eq(images.publicId, payload.public_id))
    .limit(1);

  const title = buildTitle(payload);

  if (existing.length === 0) {
    await db.insert(images).values({
      publicId: payload.public_id,
      url: payload.secure_url,
      title,
    });
  } else {
    const updates: { url?: string; title?: string | null } = {};
    if (payload.secure_url && payload.secure_url !== existing[0].url) {
      updates.url = payload.secure_url;
    }
    if (!existing[0].title && title) {
      updates.title = title;
    }
    if (Object.keys(updates).length > 0) {
      await db
        .update(images)
        .set(updates)
        .where(eq(images.publicId, payload.public_id));
    }
  }

    return c.json({ ok: true });
  });

export type CloudinaryRoutesType = typeof cloudinaryRoutes;

export default cloudinaryRoutes;
