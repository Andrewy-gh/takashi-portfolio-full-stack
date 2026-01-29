import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Pencil } from 'lucide-react';
import type { GetCategoriesResponse } from '@/lib/categories.queries';

export function CategoriesGrid({
  categories,
}: {
  categories: GetCategoriesResponse;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {categories.map((category) => (
        <Card key={category.id} className="relative">
          <CardHeader>
            <CardTitle className="hover:text-blue-500">
              <Link
                to={`/categories/$categoryId`}
                params={{ categoryId: category.id }}
              >
                {category.name}
              </Link>{' '}
            </CardTitle>
            {category.sequence !== null && category.sequence !== undefined && (
              <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                {category.sequence}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="relative mb-4 h-64 w-full">
              <Link
                to={`/categories/$categoryId`}
                params={{ categoryId: category.id }}
              >
                {category.thumbnailUrl ? (
                  <div className="relative w-full h-full">
                    <img
                      src={category.thumbnailUrl}
                      alt={`${category.name} thumbnail`}
                      className="absolute inset-0 w-full h-full rounded-md object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-64 w-full items-center justify-center rounded-md bg-slate-600">
                    <p className="text-center font-body text-lg text-white">
                      No Thumbnail
                    </p>
                  </div>
                )}
              </Link>
            </div>
            <p>{category.totalImages ?? 0} Images</p>
          </CardContent>
          <CardFooter className="flex flex-wrap justify-between gap-4">
            <Button asChild variant="outline">
              <Link
                to={`/categories/$categoryId`}
                params={{ categoryId: category.id }}
                search={{ edit: true }}
              >
                <Pencil className="mr-2 h-4 w-4" /> View
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
