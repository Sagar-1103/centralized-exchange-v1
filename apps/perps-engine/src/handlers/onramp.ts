import type { EngineRequest } from "../store/perps-store";
import { Balance } from "../utils/balance";

export default function handleOnramp(message: EngineRequest) {
    const { userId } = message.payload as { userId: string };
    let balance = new Balance(userId);
    const amount = message.payload.amount as number;
    const userBalance = balance.onramp(amount);
    return { userBalance };
}