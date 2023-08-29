import { useMemo } from 'react';
import {
  AdvancedImage,
  lazyload,
  responsive,
  placeholder,
} from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';

export default function CldImage({ cloudName, cloudinaryId }) {
  const cld = useMemo(() => {
    return new Cloudinary({
      cloud: {
        cloudName: cloudName,
      },
    });
  }, [cloudName]);

  const myImage = useMemo(() => {
    return cld.image(cloudinaryId);
  }, [cld, cloudinaryId]);

  return (
    <AdvancedImage
      cldImg={myImage}
      style={{ maxWidth: '100%' }}
      plugins={[lazyload(), responsive(), placeholder()]}
    />
  );
}
