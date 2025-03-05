import { app } from "../../scripts/app.js";
import { Gallery } from "./gallery/index.js";

let gallery;

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
                }
            });
    },
    async nodeCreated(node) {
        if (node.comfyClass === "GalleryNode") {
            const onRemoved = node.onRemoved;
            node.onRemoved = () => {
                if (onRemoved) { onRemoved.apply(node); }
                if (gallery) { gallery.closeGallery(); }
            };
            node.addWidget("button", "Open Gallery", null, () => {
                if (gallery) { gallery.openGallery(); }
            });
        }
    },
});

app.api.addEventListener("Gallery.file_change", (event) => {
    console.log("file_change:", event);
    if (gallery) {
        app.api.fetchApi("/Gallery/images")
            .then(response => response.text())
            .then(text => JSON.parse(text))
            .then(data => gallery.updateImages(data.folders || {}));
    }
});

app.api.addEventListener("Gallery.update", (event) => {
    console.log("update:", event);
    if (gallery) {
        gallery.updateImages(event.detail.folders);
    }
});

app.api.addEventListener("Gallery.clear", (event) => {
    console.log("clear:", event);
    if (gallery) {
        gallery.clearGallery();
    }
});