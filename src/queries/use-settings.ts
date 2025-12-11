import { useQuery, queryOptions } from "@tanstack/react-query";
import { getSettings } from "@/actions/settings/get-settings";

export const settingsQueryOptions = queryOptions({
  queryKey: ["settings"],
  queryFn: getSettings,
});

export const useSettings = () => {
  return useQuery(settingsQueryOptions);
};
