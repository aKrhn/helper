import { toast } from "@/components/hooks/use-toast";
import { useSavingIndicator } from "@/components/hooks/useSavingIndicator";
import { api } from "@/trpc/react";

interface InvalidateQuery {
  query: any;
  params: any;
}

interface UseSettingsMutationOptions<TData = any, TError = any, TVariables = any> {
  mutationFn: any;
  errorTitle: string;
  invalidateQueries?: InvalidateQuery[];
  successToast?: {
    title: string;
    description?: string;
  };
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: TError, variables: TVariables) => void;
  debounceMs?: number;
}

export function useSettingsMutation<TData = any, TError = any, TVariables = any>(
  options: UseSettingsMutationOptions<TData, TError, TVariables>,
) {
  const savingIndicator = useSavingIndicator();

  const mutation = options.mutationFn({
    onSuccess: (data: TData, variables: TVariables) => {
      // Handle query invalidations
      options.invalidateQueries?.forEach(({ query, params }) => {
        query.invalidate(params);
      });

      savingIndicator.setState("saved");

      // Show success toast if provided
      if (options.successToast) {
        toast({
          ...options.successToast,
        });
      }

      // Call custom onSuccess handler
      options.onSuccess?.(data, variables);
    },
    onError: (error: TError, variables: TVariables) => {
      savingIndicator.setState("error");

      toast({
        title: options.errorTitle,
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });

      // Call custom onError handler
      options.onError?.(error, variables);
    },
  });

  // Helper function to trigger save with saving state
  const save = (variables: TVariables) => {
    savingIndicator.setState("saving");
    mutation.mutate(variables);
  };

  return {
    ...mutation,
    save,
    savingIndicator,
  };
}
