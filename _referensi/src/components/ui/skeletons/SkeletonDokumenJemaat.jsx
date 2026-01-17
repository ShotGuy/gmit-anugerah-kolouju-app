import { Card, CardContent } from "@/components/ui/Card";

export default function SkeletonDokumenJemaat() {
  return (
    <div className="animate-pulse px-4 sm:px-6 lg:px-8 max-w-full space-y-6">
      {/* Skeleton Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="h-6 w-6 bg-gray-300 dark:bg-gray-700 rounded-full" />
                <div className="ml-5 flex-1 space-y-2">
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3" />
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Skeleton Search */}
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full mt-8" />

      {/* Skeleton Table/List */}
      <div className="space-y-3 mt-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}
