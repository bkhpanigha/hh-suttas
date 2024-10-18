#Add links to reference to other existing sutta translations in comments

import os
import json
import re

# Paths of the directories
translation_dir = "suttas/translation_en"
comment_dir = "suttas/comment"

# Step 1: Retrieve the translated suttas
def get_translated_suttas(translation_dir):
    return {file.split('_translation-en')[0].replace(" ", "").lower()
            for _, _, files in os.walk(translation_dir)
            for file in files if file.endswith("_translation-en-anigha.json")}

# Step 2: Process comments and modify references
def process_comments(comment_dir, translated_suttas):
    for root, _, files in os.walk(comment_dir):
        for file in files:
            if file.endswith("_comment-en-anigha.json"):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    comments = json.load(f)

                modified = False
                for key, value in comments.items():
                    modified_value = replace_references(value, translated_suttas)
                    if modified_value != value:
                        comments[key] = modified_value
                        modified = True

                if modified:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        json.dump(comments, f, ensure_ascii=False, indent=2)
                        print(f"File {filepath} modified.")

# Function to replace references in the text
def replace_references(text, translated_suttas):
    # Regex pattern to match references not inside square brackets
    pattern = r'(?<!\[)\b(AN|an|DN|dn|MN|mn|SN|sn|SNP|snp|THAG|Thag|thag)\s?(\d+[.\d+-]*)\b(?!\])'
    
    def replace_match(match):
        ref = match.group(0)
        normalized_ref = ref.replace(" ", "").lower()

        # Check if reference is already linked or translated
        if re.search(r'https://suttas\.hillsidehermitage\.org/\?q={}'.format(re.escape(ref)), text):
            return ref
        return f"[{ref}](https://suttas.hillsidehermitage.org/?q={normalized_ref})" if normalized_ref in translated_suttas else ref

    return re.sub(pattern, replace_match, text)

# Main execution
if __name__ == "__main__":
    translated_suttas = get_translated_suttas(translation_dir)
    process_comments(comment_dir, translated_suttas)
