const addResourcesToCache = async (resources) => {
  const cache = await caches.open("v1");
  await cache.addAll(resources.map(u => new URL(u,import.meta.url)));
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    addResourcesToCache([
      "/",
      "./main.js",
      "./style.css",
      "/image-list.js",
      "textures/underwater-12k-unclipped-hdr_0_5K_1992a829-4966-4c25-8a8d-1bcb47d85061.exr",
      "./dolphin_compressed.glb",
      "./textures/bubble_transformed.webp",
      "./textures/bubble_transformed_192.webp",
      "./textures/preview.webp"
    ]),
  );
});