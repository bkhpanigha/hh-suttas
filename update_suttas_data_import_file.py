import os
import re

json_directory = './suttas/translation_en'
js_suttas_data_import_file_path = 'python-generated/suttas-data-import.js'
js_import_lines_count_file_path = 'python-generated/suttas-data-import-lines-count.js'

def generate_import_lines(directory):
    import_lines = []
    import_names = []
    original_names = []

    # Walk through the directory
    for root, dirs, files in os.walk(directory):
        for file in files:
             if file.endswith('.json') and 'anigha' in file:
                # Create a valid import name
                valid_name = re.sub(r'[^a-zA-Z0-9]', '_', os.path.splitext(file)[0])
                valid_name = valid_name.lower()

                # Extract the part of the original file name before the first underscore
                original_name_part = file.split('_')[0]

                # Create the import line for each JSON file
                relative_path = os.path.relpath(os.path.join(root, file), start=os.path.dirname(js_suttas_data_import_file_path))
                relative_path = relative_path.replace('\\', '/')
                import_statement = f"import {valid_name} from \"./{relative_path}\" with {{ type: \"json\" }};"
                import_lines.append(import_statement)

                # Save valid name and the part of the original file name for export
                import_names.append(valid_name)
                original_names.append(original_name_part)

    return import_lines, import_names, original_names

def add_imports_to_js(js_file_path, import_lines, import_names, original_names):
    with open(js_file_path, 'w') as file:
        for line in import_lines:
            file.write(line + '\n')

        if import_names and original_names: 
            # Use the original file name part as the property and valid_name as the value
            export_statements = [f'"{original_names[i]}": {import_names[i]}' for i in range(len(import_names))]
            export_statement = f"\nconst suttasData = {{{', '.join(export_statements)}}};\nexport default suttasData;\n"
            file.write(export_statement)

def add_import_lines_count_to_js(js_file_path, import_lines):
    with open(js_file_path, 'w') as count_file:
        count_file.write(f"const importLinesCount = {len(import_lines)};\n")
        count_file.write(f"export default importLinesCount;\n")

if __name__ == "__main__":
    import_lines, import_names, original_names = generate_import_lines(json_directory)
    add_imports_to_js(js_suttas_data_import_file_path, import_lines, import_names, original_names)
    add_import_lines_count_to_js(js_import_lines_count_file_path, import_lines)
    print(f"Added {len(import_lines)} import statements to {js_suttas_data_import_file_path}.")
    print(f"Added import statements count ({len(import_lines)}) to {js_import_lines_count_file_path}.")
