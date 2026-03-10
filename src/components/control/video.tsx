import { useEffect, useState } from 'react';
import { useStore } from '@/store';

import { VideoExport } from '../preview/export';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function VideoTab() {
  const { doc, updateDocProperties, updateSnapshot } = useStore((state) => ({
    doc: state.doc,
    updateDocProperties: state.updateDocProperties,
    updateSnapshot: state.updateSnapshot,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePropertyChange = (propertyName: string, newValueParser: any) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = newValueParser(e.target.value);
      updateDocProperties({
        ...doc,
        [propertyName]: newValue,
      });
    };
  };

  const handleFontSizeChange = handlePropertyChange('fontSize', parseInt);
  const transitionDurationSeconds =
    (doc.snapshots[0]?.transitionTime ?? 1000) / 1000;
  const [transitionDurationInput, setTransitionDurationInput] = useState(
    String(transitionDurationSeconds),
  );

  useEffect(() => {
    setTransitionDurationInput(String(transitionDurationSeconds));
  }, [transitionDurationSeconds]);

  const applyTransitionDuration = (value: string) => {
    const seconds = parseFloat(value);
    if (!Number.isFinite(seconds)) {
      return;
    }

    const transitionTime = Math.max(0, seconds * 1000);

    doc.snapshots.forEach((snapshot, index) => {
      updateSnapshot(index, {
        ...snapshot,
        transitionTime: Math.min(transitionTime, snapshot.duration),
      });
    });
  };

  const handleTransitionDurationChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setTransitionDurationInput(e.target.value);
  };

  return (
    <ul className="space-y-4 text-xs dark:text-slate-300">
      <li>
        <Label htmlFor="font-size">
          font-size <sup>px</sup>
        </Label>
        <Input
          id="font-size"
          type="number"
          defaultValue={doc.fontSize}
          min={1}
          onChange={handleFontSizeChange}
        />
      </li>
      <li>
        <Label htmlFor="transition-duration" title="second">
          transition duration <sup>s</sup>
        </Label>
        <Input
          id="transition-duration"
          type="number"
          min={0}
          step={0.01}
          value={transitionDurationInput}
          onChange={handleTransitionDurationChange}
          onBlur={() => applyTransitionDuration(transitionDurationInput)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              applyTransitionDuration(transitionDurationInput);
              e.currentTarget.blur();
            }
          }}
        />
      </li>
      <li>
        <VideoExport />
      </li>
    </ul>
  );
}
