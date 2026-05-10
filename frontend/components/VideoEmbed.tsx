type Props = {
  title: string;
  embedUrl: string;
  className?: string;
  autoplay?: boolean;
};

export function VideoEmbed({ title, embedUrl, className, autoplay = false }: Props) {
  const src = autoplay ? `${embedUrl}${embedUrl.includes("?") ? "&" : "?"}autoplay=1&mute=1` : embedUrl;
  return (
    <div className={`relative aspect-video w-full overflow-hidden rounded-xl bg-black ring-1 ring-white/10 ${className ?? ""}`}>
      <iframe
        title={title}
        src={src}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
