export interface PageInfo {
  pageName: string
  pageURL: string
}

export interface UserInfo {
  userEmail: string
}

export interface InteractionInfo {
  interactionType: string
  interactionName: string
  interactionID: string
}

export interface EventData {
  event: string
  page: PageInfo
  user: UserInfo
  interaction: InteractionInfo
}

interface AdobeDataLayer extends Array<EventData> {
  eventData?: EventData
}

export function useGlobalClickTracker(): void
