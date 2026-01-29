import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';

import { featuredImagesQueryOptions } from '@/lib/featured-images.queries';

export const Route = createFileRoute('/_auth/featured-images/preview')({
  component: RouteComponent,
  loader({ context }) {
    context.queryClient.ensureQueryData(featuredImagesQueryOptions());
  },
});

function RouteComponent() {
  const { data: featuredImages } = useSuspenseQuery(
    featuredImagesQueryOptions()
  );

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % featuredImages.length
      );
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [featuredImages.length]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Images */}
      {featuredImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={image.url}
            alt={`Background ${index + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Centered Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="text-center text-white">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Welcome to Our World
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg sm:text-xl lg:text-2xl">
            Experience something extraordinary with our innovative solutions
            that transform the way you think about possibilities.
          </p>
        </div>
      </div>
    </div>
  );
}
