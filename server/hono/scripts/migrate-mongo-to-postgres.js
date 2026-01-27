const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { Pool } = require("pg");

require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

const Image = require("../../models/Image");
const ImageOrder = require("../../models/ImageOrder");

const requiredEnv = ["MONGODB_URI", "DATABASE_URL"];
const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Missing env vars: ${missing.join(", ")}`);
}

const ORDER_OUTPUT_PATH = path.resolve(
  __dirname,
  "mongo-image-order.json"
);

const migrate = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const images = await Image.find({}).lean();
    const existing = await pool.query("SELECT public_id FROM images");
    const existingPublicIds = new Set(
      existing.rows.map((row) => row.public_id)
    );

    let inserted = 0;
    let skipped = 0;
    let missingData = 0;

    for (const image of images) {
      const publicId = image.cloudinaryId;
      const url = image.url;
      if (!publicId || !url) {
        missingData += 1;
        continue;
      }

      if (existingPublicIds.has(publicId)) {
        skipped += 1;
        continue;
      }

      await pool.query(
        "INSERT INTO images (public_id, url, title, created_at) VALUES ($1, $2, $3, $4)",
        [publicId, url, image.title ?? null, image.createdAt ?? new Date()]
      );
      inserted += 1;
      existingPublicIds.add(publicId);
    }

    const imageOrder = await ImageOrder.findOne({}).lean();
    if (imageOrder?.order?.length) {
      const idMap = new Map(
        images.map((image) => [image._id.toString(), image.cloudinaryId])
      );
      const orderedPublicIds = imageOrder.order
        .map((id) => id.toString())
        .map((id) => idMap.get(id))
        .filter(Boolean);

      const payload = {
        generatedAt: new Date().toISOString(),
        count: orderedPublicIds.length,
        publicIds: orderedPublicIds,
      };

      fs.writeFileSync(ORDER_OUTPUT_PATH, JSON.stringify(payload, null, 2));
    }

    // eslint-disable-next-line no-console
    console.log(
      `Mongo -> Postgres migration done. inserted=${inserted} skipped=${skipped} missing=${missingData}`
    );
    if (fs.existsSync(ORDER_OUTPUT_PATH)) {
      // eslint-disable-next-line no-console
      console.log(`Image order exported: ${ORDER_OUTPUT_PATH}`);
    }
  } finally {
    await pool.end();
    await mongoose.disconnect();
  }
};

migrate().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Migration failed:", error);
  process.exitCode = 1;
});
