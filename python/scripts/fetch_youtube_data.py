import yt_dlp
import json
import requests
from typing import Dict, Tuple

available_videos_path = './python/generated/available_videos.json'
playlists_path = './python/generated/available_playlists.json'

def get_thumbnail_url(video_id: str) -> dict:
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

def get_channel_videos(channel_url: str, channel_name: str) -> Dict:
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'ignoreerrors': True,
        'extract_flat': True,
    }
    
    videos = {}
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            print(f"Fetching videos from {channel_url}...")
            channel_info = ydl.extract_info(channel_url, download=False)
            
            print("Processing videos...")
            for entry in channel_info['entries']:
                if entry is None:
                    continue
                    
                video_id = entry['id']
                thumbnails = get_thumbnail_url(video_id)
                duration = entry.get('duration')
                formatted_duration = format_duration(duration) if duration else None

                videos[video_id] = {
                    "title": entry['title'],
                    "thumbnails": thumbnails,
                    "duration": formatted_duration
                }
            
            return videos
            
        except Exception as e:
            print(f"Error during video extraction: {str(e)}")
            return {}

def get_channel_playlists(channel_url: str, channel_name: str) -> Dict:
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'ignoreerrors': True,
        'extract_flat': True,
        'extractor_args': {
            'youtube': {
                'skip': ['dash', 'hls'],
                'extract_flat': True,
            }
        }
    }
    
    playlists = {}
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            print(f"Fetching playlists from {channel_url}/playlists...")
            playlists_info = ydl.extract_info(f"{channel_url}/playlists", download=False)
            
            print("Processing playlists...")
            for entry in playlists_info.get('entries', []):
                if entry is None:
                    continue
                
                playlist_id = entry['id']
                
                try:
                    playlist_url = f"https://www.youtube.com/playlist?list={playlist_id}"
                    playlist_details = ydl.extract_info(playlist_url, download=False)
                    
                    playlists[playlist_id] = {
                        "name": entry['title'],
                        "video_count": len(playlist_details.get('entries', []))
                    }
                except Exception as e:
                    print(f"Error processing playlist {playlist_id}: {str(e)}")
                    continue
            
            return playlists
            
        except Exception as e:
            print(f"Error during playlist extraction: {str(e)}")
            return {}

def process_channels(channels_data: list[dict]) -> None:
    all_videos = {"available_videos": {}}
    all_playlists = {"playlists": {}}
    
    for channel in channels_data:
        channel_url = channel['url']
        channel_name = channel['name']
        
        # Get videos
        channel_videos = get_channel_videos(channel_url, channel_name)
        all_videos["available_videos"][channel_name] = channel_videos
        
        # Get playlists
        channel_playlists = get_channel_playlists(channel_url, channel_name)
        all_playlists["playlists"][channel_name] = channel_playlists
    
    # Save videos
    print(f"Saving videos to JSON file...")
    with open(available_videos_path, 'w', encoding='utf-8') as f:
        json.dump(all_videos, f, ensure_ascii=False, indent=4)
        
    # Save playlists
    print(f"Saving playlists to JSON file...")
    with open(playlists_path, 'w', encoding='utf-8') as f:
        json.dump(all_playlists, f, ensure_ascii=False, indent=4)
    
    print("Done!")

if __name__ == "__main__":
    channels = [
        {
            "url": "https://www.youtube.com/@HillsideHermitage",
            "name": "Hillside Hermitage"
        },
        {
            "url": "https://www.youtube.com/@SamanadipaHermitage",
            "name": "Samanadipa Hermitage"
        }
    ]
    
    process_channels(channels)
