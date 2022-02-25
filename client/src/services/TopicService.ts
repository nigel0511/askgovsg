import { Topic } from '~shared/types/base'

import { ApiClient, GetTopicsDto } from '../api'

export const fetchTopics = (): Promise<GetTopicsDto[]> => {
  return ApiClient.get<GetTopicsDto[]>('/topics').then(({ data }) => data)
}
export const FETCH_TOPICS_QUERY_KEY = 'fetchTopics'

export const getTopicsUsedByAgency = (
  agencyId: number,
): Promise<GetTopicsDto[]> => {
  return ApiClient.get<GetTopicsDto[]>(`/agencies/${agencyId}/topics`).then(
    ({ data }) => data,
  )
}

export const GET_TOPICS_USED_BY_AGENCY_QUERY_KEY = 'getTopicsUsedByAgency'

export const getTopicById = (id: number): Promise<Topic> => {
  return ApiClient.get<Topic>(`/topics/${id}`).then(({ data }) => data)
}

export const GET_TOPIC_BY_ID_QUERY_KEY = 'getTopicById'
