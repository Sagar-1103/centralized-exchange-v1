import type { EngineRequest } from "../store/perps-store";
import { Balance } from "../utils/balance";

export default function handleOnboard(message: EngineRequest) {
    const { userId } = message.payload as { userId: string };
    const balance = new Balance(userId);
    const userBalance = balance.init();
    return { userBalance };
}