import {NextResponse} from "next/server";
import {handleUpload, HandleUploadBody} from "@vercel/blob/client";
import {MAX_FILE_SIZE} from "@/lib/constants";

export async function POST(request: Request): Promise<NextResponse> {
    try {
        // Check if token is set
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            console.error('ERROR: BLOB_READ_WRITE_TOKEN is not set in environment');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        console.log('Processing upload request...');
        const body = (await request.json()) as HandleUploadBody;
        console.log('Request body received');

        const jsonResponse = await handleUpload({
           token: process.env.BLOB_READ_WRITE_TOKEN,
            body,
            request,
            onBeforeGenerateToken: async () => {
                console.log('Generating token...');
                return {
                    allowedContentTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
                    addRandomSuffix: true,
                    maximumSizeInBytes: MAX_FILE_SIZE,
                }
        } ,
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                console.log('File uploaded to blob: ', blob.url)
            }
        });

        console.log('Upload successful');
        return NextResponse.json(jsonResponse)
    } catch (e) {
        const message = e instanceof Error ? e.message : "An unknown error occurred";
        console.error('Upload error:', message, e);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}