import {NextResponse} from "next/server";
import {handleUpload, HandleUploadBody} from "@vercel/blob/client";
import {auth} from "@clerk/nextjs/server";
import {MAX_FILE_SIZE} from "@/lib/constants";

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const body = (await request.json()) as HandleUploadBody;
        const { userId } = await auth();
          if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
       }

        console.log('[Upload API] Request received');

        const jsonResponse = await handleUpload({
            token: process.env.BLOB_READ_WRITE_TOKEN,
            body,
            request,
            onBeforeGenerateToken: async () => {
                console.log('[Upload API] Generating authentication token');
                return {
                    allowedContentTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
                    addRandomSuffix: true,
                    maximumSizeInBytes: MAX_FILE_SIZE,
                    tokenPayload: JSON.stringify({ userId })
                }
            }
        });

        console.log('[Upload API] Upload completed successfully');
        return NextResponse.json(jsonResponse)
    } catch (e) {
      const message = e instanceof Error ? e.message : "An unknown error occurred";
      console.error('[Upload API] Error details:', message);
        
        // Don't return 401 automatically - only if auth actually failed
        const status = 500;
        return NextResponse.json({ error: "Upload failed" }, { status });
    }
}