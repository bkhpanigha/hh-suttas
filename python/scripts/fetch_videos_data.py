import yt_dlp
import json
import requests
from typing import Dict

available_videos_path = './python/generated/available_videos.json'

# Some old videos don't have the maxresdefault thumbnail format
def get_thumbnail_url(video_id: str) -> dict:
    """
    Try maxresdefault first, fallback to hqdefault
    """
    maxres_url = f"https://i.ytimg.com/vi/{video_id}/maxresdefault.jpg"
    try:
        response = requests.head(maxres_url, allow_redirects=True)
        if response.status_code == 200:
            return {"maxresdefault": maxres_url}
        else:
            return {"hqdefault": f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"}
    except:
        return {"hqdefault": f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"}

def format_duration(duration_seconds: float) -> str:
    if not duration_seconds:
        return None
        
    duration_seconds = int(duration_seconds)
    hours = duration_seconds // 3600
    minutes = (duration_seconds % 3600) // 60
    seconds = duration_seconds % 60
    
    if hours > 0:
        return f"{int(hours):02d}:{int(minutes):02d}:{int(seconds):02d}"
    else:
        return f"{int(minutes):02d}:{int(seconds):02d}"

def get_channel_videos(channel_url: str) -> Dict:
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'ignoreerrors': True,
        'extract_flat': True,
    }
    
    videos = {}
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            print(f"Fetching data from {channel_url}...")
            channel_info = ydl.extract_info(channel_url, download=False)
            
            print("Processing videos...")
            for entry in channel_info['entries']:
                if entry is None:
                    continue

                print("Processing video (" + entry['id'] + ") : " + entry['title']);
				
                video_id = entry['id']
                thumbnails = get_thumbnail_url(video_id)
                duration = entry.get('duration')
                formatted_duration = format_duration(duration) if duration else None
                
                videos[video_id] = {
                    "title": entry['title'],
                    "thumbnails": thumbnails,
                    "duration": formatted_duration,
                }
            
            return videos
            
        except Exception as e:
            print(f"Error during extraction: {str(e)}")
            return {}

def process_channels(channel_urls: list) -> None:
    all_videos = {"available_videos": {}}
    
    for channel_url in channel_urls:
        channel_videos = get_channel_videos(channel_url)
        all_videos["available_videos"].update(channel_videos)
    
    print(f"\nSaving {len(all_videos['available_videos'])} videos to JSON file...")
    with open(available_videos_path, 'w', encoding='utf-8') as f:
        json.dump(all_videos, f, ensure_ascii=False, indent=4)
    
    print("Done!")

if __name__ == "__main__":
    channels = [
        "https://www.youtube.com/@HillsideHermitage",
        "https://www.youtube.com/@SamanadipaHermitage"
    ]
    
    process_channels(channels)
