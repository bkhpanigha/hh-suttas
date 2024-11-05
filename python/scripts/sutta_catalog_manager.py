from collections import defaultdict
import json, re, os
import unicodedata
from pathlib import Path
import subprocess

available_suttas_path = './python/generated/available_suttas.json'
files_to_cache_path = './python/generated/files_to_cache.json'

config = {
    "vagga_books": {"iti": 11, "snp": 5, "ud": 8},  # Vaggas in the KN collection
    "no_vagga_books": ["thag", "dhp", "thig"],
    "subsection_books": {"an": 11, "sn": 56},  # Subsections in SN and AN collections
}

def get_git_date_added(file_path):
    """Fetch the date when the file was first added in the Git repository."""
    try:
        # Run git log to get the first commit date of the file
        result = subprocess.run(
            ["git", "log", "--follow", "--diff-filter=A", "--format=%cd", "--date=iso-strict", "-n", "1", file_path],
            capture_output=True, text=True, check=True
        )
        return result.stdout.strip()  # Return the date in ISO 8601 format (YYYY-MM-DDTHH:MM:SS)
    except subprocess.CalledProcessError:
        return None  # Return None if any error occurs (e.g., file not tracked in git)


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
    sutta_title = data.get(key).rstrip()
    if sutta_title:
        with open("authors.json", "r", encoding='utf-8') as authors, open("suttas/translation_en/headings.json", "r", encoding='utf-8') as headings:
            author = json.load(authors).get(f"{match.group(1)}{match.group(2)}")
            heading = json.load(headings).get(f"{match.group(1)}{match.group(2)}")
            first_group = match.group(1)
            
            html_path, root_path, translation_path, comment_path, date_added = generate_paths_for_sutta(f"{match.group(1)}{match.group(2)}", "./suttas").values()
            
            if root_path:
                
                with open(root_path, "r", encoding='utf-8') as pali_lines:
                  
                    pali_title = json.load(pali_lines).get(key)
                    pali_title = ''.join([char for char in pali_title if char.isalpha()]) #extract letters only
                    pali_title = ''.join(c for c in unicodedata.normalize('NFD', pali_title) if unicodedata.category(c) != 'Mn') #convert pali letters to latin letters
                    

            if first_group.upper() in ["MN", "AN", "SN", "DN"]:
                book = first_group.upper() 
            else:
                book = first_group.capitalize()

        # Have a no space version for the lookup
        citation_key = f"{book}{match.group(2)}".lower()
        sutta_id = f"{book} {match.group(2)}"

        # NOTE: if available_suttas.json get too big due to the file paths we can
        # pass the dir structure at the top level instead
        sutta_info = {
            "id": sutta_id,
            "title": sutta_title,
            "pali_title": pali_title,
            "html_path": html_path,
            "root_path": root_path,
            "translation_path": translation_path,
            "comment_path": comment_path,
            "date_added": date_added,
        }
        if author:
            sutta_info["author"] = author
        if heading:
            sutta_info["heading"] = heading
        available_suttas[citation_key] = sutta_info

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
                                if book == "iti":
                                    key = f"{match.group(1)}{match.group(2)}:0.4"  # Key for title in Itivuttaka texts
                                else:
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


    sorted_available_suttas = {id: available_suttas[id] for id in sorted(available_suttas, key=lambda citation: sort_key(available_suttas[citation]['id']))}

    return sorted_available_suttas

# Helper function to extract sorting key
def sort_key(id):
    prefix, number = id.split()
    parts = number.split('-')[0].split('.')  # Consider only the part before any hyphen and split on '.'
    
    # Convert each part to integer for proper numerical comparison
    parts = [int(part) for part in parts]
    
    # Return a tuple for comparison, including prefix for primary sorting
    return ({"DN": 0, "MN": 1, "SN": 2, "AN": 3}.get(prefix, 4), parts)

def generate_paths_for_sutta(sutta_id, base_dir="suttas"):
    """Generate file paths for a given sutta, taking into account special structures and adding the git date."""
    sutta_id = sutta_id.lower()
    book, number = split_id(sutta_id)

    # Base paths for different categories of files
    base_paths = {
        "html": Path(base_dir) / "html",
        "root": Path(base_dir) / "root",
        "translation": Path(base_dir) / "translation_en",
        "comment": Path(base_dir) / "comment"
    }

    # Adjust directory structure based on book type
    if book in ["snp", "ud"]:
        vagga_number = number.split('.')[0]
        vagga = f"vagga{vagga_number}"
        for key in base_paths:
            base_paths[key] = base_paths[key] / "kn" / book / vagga
    elif book == "iti":
        vagga_number = int(number[0]) + 1
        vagga = f"vagga{vagga_number}"
        print(vagga)
        for key in base_paths:
            base_paths[key] = base_paths[key] / "kn" / "iti" / vagga
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

    # Initialize the paths dictionary
    paths = {
        "html_path": None,
        "root_path": None,
        "translation_path": None,
        "comment_path": None,
        "date_added": None  # New field for storing the date added
    }

    # Determine file paths
    html_path = base_paths["html"] / f"{sutta_id}_html.json"
    root_path = base_paths["root"] / f"{sutta_id}_root-pli-ms.json"
    translation_path = base_paths["translation"] / f"{sutta_id}_translation-en-anigha.json"
    comment_path = base_paths["comment"] / f"{sutta_id}_comment-en-anigha.json"

    # Check if the "translation" file exists before adding paths
    if translation_path.exists():
        # Only add paths if the "translation" file exists
        paths["html_path"] = str(html_path) if html_path.exists() else None
        paths["root_path"] = str(root_path) if root_path.exists() else None
        paths["translation_path"] = str(translation_path)
        paths["comment_path"] = str(comment_path) if comment_path.exists() else None

        # Add the date from git history
        paths["date_added"] = get_git_date_added(translation_path)
    if "snp" in paths: print(paths)
    return paths


def generate_corresponding_files_list(available_suttas):
    files_to_cache = []

    # Directories to cache
    directories_to_cache = ["./images", "./js", "./"]
    files_to_cache = []

    for directory in directories_to_cache:
        if directory == "./":
            for file in os.listdir(directory):
                file_path = os.path.join(directory, file)
                if os.path.isfile(file_path) and 'git' not in file_path:
                    # Check if the file has a name and an extension to not cache unneeded system files
                    if '.' in file and file.rsplit('.', 1)[0] and file.rsplit('.', 1)[1]:
                        files_to_cache.append(os.path.relpath(file_path, '.'))

        else:
            for root, _, files in os.walk(directory):
                if 'git' not in root:
                    files_to_cache.extend([os.path.relpath(os.path.join(root, file), '.') for file in files])

    # Generate paths for each sutta using the refined function
    for sutta_details in available_suttas.values():
        sutta_paths = [sutta_details["html_path"], sutta_details["root_path"], sutta_details["translation_path"]]
        if sutta_details["comment_path"]:
            sutta_paths.append(sutta_details["comment_path"])
        files_to_cache.extend(sutta_paths)

    files_to_cache.sort()
    with open(files_to_cache_path, "w", encoding="utf-8") as out_file:
        json.dump(files_to_cache, out_file, ensure_ascii=False, indent=4)

# Main execution
if __name__ == "__main__":
    suttas_base_dir = "suttas"
    available_suttas = load_available_suttas(suttas_base_dir)
    if available_suttas:
        with open(available_suttas_path, "w", encoding="utf-8") as out_file:
            json.dump({"available_suttas": available_suttas}, out_file, ensure_ascii=False, indent=4)
        generate_corresponding_files_list(available_suttas)
