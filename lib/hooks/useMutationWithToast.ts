import { toast } from "@/components/hooks/use-toast";

interface InvalidateQuery {
  query: any;
  params: any;
}

interface UseMutationWithToastOptions<TData = any, TError = any, TVariables = any> {
  mutationFn: any;
  onSuccess?: {
    message?: string;
    action?: (data: TData, variables: TVariables) => void;
    invalidateQueries?: InvalidateQuery[];
  };
  onError?: {
    fallbackMessage?: string;
    action?: (error: TError, variables: TVariables) => void;
  };
}

export function useMutationWithToast<TData = any, TError = any, TVariables = any>(
  options: UseMutationWithToastOptions<TData, TError, TVariables>,
) {
  return options.mutationFn({
    onSuccess: (data: TData, variables: TVariables) => {
      // Handle query invalidations
      options.onSuccess?.invalidateQueries?.forEach(({ query, params }) => {
        query.invalidate(params);
      });

      // Show success message if provided
      if (options.onSuccess?.message) {
        toast({
          title: "Success",
          description: options.onSuccess.message,
        });
      }

      // Call custom success action
      options.onSuccess?.action?.(data, variables);
    },
    onError: (error: TError, variables: TVariables) => {
      // Show error toast
      const errorMessage =
        error instanceof Error ? error.message : options.onError?.fallbackMessage || "An error occurred";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      // Call custom error action
      options.onError?.action?.(error, variables);
    },
  });
}
