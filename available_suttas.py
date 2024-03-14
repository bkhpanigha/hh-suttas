import json
import re
from pathlib import Path

# Path to the suttas directory
suttas_dir = Path('suttas/translation_en/mn')
available_suttas = []

pattern = re.compile(r'mn(\d+)\.json', re.IGNORECASE)

# Loop through the files in the suttas directory
for file_path in suttas_dir.glob('*.json'):
    match = pattern.search(file_path.name)
    with open(file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
        # Extract the sutta title using the key pattern "mn{d+}:0.2"
        # Assuming the key follows the format "mn{number}:0.2"
        key = f"mn{match.group(1)}:0.2"
        if key:
            sutta_title = data.get(key)
            available_suttas.append({"id": f"MN {match.group(1)}", "title": sutta_title})

# Sort the list by the numeric part of the 'id' key
available_suttas.sort(key=lambda x: int(x['id'][2:]))

# Create a JSON object with the array of available suttas
output = {'available_suttas': available_suttas}

# Write the JSON object to a file if it's not empty
if len(available_suttas) > 0:
    with open('available_suttas.json', 'w', encoding='utf-8') as out_file:
        json.dump(output, out_file, ensure_ascii=False, indent=4)
