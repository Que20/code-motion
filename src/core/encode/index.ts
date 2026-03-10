import WebMWriter from 'webm-writer';
import { sleep } from '@/utils/sleep';

import { getSumDuration, type RawDoc } from '../doc/raw-doc';
import { DocumentDrawer } from '../drawer';

interface VideoEncodeOptions {
  frameRate?: number;
  onProgress?: (progress: number) => void;
}

function isCanvasWebPEncodingSupported() {
  const testCanvas = document.createElement('canvas');
  const dataUrl = testCanvas.toDataURL('image/webp', 0.9);

  return dataUrl.startsWith('data:image/webp');
}

function pickSupportedMimeType() {
  if (typeof MediaRecorder === 'undefined') return undefined;

  const types = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4',
  ];

  return types.find((type) => MediaRecorder.isTypeSupported(type));
}

export class VideoEncoder {
  readonly drawer: DocumentDrawer;
  readonly duration: number;
  private readonly initPromise: Promise<void>;
  private aborted = false;

  constructor(
    private readonly doc: RawDoc,
    private readonly options: VideoEncodeOptions = {},
  ) {
    const canvas = document.createElement('canvas');
    this.drawer = new DocumentDrawer(canvas, 1);
    this.initPromise = this.drawer.setDoc(this.doc);
    this.duration = getSumDuration(this.doc);
  }

  private get frameRate() {
    return this.options.frameRate ?? this.doc.frameRate ?? 60;
  }

  private get frameCount() {
    return (this.duration / 1000) * this.frameRate;
  }

  private get frameDuration() {
    return 1000 / this.frameRate;
  }

  private reportProgress(frame: number) {
    if (this.options.onProgress !== undefined) {
      this.options.onProgress(frame / this.frameCount);
    }
  }

  private async encodeWithWebMWriter() {
    const writer = new WebMWriter({
      quality: 0.9,
      frameDuration: this.frameDuration,
      frameRate: this.frameRate,
      transparent: true,
    });

    for (let frame = 0; frame < this.frameCount; frame++) {
      if (this.aborted) {
        throw new Error('Aborted');
      }

      const time = frame * this.frameDuration;
      this.drawer.render(time);
      writer.addFrame(this.drawer.canvas, this.frameDuration);
      this.reportProgress(frame);
      await sleep(0);
    }

    return writer.complete();
  }

  private async encodeWithMediaRecorder() {
    if (typeof MediaRecorder === 'undefined') {
      throw new Error('MediaRecorder is not available in this browser.');
    }

    const mimeType = pickSupportedMimeType();
    const stream = this.drawer.canvas.captureStream(this.frameRate);
    const track = stream.getVideoTracks()[0] as MediaStreamTrack & {
      requestFrame?: () => void;
    };
    const chunks: BlobPart[] = [];
    let detectedMimeType: string | undefined;

    const blobPromise = new Promise<Blob>((resolve, reject) => {
      const recorder = new MediaRecorder(
        stream,
        mimeType == null ? undefined : { mimeType },
      );

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
          detectedMimeType ??= event.data.type;
        }
      };

      recorder.onerror = () => {
        reject(new Error('Failed to record canvas stream.'));
      };

      recorder.onstop = () => {
        const videoBlob = new Blob(chunks, {
          type: mimeType ?? detectedMimeType ?? 'video/webm',
        });

        if (videoBlob.size === 0) {
          reject(new Error('Failed to generate video from canvas stream.'));
          return;
        }

        resolve(videoBlob);
      };

      recorder.start();

      (async () => {
        try {
          for (let frame = 0; frame < this.frameCount; frame++) {
            if (this.aborted) {
              throw new Error('Aborted');
            }

            const time = frame * this.frameDuration;
            this.drawer.render(time);
            track.requestFrame?.();
            this.reportProgress(frame);
            await sleep(this.frameDuration);
          }

          recorder.stop();
        } catch (error) {
          if (recorder.state !== 'inactive') {
            recorder.stop();
          }

          reject(error);
        }
      })();
    });

    try {
      return await blobPromise;
    } finally {
      track.stop();
    }
  }

  async encode(): Promise<Blob> {
    await this.initPromise;

    if (!isCanvasWebPEncodingSupported()) {
      console.warn(
        '[VideoExport] Canvas WebP encoding is not supported, falling back to MediaRecorder.',
      );
      return this.encodeWithMediaRecorder();
    }

    try {
      return await this.encodeWithWebMWriter();
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Failed to decode WebP Base64 URL')
      ) {
        console.warn(
          '[VideoExport] WebP frame encoding failed, falling back to MediaRecorder.',
          error,
        );
        return this.encodeWithMediaRecorder();
      }

      throw error;
    }
  }

  abort() {
    this.aborted = true;
  }
}
