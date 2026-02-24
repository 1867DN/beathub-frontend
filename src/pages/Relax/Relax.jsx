import { useState, useEffect } from 'react'

export default function Relax() {
  const [spotifyConnected, setSpotifyConnected] = useState(false)
  const [userPlaylists, setUserPlaylists] = useState([])

  useEffect(() => {
    // Check if Spotify is connected
    const spotifyToken = localStorage.getItem('spotify_token')
    if (spotifyToken) {
      setSpotifyConnected(true)
      // Fetch playlists
    }
  }, [])

  const handleConnectSpotify = () => {
    // Redirect to Spotify auth
    window.location.href = `https://accounts.spotify.com/authorize?client_id=${import.meta.env.VITE_SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${window.location.origin}/relax&scope=playlist-read-private%20playlist-read-collaborative%20user-read-private`
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-4">🎧 Relax - Tu Hub de Música</h1>
      <p className="text-gray-600 mb-8">Conecta tu cuenta de Spotify y descubre un mundo de música</p>

      {!spotifyConnected ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-6xl mb-4">🎵</div>
          <h2 className="text-2xl font-bold mb-4">Conecta tu cuenta de Spotify</h2>
          <p className="text-gray-600 mb-6">
            Para acceder a Relax, necesitas vincular tu cuenta de Spotify
          </p>
          <button
            onClick={handleConnectSpotify}
            className="bg-[#1DB954] text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-[#1ed760] transition"
          >
            🎵 Conectar con Spotify
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Playlists */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Mis Playlists</h2>
            {userPlaylists.length === 0 ? (
              <p className="text-gray-500">Cargando playlists...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {userPlaylists.map((playlist) => (
                  <div key={playlist.id} className="bg-gray-100 rounded-lg p-4 text-center">
                    <div className="bg-gray-300 h-32 rounded mb-3 flex items-center justify-center">
                      <span className="text-3xl">🎵</span>
                    </div>
                    <h3 className="font-bold">{playlist.name}</h3>
                    <p className="text-sm text-gray-600">{playlist.tracks.total} canciones</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">🤖 Recomendaciones Personalizadas</h2>
            <p className="text-gray-600">Las recomendaciones basadas en IA estarán disponibles pronto</p>
          </div>

          {/* Mini Player */}
          <div className="bg-secondary text-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">▶️ Reproductor</h2>
            <p className="text-gray-300">El reproductor Spotify se mostrará aquí</p>
          </div>
        </div>
      )}
    </div>
  )
}
