import re
import os
import json
from collections import OrderedDict

# Folder containing the .xhtml files
folder = 'suttas_epub'

# List of URLs and their replacements
url_replacements = {
    "https://www.hillsidehermitage.org/wp-content/uploads/2023/06/The-Meaning-of-Yoniso-Manasikara-Bhikkhu-Anigha.pdf": "See essay: The Meaning Of Yoniso Manasikara",
    "https://www.hillsidehermitage.org/sila-is-samadhi/": "See essay: Sila is Samadhi",
    "https://www.hillsidehermitage.org/seeing-a-body-within-the-body/": "See essay: Seeing a Body within the Body",
    "https://www.hillsidehermitage.org/what-the-jhanas-actually-are/": "See essay: What the Jhanas actually are",
    "https://www.hillsidehermitage.org/the-nature-of-ignorance/": "See essay: The Nature of Ignorance",
    "https://www.hillsidehermitage.org/pervading-the-world-with-friendliness/": "See essay: Pervading the World with Friendliness",
    "https://www.hillsidehermitage.org/restraining-the-senses/": "See essay: Restraining the Senses",
    "https://www.hillsidehermitage.org/unyoked-from-biology/": "See essay: Unyoked from Biology",
    "https://www.hillsidehermitage.org/the-cues-of-the-mind/": "See essay: The Cues of the Mind",
    "https://www.hillsidehermitage.org/developing-stream-entry/": "See essay: Developing Stream Entry",
    "https://www.hillsidehermitage.org/stepwise-training/": "See essay: Stepwise Training"
}

# Function to load a JSON file
def load_json(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f, object_pairs_hook=OrderedDict)

# Function to generate XHTML content with references to comments
def generate_xhtml(sutta_html, sutta_translation, sutta_comments):
    xhtml = ""
    comments_list = []
    comment_number = 1
    comment_map = {}  # Map to keep track of comment numbers

    # Sort the keys to maintain order
    sorted_keys = sorted(sutta_html.keys(), key=lambda x: list(map(int, filter(str.isdigit, x.split(':')[0].replace('.', ' ').split()))))

    for key in sorted_keys:
        html_content = sutta_html[key]

        # Insert the translation into the HTML
        translated_text = sutta_translation.get(key, "")
        html_content = html_content.format(translated_text)

        # Check if there is a comment for this key
        comment = sutta_comments.get(key, "")
        if comment:
            # Assign a number to the comment
            current_number = comment_number
            comment_map[key] = current_number
            comments_list.append((current_number, comment))
            comment_number += 1

            # Create the link to the comment with a unique identifier
            reference = f'<sup class="noteref">[<a id="noteref-{current_number}" href="#note-{current_number}" epub:type="noteref">{current_number}</a>]</sup>'
            # Assume that the reference should be inserted at the end of the paragraph
            if "</p>" in html_content:
                html_content = html_content.replace("</p>", f" {reference}</p>")
            else:
                # If the HTML structure is different, insert the reference at the end
                html_content += f" {reference}"

        xhtml += html_content + "\n"

    # Add the comments section at the end
    if comments_list:
        for num, comment in comments_list:
            xhtml += f'<aside id="note-{num}" epub:type="footnote"><p><sup class="noteref"><a href="#noteref-{num}">{num}</a></sup> {comment}</p></aside>\n'

    return xhtml

# Main function
def generate_xhtml_for_suttas():
    base_dir = 'suttas'  # Base folder for the files
    translation_dir = os.path.join(base_dir, 'translation_en')
    html_dir = os.path.join(base_dir, 'html')
    comment_dir = os.path.join(base_dir, 'comment')
    output_dir = 'suttas_epub'  # Output folder for the XHTML files

    # Create the output directory if it does not exist
    os.makedirs(output_dir, exist_ok=True)

    # Iterate through the available translations
    for root, dirs, files in os.walk(translation_dir):
        for file in files:
            if file.endswith('_translation-en-anigha.json'):
                # Path to the translation
                translation_filepath = os.path.join(root, file)

                # Extract the path structure to build the corresponding HTML and comment paths
                relative_path = os.path.relpath(translation_filepath, translation_dir)
                parts = relative_path.split(os.sep)

                # Build the path for the corresponding HTML file
                html_filepath = os.path.join(html_dir, *parts).replace('_translation-en-anigha.json', '_html.json')
                if not os.path.exists(html_filepath):
                    print(f"HTML file not found for {file}")
                    continue

                # Build the path for the corresponding comment file
                comment_filepath = os.path.join(comment_dir, *parts).replace('_translation-en-anigha.json', '_comment-en-anigha.json')
                comments = {}
                if os.path.exists(comment_filepath):
                    comments = load_json(comment_filepath)

                # Load the JSON files
                translation = load_json(translation_filepath)
                html_content = load_json(html_filepath)

                # Generate the XHTML content
                xhtml_content = generate_xhtml(html_content, translation, comments)

                # Output path
                output_filename = file.replace('_translation-en-anigha.json', '.xhtml')
                output_filepath = os.path.join(output_dir, output_filename)

                # Write the XHTML content to the file
                with open(output_filepath, 'w', encoding='utf-8') as output_file:
                    output_file.write(xhtml_content)

                print(f"Generated XHTML for {file}")

def separate_letter_number(string):
    return re.sub(r'([A-Za-z])([0-9])', r'\1 \2', string)

def transform_text(text):
    # Remove only the <ul><li class='division'> element in the header, without touching other parts
    text = re.sub(r"<ul><li class='division'>.*?</li></ul>", "", text)

    # Use an expression that captures the header without removing it
    text = re.sub(r"(<article id='([^']+)'>.*?<h1 class='sutta-title'>)(.+?)(</h1>)", 
                  lambda m: f"{m.group(1)}{separate_letter_number(m.group(2)).upper()} - {m.group(3)}{m.group(4)}", text, flags=re.DOTALL)

    # Replace italic words
    text = re.sub(r'_(.+?)_', r'<i>\1</i>', text)

    # Replace links
    def replace_link(match):
        link_text = match.group(1)  # Text between brackets
        url = match.group(2)  # URL between parentheses

        # Handle specific URLs
        if "youtube" in url:
            return f"See youtube video: {link_text}"
        elif "https://suttas.hillsidehermitage.org/?q=" in url:
            sutta_number_match = re.search(r'q=([^#]+)', url)
            if sutta_number_match:
                sutta_number = sutta_number_match.group(1).replace('%20', '')  # Decode the sutta number
                return f'<a href="{sutta_number}.xhtml">{link_text}</a>'
            else:
                return link_text
        else:
            for keyword, replacement in url_replacements.items():
                if keyword in url:
                    # Check if the replacement is a string or a function
                    if callable(replacement):  # If it's a function
                        return replacement(link_text)
                    else:  # Otherwise, it's a string
                        return replacement

        return match.group(0)  # Return the unchanged link if no case applies

    # Replace links using the replace_link function
    text = re.sub(r'\[(.+?)\]\((.+?)\)', replace_link, text)

    return text

def natural_sort_key(s):
    """Sort key function for natural numeric sorting."""
    return [int(t) if t.isdigit() else t for t in re.split('(\d+)', s)]

def generate_nav_file():
    # List of files to include in the table of contents
    files = sorted([f for f in os.listdir(folder) if f.endswith('.xhtml')], key=natural_sort_key)

    # Generate the XHTML code
    xhtml = '<?xml version="1.0" encoding="utf-8"?>\n'
    xhtml += '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">\n'
    xhtml += '<html xmlns="http://www.w3.org/1999/xhtml">\n'
    xhtml += '  <head>\n'
    xhtml += '    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />\n'
    xhtml += '    <meta content="text/css" http-equiv="Content-Style-Type" />\n'
    xhtml += '    <title>Suttas Translations</title>\n'
    xhtml += '    <link href="styles/epub.css" rel="stylesheet" type="text/css" />\n'
    xhtml += '  </head>\n'
    xhtml += '  <body>\n'
    xhtml += '    <div id="toc">\n'
    xhtml += '      <h3 id="toc-title">Table of Contents</h3>\n'
    xhtml += '      <ol class="toc">\n'

    # Loop through the files to generate the links
    for i, file in enumerate(files, start=1):
        xhtml += f'        <li id="toc-li-{i}">\n'
        sutta_number = file.replace(".xhtml", "")
        sutta_number = separate_letter_number(sutta_number).upper()
        xhtml += f'          <a class="list-level-0" href="{file}">{sutta_number}</a>\n'
        xhtml += '        </li>\n'

    xhtml += '      </ol>\n'
    xhtml += '    </div>\n'
    xhtml += '  </body>\n'
    xhtml += '</html>\n'

    # Save the nav.xhtml file
    with open(os.path.join(folder, 'nav.xhtml'), 'w', encoding='utf-8') as f:
        f.write(xhtml)

# Execute the script
if __name__ == '__main__':
    generate_xhtml_for_suttas()
    
    # Process the files in the folder
    for filename in os.listdir(folder):
        if filename.endswith('.xhtml'):
            input_file_path = os.path.join(folder, filename)
            with open(input_file_path, 'r', encoding='utf-8') as file:
                content = file.read()

            modified_content = transform_text(content)

            output_file_path = os.path.join(folder, filename)
            with open(output_file_path, 'w', encoding='utf-8') as file:
                file.write(modified_content)
    
    generate_nav_file()
    print("Process Finished")
