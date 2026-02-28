// Baseball Strategy Master — Service Worker for push notifications
// Sprint D1: "Your daily diamond is waiting!" reminders

const CACHE_NAME = "bsm-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// Handle push notifications
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Baseball Strategy Master";
  const options = {
    body: data.body || "Your Daily Diamond is waiting! Can you get it right?",
    icon: data.icon || "/favicon.ico",
    badge: "/favicon.ico",
    tag: data.tag || "bsm-daily",
    data: { url: data.url || "/preview.html" },
    actions: [
      { action: "play", title: "Play Now" },
      { action: "dismiss", title: "Later" },
    ],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;
  const url = event.notification.data?.url || "/preview.html";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes("preview.html") && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

// Periodic background sync for daily reminders (where supported)
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "bsm-daily-reminder") {
    event.waitUntil(
      self.registration.showNotification("Baseball Strategy Master", {
        body: "Your Daily Diamond is ready! Keep your streak alive!",
        icon: "/favicon.ico",
        tag: "bsm-daily",
        data: { url: "/preview.html" },
      })
    );
  }
});
