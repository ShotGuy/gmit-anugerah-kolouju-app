"use client";
import React from "react";

import { Button } from "@/components/ui/Button";

export default function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
  stats,
  className = "",
}) {
  return (
    <div
      className={`bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Breadcrumb */}
        {breadcrumb && (
          <nav aria-label="Breadcrumb" className="flex mb-4">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              {breadcrumb.map((item, index) => (
                <li key={index} className="inline-flex items-center">
                  {index > 0 && (
                    <svg
                      className="w-6 h-6 text-gray-400 dark:text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        clipRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        fillRule="evenodd"
                      />
                    </svg>
                  )}
                  {item.href ? (
                    <a
                      className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 md:ml-2 transition-colors"
                      href={item.href}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ml-2">
                      {item.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Header Content */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:text-3xl break-words">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 break-words">
                {description}
              </p>
            )}
          </div>

          {/* Actions */}
          {actions && (
            <div className="mt-4 flex space-x-3 lg:mt-0 lg:ml-4">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  className={action.className}
                  size={action.size || "default"}
                  variant={action.variant || "default"}
                  onClick={action.onClick}
                >
                  {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        {stats && (
          <div className="mt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
                >
                  <div className="flex items-center">
                    {stat.icon && (
                      <div
                        className={`flex-shrink-0 p-2 rounded-lg ${
                          stat.iconBg || "bg-blue-100"
                        }`}
                      >
                        <stat.icon
                          className={`w-5 h-5 ${
                            stat.iconColor || "text-blue-600"
                          }`}
                        />
                      </div>
                    )}
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {stat.label}
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {stat.value}
                      </p>
                      {stat.change && (
                        <p
                          className={`text-sm ${
                            stat.changeType === "positive"
                              ? "text-green-600"
                              : stat.changeType === "negative"
                                ? "text-red-600"
                                : "text-gray-500"
                          }`}
                        >
                          {stat.change}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
