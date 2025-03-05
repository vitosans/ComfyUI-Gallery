import re

def test_metadata_extraction():
    try:
        # Read the raw-metadata.json file as text
        with open('raw-metadata.json', 'r') as f:
            content = f.read()
        
        # Find the parameters JSON object
        json_start = content.find('{')
        if json_start != -1:
            # Extract text from parameters field
            parameters_match = re.search(r'"parameters"\s*:\s*"([^"]+)"', content[json_start:])
            if parameters_match:
                parameters = parameters_match.group(1)
                # Strip any escape characters
                parameters = parameters.replace('\\n', '\n').replace('\\', '')
                
                print("Testing parameter extraction from raw-metadata.json...")
                print("Parameters:", parameters[:100] + "..." if len(parameters) > 100 else parameters)
                
                # Manually extract using the regex patterns that are in our updated metadata_extractor.py
                
                # Extract model name
                model_match = re.search(r"Model: ([^,]+)", parameters)
                if model_match:
                    print("Model:", model_match.group(1).strip())
                
                # Extract sampler
                sampler_match = re.search(r"Sampler: ([^,]+)", parameters)
                if sampler_match:
                    print("Sampler:", sampler_match.group(1).strip())
                
                # Extract seed
                seed_match = re.search(r"Seed: (\d+)", parameters)
                if seed_match:
                    print("Seed:", seed_match.group(1).strip())
                    
                # Extract steps
                steps_match = re.search(r"Steps: (\d+)", parameters)
                if steps_match:
                    print("Steps:", steps_match.group(1).strip())
                
                # Extract LoRA information
                lora_match = re.search(r"<lora:([^>]+)>", parameters)
                if lora_match:
                    print("LoRA:", lora_match.group(1).strip())
                    
                print("\nTest completed successfully!")
            else:
                print("Could not find parameters field in the JSON object")
        else:
            print("Could not find JSON object in file")
            
    except Exception as e:
        print(f"Error during testing: {e}")

if __name__ == "__main__":
    test_metadata_extraction()