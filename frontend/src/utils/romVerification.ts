/**
 * ROM Verification Utilities
 * Validates downloaded ROMs against MD5 checksums
 */

/**
 * Calculate MD5 hash of a file/blob using Web Crypto API
 */
export async function calculateMD5(blob: Blob): Promise<string> {
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('MD5', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    // MD5 not available in crypto.subtle, fallback to SparkMD5
    return calculateMD5Fallback(blob);
  }
}

/**
 * Fallback MD5 calculation using chunk-based processing
 * More reliable across browsers
 */
async function calculateMD5Fallback(blob: Blob): Promise<string> {
  // Import SparkMD5 dynamically if needed
  const SparkMD5 = await import('spark-md5');

  const chunkSize = 2097152; // 2MB chunks
  const chunks = Math.ceil(blob.size / chunkSize);
  const spark = new SparkMD5.ArrayBuffer();

  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, blob.size);
    const chunk = blob.slice(start, end);
    const arrayBuffer = await chunk.arrayBuffer();
    spark.append(arrayBuffer);
  }

  return spark.end();
}

/**
 * Verify ROM integrity against expected MD5
 */
export async function verifyROM(
  blob: Blob,
  expectedMD5: string,
  onProgress?: (progress: number) => void
): Promise<{ valid: boolean; calculatedMD5: string }> {
  if (onProgress) onProgress(0);

  const calculatedMD5 = await calculateMD5(blob);

  if (onProgress) onProgress(100);

  const valid = calculatedMD5.toLowerCase() === expectedMD5.toLowerCase();

  return {
    valid,
    calculatedMD5,
  };
}

/**
 * Download and verify ROM with automatic retry on hash mismatch
 */
export async function downloadAndVerifyROM(
  url: string,
  expectedMD5: string,
  maxRetries: number = 3,
  onProgress?: (stage: string, progress: number) => void
): Promise<Blob> {
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      // Download ROM
      if (onProgress) onProgress('downloading', 0);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const totalSize = parseInt(response.headers.get('content-length') || '0', 10);
      const reader = response.body?.getReader();

      if (!reader) {
        throw new Error('Response body is null');
      }

      const chunks: Uint8Array[] = [];
      let receivedSize = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedSize += value.length;

        if (onProgress && totalSize > 0) {
          onProgress('downloading', Math.round((receivedSize / totalSize) * 100));
        }
      }

      const blob = new Blob(chunks as BlobPart[]);

      // Verify hash
      if (onProgress) onProgress('verifying', 0);

      const verification = await verifyROM(blob, expectedMD5, (progress) => {
        if (onProgress) onProgress('verifying', progress);
      });

      if (!verification.valid) {
        throw new Error(
          `ROM verification failed: expected ${expectedMD5}, got ${verification.calculatedMD5}`
        );
      }

      if (onProgress) onProgress('complete', 100);
      return blob;
    } catch (error) {
      retryCount++;

      if (retryCount > maxRetries) {
        throw error;
      }

      // Exponential backoff
      const delay = Math.pow(2, retryCount) * 1000;
      if (onProgress) {
        onProgress('retry', retryCount);
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Failed to download and verify ROM after maximum retries');
}
