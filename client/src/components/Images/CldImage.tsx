import { useMemo } from 'react';
import {
  AdvancedImage,
  lazyload,
  responsive,
  placeholder,
} from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';

type CldImageProps = {
  cloudName: string;
  publicId: string;
};

export default function CldImage({ cloudName, publicId }: CldImageProps) {
  const cld = useMemo(() => {
    return new Cloudinary({
      cloud: {
        cloudName: cloudName,
      },
    });
  }, [cloudName]);

  const myImage = useMemo(() => {
    return cld.image(publicId);
  }, [cld, publicId]);

  return (
    <AdvancedImage
      cldImg={myImage}
      style={{ maxWidth: '100%' }}
      plugins={[lazyload(), responsive(), placeholder()]}
    />
  );
}
