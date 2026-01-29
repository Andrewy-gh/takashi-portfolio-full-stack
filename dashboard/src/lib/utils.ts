import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from '@server/lib/shared-types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const capitalize = <T extends string>(s: T) =>
  (s[0]!.toUpperCase() + s.slice(1)) as Capitalize<typeof s>;

// MARK: Upload
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// export async function getImageDimensionsAndUrl(
//   file: File
// ): Promise<{ width: number; height: number; url: string }> {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     const url = URL.createObjectURL(file);

//     img.onload = () => {
//       resolve({
//         width: img.width,
//         height: img.height,
//         url: url,
//       });
//     };

//     img.onerror = (error) => {
//       URL.revokeObjectURL(url);
//       reject(error);
//     };

//     img.src = url;
//   });
// }

export async function getImageDimensionsAndUrl(
  file: File
): Promise<{ dimensions: { width: number; height: number }; url: string }> {
  const url = URL.createObjectURL(file);
  try {
    const dimensions = await new Promise<{ width: number; height: number }>(
      (resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.onerror = reject;
        img.src = url;
      }
    );
    return { dimensions, url };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

export function formatImageMegapixels(width: number, height: number): number {
  const megapixels = (width * height) / 1000000;
  return Number(megapixels.toFixed(2));
}

export async function validateSingleFile(file: File): Promise<{
  errors: string[] | undefined;
  dimensions: { width: number; height: number };
}> {
  const errors: string[] = [];
  if (file.size > MAX_FILE_SIZE) {
    errors.push('File size must be less than 20MB');
  }
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    errors.push('Only .jpg, .jpeg, .png and .webp files are accepted');
  }
  const dimensions = await getImageDimensions(file);
  const megapixels = (dimensions.width * dimensions.height) / 1000000;
  if (megapixels > 25) {
    errors.push('Image must be 25 megapixels or less');
  }
  return {
    errors: errors.length > 0 ? errors : undefined,
    dimensions,
  };
}

export async function generateThumbnail(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Failed to get canvas context');

      const containerSize = 300;
      const scale = Math.min(
        containerSize / img.width,
        containerSize / img.height
      );
      const width = img.width * scale;
      const height = img.height * scale;

      canvas.width = containerSize;
      canvas.height = containerSize;
      const x = (containerSize - width) / 2;
      const y = (containerSize - height) / 2;

      ctx.drawImage(img, x, y, width, height);
      resolve(canvas.toDataURL('image/webp', 0.9));
    };
    img.onerror = () => reject('Failed to load image');
    img.src = imageUrl;
  });
}

// export const generateThumbnail = (file: File): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = () => {
//       const img = new Image();
//       img.onload = () => {
//         const canvas = document.createElement('canvas');
//         const ctx = canvas.getContext('2d');
//         if (!ctx) return reject('Failed to get canvas context');

//         const maxWidth = 200;
//         const scaleFactor = maxWidth / img.width;
//         canvas.width = maxWidth;
//         canvas.height = img.height * scaleFactor;

//         ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//         resolve(canvas.toDataURL('image/webp', 0.8));
//       };
//       img.src = reader.result as string;
//     };
//     reader.onerror = () => reject(reader.error);
//     reader.readAsDataURL(file);
//   });
// };

// MARK: Table
export function hasDataChanged<
  T extends { sequence: number | null; id: string },
>(initial: T[], updated: T[]): boolean {
  return initial.some((item, index) => {
    return (
      item.sequence !== updated[index]?.sequence ||
      item.id !== updated[index]?.id
    );
  });
}

export function sortBySequenceThenName<
  T extends { sequence: number | null; name: string },
>(data: T[]): T[] {
  return data.sort((a, b) => {
    if (a.sequence !== null && b.sequence !== null) {
      return a.sequence - b.sequence;
    }
    if (a.sequence !== null) {
      return -1;
    }
    if (b.sequence !== null) {
      return 1;
    }
    return a.name.localeCompare(b.name);
  });
}
