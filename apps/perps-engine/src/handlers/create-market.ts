import { ORDERBOOKS, type EngineRequest, type OrderbookEntry } from "../store/perps-store";

export default function handleCreateMarket(message: EngineRequest) {
    const symbol = message.payload.symbol as string;
    const orderbook = {
        asks: new Map<number, OrderbookEntry>(),
        bids: new Map<number, OrderbookEntry>(),
        lastTradedPrice: 0,
        indexPrice: 0
    };

    ORDERBOOKS.set(symbol, orderbook);
    return { orderbook }
}