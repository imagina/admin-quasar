/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config.js > pwa > workboxPluginMode is set to "InjectManifest"
 */

// @ts-ignore Disable worbox Logs
self.__WB_DISABLE_DEV_LOGS = true;

declare const self: ServiceWorkerGlobalScope &
  typeof globalThis & { skipWaiting: () => void }

import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'
import { Queue } from 'workbox-background-sync'

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST)

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new CacheFirst(),
);

const queue = new Queue('requests')

self.addEventListener('fetch', (event) => {
  // const methods = [
  //   'POST',
  //   'PUT',
  //   'DELETE',
  // ]

  if (event.request.method === 'GET') {
    return
  }

  const bgSyncLogic = async () => {
    try {
      const response = await fetch(event.request.clone())
      return response
    } catch (error) {
      const path = new URL(event.request.url).pathname
      console.log('path', path);
      console.log('verifica', path.startsWith('/api/'))
      if(path.startsWith('/api/')) {
        await queue.pushRequest({
          request: event.request
        })
      }
      return error;
    }
  }

  event.respondWith(bgSyncLogic())
})

self.addEventListener('sync', (event) => {
  console.log('sync event', event)
})

// function initConnectionCache(callback: (store: IDBObjectStore) => void) {
//   const openRequest = indexedDB.open('localhost:8080DB')
//   openRequest.onsuccess = (event) => {
//     const db = openRequest.result
//     const transaction = db.transaction('storage', 'readwrite')
//     const store = transaction.objectStore('storage')
//     callback(store)
//   }
// }

// function getFromCache(key: string): Promise<any> {
//   return new Promise((resolve, reject) => {
//     const get = (store: IDBObjectStore) => {
//       const request = store.get(key)
//       request.onsuccess = () => {
//         resolve(request.result)
//       }
//       request.onerror = () => {
//         reject(request.error)
//       }
//     }
//     initConnectionCache(get)
//   });
// }

// function getAllFromCache(): Promise<any[]> {
//   return new Promise((resolve, reject) => {
//     const getAll = (store: IDBObjectStore) => {
//       const request = store.getAll();
//       request.onsuccess = () => {
//         resolve(request.result)
//       }
//       request.onerror = () => {
//         reject(request.error)
//       }
//     }
//     initConnectionCache(getAll);
//   })
// }

// function addToCache(key: string, data: any): Promise<void> {
//   return new Promise((resolve, reject) => {
//     const add = (store: IDBObjectStore) => {
//       const request = store.add(data, key);
//       request.onsuccess = () => {
//         resolve();
//       }
//       request.onerror = () => {
//         reject(request.error)
//       }
//     }
//     initConnectionCache(add)
//   })
// }

// function editInCache(key: string, newData: any): Promise<void> {
//   return new Promise((resolve, reject) => {
//     const edit = (store: IDBObjectStore) => {
//       const getRequest = store.get(key)
//       getRequest.onsuccess = () => {
//         const data = getRequest.result;
//         if (data) {
//           const putRequest = store.put(newData, key);
//           putRequest.onsuccess = () => {
//             resolve()
//           }
//           putRequest.onerror = () => {
//             reject(putRequest.error);
//           }
//         } else {
//           reject(new Error('Data not found in cache'));
//         }
//       };
//       getRequest.onerror = () => {
//         reject(getRequest.error);
//       }
//     }
//     initConnectionCache(edit)
//   })
// }

// self.addEventListener('install', (event) => {
//   console.log('installing service worker');
//   const getInfoCache = async () => {
//     try {
//       await addToCache('requests', { test: true, success: true });
//       await editInCache('requests', { test: true, success: true, new: true });
//       console.log('requests', await getFromCache('requests'));
//       console.log('getAllFromCache request', await getAllFromCache());
//     } catch (error) {
//       console.error('Error retrieving data from cache:', error);
//     }
//   };
//   getInfoCache();
// });

// self.addEventListener('activate', (event) => {
//   console.log('activating service worker');
// })