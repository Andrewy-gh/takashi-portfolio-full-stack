const UPLOAD_SEGMENT = '/image/upload/';

function hasAutoParams(transformSegment: string) {
  return /(^|,)f_auto(,|$)/.test(transformSegment) || /(^|,)q_auto(,|$)/.test(transformSegment);
}

// Inject `f_auto,q_auto` into Cloudinary delivery URLs.
// Example:
//   .../image/upload/v123/folder/id.jpg
// -> .../image/upload/f_auto,q_auto/v123/folder/id.jpg
export function withCloudinaryAutoFormatQuality(url: string) {
  if (!url) return url;

  const idx = url.indexOf(UPLOAD_SEGMENT);
  if (idx === -1) return url;

  const after = url.slice(idx + UPLOAD_SEGMENT.length);
  const slashIdx = after.indexOf('/');
  if (slashIdx === -1) {
    // Unusual, but still try a safe append.
    return `${url.slice(0, idx + UPLOAD_SEGMENT.length)}f_auto,q_auto/${after}`;
  }

  const firstSegment = after.slice(0, slashIdx); // either transforms OR version (v123) OR publicId
  const rest = after.slice(slashIdx + 1);

  // If the first segment already looks like transforms and already includes our params, no-op.
  if (!firstSegment.startsWith('v') && firstSegment.includes(',') && hasAutoParams(firstSegment)) {
    return url;
  }

  // If first segment is a transform chain (comma-separated) but missing params, prefix them.
  if (!firstSegment.startsWith('v') && firstSegment.includes(',')) {
    return `${url.slice(0, idx + UPLOAD_SEGMENT.length)}f_auto,q_auto,${firstSegment}/${rest}`;
  }

  // If first segment is version (v123) or a public id (no transforms), inject a new transform segment.
  return `${url.slice(0, idx + UPLOAD_SEGMENT.length)}f_auto,q_auto/${firstSegment}/${rest}`;
}

