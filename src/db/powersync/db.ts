import { PowerSyncDatabase } from "@powersync/web";
import { SupabaseConnector } from "./Connector";
import { AppSchema } from "./schema";

export const connector = new SupabaseConnector();

export const db = new PowerSyncDatabase({
  // The schema you defined in the previous step
  schema: AppSchema,
  database: {
    // Filename for the SQLite database — it's important to only instantiate one instance per file.
    dbFilename: "powersync.db",
    // Optional. Directory where the database file is located.'
    // dbLocation: 'path/to/directory'
  },
});

// Verbinde PowerSync mit Supabase
db.connect(connector);
