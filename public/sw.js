self.addEventListener('install', function () {
  console.log('Hello world from the Service Worker 🤙')
})
self.addEventListener('fetch',() => console.log("fetch"));