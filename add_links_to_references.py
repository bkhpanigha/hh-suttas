#Add links to reference to other existing sutta translations in comments

import os
import json
import re

# Paths of the directories
translation_dir = "suttas/translation_en"
comment_dir = "suttas/comment"

# Step 1: Retrieve the translated suttas
def get_translated_suttas(translation_dir):
    translated_suttas = set()
    
    for root, _, files in os.walk(translation_dir):
        for file in files:
            if file.endswith("_translation-en-anigha.json"):
                # Normalize the reference for storage
                sutta_reference = file.split('_translation-en')[0].replace(" ", "").lower()
                translated_suttas.add(sutta_reference)  # Add in lowercase

    return translated_suttas

# Step 2: Read the comments and modify the references
def process_comments(comment_dir, translated_suttas):
    for root, _, files in os.walk(comment_dir):
        for file in files:
            if file.endswith("_comment-en-anigha.json"):
                with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                    comments = json.load(f)

                modified_comments = {}
                modified = False  # Flag to track modifications
                
                for key, value in comments.items():
                    # Replace unrelated references
                    modified_value = replace_references(value, translated_suttas)
                    modified_comments[key] = modified_value
                    
                    # Check if any modification has occurred
                    if modified_value != value:
                        modified = True
                
                # Write the modified comments to the file only if modifications occurred
                if modified:
                    with open(os.path.join(root, file), 'w', encoding='utf-8') as f:
                        json.dump(modified_comments, f, ensure_ascii=False, indent=2)
                        print(f"File {f.name} modified.")

# Function to replace references in the text
def replace_references(text, translated_suttas):
    # Regex to capture sutta references that are not surrounded by brackets
    pattern = r'\b(AN|an|DN|dn|MN|mn|SN|sn|SNP|snp|THAG|Thag|thag)\s?(\d+[.\d+-]*)\b(?!\])'
    
    def replace_match(match):
        ref = match.group(0)
        normalized_ref = ref.replace(" ", "").lower()  # Normalization
        
        # Check if the reference is already in link form
        if re.search(r'\[{}\]'.format(re.escape(ref)), text):
            return ref  # Return unchanged if already linked

        # Check if the reference is in a link (type "https://suttas.hillsidehermitage.org/?q=")
        if re.search(r'https://suttas\.hillsidehermitage\.org/\?q={}'.format(re.escape(normalized_ref)), text):
            return ref  # Return unchanged if already linked

        # Check if the reference is in the set of available translations
        if normalized_ref in translated_suttas:
            # Create the link
            return f"[{ref}](https://suttas.hillsidehermitage.org/?q={normalized_ref})"
        
        return ref  # Return the reference unchanged if not translated
    
    # Apply the regex to replace the references
    return re.sub(pattern, replace_match, text)

def main():
    translated_suttas = get_translated_suttas(translation_dir)
    process_comments(comment_dir, translated_suttas)
