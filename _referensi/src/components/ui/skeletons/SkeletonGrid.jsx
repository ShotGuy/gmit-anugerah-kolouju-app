import { Card, CardContent } from "../Card";

import { Skeleton } from "./Skeleton";

export const GridSkeleton = ({ cards = 6, columns = 4 }) => {
  // Convert to numbers if needed
  const cardCount = typeof cards === 'number' ? cards : 6;
  const columnCount = typeof columns === 'number' ? columns : (columns?.length || 4);
  const displayColumns = Math.min(columnCount, 4); // Max 4 columns to display

  return (
    <>
      {[...Array(cardCount)].map((_, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            {[...Array(displayColumns)].map((_, colIndex) => (
              <div key={colIndex} className="mb-3">
                <Skeleton className="h-3 w-1/3 mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
            <div className="mt-4">
              <Skeleton className="h-8 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
};
