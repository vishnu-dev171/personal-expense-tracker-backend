import { createClient } from "@supabase/supabase-js";
import AppError from "../utils/AppError.js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new AppError("Supabase environment variables are missing");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
