

export async function fetchAvailableVideos()
{
    let availableVideosJson = "FAILED";

    try
    {
        const response = await fetch('python/generated/available_videos.json');
        const availableVideos = await response.json();
        availableVideosJson = availableVideos['available_videos'];
    }
    catch(err)
    {
        console.error(`Failed to fetch available videos: ${err}`)
    }

    return availableVideosJson;
}