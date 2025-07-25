console.log("hello push")

self.addEventListener('push', onPush);

async function onPush(event) {
  if (event.data) {
    const data = event.data.json();
    const { title, ...rest } = data;

    const clients = await self.clients.matchAll();
    clients.forEach((client) => client.postMessage(data));

    await event.waitUntil(
      self.registration.showNotification(title, {
        ...rest,
      }),
    );
  }
}