import json
import re
from pathlib import Path
import os

vagga_amnts = {"iti": 11, "snp": 4, "ud": 8}
def count_subdirectories(path):
    try:
        return len([name for name in os.listdir(path)
            if os.path.isdir(os.path.join(path, name))])
    except FileNotFoundError:
        return 0
def load_available_suttas(suttas_base_dir):
    pattern = re.compile(r"(mn|sn|an|dn|snp|dhp|iti|ud|thag|thig)(\d+(\.\d+)?)\.json", re.IGNORECASE)
    available_suttas = []

    for nikaya in ['mn', 'kn', 'an', 'sn', 'dn']:  # Now includes all Nikayas
        if nikaya != 'kn':
            suttas_dir_path = Path(suttas_base_dir)/ 'translation_en' / nikaya
            for file_path in suttas_dir_path.glob("*.json"):
                    match = pattern.search(file_path.name)
                    if match:
                        with open(file_path, "r", encoding="utf-8") as file:
                            data = json.load(file)
                            key = f"{match.group(1)}{match.group(2)}:0.2"
                            sutta_title = data.get(key)
                            if sutta_title:
                                available_suttas.append(
                                    {"id": f"{match.group(1).upper()} {match.group(2)}", "title": sutta_title}
                                )
        else:
            for book in ['snp', 'dhp', 'iti', 'ud', 'thag', 'thig']:
                if book not in ['snp', 'iti', 'ud']:
                    suttas_dir_path = Path(suttas_base_dir)/ 'translation_en' / nikaya / book
                    for file_path in suttas_dir_path.glob("*.json"):
                        match = pattern.search(file_path.name)
                        if match:
                            with open(file_path, "r", encoding="utf-8") as file:
                                data = json.load(file)
                                key = f"{match.group(1)}{match.group(2)}:0.2"
                                sutta_title = data.get(key)
                                if sutta_title:
                                    available_suttas.append(
                                        {"id": f"{match.group(1).upper()} {match.group(2)}", "title": sutta_title}
                                    )
                else:
                    for i in range(1, vagga_amnts[book] + 1):
                        vagga = "vagga" + str(i)
                        suttas_dir_path = Path(suttas_base_dir)/ 'translation_en' / nikaya / book / vagga
                        for file_path in suttas_dir_path.glob("*.json"):
                            match = pattern.search(file_path.name)
                         
                            if match:
                                with open(file_path, "r", encoding="utf-8") as file, open("authors.json", "r", encoding='utf-8') as authors:
                                    data = json.load(file)
                                    author = json.load(authors).get(f"{match.group(1)}{match.group(2)}")
                                    key = f"{match.group(1)}{match.group(2)}:0.2"
                                    sutta_title = data.get(key)
                                    
                                    if sutta_title:
                                        if not author:
                                            available_suttas.append(
    {"id": f"{match.group(1)[:1].upper()}{match.group(1)[1:].lower()} {match.group(2)}", "title": sutta_title})
                                        else:
                                            available_suttas.append(
    {"id": f"{match.group(1)[:1].upper()}{match.group(1)[1:].lower()} {match.group(2)}", "title": sutta_title , "author": author})

    available_suttas.sort(key=lambda x: (x["id"][:2], float(x["id"].split()[1]) if '.' in x["id"].split()[1] else int(x["id"].split()[1])))
    return available_suttas

def generate_corresponding_files_list(available_suttas, output_file):
    files_to_cache = []

    directories_to_cache = ["./images", "./js"]
    for directory in directories_to_cache:
        for root, _, files in os.walk(directory):
            for file in files:
                files_to_cache.append(os.path.join(root, file)[2:])  # Remove './'

    for sutta in available_suttas:
        dir_prefix, formatted_sutta_id = sutta["id"].split()
        dir_prefix = dir_prefix.lower()
        formatted_sutta_id = formatted_sutta_id.lower()
        book = sutta["id"].split(" ")[0]
        
        if book in ["MN", "DN"]:
            paths = [
                f"suttas/html/{dir_prefix}/{dir_prefix}{formatted_sutta_id}_html.json",
                f"suttas/root/{dir_prefix}/{dir_prefix}{formatted_sutta_id}_root-pli-ms.json",
                f"suttas/translation_en/{dir_prefix}/{dir_prefix}{formatted_sutta_id}.json",
            ]
            comment_json_path = f"suttas/comment/{dir_prefix}/{dir_prefix}{formatted_sutta_id}_comment.json"
            if os.path.exists(comment_json_path):
                paths.append(comment_json_path)

            files_to_cache.extend(paths)
        elif book in ["Snp", "Ud", "Iti"]:
            vagga = "vagga" + str(formatted_sutta_id.split(".")[0])
            print(vagga)
            paths = [
                f"suttas/html/kn/{dir_prefix}/{vagga}/{dir_prefix}{formatted_sutta_id}_html.json",
                f"suttas/root/kn/{dir_prefix}/{vagga}/{dir_prefix}{formatted_sutta_id}_root-pli-ms.json",
                f"suttas/translation_en/kn/{dir_prefix}/{vagga}/{dir_prefix}{formatted_sutta_id}.json",
            ]
            comment_json_path = f"suttas/comment/kn{dir_prefix}/{vagga}/{dir_prefix}{formatted_sutta_id}_comment.json"
            if os.path.exists(comment_json_path):
                paths.append(comment_json_path)
            files_to_cache.extend(paths)

    files_to_cache.sort()
    with open(output_file, "w", encoding="utf-8") as out_file:
        json.dump(files_to_cache, out_file, ensure_ascii=False, indent=4)

# Main execution
if __name__ == "__main__":
    suttas_base_dir = "suttas"
    available_suttas = load_available_suttas(suttas_base_dir)
    if available_suttas:
        with open("available_suttas.json", "w", encoding="utf-8") as out_file:
            json.dump({"available_suttas": available_suttas}, out_file, ensure_ascii=False, indent=4)
        generate_corresponding_files_list(available_suttas, "files_to_cache.json")
