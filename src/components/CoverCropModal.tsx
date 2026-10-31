import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { useLocale } from "../contexts/LocaleContext";

const OUTPUT_MAX_WIDTH = 1280;
const ASPECT = 16 / 9;

interface CoverCropModalProps {
  imageUrl: string;
  fileName: string;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}

const loadImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

async function cropToFile(imageUrl: string, area: Area, fileName: string): Promise<File> {
  const img = await loadImage(imageUrl);
  const width = Math.min(Math.round(area.width), OUTPUT_MAX_WIDTH);
  const height = Math.round(width / ASPECT);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
  if (!blob) throw new Error("Could not crop image");
  return new File([blob], fileName.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
}

export default function CoverCropModal({ imageUrl, fileName, onCancel, onConfirm }: CoverCropModalProps) {
  const { t } = useLocale();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), []);

  const handleConfirm = async () => {
    if (!area || busy) return;
    setBusy(true);
    try {
      onConfirm(await cropToFile(imageUrl, area, fileName));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-xl rounded-game border border-text/15 bg-card p-4 text-text shadow-lg md:p-6">
        <h2 className="mb-3 text-xl font-bold">{t.ct_coverCropTitle}</h2>
        <div className="relative aspect-video w-full overflow-hidden rounded-game bg-black">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={ASPECT}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="mt-4 w-full accent-success"
          aria-label="Zoom"
        />
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 rounded-game border border-text/15 bg-text/[0.06] px-4 py-2 font-semibold transition hover:bg-text/10 disabled:opacity-50"
          >
            {t.ct_cancel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy || !area}
            className="flex-1 rounded-game bg-success px-4 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {t.ct_coverCropConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}
