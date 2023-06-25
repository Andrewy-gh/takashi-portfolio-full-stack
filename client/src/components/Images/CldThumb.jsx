import {
  AdvancedImage,
  lazyload,
  responsive,
  placeholder,
} from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';
import { name } from '@cloudinary/url-gen/actions/namedTransformation';

export default function CldThumb({ cloudName, cloudinaryId }) {
  const cld = new Cloudinary({
    cloud: {
      cloudName: cloudName,
    },
  });

  const myImage = cld
    .image(cloudinaryId)
    .namedTransformation(name('media_lib_thumb'));

  return (
    <div>
      <img src={myImage.toURL()} />
    </div>
  );
}
