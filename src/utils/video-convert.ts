const FFMPEG_CORE_VERSION = '0.12.10';
const FFMPEG_CORE_BASE_URL = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/esm`;

type FFmpegContext = {
  ffmpeg: any;
  fetchFile: (file?: Blob | File | string) => Promise<Uint8Array>;
};

let ffmpegPromise: Promise<FFmpegContext> | undefined;

async function getFFmpeg() {
  if (ffmpegPromise == null) {
    ffmpegPromise = (async () => {
      console.info('[VideoExport] Loading FFmpeg core...');
      const [{ FFmpeg }, { fetchFile, toBlobURL }] = await Promise.all([
        import('@ffmpeg/ffmpeg'),
        import('@ffmpeg/util'),
      ]);
      const ffmpeg = new FFmpeg();

      ffmpeg.on?.('log', (event) => {
        const message =
          typeof event.message === 'string' ? event.message : undefined;
        if (message != null) {
          console.info(`[VideoExport][FFmpeg] ${message}`);
        } else {
          console.info('[VideoExport][FFmpeg] log event', event);
        }
      });

      ffmpeg.on?.('progress', (event) => {
        const progress =
          typeof event.progress === 'number' ? event.progress : undefined;
        if (progress != null) {
          console.info(
            `[VideoExport][FFmpeg] progress ${Math.round(progress * 100)}%`,
          );
        }
      });

      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${FFMPEG_CORE_BASE_URL}/ffmpeg-core.js`,
          'text/javascript',
        ),
        wasmURL: await toBlobURL(
          `${FFMPEG_CORE_BASE_URL}/ffmpeg-core.wasm`,
          'application/wasm',
        ),
      });

      console.info('[VideoExport] FFmpeg core loaded.');

      return { ffmpeg, fetchFile };
    })();
  }

  return ffmpegPromise!;
}

export async function convertWebmToMp4(sourceBlob: Blob) {
  console.info('[VideoExport] Starting WebM to MP4 conversion.', {
    inputType: sourceBlob.type,
    inputSize: sourceBlob.size,
  });

  const { ffmpeg, fetchFile } = await getFFmpeg();
  const inputName = `input-${Date.now()}.webm`;
  const outputName = `output-${Date.now()}.mp4`;

  const inputData = await fetchFile(sourceBlob);
  console.info('[VideoExport] Input file prepared for FFmpeg.', {
    inputName,
    bytes: inputData.byteLength,
  });

  await ffmpeg.writeFile(inputName, inputData);
  console.info('[VideoExport] Input file written to FFmpeg FS.', { inputName });

  const exitCode = await ffmpeg.exec([
    '-i',
    inputName,
    '-c:v',
    'libx264',
    '-preset',
    'fast',
    '-pix_fmt',
    'yuv420p',
    outputName,
  ]);

  console.info('[VideoExport] FFmpeg conversion command completed.', {
    exitCode,
    outputName,
  });

  const outputData = await ffmpeg.readFile(outputName);
  if (!(outputData instanceof Uint8Array)) {
    console.error('[VideoExport] Unexpected FFmpeg output format.', {
      outputType: typeof outputData,
    });
    throw new Error('FFmpeg output is not a binary buffer.');
  }

  const outputBytes = new Uint8Array(outputData);

  console.info('[VideoExport] Output file read from FFmpeg FS.', {
    outputName,
    outputBytes: outputBytes.byteLength,
  });

  await Promise.allSettled([
    ffmpeg.deleteFile(inputName),
    ffmpeg.deleteFile(outputName),
  ]);

  console.info('[VideoExport] Temporary FFmpeg files deleted.', {
    inputName,
    outputName,
  });

  console.info('[VideoExport] Conversion finished successfully.');
  return new Blob([outputBytes], { type: 'video/mp4' });
}
