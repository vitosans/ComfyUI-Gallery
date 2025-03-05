import os
import json
import re
from datetime import datetime
from pathlib import Path
from PIL import Image, ImageOps
from PIL.ExifTags import TAGS, GPSTAGS, IFD
from PIL.PngImagePlugin import PngImageFile
from PIL.JpegImagePlugin import JpegImageFile
import folder_paths

CONFIG_INDENT = 4  # Assuming a default indent value if CONFIG is not available

def get_size(file_path):
    file_size_bytes = os.path.getsize(file_path)
    if file_size_bytes < 1024:
        return f"{file_size_bytes} bytes"
    elif file_size_bytes < 1024 * 1024:
        return f"{file_size_bytes / 1024:.2f} KB"
    else:
        return f"{file_size_bytes / (1024 * 1024):.2f} MB"


def buildMetadata(image_path):
    if not Path(image_path).is_file():
        raise FileNotFoundError(f"File not found: {image_path}")

    img = Image.open(image_path)
    metadata = {}
    prompt = {}

    metadata["fileinfo"] = {
        "filename": Path(image_path).as_posix(),
        "resolution": f"{img.width}x{img.height}",
        "date": str(datetime.fromtimestamp(os.path.getmtime(image_path))),
        "size": str(get_size(image_path)),
    }

    # only for png files
    if isinstance(img, PngImageFile):
        metadataFromImg = img.info

        # for all metadataFromImg convert to string (but not for workflow and prompt!)
        for k, v in metadataFromImg.items():
            # from ComfyUI
            if k == "workflow":
                if isinstance(v, str): # Check if v is a string before attempting json.loads
                    try:
                        metadata["workflow"] = json.loads(v)
                    except json.JSONDecodeError as e:
                        print(f"Warning: Error parsing metadataFromImg 'workflow' as JSON, keeping as string: {e}")
                        metadata["workflow"] = v # Keep as string if parsing fails
                else:
                    metadata["workflow"] = v # If not a string, keep as is (might already be parsed)

            # from ComfyUI
            elif k == "prompt":
                if isinstance(v, str): # Check if v is a string before attempting json.loads
                    try:
                        metadata["prompt"] = json.loads(v)
                        prompt = metadata["prompt"] # extract prompt to use on metadata
                    except json.JSONDecodeError as e:
                        print(f"Warning: Error parsing metadataFromImg 'prompt' as JSON, keeping as string: {e}")
                        metadata["prompt"] = v # Keep as string if parsing fails
                else:
                    metadata["prompt"] = v # If not a string, keep as is (might already be parsed)

            # Handle "parameters" field which contains the generation parameters
            elif k == "parameters":
                if isinstance(v, str):
                    # Store the full parameters string
                    metadata["parameters"] = v
                    
                    # Try to extract model name, sampler, and seed if present
                    try:
                        # Extract model name
                        model_match = re.search(r"Model: ([^,]+)", v)
                        if model_match:
                            metadata["model"] = model_match.group(1).strip()
                        
                        # Extract sampler
                        sampler_match = re.search(r"Sampler: ([^,]+)", v)
                        if sampler_match:
                            metadata["sampler"] = sampler_match.group(1).strip()
                        
                        # Extract seed
                        seed_match = re.search(r"Seed: (\d+)", v)
                        if seed_match:
                            metadata["seed"] = seed_match.group(1).strip()
                            
                        # Extract steps
                        steps_match = re.search(r"Steps: (\d+)", v)
                        if steps_match:
                            metadata["steps"] = steps_match.group(1).strip()
                        
                        # Extract LoRA information
                        lora_match = re.search(r"<lora:([^>]+)>", v)
                        if lora_match:
                            metadata["lora"] = lora_match.group(1).strip()
                    except Exception as e:
                        print(f"Warning: Error extracting information from parameters: {e}")
                else:
                    metadata["parameters"] = v

            else:
                if isinstance(v, str): # Check if v is a string before attempting json.loads
                    try:
                        metadata[str(k)] = json.loads(v)
                    except json.JSONDecodeError as e:
                        print(f"Debug: Error parsing {k} as JSON, trying as string: {e}")
                        metadata[str(k)] = v # Keep as string if parsing fails
                else:
                    metadata[str(k)] = v # If not a string, keep as is

    if isinstance(img, JpegImageFile):
        exif = img.getexif()

        for k, v in exif.items():
            tag = TAGS.get(k, k)
            if v is not None:
                try:
                    metadata[str(tag)] = str(v)
                except Exception as e:
                    print(f"Warning: Error converting EXIF tag {tag} to string: {e}")
                    metadata[str(tag)] = "Error decoding value" # Handle encoding errors

        for ifd_id in IFD:
            try:
                if ifd_id == IFD.GPSInfo:
                    resolve = GPSTAGS
                else:
                    resolve = TAGS

                ifd = exif.get_ifd(ifd_id)
                ifd_name = str(ifd_id.name)
                metadata[ifd_name] = {}

                for k, v in ifd.items():
                    tag = resolve.get(k, k)
                    try:
                        metadata[ifd_name][str(tag)] = str(v)
                    except Exception as e:
                        print(f"Warning: Error converting EXIF IFD tag {tag} to string: {e}")
                        metadata[ifd_name][str(tag)] = "Error decoding value" # Handle encoding errors


            except KeyError:
                pass


    return img, prompt, metadata


def buildPreviewText(metadata):
    text = f"File: {metadata['fileinfo']['filename']}\n"
    text += f"Resolution: {metadata['fileinfo']['resolution']}\n"
    text += f"Date: {metadata['fileinfo']['date']}\n"
    text += f"Size: {metadata['fileinfo']['size']}\n"
    
    # Add useful generation parameters if available
    if "model" in metadata:
        text += f"Model: {metadata['model']}\n"
    if "sampler" in metadata:
        text += f"Sampler: {metadata['sampler']}\n"
    if "steps" in metadata:
        text += f"Steps: {metadata['steps']}\n"
    if "seed" in metadata:
        text += f"Seed: {metadata['seed']}\n"
    if "lora" in metadata:
        text += f"LoRA: {metadata['lora']}\n"
        
    return text