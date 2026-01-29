import { Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Pencil, Trash2 } from 'lucide-react';

import type { Projects, ProjectsByCategoryId } from '@/lib/projects.queries';

export function ProjectGrid({
  projects,
}: {
  projects: Projects | ProjectsByCategoryId;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader>
            <CardTitle>
              <Link
                to={`/projects/$projectId`}
                params={{ projectId: project.id }}
                className="hover:text-blue-500"
              >
                {project.name}
              </Link>
            </CardTitle>
            <CardDescription>
              {project.categoryId ? (
                <Link
                  to={`/categories/$categoryId`}
                  params={{ categoryId: project.categoryId }}
                  className="hover:text-blue-500"
                >
                  {project.categoryName}
                </Link>
              ) : (
                'No category'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4 h-64 w-full">
              <Link
                to={`/projects/$projectId`}
                params={{ projectId: project.id }}
              >
                {project.thumbnailUrl ? (
                  <img
                    src={project.thumbnailUrl}
                    alt={`${project.name} thumbnail`}
                    className="absolute inset-0 w-full h-full rounded-md object-cover object-top"
                  />
                ) : (
                  <div className="flex h-64 w-full items-center justify-center rounded-md bg-slate-600">
                    <p className="text-center font-body text-lg text-white">
                      No Thumbnail
                    </p>
                  </div>
                )}
              </Link>
            </div>
            <p>{project.totalImages ?? 0} Images</p>
          </CardContent>
          <CardFooter className="flex flex-wrap justify-between gap-4">
            <Button asChild variant="outline">
              <Link
                to="/projects/$projectId"
                params={{ projectId: project.id }}
                search={{ edit: true }}
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Link
                to="/projects/$projectId"
                params={{ projectId: project.id }}
                search={{ delete: true }}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
