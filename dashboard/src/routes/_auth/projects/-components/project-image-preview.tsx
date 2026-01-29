import { ArrowLeft, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import Masonry from 'react-masonry-css';
import type { GetProjectResponse } from '@/lib/projects.queries';

export function ProjectImagePreview({
  project,
}: {
  project: GetProjectResponse;
}) {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex justify-between">
        <h1 className="mb-4 text-4xl font-bold">{project.name}</h1>
        <nav className="flex gap-4">
          <Button asChild>
            <Link to="." search={{ preview: false }}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Main
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="." search={{ order: true, preview: false }}>
              <ArrowUpDown className="mr-2 h-4 w-4" /> Order
            </Link>
          </Button>
        </nav>
      </div>
      <section>
        {project.images.length ? (
          <Masonry
            breakpointCols={{
              default: 2,
            }}
            className="ml-[-2rem] flex w-auto"
            columnClassName="pl-[2rem] bg-clip-border"
          >
            {project.images.map((image) => {
              return (
                <div key={image.id} className="mb-[2rem]">
                  <div className="group relative overflow-hidden rounded-lg">
                    <img
                      src={image.url}
                      alt={image.description ?? image.name ?? 'image'}
                    />
                  </div>
                </div>
              );
            })}
          </Masonry>
        ) : (
          <p>No images</p>
        )}
      </section>
    </div>
  );
}
