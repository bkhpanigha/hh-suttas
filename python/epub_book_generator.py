#need to modify the folders/files path
#need to add css style #toc a{text-decoration: none} (see Not working part in code)

import os
import re
from ebooklib import epub

# Function to extract chapters and titles from the nav.xhtml file
def extract_chapters(nav_file):
    toc_entries = []

    # Read the nav.xhtml file
    with open(nav_file, 'r', encoding='utf-8') as file:
        content = file.read()

    # Add the first entry pointing to the ToC itself
    toc_entries.append(('Table of Contents', 'nav.xhtml'))

    # Regex to find chapters and their titles
    chapter_pattern = re.compile(r'<h2><a href="([^"]+)">([^<]+)</a></h2>\s*<ol>(.*?)</ol>', re.DOTALL)
    sub_chapter_pattern = re.compile(r'<li>\s*<a href="([^"]+)">([^<]+)</a>\s*</li>')

    # Find chapters and their sub-chapters
    for match in chapter_pattern.finditer(content):
        chapter_link, chapter_title, ol_content = match.groups()
        toc_entries.append((chapter_title, chapter_link))

        # Find sub-chapters in the ordered list
        for sub_match in sub_chapter_pattern.finditer(ol_content):
            sub_chapter_link, sub_chapter_title = sub_match.groups()
            toc_entries.append((sub_chapter_title, sub_chapter_link))

    return toc_entries

# Function to create the ebook
def create_ebook(toc_entries, output_file):
    book = epub.EpubBook()

    # Set the metadata for the ebook
    book.set_title('Sutta Translations')
    book.set_language('en')
    book.add_author('')

    spine_items = []  # To store the chapters to add to the spine

    for title, href in toc_entries:
        chapter_file_path = href

        # Create a new chapter
        chapter = epub.EpubHtml(title=title, file_name=chapter_file_path, lang='en')

        # Add the content of the chapter
        with open(chapter_file_path, 'r', encoding='utf-8') as file:
            content = file.read()
            chapter.set_content(content)

        # Add the chapter to the ebook
        book.add_item(chapter)
        spine_items.append(chapter)  # Add the chapter to the spine
    
    # Configure the style of every xhtml files
    style = """
    #toc a { text-decoration: none; }
    """
    css_item = epub.EpubItem(uid="style", file_name="style.css", media_type="text/css", content=style)
    book.add_item(css_item)
    
    # Add CSS to chapters
    for item in spine_items:
        item.add_link(href='style.css', rel='stylesheet', type='text/css')
    
    # Configure the ToC
    #book.toc = (epub.Link('nav.xhtml', 'Table of Contents', 'toc'),)
    book.toc += tuple(epub.Link(href, title, title) for title, href in toc_entries)

    # Configure the spine
    book.spine = spine_items  # Ensure the spine has content
    
    book.add_item(epub.EpubNcx())

    # Save the ebook
    epub.write_epub(output_file, book)

if __name__ == "__main__":
    nav_file = 'nav.xhtml'  # Path to the nav.xhtml file
    output_file = 'sutta_translations.epub'  # Output path for the ebook

    # Extract chapters and create the ebook
    chapters = extract_chapters(nav_file)
    create_ebook(chapters, output_file)

    print(f"Ebook '{output_file}' created successfully.")
