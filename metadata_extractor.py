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
                        
                        # Try to dynamically extract information from the prompt structure
                        try:
                            # Look for node that contains text input for positive prompt
                            # These can vary between workflows so we use several approaches
                            for node_id, node in prompt.items():
                                # Check if this is a CLIP text encode node
                                if node.get("class_type") in ["CLIPTextEncode", "CLIPTextEncodeSDXL", "CLIPTextEncodeSDXLRefiner"]:
                                    # Check if it's not a negative prompt
                                    node_title = node.get("_meta", {}).get("title", "")
                                    if "negative" not in node_title.lower() and "text" in node.get("inputs", {}):
                                        text_input = node["inputs"].get("text", "")
                                        if text_input and isinstance(text_input, str) and len(text_input) > 5:
                                            metadata["positive_prompt"] = text_input
                                            break
                                
                                # Check scheduler for steps and other params
                                if node.get("class_type") in ["BasicScheduler", "KarrasScheduler"]:
                                    if "steps" in node.get("inputs", {}):
                                        steps = node["inputs"].get("steps", "")
                                        if steps:
                                            metadata["steps"] = str(steps)
                                
                                # Check for samplers
                                if node.get("class_type") in ["KSamplerSelect", "KSampler", "KSamplerAdvanced"]:
                                    if "sampler_name" in node.get("inputs", {}):
                                        sampler = node["inputs"].get("sampler_name", "")
                                        if sampler:
                                            metadata["sampler"] = str(sampler)
                                
                                # Look for CFG in samplers
                                if "cfg" in node.get("inputs", {}):
                                    cfg = node["inputs"].get("cfg", "")
                                    if cfg:
                                        metadata["cfg_scale"] = str(cfg)
                                        
                                # Look for seed
                                if "seed" in node.get("inputs", {}):
                                    seed = node["inputs"].get("seed", "")
                                    if seed:
                                        metadata["seed"] = str(seed)
                                
                                # Look for negative prompt
                                if node.get("class_type") in ["CLIPTextEncode", "CLIPTextEncodeSDXL", "CLIPTextEncodeSDXLRefiner"]:
                                    node_title = node.get("_meta", {}).get("title", "")
                                    if "negative" in node_title.lower() and "text" in node.get("inputs", {}):
                                        text_input = node["inputs"].get("text", "")
                                        if text_input and isinstance(text_input, str):
                                            metadata["negative_prompt"] = text_input
                                            break
                                
                                # Look for model name
                                if node.get("class_type") in ["CheckpointLoaderSimple", "UNETLoader", "DiffusersLoader"]:
                                    for key in ["ckpt_name", "unet_name", "model_name"]:
                                        if key in node.get("inputs", {}):
                                            model = node["inputs"].get(key, "")
                                            if model and isinstance(model, str):
                                                metadata["model"] = model
                                                break
                                
                                # Look for LoRA nodes
                                if "lora" in node.get("class_type", "").lower() or "lora" in node_title.lower():
                                    # Different LoRA loaders have different formats
                                    for key in ["lora_name", "lora"]:
                                        if key in node.get("inputs", {}):
                                            lora = node["inputs"].get(key, "")
                                            if lora and isinstance(lora, str):
                                                metadata["lora"] = lora
                                                break
                                    
                                    # Check for Power Lora Loader style
                                    for key, value in node.get("inputs", {}).items():
                                        if key.startswith("lora_") and isinstance(value, dict) and value.get("on", False):
                                            lora = value.get("lora", "")
                                            if lora and isinstance(lora, str):
                                                metadata["lora"] = lora
                                                break
                        except Exception as e:
                            print(f"Warning: Error dynamically extracting metadata from prompt structure: {e}")
                            
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
                        model_match = re.search(r"Model: ([^,\n]+)", v)
                        if model_match:
                            metadata["model"] = model_match.group(1).strip()
                        
                        # Extract positive prompt (might be at the beginning of the parameters)
                        positive_match = re.match(r"^(.*?)(?:Negative prompt:|Steps:|Model:|Sampler:|Seed:|Scheduler:|CFG)", v, re.DOTALL)
                        if positive_match and positive_match.group(1).strip():
                            metadata["positive_prompt"] = positive_match.group(1).strip()
                            
                        # Extract negative prompt
                        negative_match = re.search(r"Negative prompt:(.*?)(?:Steps:|Model:|Sampler:|Seed:|Scheduler:|CFG|$)", v, re.DOTALL)
                        if negative_match:
                            metadata["negative_prompt"] = negative_match.group(1).strip()
                            
                        # Extract sampler
                        sampler_match = re.search(r"Sampler: ([^,\n]+)", v)
                        if sampler_match:
                            metadata["sampler"] = sampler_match.group(1).strip()
                            
                        # Extract scheduler
                        scheduler_match = re.search(r"Scheduler: ([^,\n]+)", v)
                        if scheduler_match:
                            metadata["scheduler"] = scheduler_match.group(1).strip()
                            
                        # Extract steps
                        steps_match = re.search(r"Steps: (\d+)", v)
                        if steps_match:
                            metadata["steps"] = steps_match.group(1).strip()
                            
                        # Extract CFG Scale
                        cfg_match = re.search(r"CFG[ scale]*: ([\d\.]+)", v, re.IGNORECASE)
                        if cfg_match:
                            metadata["cfg_scale"] = cfg_match.group(1).strip()
                        
                        # Extract seed
                        seed_match = re.search(r"Seed: (\d+)", v)
                        if seed_match:
                            metadata["seed"] = seed_match.group(1).strip()
                            
                        # Extract LoRA information
                        lora_match = re.search(r"<lora:([^>]+)>", v)
                        if lora_match:
                            metadata["lora"] = lora_match.group(1).strip()
                    except Exception as e:
                        print(f"Warning: Error extracting information from parameters: {e}")
                else:
                    metadata["parameters"] = v

            # Handle CreationTime specially to avoid JSON parsing errors
            elif k == "CreationTime":
                if isinstance(v, str):
                    # Store as is without attempting to parse as JSON
                    metadata[str(k)] = v
                else:
                    metadata[str(k)] = str(v)  # Convert to string if not already

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
    if "positive_prompt" in metadata:
        text += f"Positive Prompt: {metadata['positive_prompt']}\n"
    if "negative_prompt" in metadata:
        text += f"Negative Prompt: {metadata['negative_prompt']}\n"
    if "sampler" in metadata:
        text += f"Sampler: {metadata['sampler']}\n"
    if "scheduler" in metadata:
        text += f"Scheduler: {metadata['scheduler']}\n"
    if "steps" in metadata:
        text += f"Steps: {metadata['steps']}\n"
    if "cfg_scale" in metadata:
        text += f"CFG Scale: {metadata['cfg_scale']}\n"
    if "seed" in metadata:
        text += f"Seed: {metadata['seed']}\n"
    if "lora" in metadata:
        text += f"LoRA: {metadata['lora']}\n"
        
    return text