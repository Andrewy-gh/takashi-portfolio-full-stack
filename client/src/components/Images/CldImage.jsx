import {
  AdvancedImage,
  lazyload,
  responsive,
  placeholder,
} from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';

export default function CldImage({ cloudName, cloudinaryId }) {
  const cld = new Cloudinary({
    cloud: {
      cloudName: cloudName,
    },
  });
  const myImage = cld.image(cloudinaryId);

  return (
    <AdvancedImage
      cldImg={myImage}
      style={{ maxWidth: '100%' }}
      plugins={[lazyload(), responsive(), placeholder()]}
    />
  );
}
