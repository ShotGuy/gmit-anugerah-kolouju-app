import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadFile(file: File, bucket: string, folder: string = ""): Promise<string> {
    const fileName = `${folder}${Date.now()}_${file.name}`;

    // Use Service Role Key for server-side uploads to bypass RLS
    // Fallback to Anon key if Service Key is not set (but this might fail RLS)
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const adminSupabase = createClient(supabaseUrl, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    const { data, error } = await adminSupabase.storage.from(bucket).upload(fileName, file, {
        contentType: file.type,
        upsert: false
    });

    if (error) {
        console.error("Supabase Upload Error:", error);
        throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: publicUrlData } = adminSupabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrlData.publicUrl;
}

export async function deleteFile(fileUrl: string, bucket: string): Promise<void> {
    try {
        // Extract path from URL
        // URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[folder]/[filename]
        const urlParts = fileUrl.split(`${bucket}/`);
        if (urlParts.length < 2) return; // Invalid URL or not in this bucket

        const filePath = urlParts[1]; // [folder]/[filename]

        // Use Service Role Key for deletion
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const adminSupabase = createClient(supabaseUrl, serviceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        const { error } = await adminSupabase.storage.from(bucket).remove([filePath]);

        if (error) {
            console.error("Supabase Delete Error:", error);
            // We don't throw here to avoid blocking the main record deletion if file delete fails
            // But usually we should warn.
        }
    } catch (err) {
        console.error("Error parsing file URL for deletion:", err);
    }
}
