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
import { Queue, QueueStore } from 'workbox-background-sync'

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST)

const requestPOST = new Map<string, Request>()
const sentPOST = new Map<string, any>()
const QUEUE_NAME = 'requests'

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new CacheFirst(),
)

const postMessage = (message: string) => {
  self.clients.matchAll()
    .then(clients => {
      clients.forEach(client => client.postMessage(message))
    })
}

const decode = (data: ArrayBuffer) => {
  if (!data) return null

  try {
    const decoder = new TextDecoder('utf-8')
    const body = decoder.decode(data)
    
    if (!body) return ''
    return JSON.parse(body)
  } catch (error) {
    console.log('Error decoding data', error)
    throw new Error(error)
  }
}

const transformReadableStreamToObject = async (data: ReadableStream): Promise<any> => {
  if (!data) return
  try {
    const reader = data.getReader()
    let result = '';
    while (true) {
      const { done, value } = await reader.read()
      if (done) break;
      result += new TextDecoder().decode(value)
    }
    return JSON.parse(result)
  } catch (err) {
    console.error('Error reading data', err)
    throw new Error(err)
  }
}

const getIdFromUrl = (fullUrl: string) => {
  if (!fullUrl) return
  const url = new URL(fullUrl)
  const pathParts = url.pathname.split('/')
  return pathParts[pathParts.length - 1]
}

const groupRequestsById = (entries) => {
  return entries.reduce((acc, request) => {
    if (request.requestData.method !== 'PUT') return acc
    
    const id = getIdFromUrl(request.requestData?.url)
  
    acc[id] ? acc[id].push(request) : acc[id] = [request]
    
    return acc
  }, {})
}

const queueStore = new QueueStore(QUEUE_NAME)

const squashRequests = async () => {
  const entries = await queueStore.getAll()

  const groupedUpdateRequests = groupRequestsById(entries)

  try {
    await Promise.all(Object.keys(groupedUpdateRequests).map(async key => {
      const group = groupedUpdateRequests[key]
  
      if (group.length > 1) {
        let body = null
  
        await Promise.all(group.map(async (item: any  ) => {
          const bodyArrayBuffer = item.requestData.body

          const { 
            attributes: attributesPUT 
          } = decode(bodyArrayBuffer)
  
          await queueStore.deleteEntry(item.id)
  
          body = {
            attributes: {
              ...body?.attributes,
              ...attributesPUT
            }
          }
        }))

        const requestData = group[0].requestData
  
        const mergeRequest = new Request(requestData?.url, {
          ...requestData,
          body: JSON.stringify(body),
        })
  
        await queue.pushRequest({
          request: mergeRequest
        })
        
      }
    }))
  } catch (error) {
    console.log('error', error)
  }

}

const mergePostAndPutRequests = async (entry, entries) => {
  try {
    let body = null
    const { 
      attributes: { offline_id }, 
      attributes: attributesPOST 
    } = await transformReadableStreamToObject(entry.body)

    await Promise.all(entries.map(async (request: any) => {
      if (request.requestData.method !== 'PUT') return

      const id = getIdFromUrl(request.requestData.url)

      if (String(id) === String(offline_id)) {
        const bodyArrayBuffer = request.requestData.body

        const { 
          attributes: attributesPUT 
        } = await decode(bodyArrayBuffer)

        delete attributesPUT.id

        await queueStore.deleteEntry(request.id)

        body = JSON.stringify({
          attributes: {
            ...attributesPOST,
            ...attributesPUT,
          }
        })
      }
    }))

    if (body) {
      const mergeRequest = new Request(entry.url, {
        ...entry,
        body,
        cache: entry.cache,
        credentials: entry.credentials,
        headers: entry.headers,
        integrity: entry.integrity,
        keepalive: entry.keepalive,
        method: entry.method,
        mode: entry.mode,
        redirect: entry.redirect,
        referrer: entry.referrer,
        referrerPolicy: entry.referrerPolicy,
        signal: entry.signal,
      })

      requestPOST.delete(offline_id)

      return mergeRequest
    }
  } catch (error) {
    console.log('Error merging requests', error)
  }
}

const replaceRequestUrlWithStoredUrl = async (entry) => {
  const requestId = entry.metadata?.requestId

  if (sentPOST.has(String(requestId))) {
    const url = entry.request.url.replace(requestId, sentPOST.get(requestId))

    const newRequest = new Request(url, {
      ...entry.request.clone(),
    })

    return newRequest
  } 
}

const queue = new Queue(QUEUE_NAME, {
  onSync: async ({ queue }) => {
    let entry
    const retryCounters = new Map<string, number>()
    
    await squashRequests()
    const entries = await queueStore.getAll()

    while (entry = await queue.shiftRequest()) {
      try {
        if (entry.request.method === 'POST') {
          const mergeRequest = await mergePostAndPutRequests(entry.request.clone(), entries)
          if (mergeRequest) {
            entry.request = mergeRequest
          }
        }

        if (entry.request.method === 'DELETE') {
          const newRequest = await replaceRequestUrlWithStoredUrl(entry)
          if (newRequest) {
            entry.request = newRequest
          }
        }

        if (entry.metadata?.squash) return
        const response = await fetch(entry.request)

        if (entry.request.method === 'POST') {
          const { data } = await response.json()
          sentPOST.set(data.offlineId, data.id)
        }

        postMessage('successful')

        retryCounters.delete(entry.request.url)
      } catch (error) {
        const retryCounter = retryCounters.get(entry.request.url) || 0

        if (retryCounter < 3) {
          retryCounters.set(entry.request.url, retryCounter + 1);
          await queue.unshiftRequest(entry);
        } else {
          retryCounters.delete(entry.request.url);
        }
      }
    }

    postMessage('sync-data')
  },
})

self.addEventListener('fetch', (event) => {
  const supportedMethods = [
    'POST',
    'PUT',
    'DELETE',
  ]

  if (!supportedMethods.includes(event.request.method)) {
    return
  }

  const bgSyncLogic = async () => {
    try {
      const response = await fetch(event.request.clone())
      return response
    } catch (error) {
      const path = new URL(event.request.url).pathname
      if(path.startsWith('/api/') && !navigator.onLine) {

        let requestId = null

        if (event.request.method === 'POST') {
          const { 
            attributes: { offline_id } 
          } = await transformReadableStreamToObject(event.request.clone().body)
          requestPOST.set(String(offline_id), event.request.clone())
        }

        if (event.request.method === 'DELETE') {
          const id = getIdFromUrl(event.request.url)

          if (requestPOST.has(String(id))) {
            requestId = id
          }
        }

        await queue.pushRequest({
          request: event.request,
          metadata: {
            requestId
          }
        })

        postMessage('queue-request')
      }
      
      return error
    }
  }

  event.respondWith(bgSyncLogic())
})