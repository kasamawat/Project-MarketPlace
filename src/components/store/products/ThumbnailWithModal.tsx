import React from "react";
import Image from "next/image";

type Cover = { url?: string; alt?: string };

type Props = {
  name: string;
  images?: Cover[]; // p.cover
  size?: number; // ความกว้าง/สูงของรูป thumbnail (px)
};

export default function ThumbnailWithModal({
  name,
  images = [],
  size = 80,
}: Props): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState(0);

  const hasImages = images.length > 0;
  const firstUrl = hasImages ? String(images[0].url) : "";
    console.log(firstUrl,"firstUrl");
    
  // เปิด modal ที่รูป index 0
  const openModal = (): void => {
    if (!hasImages) return;
    setIndex(0);
    setOpen(true);
    document.body.classList.add("overflow-hidden");
  };

  const closeModal = (): void => {
    setOpen(false);
    document.body.classList.remove("overflow-hidden");
  };

  const prev = (): void => {
    if (!hasImages) return;
    setIndex((i) => (i - 1 + images.length) % images.length);
  };

  const next = (): void => {
    if (!hasImages) return;
    setIndex((i) => (i + 1) % images.length);
  };

  // ปิดด้วย ESC + เลื่อนด้วยลูกศรซ้าย/ขวา
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, images.length]);

  return (
    <>
      {/* Thumbnail + Badge */}
      {hasImages ? (
        <button
          type="button"
          onClick={openModal}
          className="relative inline-block outline-none cursor-pointer"
          aria-label={`Open images for ${name}`}
        >
          <Image
            src={firstUrl}
            alt={name}
            width={size}
            height={size}
            className="h-20 w-20 mx-auto rounded object-cover transition-transform duration-200 ease-in-out hover:scale-110"
          />
          {images.length > 1 && (
            <span className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
              +{images.length - 1}
            </span>
          )}
        </button>
      ) : (
        <span>—</span>
      )}

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          {/* Stop propagation เพื่อไม่ให้คลิกในกล่องแล้วปิด */}
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ปุ่มปิด */}
            {/* <button
              onClick={closeModal}
              className="absolute -top-0 -right-0 rounded-full bg-gray-400 px-3 py-1 text-red-500 text-sm hover:bg-black/90 z-[9999] cursor-pointer"
              aria-label="Close"
            >
              ✕
            </button> */}

            {/* รูปใหญ่ */}
            <div className="relative w-full overflow-hidden rounded-2xl bg-black">
              <div className="relative mx-auto aspect-video max-h-[80vh]">
                <Image
                  src={String(images[index].url)}
                  alt={images[index].alt ?? name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="object-contain"
                  priority
                />
              </div>

              {/* ปุ่มเลื่อนซ้าย/ขวา */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-white hover:bg-black/70 cursor-pointer"
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-white hover:bg-black/70 cursor-pointer"
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {/* แถบ thumbnails ด้านล่าง */}
            {images.length > 1 && (
              <div className="mt-3 flex items-center gap-2 overflow-x-auto">
                {images.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border ${
                      i === index
                        ? "border-red-500"
                        : "border-white/20 hover:border-white/60 cursor-pointer"
                    }`}
                    aria-label={`Go to image ${i + 1}`}
                  >
                    <Image
                      src={String(c.url)}
                      alt={c.alt ?? `${name} ${i + 1}`}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
