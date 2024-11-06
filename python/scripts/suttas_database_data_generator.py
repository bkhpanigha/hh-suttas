import os
import json
import time

# Define the directories for English translations, root translations, comments, and the headings file
json_translation_directory = './suttas/translation_en'
json_root_directory = './suttas/root'
json_comments_directory = './suttas/comment'
headings_file_path = './suttas/translation_en/headings.json'
combined_json_path = './python/generated/suttas-database-data.json'
combined_json_hash_path = './python/generated/suttas-database-data-hash.js'
suttas_count_js_path = './python/generated/suttas-count.js'

def combine_translations(translation_directory, root_directory, comment_directory, headings):
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

                # Add heading if available
                if original_name_part in headings:
                    combined_data[original_name_part]['heading'] = headings[original_name_part]

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

    # Process the comments, but only add them if a corresponding English translation exists
    for root, dirs, files in os.walk(comment_directory):
        for file in files:
            if file.endswith('.json'):  # Filter for comment files
                # Extract the part of the file name before the first underscore
                original_name_part = file.split('_')[0]

                # Only add the comment if the English translation already exists
                if original_name_part in combined_data:
                    # Extract file name and path
                    file_path = os.path.join(root, file)

                    # Load the JSON data
                    with open(file_path, 'r', encoding='utf-8') as json_file:
                        data = json.load(json_file)

                    # Add comment to the corresponding key
                    combined_data[original_name_part]['comment'] = data

    return combined_data

def write_combined_json(combined_data, output_path):
    # Write the combined data to a single JSON file
    with open(output_path, 'w', encoding='utf-8') as output_file:
        json.dump(combined_data, output_file, ensure_ascii=False, indent=2)

    print(f"Set suttas database data: {output_path}")

def update_suttas_count_js(combined_data, suttas_count_js_path):
    # Count the number of entries in the combined data
    suttas_count = len(combined_data)

    # Create the content for the JS file
    suttas_count_js_content = f'const suttasCount = {suttas_count};\nexport default suttasCount;\n'

    # Write the suttas count to the JS file
    with open(suttas_count_js_path, 'w', encoding='utf-8') as js_file:
        js_file.write(suttas_count_js_content)

    print(f"Set suttas count ({suttas_count}): {suttas_count_js_path}.")

def generate_unique_id():
    # Get timestamp in milliseconds
    timestamp = int(time.time() * 1000000)  # microseconds
    # Get process id 
    pid = os.getpid()
    # Combine timestamp and pid to create a somewhat unique identifier
    unique_id = timestamp + pid
    
    return str(unique_id)

if __name__ == "__main__":
    # Load the headings data from headings.json
    with open(headings_file_path, 'r', encoding='utf-8') as headings_file:
        headings = json.load(headings_file)

    # Combine translations, root texts, comments, and headings
    combined_data = combine_translations(json_translation_directory, json_root_directory, json_comments_directory, headings)

    # Write the combined JSON data to a file
    write_combined_json(combined_data, combined_json_path)

    # Update the suttas-data-import-lines-count.js file with the count of entries
    update_suttas_count_js(combined_data, suttas_count_js_path)

    unique_id = generate_unique_id()
    file_path = combined_json_hash_path
    with open(file_path, "w") as file:
        file.write("const hash = \"" + unique_id + "\";\rexport default hash;")
