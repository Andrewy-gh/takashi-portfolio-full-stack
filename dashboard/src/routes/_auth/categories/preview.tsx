import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';

import { ImageOff } from 'lucide-react';

import { categoriesPreviewQueryOptions } from '@/lib/categories.queries';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';

export const Route = createFileRoute('/_auth/categories/preview')({
  component: RouteComponent,
  loader({ context }) {
    context.queryClient.ensureQueryData(categoriesPreviewQueryOptions());
  },
});

function RouteComponent() {
  const { data: categories } = useSuspenseQuery(
    categoriesPreviewQueryOptions()
  );

  const { observeElements } = useIntersectionObserver();

  useEffect(() => {
    const faders = document.querySelectorAll('.fade-in');
    if (faders.length > 0) {
      observeElements(Array.from(faders));
    }
  }, [observeElements]);

  return (
    <section className="container space-y-12 p-6">
      {categories.map((category) => (
        <section
          key={category.id}
          className="opacity-0 transition-opacity duration-700 ease-in fade-in"
        >
          {/* Title */}
          <Link
            to="/categories/$categoryId"
            params={{ categoryId: category.id }}
          >
            <h2 className="scroll-m-20 pb-2 text-3xl font-bold leading-relaxed first:mt-0">
              {category.name}
            </h2>
          </Link>
          {category.projects.length > 0 ? (
            <>
              {/* Grid */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                {category.projects.map((project) => (
                  <Link
                    key={project.id}
                    to="/projects/$projectId"
                    params={{ projectId: project.id }}
                  >
                    {project.thumbnail ? (
                      <div className="group relative aspect-[3/4]">
                        {/* Thumbnail */}
                        <img
                          src={project.thumbnail?.url}
                          alt={project.name}
                          className="absolute inset-0 h-full w-full rounded-lg object-cover"
                        />
                        {/* Overlay */}
                        <div className="mouse">
                          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gray-800 bg-opacity-0 transition-opacity duration-300 group-hover:bg-opacity-70">
                            <p className="text-center font-header text-2xl text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                              {project.name}
                            </p>
                          </div>
                        </div>
                        {/* Caption for touch devices */}
                        <div className="touch mt-2">
                          <p className="font-body text-xl">{project.name}</p>
                        </div>
                      </div>
                    ) : (
                      // No thumbnail placeholder
                      <div className="flex aspect-[3/4] h-full w-full flex-col items-center justify-center rounded-lg bg-gray-200 text-gray-400">
                        <ImageOff className="mb-2 h-12 w-12" />
                        <p className="px-2 text-center text-sm">
                          {project.name}
                        </p>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-lg">No projects</p>
          )}
        </section>
      ))}
    </section>
  );
}
