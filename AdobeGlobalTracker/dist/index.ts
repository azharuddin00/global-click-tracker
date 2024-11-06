import { useRouter } from "vue-router"
import { EventData } from "./index.d"
import { onMounted, onUnmounted, ref } from "vue"

interface AdobeDataLayer extends Array<EventData> {
  eventData?: EventData
}

export default function useGlobalClickTracker() {
  const adobeDataLayer: AdobeDataLayer = []
  Object.defineProperty(adobeDataLayer, "eventData", {
    get: function () {
      return this.length > 0 ? this[this.length - 1] : undefined
    },
    configurable: true,
    enumerable: true,
  })
  ;(window as any).adobeDataLayer = adobeDataLayer

  function setAdobeDataLayer(event: EventData) {
    try {
      console.log(event)
      // Directly set adobeDataLayer to event
      ;(window as any).adobeDataLayer = event
    } catch (error) {
      console.error(`Error setting adobeDataLayer: ${error}`)
    }
  }

  const router = useRouter()
  const currentURL = ref(window.location.href)

  const handleClick = (event: MouseEvent) => {
    try {
      let target = event.target as HTMLElement
      let tagName = target.tagName.toLowerCase()

      while (
        (tagName === "svg" || tagName === "path" || tagName === "span") &&
        target.parentElement
      ) {
        target = target.parentElement
        tagName = target.tagName.toLowerCase()
      }

      const getUserEmail = (): string => {
        return "user@example.com"
      }

      const createEventData = (
        eventType: string,
        interactionType: string,
        interactionName: string,
        interactionID: string
      ): EventData => ({
        event: eventType,
        page: {
          pageName: document.title,
          pageURL: window.location.href,
        },
        user: {
          userEmail: getUserEmail(),
        },
        interaction: {
          interactionType,
          interactionName,
          interactionID,
        },
      })

      let eventData: EventData | null = null

      if (
        tagName === "a" ||
        (target.parentElement &&
          target.parentElement.tagName.toLowerCase() === "a")
      ) {
        const link = target as HTMLAnchorElement
        event.preventDefault()
        eventData = createEventData(
          "linkClick",
          "link",
          link.innerText,
          link.href
        )

        setAdobeDataLayer(eventData)
        const href = link.getAttribute("href")
        if (href) {
          router
            .push(href)
            .then(() => {
              eventData = createEventData(
                "PageLoad",
                "page",
                document.title,
                window.location.href
              )
              setAdobeDataLayer(eventData)
            })
            .catch((error) => {
              console.error(`Error navigating to ${href}: ${error}`)
            })
        }
      } else if (
        tagName === "button" &&
        (target as HTMLButtonElement).type !== "submit" &&
        (target as HTMLButtonElement).type !== "reset"
      ) {
        const button = target as HTMLButtonElement
        eventData = createEventData(
          "buttonClick",
          "button",
          button.innerText,
          button.id
        )
        setAdobeDataLayer(eventData)
      } else if (
        (tagName === "button" &&
          (target as HTMLButtonElement).innerText === "submit") ||
        (target as HTMLButtonElement).innerText === "login"
      ) {
        const button = target as HTMLButtonElement
        eventData = createEventData(
          "buttonClick",
          "button",
          button.innerText || "login",
          button.id
        )
        console.log(eventData)
        setAdobeDataLayer(eventData)
      } else if (
        tagName === "input" &&
        (target as HTMLInputElement).type === "radio"
      ) {
        const radio = target as HTMLInputElement
        eventData = createEventData(
          "radioButtonClick",
          "radioButton",
          radio.name,
          radio.id
        )
        setAdobeDataLayer(eventData)
      } else if (
        tagName === "input" &&
        (target as HTMLInputElement).type === "checkbox"
      ) {
        const checkbox = target as HTMLInputElement
        eventData = createEventData(
          "checkboxClick",
          "checkbox",
          checkbox.name,
          checkbox.id
        )
        setAdobeDataLayer(eventData)
      }
    } catch (error) {
      console.error(`Error handling click event: ${error}`)
    }
  }

  console.log("Global Adobe Click Tracker Initialized")
  document.addEventListener("click", handleClick)
}
