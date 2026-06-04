// basically from: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation
const putInCache = async (request, response) => {
    const cache = await caches.open("v1");
    await cache.put(request, response);
};

const cacheLast = async ({ request, fallbackUrl }) => {
    
    // try to get the resource from the network.
    try {
        const responseFromNetwork = await fetch(request);
        // If the network request succeeded, clone the response:
        // - put one copy in the cache, for the next time
        // - return the original to the app
        // Cloning is needed because a response can only be consumed once.
        putInCache(request, responseFromNetwork.clone());
        console.log("cached good response for "+request.url)
        return responseFromNetwork;
    } catch (error) {
        // If the network request failed,
        // get the fallback response from the cache.
        const fallbackResponse = await caches.match(fallbackUrl);
        if (fallbackResponse) {
            console.log("getting from cache since network failed")
            return fallbackResponse;
        }
        console.log("failed to get "+request.url+" from cache OR network!!!")
        // When even the fallback response is not available,
        // there is nothing we can do, but we must always
        // return a Response object.
        return new Response("Network error happened for "+request.url, {
            status: 408,
            headers: { "Content-Type": "text/plain" },
        });
    }
};

self.addEventListener("fetch", (event) => {
    event.respondWith(
        cacheLast({
            request: event.request,
            fallbackUrl: "/fallback.html",
        }),
    );
});
