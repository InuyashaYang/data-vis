export type DatasetCard = {
  id: string
  name: string
  description?: string
  tags?: string[]
  taskType?: string
  sampleCount?: number
  updatedAt?: string
}

export type DatasetIndex = {
  datasets: DatasetCard[]
}

export type Difficulty = 'easy' | 'medium' | 'hard' | string
export type SampleStatus = 'draft' | 'reviewed' | 'accepted' | string

export type SampleAnnotations = {
  topics?: string[]
  difficulty?: Difficulty
  status?: SampleStatus
  [k: string]: unknown
}

export type MathSample = {
  id: string
  content: {
    prompt_md: string
    answer_md?: string
    solution_md?: string
  }
  annotations?: SampleAnnotations
  raw?: unknown
}

export type DatasetPage = {
  datasetId: string
  page: number
  pageSize: number
  total: number
  samples: MathSample[]
}

export type DatasetMeta = {
  id: string
  name: string
  description?: string
  fields?: Record<string, string>
}
