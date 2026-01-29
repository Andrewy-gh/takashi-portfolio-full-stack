import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';

import Masonry from 'react-masonry-css';

import { featuredImagesQueryOptions } from '@/lib/featured-images.queries';
import { ImageOptionsMenu } from '@/components/image-options-menu';

export const Route = createFileRoute('/_auth/featured-images/')({
  component: RouteComponent,
  loader({ context }) {
    context.queryClient.ensureQueryData(featuredImagesQueryOptions());
  },
});

function RouteComponent() {
  const { data: featuredImages } = useSuspenseQuery(
    featuredImagesQueryOptions()
  );
  return (
    <section className="container space-y-12 p-6">
      <h1 className="scroll-m-20 pb-2 text-3xl font-bold leading-relaxed first:mt-0">
        Featured Images
      </h1>
      <Masonry
        breakpointCols={{
          default: 4,
          1280: 4,
          1024: 3,
          768: 2,
          640: 1,
        }}
        className="ml-[-2rem] flex w-auto"
        columnClassName="pl-[2rem] bg-clip-border"
      >
        {featuredImages.map((image) => (
          <div key={image.id} className="mb-[2rem]">
            <div className="group relative overflow-hidden rounded-lg">
              <img
                src={image.thumbnailUrl}
                alt={image?.description ?? image?.name ?? 'Image'}
              />
              <ImageOptionsMenu
                image={{
                  id: image.id,
                  name: image.name,
                  url: image.url,
                  featuredImageId: image.featuredImageId,
                }}
              />
            </div>
          </div>
        ))}
      </Masonry>
    </section>
  );
}
