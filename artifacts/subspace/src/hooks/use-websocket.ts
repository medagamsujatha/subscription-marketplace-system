import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getListSubscriptionsQueryKey, getGetSubscriptionQueryKey } from "@workspace/api-client-react";

export function useWebsocketUpdates() {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Determine WS URL based on current origin
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const connect = () => {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        // Attempt to reconnect after 3 seconds
        setTimeout(connect, 3000);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'SUBSCRIBER_UPDATE' && data.serviceId) {
            // Invalidate lists
            queryClient.invalidateQueries({ queryKey: getListSubscriptionsQueryKey() });
            // Invalidate specific service
            queryClient.invalidateQueries({ queryKey: getGetSubscriptionQueryKey(data.serviceId) });
          }
        } catch (e) {
          console.error("Failed to parse WS message", e);
        }
      };
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [queryClient]);

  return { isConnected };
}
