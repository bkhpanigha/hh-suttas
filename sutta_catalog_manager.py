import json
import re
from pathlib import Path
import os


def load_available_suttas(suttas_dir_path):
    suttas_dir = Path(suttas_dir_path)
    available_suttas = []
    pattern = re.compile(r"mn(\d+)\.json", re.IGNORECASE)

    for file_path in suttas_dir.glob("*.json"):
        match = pattern.search(file_path.name)
        if match:
            with open(file_path, "r", encoding="utf-8") as file:
                data = json.load(file)
                key = f"mn{match.group(1)}:0.2"
                sutta_title = data.get(key)
                if sutta_title:
                    available_suttas.append(
                        {"id": f"MN {match.group(1)}", "title": sutta_title}
                    )

    available_suttas.sort(key=lambda x: int(x["id"][2:]))
    return available_suttas


def generate_corresponding_files_list(available_suttas, output_file):
    files_to_cache = []

    directories_to_cache = ["./images", "./js"]
    for directory in directories_to_cache:
        for root, _, files in os.walk(directory):
            for file in files:
                files_to_cache.append(os.path.join(root, file)[2:])  # Remove './'

    for sutta in available_suttas:
        formatted_sutta_id = sutta["id"].split()[1].lower()
        files_to_cache.extend(
            [
                f"suttas/html/mn/mn{formatted_sutta_id}_html.json",
                f"suttas/comment/mn/mn{formatted_sutta_id}_comment.json",
                f"suttas/root/mn/mn{formatted_sutta_id}_root-pli-ms.json",
                f"suttas/translation_en/mn/mn{formatted_sutta_id}.json",
            ]
        )

    with open(output_file, "w", encoding="utf-8") as out_file:
        json.dump(files_to_cache, out_file, ensure_ascii=False, indent=4)


# Main execution
if __name__ == "__main__":
    suttas_dir_path = "suttas/translation_en/mn"
    available_suttas = load_available_suttas(suttas_dir_path)
    if available_suttas:
        with open("available_suttas.json", "w", encoding="utf-8") as out_file:
            json.dump(
                {"available_suttas": available_suttas},
                out_file,
                ensure_ascii=False,
                indent=4,
            )
        generate_corresponding_files_list(available_suttas, "files_to_cache.json")
