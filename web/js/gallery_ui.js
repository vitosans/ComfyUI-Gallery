import { app } from "../../scripts/app.js";
import { Gallery, setGalleryInstance, getGalleryInstance } from "./gallery/index.js";

// Now the Gallery is defined in the gallery module
// Keep track of gallery instance locally as well
let gallery = null;

app.registerExtension({
    name: "Gallery",
    init() {
        app.api.fetchApi("/Gallery/images")
            .then(response => response.text())
            .then(text => {
                try {
                    return JSON.parse(text);
                } catch (e) {
                    console.error("Error parsing JSON response:", e);
                    return { folders: {} };
                }
            })
            .then(data => {
                const menu = document.getElementsByClassName("flex gap-2 mx-2")[0];
                if (menu) {
                    gallery = new Gallery({ openButtonBox: menu, folders: data.folders || {} });
                    // Store the gallery instance in the module for access from other parts
                    setGalleryInstance(gallery);
                }
            });
    },
    async nodeCreated(node) {
        if (node.comfyClass === "GalleryNode") {
            const onRemoved = node.onRemoved;
            node.onRemoved = () => {
                if (onRemoved) { onRemoved.apply(node); }
                // Use either the local instance or get it from the module
                const galleryInstance = gallery || getGalleryInstance();
                if (galleryInstance) {
                    galleryInstance.closeGallery();
                }
            };
            node.addWidget("button", "Open Gallery", null, () => {
                // Use either the local instance or get it from the module
                const galleryInstance = gallery || getGalleryInstance();
                if (galleryInstance) {
                    galleryInstance.openGallery();
                }
            });
        }
    },
});

// Event listeners
app.api.addEventListener("Gallery.file_change", (event) => {
    console.log("file_change:", event);
    // Use either the local instance or get it from the module
    const galleryInstance = gallery || getGalleryInstance();
    if (galleryInstance) {
        app.api.fetchApi("/Gallery/images")
            .then(response => response.text())
            .then(text => JSON.parse(text))
            .then(data => galleryInstance.updateImages(data.folders || {}));
    }
});

app.api.addEventListener("Gallery.update", (event) => {
    console.log("update:", event);
    // Use either the local instance or get it from the module
    const galleryInstance = gallery || getGalleryInstance();
    if (galleryInstance) {
        galleryInstance.updateImages(event.detail.folders);
    }
});

app.api.addEventListener("Gallery.clear", (event) => {
    console.log("clear:", event);
    // Use either the local instance or get it from the module
    const galleryInstance = gallery || getGalleryInstance();
    if (galleryInstance) {
        galleryInstance.clearGallery();
    }
});