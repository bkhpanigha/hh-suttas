import yt_dlp
import json
from typing import Dict

available_videos_path = './python/generated/available_videos.json'

def get_thumbnail_url(video_id: str) -> dict:
    """
    Get available thumbnail URLs for different qualities
    Returns a dict with available qualities
    """
    thumbnail_urls = {}
    quality_formats = ['maxresdefault', 'sddefault', 'hqdefault', 'mqdefault', 'default']
    
    # Generate thumbnail URLs based on video ID
    for format in quality_formats:
        thumbnail_urls[format] = f"https://i.ytimg.com/vi/{video_id}/{format}.jpg"
    
    return thumbnail_urls

def format_duration(duration_seconds: float) -> str:
    """
    Convert duration from seconds to HH:MM:SS format
    """
    # Convert float to int
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
            # Extract channel information
            print(f"Fetching data from {channel_url}...")
            channel_info = ydl.extract_info(channel_url, download=False)
            
            # Loop through videos
            print("Processing videos...")
            for entry in channel_info['entries']:
                if entry is None:  # Skip any failed extractions
                    continue
                    
                video_id = entry['id']
                
                # Get thumbnails
                thumbnails = get_thumbnail_url(video_id)
                
                # Get duration (if available)
                duration = entry.get('duration')
                formatted_duration = format_duration(duration) if duration else None
                
                # Store video information
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
    """
    Process multiple channels and save all videos to a single JSON file
    """
    all_videos = {"available_videos": {}}
    
    # Fetch videos from all channels
    for channel_url in channel_urls:
        channel_videos = get_channel_videos(channel_url)
        all_videos["available_videos"].update(channel_videos)
    
    # Save all videos to JSON file
    print(f"\nSaving {len(all_videos['available_videos'])} videos to JSON file...")
    with open(available_videos_path, 'w', encoding='utf-8') as f:
        json.dump(all_videos, f, ensure_ascii=False, indent=4)
    
    print("Video data extraction done")

if __name__ == "__main__":
    channels = [
        "https://www.youtube.com/@HillsideHermitage",
        "https://www.youtube.com/@SamanadipaHermitage"
    ]
    
    process_channels(channels)