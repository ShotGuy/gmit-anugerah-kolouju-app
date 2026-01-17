import React from "react";

import ActionsButtonVertical from "./ActionsButtonVertical";

import { Button } from "@/components/ui/Button";

export default function ActionsButtonHorizontal({
  actions = [],
  item,
  className = "",
  size = "sm",
  spacing = "gap-2",
  maxVisible = 3,
}) {
  if (actions.length === 0) return null;

  const visibleActions = actions.slice(0, maxVisible);
  const hiddenActions = actions.slice(maxVisible);

  return (
    <div className={`flex items-center ${spacing} ${className}`}>
      {/* Visible Actions */}
      {visibleActions.map((action, index) => (
        <Button
          key={index}
          className={`
            flex items-center
            ${action.className || ""}
            ${
              action.variant === "destructive"
                ? "text-red-600 hover:bg-red-50"
                : ""
            }
            ${action.hideLabel ? "p-2" : ""}
          `}
          disabled={action.disabled}
          size={size}
          title={action.tooltip || action.label}
          variant={action.variant || "outline"}
          onClick={() => action.onClick(item)}
        >
          {action.icon && (
            <action.icon
              className={`h-4 w-4 ${!action.hideLabel ? "mr-1" : ""}`}
            />
          )}
          {!action.hideLabel && action.label}
        </Button>
      ))}

      {/* More Actions Dropdown for Hidden Actions */}
      {hiddenActions.length > 0 && (
        <ActionsButtonVertical
          actions={hiddenActions}
          item={item}
          size={size}
        />
      )}
    </div>
  );
}
