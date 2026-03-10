export function dateFilename() {
  const curDate = new Date()
    .toLocaleString('en-GB')
    .replace(', ', '_')
    .replace(/\/|:| /g, '-');
  return curDate;
}

export function downloadBlob(blob: Blob, filename: string) {
  if (!(blob instanceof Blob) || blob.size === 0) {
    throw new Error('Cannot download an empty video blob.');
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 0);
}
