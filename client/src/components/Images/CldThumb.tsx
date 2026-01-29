import { useMemo } from 'react';
import { Cloudinary } from '@cloudinary/url-gen';
import { name } from '@cloudinary/url-gen/actions/namedTransformation';

type CldThumbProps = {
  cloudName: string;
  cloudinaryId: string;
};

export default function CldThumb({ cloudName, cloudinaryId }: CldThumbProps) {
  const cld = useMemo(() => {
    return new Cloudinary({
      cloud: {
        cloudName: cloudName,
      },
    });
  }, [cloudName]);

  const myImage = useMemo(() => {
    return cld.image(cloudinaryId).namedTransformation(name('media_lib_thumb'));
  }, [cld, cloudinaryId]);

  return (
    <div>
      <img src={myImage.toURL()} alt="" />
    </div>
  );
}
