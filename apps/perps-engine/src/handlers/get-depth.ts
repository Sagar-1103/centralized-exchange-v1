import { ORDERBOOKS, type DepthLevel, type DepthResponse, type EngineRequest } from "../store/perps-store";
import { Orderbook } from "../utils/orderbook";

export default function handleGetDepth(message: EngineRequest) {
    const symbol = message.payload.symbol as string;
    const temp = ORDERBOOKS.get(symbol);
    const orderbook = new Orderbook(temp?.indexPrice || 0, temp?.lastTradedPrice || 0, symbol);
    // got all the bids
    const bids = orderbook.bids.keys().reduce((acc: DepthLevel[], curr: number) => {
        const level = orderbook.getOrderBookEntry(curr, "BUY");
        return [...acc, { price: curr, qty: level?.availableQty || 0 }];
    }, []);

    // got all the asks
    const asks = orderbook.asks.keys().reduce((acc: DepthLevel[], curr: number) => {
        const level = orderbook.getOrderBookEntry(curr, "SELL");
        return [...acc, { price: curr, qty: level?.availableQty || 0 }];
    }, []);
    const response: DepthResponse = { symbol, bids, asks };
    return response;
}