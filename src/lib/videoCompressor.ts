/**
 * Client-side video compression utility using FFmpeg.wasm
 * 
 * - Accepts input videos up to 300MB
 * - Automatically compresses large videos (>45MB) to target <50MB (ideally 40–45MB)
 * - The 50MB limit applies only to the final compressed file uploaded to Supabase Storage
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { formatFileSize, isVideoFile } from './imageOptimizer';

export const MAX_INPUT_VIDEO_SIZE_BYTES = 300 * 1024 * 1024; // 300 MB
export const MAX_SUPABASE_STORAGE_BYTES = 50 * 1024 * 1024; // 50 MB hard limit on bucket
export const TARGET_COMPRESSED_BYTES = 42 * 1024 * 1024;    // 42 MB (ideal 40–45MB range)
export const AUTO_COMPRESS_THRESHOLD_BYTES = 45 * 1024 * 1024; // 45 MB threshold

export interface VideoCompressOptions {
  targetSizeBytes?: number;
  maxUploadSizeBytes?: number;
  onProgress?: (progressPercent: number, statusText: string) => void;
}

let ffmpegInstance: FFmpeg | null = null;
let ffmpegLoadingPromise: Promise<FFmpeg> | null = null;

export const FFMPEG_LOAD_TIMEOUT_MS = 30000; // 30 seconds max timeout

/**
 * Retrieve video duration in seconds via HTML5 Video element metadata
 */
export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      return resolve(0);
    }
    const video = document.createElement('video');
    video.preload = 'metadata';
    const objectUrl = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(video.duration || 0);
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(0);
    };

    video.src = objectUrl;
  });
}

interface CoreCandidate {
  name: string;
  getUrls: () => Promise<{ coreURL: string; wasmURL: string }>;
}

function getCandidateStrategies(): CoreCandidate[] {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return [
    // 1. Local direct URLs (same-origin ESM, fastest, lowest memory overhead)
    {
      name: 'Aset Lokal Langsung (/ffmpeg/)',
      getUrls: async () => ({
        coreURL: `${origin}/ffmpeg/ffmpeg-core.js`,
        wasmURL: `${origin}/ffmpeg/ffmpeg-core.wasm`,
      }),
    },
    // 2. Local Blob URLs (protects against CSP or sandbox restrictions)
    {
      name: 'Aset Lokal Blob URL (/ffmpeg/)',
      getUrls: async () => ({
        coreURL: await toBlobURL('/ffmpeg/ffmpeg-core.js', 'text/javascript'),
        wasmURL: await toBlobURL('/ffmpeg/ffmpeg-core.wasm', 'application/wasm'),
      }),
    },
    // 3. CDN unpkg (ESM core v0.12.10)
    {
      name: 'CDN unpkg (ESM)',
      getUrls: async () => {
        const cdn = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm';
        return {
          coreURL: await toBlobURL(`${cdn}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${cdn}/ffmpeg-core.wasm`, 'application/wasm'),
        };
      },
    },
    // 4. CDN jsDelivr (ESM core v0.12.10)
    {
      name: 'CDN jsDelivr (ESM)',
      getUrls: async () => {
        const cdn = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm';
        return {
          coreURL: await toBlobURL(`${cdn}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${cdn}/ffmpeg-core.wasm`, 'application/wasm'),
        };
      },
    },
  ];
}

async function loadCandidateWithTimeout(
  candidate: CoreCandidate,
  timeoutMs: number,
  onStatus?: (status: string) => void
): Promise<FFmpeg> {
  console.info(`[FFmpeg] Menginisialisasi modul melalui: ${candidate.name}...`);
  onStatus?.(`Memuat WebAssembly video engine (${candidate.name})...`);

  // 1. Prepare asset URLs
  const { coreURL, wasmURL } = await candidate.getUrls();

  console.info(`[FFmpeg] coreURL disiapkan: ${coreURL.slice(0, 100)}...`);
  console.info(`[FFmpeg] wasmURL disiapkan: ${wasmURL.slice(0, 100)}...`);

  const ffmpeg = new FFmpeg();

  ffmpeg.on('log', ({ message }) => {
    if (
      message.includes('frame=') ||
      message.includes('fps=') ||
      message.includes('bitrate=') ||
      message.includes('size=')
    ) {
      console.debug('[FFmpeg]', message);
    }
  });

  let timer: any = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Timeout (${Math.round(timeoutMs / 1000)} detik) saat memuat ${candidate.name}`));
    }, timeoutMs);
  });

  try {
    // 2. Load FFmpeg without overriding classWorkerURL.
    // Vite bundles the worker correctly; passing custom classWorkerURL breaks relative module imports.
    await Promise.race([
      ffmpeg.load({
        coreURL,
        wasmURL,
      }),
      timeoutPromise,
    ]);

    if (!ffmpeg.loaded) {
      throw new Error(`FFmpeg instance tidak dalam status loaded setelah proses load.`);
    }

    console.info(`[FFmpeg] Berhasil memuat WebAssembly video engine melalui: ${candidate.name}!`);
    return ffmpeg;
  } catch (err: any) {
    try {
      ffmpeg.terminate();
    } catch {}
    throw err;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Singleton loader for FFmpeg.wasm instance
 * - Tries local ESM static assets first, then falls back to public CDNs
 * - Protected with a 30-second hard timeout
 * - Logs clear success and error diagnostics
 * - Never hangs forever
 */
export async function getFFmpeg(
  onStatus?: (status: string) => void
): Promise<FFmpeg> {
  if (ffmpegInstance && ffmpegInstance.loaded) {
    return ffmpegInstance;
  }

  if (ffmpegLoadingPromise) {
    return ffmpegLoadingPromise;
  }

  ffmpegLoadingPromise = (async () => {
    const startTime = Date.now();
    console.info(`[FFmpeg] Memulai inisialisasi WebAssembly video engine (batas waktu ${FFMPEG_LOAD_TIMEOUT_MS / 1000} detik)...`);
    onStatus?.('Menyiapkan modul WebAssembly kompresor video...');

    const candidates = getCandidateStrategies();
    let lastError: any = null;

    for (const candidate of candidates) {
      const elapsed = Date.now() - startTime;
      const remainingTime = FFMPEG_LOAD_TIMEOUT_MS - elapsed;

      if (remainingTime <= 2000) {
        console.error('[FFmpeg] Batas waktu 30 detik hampir habis, menghentikan percobaan loader.');
        break;
      }

      // Per-candidate timeout: up to 12s or remaining time
      const candidateTimeout = Math.min(12000, remainingTime);

      try {
        const ffmpeg = await loadCandidateWithTimeout(candidate, candidateTimeout, onStatus);
        ffmpegInstance = ffmpeg;
        onStatus?.('WebAssembly video engine siap digunakan.');
        return ffmpeg;
      } catch (err: any) {
        lastError = err;
        console.warn(`[FFmpeg] Percobaan (${candidate.name}) gagal: ${err?.message || err}. Mencoba sumber alternatif...`);
      }
    }

    const totalElapsed = Date.now() - startTime;
    const errorMsg = `Gagal menginisialisasi WebAssembly video engine setelah ${Math.round(totalElapsed / 1000)} detik: ${lastError?.message || 'Batas waktu 30 detik terlampaui'}. Pastikan browser Anda mendukung WebAssembly dan periksa koneksi internet.`;
    console.error('[FFmpeg]', errorMsg);
    throw new Error(errorMsg);
  })();

  try {
    return await ffmpegLoadingPromise;
  } catch (err) {
    ffmpegInstance = null;
    throw err;
  } finally {
    ffmpegLoadingPromise = null;
  }
}

/**
 * Compresses an input video file using FFmpeg.wasm:
 * - Accepts input video up to 300MB
 * - Automatically computes bitrate targeting <50MB (ideal 40–45MB)
 * - Returns compressed File in MP4 (H.264 / AAC)
 * - Throws only if final compressed file exceeds 50MB or input >300MB
 */
export async function compressVideoFile(
  file: File,
  options: VideoCompressOptions = {}
): Promise<File> {
  if (!isVideoFile(file)) {
    return file;
  }

  // 1. Validate original input size against 300MB ceiling
  if (file.size > MAX_INPUT_VIDEO_SIZE_BYTES) {
    throw new Error(
      `Ukuran video input (${formatFileSize(file.size)}) melebihi batas maksimal 300MB. Silakan pilih video hingga 300MB.`
    );
  }

  const {
    targetSizeBytes = TARGET_COMPRESSED_BYTES, // ~42MB (in 40-45MB ideal range)
    maxUploadSizeBytes = MAX_SUPABASE_STORAGE_BYTES, // 50MB hard limit
    onProgress,
  } = options;

  // 2. If the original video is already <= 45MB, it safely satisfies the <50MB Supabase requirement
  if (file.size <= AUTO_COMPRESS_THRESHOLD_BYTES) {
    onProgress?.(100, `Video sudah berukuran optimal (${formatFileSize(file.size)} < 50MB), siap diunggah.`);
    return file;
  }

  onProgress?.(
    5,
    `Ukuran video asli: ${formatFileSize(file.size)}. Memulai kompresi otomatis ke target 40–45MB (<50MB)...`
  );

  const duration = await getVideoDuration(file);
  console.info(`[FFmpeg] Mempersiapkan kompresi: ${file.name} (${formatFileSize(file.size)}, durasi: ${Math.round(duration)}s)`);
  const ffmpeg = await getFFmpeg((msg) => onProgress?.(10, msg));

  const inputExt = (file.name.split('.').pop() || 'mp4').toLowerCase();
  const inputFileName = `input_${Date.now()}.${inputExt}`;
  const outputFileName = `compressed_${Date.now()}.mp4`;

  try {
    onProgress?.(15, `Membaca berkas video (${formatFileSize(file.size)})...`);
    const fileData = await fetchFile(file);
    await ffmpeg.writeFile(inputFileName, fileData);

    // Calculate target bitrate based on duration or ratio
    // Target size in bits: 42MB * 1024 * 1024 * 8 = ~352,321,536 bits
    const audioBitrateKbps = 96;
    let targetVideoBitrateKbps = 2400; // default safe fallback

    if (duration && duration > 0) {
      const totalTargetBits = targetSizeBytes * 8;
      const totalBitrateKbps = Math.floor(totalTargetBits / duration / 1000);
      targetVideoBitrateKbps = Math.max(350, totalBitrateKbps - audioBitrateKbps);
      // Cap at 6000kbps to ensure it never blooms over 45MB
      targetVideoBitrateKbps = Math.min(targetVideoBitrateKbps, 6000);
    } else {
      // Estimate based on input file size to target ~40MB
      const ratio = Math.min(0.8, targetSizeBytes / file.size);
      targetVideoBitrateKbps = Math.max(400, Math.floor(4000 * ratio));
    }

    onProgress?.(
      20,
      `Mengompresi video dengan FFmpeg (target ~40–45MB, bitrate ${targetVideoBitrateKbps} kbps)...`
    );

    // Set up progress listener
    const progressHandler = ({ progress }: { progress: number }) => {
      const pct = Math.min(95, Math.max(20, Math.round(20 + progress * 75)));
      onProgress?.(
        pct,
        `Mengompresi video: ${pct}% (Ukuran awal: ${formatFileSize(file.size)} → Target <50MB)...`
      );
    };

    ffmpeg.on('progress', progressHandler);

    // Run FFmpeg compression:
    // - Scale max width to 1280 (720p) with proportional height ensuring even dimensions
    // - Preset 'veryfast' for fast client-side encoding
    // - Two-pass buffer management for strict size control
    // - YUV420p for universal browser & mobile player compatibility
    const ffmpegArgs = [
      '-i',
      inputFileName,
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-b:v',
      `${targetVideoBitrateKbps}k`,
      '-maxrate',
      `${Math.round(targetVideoBitrateKbps * 1.25)}k`,
      '-bufsize',
      `${Math.round(targetVideoBitrateKbps * 2)}k`,
      '-vf',
      "scale='trunc(min(1280,iw)/2)*2':-2",
      '-pix_fmt',
      'yuv420p',
      '-c:a',
      'aac',
      '-b:a',
      `${audioBitrateKbps}k`,
      '-movflags',
      '+faststart',
      outputFileName,
    ];

    const exitCode = await ffmpeg.exec(ffmpegArgs);
    ffmpeg.off('progress', progressHandler);

    if (exitCode !== 0) {
      throw new Error(`FFmpeg exec failed with code ${exitCode}`);
    }

    onProgress?.(96, 'Menyelesaikan berkas video terkompresi...');
    const outputData = await ffmpeg.readFile(outputFileName);

    let outputBytes: Uint8Array;
    if (outputData instanceof Uint8Array) {
      outputBytes = outputData;
    } else if (typeof outputData === 'string') {
      outputBytes = new TextEncoder().encode(outputData);
    } else {
      outputBytes = new Uint8Array(outputData as any);
    }

    const compressedBlob = new Blob([outputBytes.buffer as ArrayBuffer], { type: 'video/mp4' });
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    let finalFile = new File([compressedBlob], `${baseName}-compressed.mp4`, {
      type: 'video/mp4',
      lastModified: Date.now(),
    });

    // 3. If output slightly overshoots the 50MB Supabase hard limit (e.g. 51MB),
    // run a fast secondary pass with reduced resolution (960x540) to guarantee <50MB
    if (finalFile.size >= maxUploadSizeBytes) {
      onProgress?.(
        80,
        `Menyesuaikan kembali ukuran (${formatFileSize(finalFile.size)}) agar strictly < 50MB...`
      );

      const pass2Output = `compressed_pass2_${Date.now()}.mp4`;
      const pass2Bitrate = Math.max(300, Math.floor(targetVideoBitrateKbps * 0.7));

      await ffmpeg.exec([
        '-i',
        outputFileName,
        '-c:v',
        'libx264',
        '-preset',
        'ultrafast',
        '-b:v',
        `${pass2Bitrate}k`,
        '-vf',
        "scale='trunc(min(960,iw)/2)*2':-2",
        '-c:a',
        'copy',
        pass2Output,
      ]);

      const p2Data = await ffmpeg.readFile(pass2Output);
      const p2Bytes = p2Data instanceof Uint8Array ? p2Data : new Uint8Array(p2Data as any);
      const p2Blob = new Blob([p2Bytes.buffer as ArrayBuffer], { type: 'video/mp4' });

      finalFile = new File([p2Blob], `${baseName}-compressed.mp4`, {
        type: 'video/mp4',
        lastModified: Date.now(),
      });

      try {
        await ffmpeg.deleteFile(pass2Output);
      } catch {}
    }

    // Clean up FFmpeg virtual FS
    try {
      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile(outputFileName);
    } catch {}

    // 4. Verify final compressed file does not exceed 50MB
    if (finalFile.size >= maxUploadSizeBytes) {
      throw new Error(
        `Ukuran video hasil kompresi (${formatFileSize(finalFile.size)}) masih melebihi batas 50MB Supabase. Silakan potong durasi video.`
      );
    }

    console.info(
      `[FFmpeg] Kompresi selesai dengan sukses: ${file.name} (${formatFileSize(file.size)} → ${formatFileSize(finalFile.size)}) < 50MB.`
    );
    onProgress?.(
      100,
      `Kompresi video selesai: ${formatFileSize(file.size)} → ${formatFileSize(finalFile.size)} (< 50MB).`
    );

    return finalFile;
  } catch (err: any) {
    console.error('Video compression error:', err);

    // Clean up FFmpeg virtual FS on error
    try {
      await ffmpeg.deleteFile(inputFileName);
    } catch {}
    try {
      await ffmpeg.deleteFile(outputFileName);
    } catch {}

    // Only throw if original file exceeds 50MB because Supabase will reject it
    if (file.size >= maxUploadSizeBytes) {
      throw new Error(
        `Gagal mengompresi video: ${err.message || 'Kesalahan FFmpeg'}. File asli (${formatFileSize(file.size)}) melebihi batas 50MB Supabase.`
      );
    }

    // If original file is already < 50MB, fall back to original
    console.warn('Falling back to original video file as it is < 50MB.');
    return file;
  }
}
