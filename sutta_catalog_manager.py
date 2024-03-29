import json, re, os
from pathlib import Path

config = {
    "vagga_books": {"iti": 11, "snp": 4, "ud": 8},  # Vaggas in the KN collection
    "subsection_books": {"an": 11, "sn": 56},  # Subsections in SN and AN collections
}

def load_json(file_path):
    """Utility function to load a JSON file."""
    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)

def add_sutta(available_suttas, match, data, key):
    """Extract sutta title from data and add it to the list if present."""
    sutta_title = data.get(key)
    if sutta_title:
        first_group = match.group(1)
        sutta_id = ""
        if first_group.upper() in ["MN", "AN", "SN", "DN"]:
            sutta_id = f"{first_group.upper()} {match.group(2)}"
            
        else:
            sutta_id = f"{first_group.capitalize()} {match.group(2)}"
            
        available_suttas.append({"id": sutta_id, "title": sutta_title})     

def load_available_suttas(suttas_base_dir):
    """Load available suttas from the specified directory."""
    available_suttas = []
    pattern = re.compile(r"(mn|sn|an|dn|snp|dhp|iti|ud|thag|thig)(\d+(\.\d+)?)\.json", re.IGNORECASE)
    base_path = Path(suttas_base_dir) / 'translation_en'

    # Check each Nikaya or collection
    for nikaya_dir in base_path.iterdir():
        if nikaya_dir.is_dir():
            # Handle special structure for SN and AN, which are divided into subsections
            if nikaya_dir.name in config["subsection_books"]:
                for subsection in range(1, config["subsection_books"][nikaya_dir.name] + 1):
                    subsection_path = nikaya_dir / f"{nikaya_dir.name}{subsection}"
                    for file_path in subsection_path.glob("*.json"):
                        match = pattern.match(file_path.name)
                        if match:
                            data = load_json(file_path)
                            key = f"{match.group(1)}{match.group(2)}:0.3"  # Key for title in SN and AN
                            add_sutta(available_suttas, match, data, key)
            # Handle special structure for texts in the KN collection
            elif nikaya_dir.name == 'kn':
                for book in config["vagga_books"]:
                    book_path = nikaya_dir / book
                    for vagga_number in range(1, config["vagga_books"][book] + 1):
                        vagga_path = book_path / f"vagga{vagga_number}"
                        for file_path in vagga_path.glob("*.json"):
                            match = pattern.match(file_path.name)
                            if match:
                                data = load_json(file_path)
                                key = f"{match.group(1)}{match.group(2)}:0.2"  # Key for title in KN texts
                                add_sutta(available_suttas, match, data, key)
            else:
                # Direct handling for MN, DN, and other texts not requiring special structure
                for file_path in nikaya_dir.glob("*.json"):
                    match = pattern.match(file_path.name)
                    if match:
                        data = load_json(file_path)
                        key = f"{match.group(1)}{match.group(2)}:0.2"  # Key for title in MN, DN
                        add_sutta(available_suttas, match, data, key)

    # Sort the list for consistency
    available_suttas.sort(key=lambda x: (x["id"].split()[0], float(x["id"].split()[1]) if '.' in x["id"].split()[1] else int(x["id"].split()[1])))
    return available_suttas

def generate_paths_for_sutta(sutta_id, base_dir="suttas"):
    """Generate file paths for a given sutta, taking into account special structures."""
    book, number = sutta_id.split()
    dir_prefix = book.lower()
    formatted_sutta_id = number

    # Base paths for different categories of files
    base_paths = {
        "html": Path(base_dir) / "html",
        "root": Path(base_dir) / "root-pli-ms",
        "translation": Path(base_dir) / "translation_en"
    }

    # Special handling for "Snp", "Ud", and "Iti" books within "kn" folder
    if book in ["Snp", "Ud", "Iti"]:
        vagga_number = number.split('.')[0]
        vagga = f"vagga{vagga_number}"
        for key in base_paths:
            print(vagga)
            base_paths[key] = base_paths[key] / "kn" / dir_prefix / vagga
    # Handling for "SN" and "AN" that are divided into subsections
    elif book in ["SN", "AN"]:
        subsection_number = number.split('.')[0]
        subsection = f"{dir_prefix}{subsection_number}"
        for key in base_paths:
            base_paths[key] = base_paths[key] / dir_prefix / subsection
    else:
        for key in base_paths:
            base_paths[key] = base_paths[key] / dir_prefix

    # Construct file paths
    paths = [
        base_paths["html"] / f"{dir_prefix}{formatted_sutta_id}.json",
        base_paths["root"] / f"{dir_prefix}{formatted_sutta_id}.json",
        base_paths["translation"] / f"{dir_prefix}{formatted_sutta_id}.json",
    ]

    # Add comment file path if exists (assuming a common comment directory structure)
    comment_path = Path(base_dir) / "comment" / f"{dir_prefix}{formatted_sutta_id}.json"
    if comment_path.exists():
        paths.append(comment_path)

    return [str(path) for path in paths]

def generate_corresponding_files_list(available_suttas, output_file):
    files_to_cache = []

    # Directories to cache
    directories_to_cache = ["./images", "./js"]
    for directory in directories_to_cache:
        for root, _, files in os.walk(directory):
            files_to_cache.extend([os.path.relpath(os.path.join(root, file), '.') for file in files])

    # Generate paths for each sutta using the refined function
    for sutta in available_suttas:
        files_to_cache.extend(generate_paths_for_sutta(sutta["id"], "./suttas"))

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
        elif book in ["SN", "AN"]:
            subsection = book.lower()+ str(formatted_sutta_id.split(".")[0])
            paths = [
                f"suttas/html/{dir_prefix}/{subsection}/{dir_prefix}{formatted_sutta_id}_html.json",
                f"suttas/root/{dir_prefix}/{subsection}/{dir_prefix}{formatted_sutta_id}_root-pli-ms.json",
                f"suttas/translation_en/{dir_prefix}/{subsection}/{dir_prefix}{formatted_sutta_id}.json",
            ]
            print(paths)
            comment_json_path = f"suttas/comment/{dir_prefix}/{subsection}/{dir_prefix}{formatted_sutta_id}_comment.json"
            if os.path.exists(comment_json_path):
                paths.append(comment_json_path)
            files_to_cache.extend(paths)
        elif book in ["Snp", "Ud", "Iti"]:
            vagga = "vagga" + str(formatted_sutta_id.split(".")[0])
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