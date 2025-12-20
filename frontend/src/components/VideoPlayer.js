import { useState } from 'react';

const VideoPlayer = ({ videoUrl, videoLocal, className = "" }) => {
  const [error, setError] = useState(false);

  // Se for URL do YouTube
  const isYouTube = videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'));
  
  // Extrair ID do vídeo do YouTube
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    
    let videoId = null;
    
    if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(new URL(url).search);
      videoId = urlParams.get('v');
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('youtube.com/embed/')[1]?.split('?')[0];
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ minHeight: '240px' }}>
        <div className="text-center p-6">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-600">Vídeo não disponível</p>
        </div>
      </div>
    );
  }

  // Sem vídeo
  if (!videoUrl && !videoLocal) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ minHeight: '240px' }}>
        <div className="text-center p-6">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-600">Nenhum vídeo</p>
        </div>
      </div>
    );
  }

  // Vídeo do YouTube
  if (isYouTube) {
    const embedUrl = getYouTubeEmbedUrl(videoUrl);
    
    if (!embedUrl) {
      setError(true);
      return null;
    }

    return (
      <div className={`relative ${className}`} style={{ paddingBottom: '56.25%', height: 0 }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          src={embedUrl}
          title="Vídeo do YouTube"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onError={() => setError(true)}
        />
      </div>
    );
  }

  // Vídeo local (base64)
  if (videoLocal) {
    return (
      <video
        className={`w-full rounded-lg ${className}`}
        controls
        onError={() => setError(true)}
      >
        <source src={videoLocal} type="video/mp4" />
        Seu navegador não suporta a reprodução de vídeos.
      </video>
    );
  }

  // Fallback: tentar como URL direta
  return (
    <video
      className={`w-full rounded-lg ${className}`}
      controls
      onError={() => setError(true)}
    >
      <source src={videoUrl} type="video/mp4" />
      Seu navegador não suporta a reprodução de vídeos.
    </video>
  );
};

export default VideoPlayer;