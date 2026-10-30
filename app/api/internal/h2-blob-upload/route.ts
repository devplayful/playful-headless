import { createHash, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { head, put } from '@vercel/blob';
import {
  sliceH2BlobUploadJobs,
  totalH2BlobUploadJobs,
} from '@/lib/h2-blob-upload-queue';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const H2_SECRET_SHA256_HEX =
  '5171c7ccbb82730befe09c114965e39da9638e014f02b8249df464edc66f2dbe';
const EXPECTED_SECRET_HASH = Buffer.from(H2_SECRET_SHA256_HEX, 'hex');
const UA = 'PlayfulQA/1.0';

function unauthorized(): NextResponse {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

function verifyH2Secret(header: string | null): boolean {
  if (!header || typeof header !== 'string') return false;
  const digest = createHash('sha256').update(header, 'utf8').digest();
  if (digest.length !== EXPECTED_SECRET_HASH.length) return false;
  return timingSafeEqual(digest, EXPECTED_SECRET_HASH);
}

function parseBatchParams(url: URL): { offset: number; limit: number } {
  const offsetRaw = url.searchParams.get('offset');
  const limitRaw = url.searchParams.get('limit');
  const offset = offsetRaw == null || offsetRaw === '' ? 0 : Number.parseInt(offsetRaw, 10);
  const limit = limitRaw == null || limitRaw === '' ? 40 : Number.parseInt(limitRaw, 10);
  return {
    offset: Number.isFinite(offset) && offset >= 0 ? offset : 0,
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 200) : 40,
  };
}

export async function POST(request: NextRequest) {
  if (process.env.VERCEL_ENV !== 'preview') {
    return new NextResponse(null, { status: 404 });
  }

  if (!verifyH2Secret(request.headers.get('x-h2-secret'))) {
    return unauthorized();
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'no-token' }, { status: 500 });
  }

  const { offset, limit } = parseBatchParams(new URL(request.url));
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
      const existing = await head(job.blobKey, { token });
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
        token,
        addRandomSuffix: false,
      });
      uploaded += 1;
      urls.push(result.url);
    } catch {
      failed.push({ src: job.src, status: originStatus || 500 });
    }
  }

  return NextResponse.json({
    offset,
    limit,
    total,
    uploaded,
    skipped,
    failed,
    urls,
  });
}
