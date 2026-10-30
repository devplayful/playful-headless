import { NextRequest, NextResponse } from 'next/server';
import { head, put } from '@vercel/blob';
import {
  H2_BATCH_SIZE,
  verifyH2BatchToken,
} from '@/lib/h2-blob-upload-auth';
import {
  sliceH2BlobUploadJobs,
  totalH2BlobUploadJobs,
} from '@/lib/h2-blob-upload-queue';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const UA = 'PlayfulQA/1.0';

function notFound(): NextResponse {
  return new NextResponse(null, { status: 404 });
}

export async function GET(request: NextRequest) {
  if (process.env.VERCEL_ENV !== 'preview') {
    return notFound();
  }

  const url = new URL(request.url);
  const bRaw = url.searchParams.get('b');
  const t = url.searchParams.get('t');
  if (bRaw === null || t === null) {
    return notFound();
  }
  const b = Number.parseInt(bRaw, 10);
  if (!Number.isFinite(b) || !verifyH2BatchToken(b, t)) {
    return notFound();
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    return NextResponse.json({ error: 'no-token' }, { status: 500 });
  }

  const offset = b * H2_BATCH_SIZE;
  const limit = H2_BATCH_SIZE;
  const total = totalH2BlobUploadJobs();
  const jobs = sliceH2BlobUploadJobs(offset, limit);

  let uploaded = 0;
  let skipped = 0;
  const failed: { src: string; status: number }[] = [];
  const urls: string[] = [];

  for (const job of jobs) {
    if (job.inventoryStatus === 404) {
      failed.push({ src: job.src, status: 404 });
      continue;
    }

    try {
      const existing = await head(job.blobKey, { token: blobToken });
      if (existing?.url) {
        skipped += 1;
        urls.push(existing.url);
        continue;
      }
    } catch {
      /* no existe aún en Blob */
    }

    let originStatus = 0;
    try {
      const origin = await fetch(job.src, {
        method: 'GET',
        headers: { 'User-Agent': UA },
      });
      originStatus = origin.status;
      if (!origin.ok) {
        failed.push({ src: job.src, status: originStatus || 502 });
        continue;
      }
      const body = Buffer.from(await origin.arrayBuffer());
      const result = await put(job.blobKey, body, {
        access: 'public',
        token: blobToken,
        addRandomSuffix: false,
      });
      uploaded += 1;
      urls.push(result.url);
    } catch {
      failed.push({ src: job.src, status: originStatus || 500 });
    }
  }

  return NextResponse.json({
    b,
    offset,
    limit,
    total,
    uploaded,
    skipped,
    failed,
    urls,
  });
}
