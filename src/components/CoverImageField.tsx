import { useEffect, useMemo, useRef, useState } from "react";
import CoverCropModal from "./CoverCropModal";
import { useLocale } from "../contexts/LocaleContext";

export const COVER_MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

interface CoverImageFieldProps {
  /** Cover already stored on the server, if any */
  currentUrl?: string | null;
  /** Newly picked file, not uploaded yet */
  file: File | null;
  /** True when the stored cover should be deleted on save */
  removed?: boolean;
  onFileChange: (file: File | null) => void;
  onRemoveChange?: (removed: boolean) => void;
}

export default function CoverImageField({
  currentUrl,
  file,
  removed = false,
  onFileChange,
  onRemoveChange,
}: CoverImageFieldProps) {
  const { t } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [cropSource, setCropSource] = useState<File | null>(null);
  const cropUrl = useMemo(() => (cropSource ? URL.createObjectURL(cropSource) : null), [cropSource]);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    if (!cropUrl) return;
    return () => URL.revokeObjectURL(cropUrl);
  }, [cropUrl]);

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const shownUrl = previewUrl ?? (removed ? null : currentUrl ?? null);

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    e.target.value = "";
    if (!picked) return;
    if (!picked.type.startsWith("image/")) {
      setError(t.ct_coverInvalid);
      return;
    }
    if (picked.size > COVER_MAX_UPLOAD_BYTES) {
      setError(t.ct_coverTooLarge);
      return;
    }
    setError("");
    setCropSource(picked);
  };

  const handleCropped = (cropped: File) => {
    setCropSource(null);
    onFileChange(cropped);
    onRemoveChange?.(false);
  };

  const handleRemove = () => {
    setError("");
    onFileChange(null);
    if (currentUrl) onRemoveChange?.(true);
  };

  return (
    <div>
      <label className="mb-2 block font-semibold text-text">{t.ct_coverImage}</label>
      <div className="aspect-video w-full max-w-sm overflow-hidden rounded-game border border-text/10 bg-text/[0.04]">
        {shownUrl ? (
          <img src={shownUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-text/30">🖼️</div>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-game border border-text/15 bg-text/[0.06] px-4 py-2 text-sm font-semibold text-text transition hover:bg-text/10"
        >
          {shownUrl ? t.ct_coverChange : t.ct_coverAdd}
        </button>
        {shownUrl && (
          <button
            type="button"
            onClick={handleRemove}
            className="rounded-game border border-text/15 bg-text/[0.06] px-4 py-2 text-sm font-semibold text-error transition hover:bg-text/10"
          >
            {t.ct_coverRemove}
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handlePick} className="hidden" />
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
      {cropSource && cropUrl && (
        <CoverCropModal
          imageUrl={cropUrl}
          fileName={cropSource.name}
          onCancel={() => setCropSource(null)}
          onConfirm={handleCropped}
        />
      )}
    </div>
  );
}
