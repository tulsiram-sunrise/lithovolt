import React from 'react';

/**
 * Component to display when user lacks access to view entities
 */
export const EntityAccessDeniedMessage = ({ 
  resource = 'items',
  action = 'view',
  onCancel = null 
}) => {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
      <div className="flex items-center justify-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
          <svg
            className="h-5 w-5 text-amber-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4v2m0 4v2M7.08 6.47a9 9 0 114.745 15.785"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-medium text-amber-800">
            Access Restricted
          </h3>
          <p className="text-xs text-amber-700 mt-1">
            You don't have permission to {action} {resource}. 
            Contact your administrator if you believe this is an error.
          </p>
        </div>
      </div>
      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-3 inline-flex items-center gap-2 rounded-md bg-amber-100 px-3 py-2 text-xs font-medium text-amber-800 hover:bg-amber-200 transition-colors"
        >
          ← Go Back
        </button>
      )}
    </div>
  );
};

/**
 * Component to display when results are empty (could be due to permissions or no data)
 */
export const EmptyStateWithAccessHint = ({ 
  resource = 'items',
  couldBePermission = true,
  onRetry = null 
}) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
      <svg
        className="h-12 w-12 mx-auto text-gray-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
      <h3 className="text-base font-medium text-gray-900 mb-2">
        No {resource} found
      </h3>
      <p className="text-sm text-gray-600 max-w-sm mx-auto">
        {couldBePermission ? (
          <>
            No {resource} to display. This could mean there's no data available, or you may not have permission to view {resource}.
          </>
        ) : (
          <>
            No {resource} to display.
          </>
        )}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          ↻ Retry
        </button>
      )}
    </div>
  );
};

export default EntityAccessDeniedMessage;
