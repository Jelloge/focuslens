import { Client } from "@gadget-client/focuslens";

export const api = new Client({ environment: window.gadgetConfig.environment });
