/**
 * PhotoUploadButton.jsx
 * ------------------------------------------------------------------
 * Shows the receipt photo thumbnail if one's attached, or a camera
 * icon button to pick one. Hands the chosen File up via onUpload —
 * the parent (CostItemRow) calls useInvoice().uploadCostItemPhoto.
 * ------------------------------------------------------------------
 */
import { useRef } from 'react';

export default function PhotoUploadButton({ photoUrl, onUpload }) {
  const inputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = '';
  }

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        onClick={() => window.open(photoUrl, '_blank')}
        title="Tap to view full size"
        style={{ width: 30, height: 30, borderRadius: 6, objectFit: 'cover', flexShrink: 0, cursor: 'pointer' }}
      />
    );
  }

  return (
    <>
      <span
        onClick={() => inputRef.current?.click()}
        title="Add receipt photo"
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: 'var(--orange-tint)',
          color: 'var(--orange)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          cursor: 'pointer',
          fontSize: 14,
        }}
      >
        📷
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </>
  );
}
