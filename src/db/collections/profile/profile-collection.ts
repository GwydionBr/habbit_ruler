import { db } from "@/db/powersync/db";
import { AppSchema } from "@/db/powersync/schema";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
import { createCollection, useLiveQuery } from "@tanstack/react-db";
import {
  profileSchema,
  profileDeserializationSchema,
} from "@/db/collections/profile/profile-schema";
import { useMemo } from "react";
import { useRouteContext } from "@tanstack/react-router";

// Collection basierend auf der PowerSync-Tabelle 'profiles'
export const profileCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.profiles,
    schema: profileSchema,
    deserializationSchema: profileDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(error);
    },
  })
);

// Returns the profile of the current user
export const useProfile = () => {
  const { user } = useRouteContext({ from: "__root__" });
  const currentUserId = user?.id;

  const { data: profiles } = useLiveQuery((q) =>
    q.from({ profiles: profileCollection })
  );

  return useMemo(
    () => ({
      data: profiles?.find((profile) => profile.id === currentUserId) ?? null,
    }),
    [profiles, currentUserId]
  );
};

// Returns profiles of all other users (excluding the current user)
export const useOtherProfiles = () => {
  const { user } = useRouteContext({ from: "__root__" });
  const currentUserId = user?.id;

  const { data: profiles } = useLiveQuery((q) =>
    q.from({ profiles: profileCollection })
  );

  return useMemo(
    () => ({
      data: profiles?.filter((profile) => profile.id !== currentUserId) ?? [],
    }),
    [profiles, currentUserId]
  );
};
