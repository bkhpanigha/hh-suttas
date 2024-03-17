import json

def generate_corresponding_files_list(available_suttas_file, output_file):
    files_to_cache = []

    # Load all website files
    directories_to_cache = [
        '.',  # Root directory for index.html, etc.
        './images',
        './js',
        # Add other directories as needed
    ]


    # Load sutta files
    with open(available_suttas_file, 'r', encoding='utf-8') as file:
        data = json.load(file)
        available_suttas = data['available_suttas']
    
    for sutta in available_suttas:
        formatted_sutta_id = sutta['id'].split()[1].replace(" ", "").lower()  # Assuming the ID is always in the format "MN X"
        files_to_cache += [
            f"suttas/html/mn/mn{formatted_sutta_id}_html.json",
            f"suttas/comment/mn/mn{formatted_sutta_id}_comment.json",
            f"suttas/root/mn/mn{formatted_sutta_id}_root-pli-ms.json",
            f"suttas/translation_en/mn/mn{formatted_sutta_id}.json",
        ]
    
    with open(output_file, 'w', encoding='utf-8') as out_file:
        json.dump(files_to_cache, out_file, ensure_ascii=False, indent=4)

# Example usage
generate_corresponding_files_list('available_suttas.json', 'filesToCache.json')
