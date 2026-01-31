import type { DatasetIndex, DatasetMeta, DatasetPage } from './types'

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(path, { headers: { 'Accept': 'application/json' } })
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status} ${res.statusText}`)
  }
  return (await res.json()) as T
}

export function loadIndex(): Promise<DatasetIndex> {
  return fetchJson<DatasetIndex>(`${import.meta.env.BASE_URL}data/index.json`)
}

export function loadDatasetMeta(datasetId: string): Promise<DatasetMeta> {
  return fetchJson<DatasetMeta>(`${import.meta.env.BASE_URL}data/datasets/${datasetId}/meta.json`)
}

export function loadDatasetPage(datasetId: string, page: number): Promise<DatasetPage> {
  return fetchJson<DatasetPage>(`${import.meta.env.BASE_URL}data/datasets/${datasetId}/pages/${page}.json`)
}
