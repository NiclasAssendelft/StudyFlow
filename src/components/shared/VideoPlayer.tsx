'use client'

interface VideoPlayerProps {
  url?: string
  title: string
}

export function VideoPlayer({ url, title }: VideoPlayerProps) {
  if (!url) {
    return (
      <div className="w-full bg-gray-100 rounded-lg flex items-center justify-center aspect-video">
        <div className="text-center">
          <div className="text-gray-400 text-sm">Videota ei ole saatavilla</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
        <iframe
          src={url}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </div>
  )
}
