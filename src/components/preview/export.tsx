import { useState } from 'react';
import { DownloadIcon } from 'lucide-react';
import { useStore } from '@/store';
import { EncodeStatus } from '@/store/encode-task';
import { dateFilename, downloadBlob } from '@/utils/download';
import { convertWebmToMp4 } from '@/utils/video-convert';

import { Button } from '../ui/button';

interface VideoExportProps {
  exportFormat: 'webm' | 'mp4';
}

export function VideoExport({ exportFormat }: VideoExportProps) {
  const [isConverting, setIsConverting] = useState(false);
  const { encodeState, startEncodeTask, abortEncodeTask } = useStore(
    (state) => ({
      encodeState: state.encodeState,
      startEncodeTask: state.startEncodeTask,
      abortEncodeTask: state.abortEncodeTask,
    }),
  );

  const handleClick = async () => {
    if (isConverting) {
      console.info('[VideoExport] Ignoring click while conversion is running.');
      return;
    }

    if (encodeState == null || encodeState.status === EncodeStatus.Error) {
      startEncodeTask();
    } else if (encodeState.status === EncodeStatus.Encoding) {
      abortEncodeTask();
    } else if (encodeState.status === EncodeStatus.Done) {
      try {
        console.info('[VideoExport] Download button clicked with encoded result.', {
          type: encodeState.result.type,
          size: encodeState.result.size,
        });
        if (exportFormat === 'mp4') {
          setIsConverting(true);
          const mp4Blob = await convertWebmToMp4(encodeState.result);
          console.info('[VideoExport] Converted MP4 ready for download.', {
            type: mp4Blob.type,
            size: mp4Blob.size,
          });
          downloadBlob(mp4Blob, `code_motion-${dateFilename()}.mp4`);
        } else {
          downloadBlob(encodeState.result, `code_motion-${dateFilename()}.webm`);
        }
        abortEncodeTask();
      } catch (error) {
        console.error('[VideoExport] Failed to download the encoded video.', error);
      } finally {
        console.info('[VideoExport] Conversion flow ended.');
        setIsConverting(false);
      }
    }
  };

  const progress =
    encodeState?.status === EncodeStatus.Encoding
      ? encodeState.progress
      : encodeState?.status === EncodeStatus.Done
        ? 1
        : 0;

  const progressPercent = `${Math.round(progress * 100)}%`;

  return (
      <Button
      className={`felx relative w-full gap-1.5 font-normal ${
        isConverting ? 'cursor-not-allowed' : ''
      }`}
      variant="secondary"
      title={
        encodeState?.status === EncodeStatus.Encoding ? 'Click to cancel' : ''
      }
      disabled={isConverting}
      onClick={handleClick}
    >
      <DownloadIcon className="w-5" />
      <span>
        {encodeState == null
          ? 'Export'
          : isConverting
            ? 'Converting...'
          : encodeState.status === EncodeStatus.Done
            ? 'Download'
            : encodeState.status === EncodeStatus.Encoding
              ? progressPercent
              : 'Re-Export'}
      </span>
      <span
        className={`animate-progress absolute bottom-0 left-0 top-0 bg-slate-200 mix-blend-overlay`}
        style={{
          width: progressPercent,
        }}
      />
    </Button>
  );
}
