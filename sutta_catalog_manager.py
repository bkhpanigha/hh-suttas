from collections import defaultdict
import json, re, os
import unicodedata
from pathlib import Path

config = {
    "vagga_books": {"iti": 11, "snp": 4, "ud": 8},  # Vaggas in the KN collection
    "no_vagga_books": ["thag", "dhp", "thig"],
    "subsection_books": {"an": 11, "sn": 56},  # Subsections in SN and AN collections
}

def load_json(file_path):
    """Utility function to load a JSON file."""
    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)
    
def split_id(s):
    match = re.match(r"([A-Za-z]+)(.*)", s)
    if match:
        letters, numbers = match.groups()
        return letters, numbers
    else:
        return s, ""

def add_sutta(available_suttas, match, data, key):
    """Extract sutta title from data and add it to the list if present."""
    sutta_title = data.get(key)

    if sutta_title:
        with open("authors.json", "r", encoding='utf-8') as authors, open("suttas/translation_en/headings.json", "r", encoding='utf-8') as headings:
            author = json.load(authors).get(f"{match.group(1)}{match.group(2)}")
            heading = json.load(headings).get(f"{match.group(1)}{match.group(2)}")
            first_group = match.group(1)
            
            #Extract pali title in sutta's pali file
            paths = generate_paths_for_sutta(f"{match.group(1)}{match.group(2)}", "./suttas")
            en_file_path = paths[2]
            if paths:
                with open(paths[1], "r", encoding='utf-8') as pali_lines:
                    pali_title = json.load(pali_lines).get(key)
                    pali_title = ''.join([char for char in pali_title if char.isalpha()]) #extract letters only
                    pali_title = ''.join(c for c in unicodedata.normalize('NFD', pali_title) if unicodedata.category(c) != 'Mn') #convert pali letters to latin letters
            

            if first_group.upper() in ["MN", "AN", "SN", "DN"]:
                book = first_group.upper() 
            else:
                book = first_group.capitalize()

        sutta_id = f"{book} {match.group(2)}"

        sutta_info = {
            "id": sutta_id,
            "title": sutta_title,
            "pali_title": pali_title,
            "file_path": en_file_path,
        }
        if author:
            sutta_info["author"] = author
        if heading:
            sutta_info["heading"] = heading
        available_suttas[sutta_id] = sutta_info

def load_available_suttas(suttas_base_dir):
    """Load available suttas from the specified directory."""
    available_suttas = defaultdict(dict)
    pattern = re.compile(r"(mn|sn|an|dn|snp|dhp|iti|ud|thag|thig)(\d+(\.\d+(-\d+)?)?)_translation-en-anigha\.json", re.IGNORECASE)
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
                            pattern2 = re.compile(r"(\d\.\d+)-\d+", re.IGNORECASE)
                            match2 = pattern2.match(match.group(2))
                            if match2:
                                key = f"{match.group(1)}{match2.group(1)}:0.2" 
                                
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
                for book in config["no_vagga_books"]:
                    book_path = nikaya_dir / book
                    for file_path in book_path.glob("*.json"):
                        match = pattern.match(file_path.name)
                        if match:
                            data = load_json(file_path)
                            key = f"{match.group(1)}{match.group(2)}:0.4"  # Key for title in KN texts
                            add_sutta(available_suttas, match, data, key)
            
            else:
                # Direct handling for MN, DN, and other texts not requiring special structure
                for file_path in nikaya_dir.glob("*.json"):
                    match = pattern.match(file_path.name)
                    if match:
                        data = load_json(file_path)
                        key = f"{match.group(1)}{match.group(2)}:0.2"  # Key for title in MN, DN
                        add_sutta(available_suttas, match, data, key)


    sorted_available_suttas = {id: available_suttas[id] for id in sorted(available_suttas, key=sort_key)}

    return sorted_available_suttas

# Helper function to extract sorting key
def sort_key(id):
    prefix, number = id.split()
    number = number.split('-')[0]  # Consider only the part before any hyphen
    number = float(number) if '.' in number else int(number)
    return {"DN": 0, "MN": 1, "SN": 2, "AN": 3}.get(prefix, 4), number

def generate_paths_for_sutta(sutta_id, base_dir="suttas"):
    """Generate file paths for a given sutta, taking into account special structures."""
    sutta_id = sutta_id.lower()
    book, number = split_id(sutta_id)
    
    # Base paths for different categories of files
    base_paths = {
        "html": Path(base_dir) / "html",
        "root": Path(base_dir) / "root",  # Assuming correct folder name is "root"
        "translation": Path(base_dir) / "translation_en",
        "comment": Path(base_dir) / "comment"
    }

    # Adjust directory structure based on book type
    if book in ["snp", "ud", "iti"]:
        vagga_number = number.split('.')[0]
        vagga = f"vagga{vagga_number}"
        for key in base_paths:
            base_paths[key] = base_paths[key] / "kn" / book / vagga
    elif book in ["sn", "an"]:
        subsection_number = number.split('.')[0]
        subsection = f"{book}{subsection_number}"
        for key in base_paths:
            base_paths[key] = base_paths[key] / book / subsection
    elif book in ["dhp", "thag", "thig"]:
        for key in base_paths:
            base_paths[key] = base_paths[key] / "kn" / book
    else:
        for key in base_paths:
            base_paths[key] = base_paths[key] / book

    # Initialize the paths list
    paths = []

    # Check if the "translation" file exists before adding paths
    translation_path = base_paths["translation"] / f"{sutta_id}_translation-en-anigha.json"

    if translation_path.exists():
        # Only add paths if the "translation" file exists
        paths = [
            str(base_paths["html"] / f"{sutta_id}_html.json"),
            str(base_paths["root"] / f"{sutta_id}_root-pli-ms.json"),
            str(translation_path),  # Already confirmed to exist
        ]
        # Attempt to add the comment file path if it exists
        comment_path = base_paths["comment"] / f"{sutta_id}_comment-en-anigha.json"
        if comment_path.exists():
            paths.append(str(comment_path))
    return paths

def generate_corresponding_files_list(available_suttas, output_file):
    files_to_cache = []

    # Directories to cache
    directories_to_cache = ["./images", "./js", "./"]
    for directory in directories_to_cache:
        for root, _, files in os.walk(directory):
            if 'git' not in root:
                files_to_cache.extend([os.path.relpath(os.path.join(root, file), '.') for file in files])

    # Generate paths for each sutta using the refined function
    for sutta_id in available_suttas.keys():
        files_to_cache.extend(generate_paths_for_sutta(sutta_id, "./suttas"))

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
