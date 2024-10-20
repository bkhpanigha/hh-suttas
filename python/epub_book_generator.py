import xml.etree.ElementTree as ET
from ebooklib import epub

xhtml_dir = "../suttas_epub/xhtml/"

# Créer un nouvel ebook
book = epub.EpubBook()
book.set_title('Sutta translations')
book.add_author('')

# Parse du fichier nav.xhtml pour obtenir l'ordre des chapitres
tree = ET.parse(xhtml_dir + 'nav.xhtml')
root = tree.getroot()

# Rechercher les balises <a> dans le fichier nav.xhtml et extraire les chapitres
chapters = []
for link in root.iter('a'):
    href = xhtml_dir + link.attrib.get('href')
    title = link.text.strip() if link.text else 'Chapitre sans titre'

    # Créer un chapitre pour chaque lien trouvé
    with open(href, 'r', encoding='utf-8') as chapter_file:
        chapter_content = chapter_file.read()

    chapitre = epub.EpubHtml(title=title, file_name=href, content=chapter_content)
    book.add_item(chapitre)
    chapters.append(chapitre)

# Définir la table des matières et la mise en ordre des chapitres
book.toc = tuple(chapters)
book.spine = ['nav'] + chapters

# Ajouter les ressources obligatoires
book.add_item(epub.EpubNcx())
book.add_item(epub.EpubNav())

# Enregistrer l'ebook
epub.write_epub('Sutta_Translations.epub', book, {})
