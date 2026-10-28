import type { Database } from "@/types/database.types";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "./config";

export const supabase = createClient(supabaseConfig.url, supabaseConfig.publishableKey);

export type { Database };
