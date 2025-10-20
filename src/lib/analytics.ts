export type AnalyticsEvent =
  | "viewer_open"
  | "viewer_rotate"
  | "viewer_wireframe_toggle"
  | "viewer_reset"
  | "viewer_download_glb"
  | "cta_whatsapp_click";

type EventPayload = Record<string, unknown>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const EVENT_CATEGORY = "product_viewer";

export function trackEvent(event: AnalyticsEvent, payload: EventPayload = {}): void {
  if (typeof window === "undefined") {
    return;
  }

  const data = {
    event_category: EVENT_CATEGORY,
    event_label: "ufo5-200W",
    ...payload
  };

  if (typeof window.gtag === "function") {
    window.gtag("event", event, data);
    return;
  }

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event,
      ...data
    });
  }
}

export function trackViewerToggle(
  event: "viewer_wireframe_toggle" | "viewer_rotate",
  isEnabled: boolean
): void {
  trackEvent(event, { value: Number(isEnabled) });
}
