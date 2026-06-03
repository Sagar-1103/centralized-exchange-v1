import handleCreateMarket from "../handlers/create-market";
import handleCreateOrder from "../handlers/create-order";
import handleGetDepth from "../handlers/get-depth";
import handleOnboard from "../handlers/onboard";
import handleOnramp from "../handlers/onramp";

export type EngineRequestType = "create_order" | "onboard" | "onramp" | "create_market" | "get_depth";

export interface EngineRequest {
    correlationId: string;
    payload: Record<string, unknown>;
    type: EngineRequestType;
    responseQueue: string;
}

export interface EngineResponse {
    correlationId: string;
    data?: unknown;
    ok: boolean;
    error?: string;
}

export interface Collateral {
    available: number;
    locked: number;
}

export type OrderSide = "BUY" | "SELL";
export type PositionSide = "LONG" | "SHORT";
export type Type = "LIMIT" | "MARKET";
export type Status = "OPEN" | "PARTIALLY_FILLED" | "FILLED" | "CANCELLED";

export interface Position {
    positionId: string;
    userId: string;
    market: string;
    type: Type;
    qty: number;
    margin: number;
    liquidationPrice: number;
    averagePrice: number;
}

export interface OpenOrder {
    orderId: string;
    userId: string;
    market: string;
    side: OrderSide;
    type: "LIMIT";
    qty: number;
    filledQty: number;
    price: number;
    status: Status;
    margin: number;
    createdAt: number;
}

export interface Order {
    orderId: string;
    userId: string;
    side: OrderSide;
    type: Type;
    market: string;
    price: number;
    qty: number;
    filledQty: number;
    status: Status;
    fills: Fill[];
    margin: number;
    createdAt: number;
}


export interface OrderbookEntry {
    availableQty: number;
    openOrders: OpenOrder[];
}

export interface Orderbook {
    asks: Map<number, OrderbookEntry>;
    bids: Map<number, OrderbookEntry>;
    lastTradedPrice: number | null;
    indexPrice: number | null;
}

export interface Fill {
    fillId: string;
    makerOrderId: string;
    takerOrderId: string;
    makerId: string;
    takerId: string;
    market: string;
    qty: number;
    price: number;
}

export interface DepthLevel {
    price: number;
    qty: number;
}

export interface DepthResponse {
    symbol: string;
    bids: DepthLevel[];
    asks: DepthLevel[];
}


export const BALANCES = new Map<string, Collateral>();
export const POSITIONS = new Map<string, Position[]>();
export const ORDERS = new Map<string, Order>();
export const ORDERBOOKS = new Map<string, Orderbook>();
export const FILLS = new Map<string, Fill>();

export type RequestHandler = (message: EngineRequest) => unknown;

export const requestHandlers: Record<EngineRequestType, RequestHandler> = {
    "onboard": handleOnboard,
    "onramp": handleOnramp,
    "get_depth": handleGetDepth,
    "create_market": handleCreateMarket,
    "create_order": handleCreateOrder,
}
