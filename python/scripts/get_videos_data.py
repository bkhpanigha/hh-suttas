import yt_dlp
import json
from typing import Dict

available_videos_path = './python/generated/available_videos.json'

def get_channel_videos(channel_url: str) -> Dict:
    ydl_opts = {
        'extract_flat': True,
        'quiet': True,
        'no_warnings': True
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            # Extract channel information
            channel_info = ydl.extract_info(channel_url, download=False)
            
            # Prepare output dictionary
            output = {"available_videos": {}}
            
            # Loop through videos
            for entry in channel_info['entries']:
                video_id = entry['id']
                output["available_videos"][video_id] = {
                    "title": entry['title']
                }
            
            # Save to JSON file
            with open(available_videos_path, 'w', encoding='utf-8') as f:
                json.dump(output, f, ensure_ascii=False, indent=4)
                
            return output
            
        except Exception as e:
            print(f"Error during extraction: {str(e)}")
            return None

# Usage example
if __name__ == "__main__":
    channel_url = "https://www.youtube.com/@HillsideHermitage"
    videos = get_channel_videos(channel_url)