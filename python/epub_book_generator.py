from ebooklib import epub

# Create new ebook
book = epub.EpubBook()

# Define title and author
book.set_title('Titre de l\'ebook')
book.add_author('Auteur')

# Add a chapter from a xhtml file
with open('fichier.xhtml', 'r', encoding='utf-8') as f:
    content = f.read()

chapitre = epub.EpubHtml(title='Chapitre 1', file_name='chap1.xhtml', content=content)
book.add_item(chapitre)

# Define Table of Contents and chapters order
book.toc = (epub.Link('chap1.xhtml', 'Chapitre 1', 'chap1'),)
book.spine = ['nav', chapitre]

# Add mandatory ressources
book.add_item(epub.EpubNcx())
book.add_item(epub.EpubNav())

# Save ebook
epub.write_epub('output.epub', book, {})
