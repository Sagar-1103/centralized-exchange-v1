import { FILLS, ORDERBOOKS, ORDERS, type EngineRequest, type Fill, type OpenOrder, type Order, type OrderSide, type Type } from "../store/perps-store";
import { Balance } from "../utils/balance";
import { Orderbook } from "../utils/orderbook";

export default function handleCreateOrder(message: EngineRequest) {
    const orderId = crypto.randomUUID();
    const { price, symbol, qty, type, side, equity, userId } = message.payload as { userId: string; price: number; symbol: string; qty: number; type: Type; side: OrderSide, equity: number };
    const temp = ORDERBOOKS.get(symbol);
    let balance = new Balance(userId);

    // if (!temp) {
    //   return { message: "Market doesnt exist" };
    // }
    const orderbook = new Orderbook(temp?.indexPrice || 0, temp?.lastTradedPrice || 0, symbol);
    if (type === "LIMIT") {
        const leverage = (price * qty) / equity;

        // check if user wallet has enough funds
        if (balance.hasEnoughBalance(equity)) {
            return { message: "No available balance" };
        }

        balance.hasEnoughBalance(equity);

        // lock balance
        balance.lockBalance(price * qty);

        // create order
        const order: Order = {
            orderId,
            userId,
            market: symbol,
            side,
            price,
            qty,
            filledQty: 0,
            status: "OPEN",
            type,
            margin: equity,
            fills: [],
            createdAt: Date.now(),
        };

        const openOrder: OpenOrder = {
            orderId,
            userId,
            market: symbol,
            side,
            price,
            qty,
            margin: equity,
            filledQty: 0,
            status: "OPEN",
            type,
            createdAt: Date.now(),
        }
        if (side === "BUY") {
            const makerPrices = orderbook.getMakerPrices("SELL");

            for (const makerPrice of makerPrices) {
                if (order.filledQty >= order.qty) {
                    break;
                }
                if (makerPrice > price) {
                    break;
                }

                const level = orderbook.getOrderBookEntry(makerPrice, side);
                if (!level) {
                    continue;
                }

                for (const maker of level.openOrders) {
                    if (order.filledQty >= order.qty) {
                        break;
                    }
                    if (order.userId === maker.userId) {
                        continue;
                    }

                    const makerRemaining = maker.qty - maker.filledQty;
                    const takerRemaining = order.qty - order.filledQty;

                    const fillQty = Math.min(makerRemaining, takerRemaining);

                    const makerOrder = ORDERS.get(maker.orderId);
                    if (!makerOrder) return;

                    makerOrder.filledQty += fillQty;
                    order.filledQty += fillQty;
                    openOrder.filledQty += fillQty;
                    maker.filledQty += fillQty;

                    orderbook.updateLevelQty(makerPrice, level.availableQty - fillQty, side);

                    const fillId = crypto.randomUUID();
                    const fill: Fill = {
                        fillId,
                        makerOrderId: maker.orderId,
                        takerOrderId: orderId,
                        qty: fillQty,
                        market: symbol,
                        price: makerPrice,
                        makerId: maker.userId,
                        takerId: userId
                    }

                    makerOrder.fills.push(fill);
                    order.fills.push(fill);
                    FILLS.set(fillId, fill);

                    makerOrder.status = makerOrder.filledQty === makerOrder.qty ? "FILLED" : "PARTIALLY_FILLED";
                    order.status = order.filledQty === order.qty ? "FILLED" : "PARTIALLY_FILLED";
                    maker.status = maker.filledQty === maker.qty ? "FILLED" : "PARTIALLY_FILLED";
                    openOrder.status = openOrder.filledQty === openOrder.qty ? "FILLED" : "PARTIALLY_FILLED";

                    orderbook.lastTradedPrice = makerPrice;
                    orderbook.indexPrice = makerPrice;
                }

            }
        } else {

            const makerPrices = orderbook.getMakerPrices("BUY");

            for (const makerPrice of makerPrices) {
                if (order.filledQty >= order.qty) {
                    break;
                }
                if (makerPrice < price) {
                    break;
                }

                const level = orderbook.getOrderBookEntry(makerPrice, side);
                if (!level) {
                    continue;
                }

                for (const maker of level.openOrders) {
                    if (order.filledQty >= order.qty) {
                        break;
                    }
                    if (order.userId === maker.userId) {
                        continue;
                    }

                    const makerRemaining = maker.qty - maker.filledQty;
                    const takerRemaining = order.qty - order.filledQty;

                    const fillQty = Math.min(makerRemaining, takerRemaining);

                    const makerOrder = ORDERS.get(maker.orderId);
                    if (!makerOrder) return;

                    makerOrder.filledQty += fillQty;
                    order.filledQty += fillQty;
                    openOrder.filledQty += fillQty;
                    maker.filledQty += fillQty;

                    orderbook.updateLevelQty(makerPrice, level.availableQty - fillQty, side);

                    const fillId = crypto.randomUUID();
                    const fill: Fill = {
                        fillId,
                        makerOrderId: maker.orderId,
                        takerOrderId: orderId,
                        qty: fillQty,
                        market: symbol,
                        price: makerPrice,
                        makerId: maker.userId,
                        takerId: userId
                    }

                    makerOrder.fills.push(fill);
                    order.fills.push(fill);
                    FILLS.set(fillId, fill);

                    makerOrder.status = makerOrder.filledQty === makerOrder.qty ? "FILLED" : "PARTIALLY_FILLED";
                    order.status = order.filledQty === order.qty ? "FILLED" : "PARTIALLY_FILLED";
                    maker.status = maker.filledQty === maker.qty ? "FILLED" : "PARTIALLY_FILLED";
                    openOrder.status = openOrder.filledQty === openOrder.qty ? "FILLED" : "PARTIALLY_FILLED";

                    orderbook.lastTradedPrice = makerPrice;
                    orderbook.indexPrice = makerPrice;
                }
            }

        }

        if (order.filledQty < order.qty) {
            orderbook.addOrderBookEntry(order.price, order.side, openOrder, order.qty - order.filledQty);
        }

        orderbook.update();
        ORDERS.set(orderId, order);

        return { filledQty: order.filledQty, order, openOrder };

    } else {

    }
    return { orderId };
}