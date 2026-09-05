/**
 * LogoUploader.jsx
 * ------------------------------------------------------------------
 * Uploads/replaces the business logo shown on invoice & quote PDFs.
 * ------------------------------------------------------------------
 */
import { useRef } from 'react';
import FieldLabel from '../ui/FieldLabel.jsx';
import Button from '../ui/Button.jsx';

export default function LogoUploader({ logoUrl, onUpload }) {
  const inputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = '';
  }

  return (
    <div>
      <FieldLabel>Business logo</FieldLabel>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
        {logoUrl ? (
          <img src={logoUrl} style={{ height: 44, maxWidth: 110, objectFit: 'contain' }} />
        ) : (
          <div style={{ fontSize: 12, color: 'var(--gray)' }}>No logo uploaded</div>
        )}
        <Button variant="outline" style={{ fontSize: 12 }} onClick={() => inputRef.current?.click()}>
          {logoUrl ? 'Change logo' : 'Upload logo'}
        </Button>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
      </div>
    </div>
  );
}
