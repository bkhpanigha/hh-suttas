import os
import re
import json

# Define the directories for English translations and root translations
json_translation_directory = './suttas/translation_en'
json_root_directory = './suttas/root'
combined_json_path = './python-generated/suttas-database-data.json'
suttas_count_js_path = './python-generated/suttas-count.js'

def combine_translations(translation_directory, root_directory):
    combined_data = {}

    # Process the English translations
    for root, dirs, files in os.walk(translation_directory):
        for file in files:
            if file.endswith('.json') and 'anigha' in file:  # Filter for "anigha" translations
                # Extract file name and path
                file_path = os.path.join(root, file)

                # Load the JSON data
                with open(file_path, 'r', encoding='utf-8') as json_file:
                    data = json.load(json_file)

                # Extract the part of the file name before the first underscore
                original_name_part = file.split('_')[0]

                # Add to combined data with the original name part as the key
                combined_data[original_name_part] = {'translation_en_anigha': data}

    # Process the root translations, but only add them if a corresponding English translation exists
    for root, dirs, files in os.walk(root_directory):
        for file in files:
            if file.endswith('.json') and 'root-pli-ms' in file:  # Filter for root translations
                # Extract the part of the file name before the first underscore
                original_name_part = file.split('_')[0]

                # Only add the root translation if the English translation already exists
                if original_name_part in combined_data:
                    # Extract file name and path
                    file_path = os.path.join(root, file)

                    # Load the JSON data
                    with open(file_path, 'r', encoding='utf-8') as json_file:
                        data = json.load(json_file)

                    # Add root translation to the corresponding key
                    combined_data[original_name_part]['root_pli_ms'] = data

    return combined_data

def write_combined_json(combined_data, output_path):
    # Write the combined data to a single JSON file
    with open(output_path, 'w', encoding='utf-8') as output_file:
        json.dump(combined_data, output_file, ensure_ascii=False, indent=2)

    print(f"Set suttas database data: {combined_json_path}")

def update_suttas_count_js(combined_data, suttas_count_js_path):
    # Count the number of entries in the combined data
    suttas_count = len(combined_data)

    # Create the content for the JS file
    suttas_count_js_content = f'const suttasCount = {suttas_count};\nexport default suttasCount;\n'

    # Write the suttas count to the JS file
    with open(suttas_count_js_path, 'w', encoding='utf-8') as js_file:
        js_file.write(suttas_count_js_content)

    print(f"Set suttas count ({suttas_count}): {suttas_count_js_path}.")

if __name__ == "__main__":
    # Combine both English translations and root translations
    combined_data = combine_translations(json_translation_directory, json_root_directory)

    # Write the combined JSON data to a file
    write_combined_json(combined_data, combined_json_path)

    # Update the suttas-data-import-lines-count.js file with the count of entries
    update_suttas_count_js(combined_data, suttas_count_js_path)
