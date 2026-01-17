const { Skeleton } = require("./Skeleton");

export const TableSkeleton = ({ columns = 5, rows = 5, hasActions }) => {
  // Convert columns to number if it's already a number, or get length if it's array
  const columnCount = typeof columns === "number" ? columns : columns.length;
  const rowCount = typeof rows === "number" ? rows : 5;

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            {[...Array(columnCount)].map((_, colIndex) => (
              <th key={colIndex} className="text-left p-4">
                <Skeleton className="h-4 w-24" />
              </th>
            ))}
            {hasActions && (
              <th className="text-left p-4">
                <Skeleton className="h-4 w-16" />
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {[...Array(rowCount)].map((_, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-gray-200 dark:border-gray-700"
            >
              {[...Array(columnCount)].map((_, colIndex) => (
                <td key={colIndex} className="p-4">
                  <Skeleton className="h-4 w-3/4" />
                </td>
              ))}
              {hasActions && (
                <td className="p-4">
                  <Skeleton className="h-8 w-20" />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
