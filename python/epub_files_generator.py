import re
import os
import json
from collections import OrderedDict

# Folder containing the .xhtml files
folder = 'suttas_epub/xhtml'

# List of URLs and their replacements
url_replacements = {
    "https://www.hillsidehermitage.org/wp-content/uploads/2023/06/The-Meaning-of-Yoniso-Manasikara-Bhikkhu-Anigha.pdf": "Essay “The Meaning Of Yoniso Manasikara”",
    "https://www.hillsidehermitage.org/sila-is-samadhi/": "Essay “Sila is Samadhi”",
    "https://www.hillsidehermitage.org/seeing-a-body-within-the-body/": "Essay “Seeing a Body within the Body”",
    "https://www.hillsidehermitage.org/what-the-jhanas-actually-are/": "Essay “What the Jhanas actually are”",
    "https://www.hillsidehermitage.org/the-nature-of-ignorance/": "Essay “The Nature of Ignorance”",
    "https://www.hillsidehermitage.org/pervading-the-world-with-friendliness/": "Essay “Pervading the World with Friendliness”",
    "https://www.hillsidehermitage.org/restraining-the-senses/": "Essay “Restraining the Senses”",
    "https://www.hillsidehermitage.org/unyoked-from-biology/": "Essay “Unyoked from Biology”",
    "https://www.hillsidehermitage.org/the-cues-of-the-mind/": "Essay “The Cues of the Mind”",
    "https://www.hillsidehermitage.org/developing-stream-entry/": "Essay “Developing Stream Entry”",
    "https://www.hillsidehermitage.org/stepwise-training/": "Essay “Stepwise Training”",
    "https://www.hillsidehermitage.org/seeing-beneath-the-surface/":"Essay “Seeing Beneath the Surface”",
    "https://www.hillsidehermitage.org/theres-no-love-in-loving-kindness/":"Essay “There's No Love in Loving-Kindness”",
    "https://www.hillsidehermitage.org/the-danger-contemplation/":"Essay “The Danger Contemplation”",
    "https://www.hillsidehermitage.org/peripheral-awareness/":"Essay “Peripheral Awareness”",
    "https://www.hillsidehermitage.org/the-necessity-of-celibacy/":"Essay “The Necessity of Celibacy”",
    "https://www.hillsidehermitage.org/intentions-behind-ones-actions/":"Essay “Intentions Behind One's Actions”",
    "https://www.hillsidehermitage.org/breathing-towards-death/":"Essay “Breathing Towards Death”",
    "https://www.hillsidehermitage.org/notes-on-meditation/":"Essay “Notes on Meditation”",
    "https://www.hillsidehermitage.org/feelings-are-suffering/":"Essay “Feelinds Are Suffering”",
    "https://www.hillsidehermitage.org/existence-means-control/":"Essay “Existence Means Control”",
    "https://www.hillsidehermitage.org/with-birth-death-applies/":"Essay “with Birth, Death Applies”",
    "https://www.hillsidehermitage.org/appearance-and-existence/":"Essay “Appearance and Existence”",
    "https://www.hillsidehermitage.org/papanca-sanna-sankha/":"Essay “Papañca-Saññā-Sankhā”",
    "https://www.hillsidehermitage.org/the-infinity-of-the-mind-notes-on-an-1-51/":"Essay “The Infinity of The Mind (Notes on AN 1.51)”",
    "https://www.hillsidehermitage.org/not-perceiving-the-feeling-notes-on-mn-43/":"Essay “Not Perceiving the Feeling (Notes on MN 43)”",
    "https://www.hillsidehermitage.org/resistance-and-designation-notes-on-dn-15/":"Essay “Resistance and Designation (Notes on DN 15)”",
    "https://www.hillsidehermitage.org/determining-determinations/":"Essay “Determining Determinations”",
    "https://www.hillsidehermitage.org/wp-content/uploads/2022/07/Uproot-Assumptions-Uproot-Suffering_Thaniyo.pdf":"Essay “Uproot Assumptions, Uproot Suffering”",
    "https://www.hillsidehermitage.org/going-through-dukkha/":"Essay “Going Through Dukkha”",
    "https://www.hillsidehermitage.org/fixed-views-vs-unfixed-certainties/":"Essay “Fixed Views VS Unfixed Certainties”",
    "https://www.hillsidehermitage.org/living-under-an-authority/":"Essay “Living Under An Authority”",
    "https://www.hillsidehermitage.org/straightening-of-crookendness/":"Essay “Straightening of Crookedness”",
    "https://www.hillsidehermitage.org/new-book-jhana/": "Book “The Only Way to Jhana”",
    "https://www.hillsidehermitage.org/meanings/": "Book “Meanings”",
    "https://www.hillsidehermitage.org/dwr/": "Book “Dhamma Within Reach”"
}

# Function to load a JSON file
def load_json(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f, object_pairs_hook=OrderedDict)

# Function to generate XHTML content with references to comments
def generate_xhtml(sutta_html, sutta_translation, sutta_comments, chapter):
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
        xhtml += f"<footer><br /><h3>{chapter} - Comments</h3><hr />"
        for num, comment in comments_list:
            xhtml += f'<div id="note-{num}" epub:type="footnote"><p><a href="#noteref-{num}">{num}</a> {comment}</p></div>\n'
        xhtml += "</footer>"
        
    return xhtml

# Main function
def generate_xhtml_for_suttas():
    base_dir = 'suttas'  # Base folder for the files
    translation_dir = os.path.join(base_dir, 'translation_en')
    html_dir = os.path.join(base_dir, 'html')
    comment_dir = os.path.join(base_dir, 'comment')
    output_dir = folder  # Output folder for the XHTML files

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
                chapter = separate_letter_number(file.replace('_translation-en-anigha.json', '')).upper()
                xhtml_content = generate_xhtml(html_content, translation, comments, chapter)

                # Output path
                output_filename = file.replace('_translation-en-anigha.json', '.xhtml')
                output_filepath = os.path.join(output_dir, output_filename)

                # Write the XHTML content to the file
                with open(output_filepath, 'w', encoding='utf-8') as output_file:
                    output_file.write(xhtml_content)

                print(f"Generated XHTML for {file}")

def separate_letter_number(string):
    return re.sub(r'([A-Za-z])([0-9])', r'\1 \2', string)

def transform_text(text, filename):
    chapter = separate_letter_number(filename).replace(".xhtml", "").upper()
    
    # Add the header of the xhtml file
    header = "<!DOCTYPE html>"
    header += "<html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:epub=\"http://www.idpf.org/2007/ops\" xml:lang=\"en\" lang=\"en\">"
    header += "<head>"
    header += "<meta charset=\"UTF-8\"/>"
    header += "<title>" + chapter + "</title>"
    header += "</head>"
    header += "<body>"
    text = header + text
    
    # Remove only the <ul><li class='division'> element in the header, without touching other parts
    text = re.sub(r"<ul><li class='division'>.*?</ul>", "", text, flags=re.DOTALL)

    # Add sutta number in the chapter's title
    text = re.sub(r'(<h1 class=[\'"](sutta-title|range-title)[\'"]>)([^<]+)(</h1>)', r'\1' + chapter + " - " + r' \3\4', text)

    # Replace italic words
    text = re.sub(r'_(.+?)_', r'<i>\1</i>', text)
    text = re.sub(r'\*(.+?)\*', r'<i>\1</i>', text)
    
    # Replace links
    def replace_link(match):
        link_text = match.group(1).replace("“", "").replace("”", "") # Text between brackets
        url = match.group(2)
        displayed_url = "<span style=\"font-size: .70em\">" + url + "</span>"  # URL displayed with smaller font
        
        # Handle specific URLs
        if "youtube" in url:
            return f"Youtube: “{link_text}” ({displayed_url})"
        elif "suttas.hillsidehermitage.org/?q=" in url:
            sutta_number_match = re.search(r'q=([^#]+)', url)
            if sutta_number_match:
                sutta_number = sutta_number_match.group(1).replace('%20', '')  # Decode the sutta number
                return f'<a href="{sutta_number.lower()}.xhtml">{link_text}</a>'
            else:
                return link_text
        elif "reddit" in url:
            return f"Reddit Post “{link_text}” ({displayed_url})"
        elif "suttacentral" in url:
            return f"{link_text} ({displayed_url})"
        else:
            for keyword, replacement in url_replacements.items():
                if keyword in url:
                    return link_text + " → " + replacement + " (" + displayed_url + ")"

        return match.group(0)  # Return the unchanged link if no case applies

    # Replace links using the replace_link function
    text = re.sub(r'\[(.+?)\]\((.+?)\)', replace_link, text)

    # Add the closing tags of the xhtml file
    text += "</body>"
    text += "</html>"
    
    return text

def natural_sort_key(s):
    """Sort key function for natural numeric sorting."""
    return [int(t) if t.isdigit() else t for t in re.split('(\d+)', s)]

def categorize_sutta(sutta_number):
    """Determine the category of the sutta based on its prefix."""
    if re.match(r'^DN\s*\d+(\.\d+)?(-\d+)?', sutta_number, re.IGNORECASE):
        return "Dīgha Nikāya"
    elif re.match(r'^MN\s*\d+(\.\d+)?(-\d+)?', sutta_number, re.IGNORECASE):
        return "Majjhima Nikāya"
    elif re.match(r'^SN\s*\d+(\.\d+)?(-\d+)?', sutta_number, re.IGNORECASE):
        return "Saṃyutta Nikāya"
    elif re.match(r'^AN\s*\d+(\.\d+)?(-\d+)?', sutta_number, re.IGNORECASE):
        return "Aṅguttara Nikāya"
    else:
        return "Khuddaka Nikāya"

import os

def create_book_title_xhtml(book_name, book_abbr, folder):
    #Dynamic XHTML with book name
    xhtml_content = f"""<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en" lang="en">
<head>
    <meta charset="UTF-8"/>
    <title>{book_name}</title>
</head>
<body>
    <section style="height:100%" id="book-{book_abbr}">
        <div style="position: absolute; top: 50%; transform: translateY(-50%); width: 100%; text-align: center;">
            <h1>{book_name}</h1>
        </div>
    </section>
</body>
</html>"""

    # Filename based on abbr
    filename = f'book-{book_abbr}.xhtml'
    filepath = os.path.join(folder, filename)
    
    #Write file content
    with open(filepath, 'w', encoding='utf-8') as file:
        file.write(xhtml_content)

    print(f'Created file : {filepath}')

    
    
def generate_nav_file():
    # Load the data from the JSON file
    with open('available_suttas.json', 'r', encoding='utf-8') as json_file:
        suttas_data = json.load(json_file)["available_suttas"]

    # List of files to include in the table of contents
    files = sorted([f for f in os.listdir(folder) if f.endswith('.xhtml')], key=natural_sort_key)

    # Create a dictionary with books and their respective abbreviations
    books = {
        "Dīgha Nikāya": {"abbr": "dn", "suttas": []},
        "Majjhima Nikāya": {"abbr": "mn", "suttas": []},
        "Saṃyutta Nikāya": {"abbr": "sn", "suttas": []},
        "Aṅguttara Nikāya": {"abbr": "an", "suttas": []},
        "Khuddaka Nikāya": {"abbr": "kn", "suttas": []}
    }

    # Loop through the files to categorize suttas
    for file in files:
        if file == "nav.xhtml" or file.startswith("book"):
            continue
        sutta_number = file.replace(".xhtml", "").replace(" ", "")
        category = categorize_sutta(sutta_number)
        books[category]["suttas"].append(file)

    # Sort suttas within each book naturally
    for book_data in books.values():
        book_data["suttas"].sort(key=natural_sort_key)

    # Generate the XHTML code
    xhtml = '<html>\n'
    xhtml += '  <head>\n'
    xhtml += '    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />\n'
    xhtml += '    <meta content="text/css" http-equiv="Content-Style-Type" />\n'
    xhtml += '    <title>Sutta Translations</title>\n'
    xhtml += '  </head>\n'
    xhtml += '  <body id="toc">\n'
    xhtml += '    <div>\n'
    xhtml += '      <h1>Table of Contents</h1>\n'

    # Loop through the chapters to create the sorted list of suttas
    for book, book_data in books.items():
        # Get the book abbreviation
        book_abbr = book_data["abbr"]
        
        #Create the xhtml file containing the book title
        create_book_title_xhtml(book, book_abbr, folder)

        # Add the book header with a link
        xhtml += f'      <h2><a href="book-{book_abbr}.xhtml">{book}</a></h2>\n'
        xhtml += '      <ol>\n'

        for file in book_data["suttas"]:
            sutta_number = file.replace(".xhtml", "").replace(" ", "")

            # Retrieve sutta information from the JSON data
            sutta_info = suttas_data.get(sutta_number.lower(), {})
            title = sutta_info.get('title', '')
            heading = sutta_info.get('heading', '')
            sutta_number = separate_letter_number(sutta_number).upper()

            # Create the string with sutta_number, title, and heading (if available)
            title_heading_str = f'{sutta_number} - {title}' + (f' ({heading})' if heading else '')
            xhtml += f'        <li>\n'
            xhtml += f'          <a href="{file}">{title_heading_str}</a>\n'
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
        if filename.endswith('.xhtml') and not filename.startswith("book"):
            input_file_path = os.path.join(folder, filename)
            with open(input_file_path, 'r', encoding='utf-8') as file:
                content = file.read()

            modified_content = transform_text(content, filename)

            output_file_path = os.path.join(folder, filename)
            with open(output_file_path, 'w', encoding='utf-8') as file:
                file.write(modified_content)
                print(f"Formatted XHTML for {filename}")
    
    generate_nav_file()
    print("Process Finished")
