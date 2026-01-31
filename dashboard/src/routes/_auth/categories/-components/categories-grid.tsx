import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ImageOff, Pencil } from 'lucide-react';
import type { GetCategoriesResponse } from '@/lib/categories.queries';

const formatSortMode = (value?: string | null) => {
  if (!value) return 'Custom order';
  switch (value) {
    case 'custom':
      return 'Custom order';
    case 'created_at':
    case 'created_at_desc':
      return 'Newest first';
    case 'created_at_asc':
      return 'Oldest first';
    case 'title':
    case 'title_asc':
      return 'Title A-Z';
    case 'title_desc':
      return 'Title Z-A';
    default:
      return value.replaceAll('_', ' ');
  }
};

export function CategoriesGrid({
  categories,
}: {
  categories: GetCategoriesResponse;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {categories.map((category) => (
        <Card key={category.id} className="group overflow-hidden">
          <Link
            to={`/categories/$categoryId`}
            params={{ categoryId: category.id }}
            className="block"
          >
            <div className="relative h-56 w-full bg-muted/30">
              {category.thumbnailUrl ? (
                <>
                  <img
                    src={category.thumbnailUrl}
                    alt={`${category.name} thumbnail`}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0" />
                </>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <ImageOff className="h-6 w-6" />
                  <span className="text-sm">No thumbnail</span>
                </div>
              )}
              <div className="absolute left-4 top-4 flex items-center gap-2">
                <Badge variant="secondary">{formatSortMode(category.sortMode)}</Badge>
                <Badge variant="outline">
                  {category.totalImages ?? 0} images
                </Badge>
              </div>
              {category.sequence !== null && category.sequence !== undefined && (
                <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow">
                  {category.sequence}
                </div>
              )}
            </div>
          </Link>
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl">
              <Link
                to={`/categories/$categoryId`}
                params={{ categoryId: category.id }}
                className="inline-flex items-center gap-2 transition-colors group-hover:text-primary"
              >
                {category.name}
                <ArrowUpRight className="h-4 w-4 opacity-60" />
              </Link>
            </CardTitle>
            {category.description ? (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {category.description}
              </p>
            ) : null}
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">
              Home & sidebar order controlled by sequence.
            </p>
          </CardContent>
          <CardFooter className="flex flex-wrap justify-between gap-3">
            <Button asChild variant="outline" size="sm">
              <Link
                to={`/categories/$categoryId`}
                params={{ categoryId: category.id }}
                search={{ edit: true }}
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link
                to={`/categories/$categoryId`}
                params={{ categoryId: category.id }}
              >
                View details
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
