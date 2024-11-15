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
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            # Extract channel information
            print("Fetching channel data...")
            channel_info = ydl.extract_info(channel_url, download=False)
            
            # Prepare output dictionary
            output = {"available_videos": {}}
            
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
                
                # Format upload date
                upload_date = entry.get('upload_date', '')
                
                # Store video information
                output["available_videos"][video_id] = {
                    "title": entry['title'],
                    "thumbnails": thumbnails,
                    "duration": formatted_duration,
                }
            
            # Save to JSON file
            print("Saving to JSON file...")
            with open(available_videos_path, 'w', encoding='utf-8') as f:
                json.dump(output, f, ensure_ascii=False, indent=4)
                
            return output
            
        except Exception as e:
            print(f"Error during extraction: {str(e)}")
            return None

# Usage example
if __name__ == "__main__":
    channel_url = "https://www.youtube.com/@HillsideHermitage"
    get_channel_videos(channel_url)
    channel_url = "https://www.youtube.com/@SamanadipaHermitage"
    get_channel_videos(channel_url)
