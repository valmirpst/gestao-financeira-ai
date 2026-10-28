const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export const supabaseConfig = {
  url: supabaseUrl,
  publishableKey: supabasePublishableKey,
};

export const configErrors = [
  ...(!isHttpUrl(supabaseUrl) ? ["VITE_SUPABASE_URL"] : []),
  ...(!supabasePublishableKey ||
  supabasePublishableKey === "your_supabase_publishable_key"
    ? ["VITE_SUPABASE_PUBLISHABLE_KEY"]
    : []),
];
