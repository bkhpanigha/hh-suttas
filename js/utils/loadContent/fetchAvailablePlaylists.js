

export async function fetchAvailablePlaylists()
{
    let availablePlaylistsJson = "FAILED";

    try
    {
        const response = await fetch('python/generated/available_playlists.json');
        const availablePlaylists = await response.json();
        availablePlaylistsJson = availablePlaylists['available_playlists'];
    }
    catch(err)
    {
        console.error(`Failed to fetch available videos: ${err}`)
    }

    return availablePlaylistsJson;
}
