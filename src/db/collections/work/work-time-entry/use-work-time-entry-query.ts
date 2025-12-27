import { useLiveQuery } from "@tanstack/react-db";
import { workTimeEntriesCollection } from "./work-time-entry-collection";

export const useWorkTimeEntries = () =>
  useLiveQuery((q) => q.from({ workTimeEntries: workTimeEntriesCollection }));
