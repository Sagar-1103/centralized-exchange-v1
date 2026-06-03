import { ORDERBOOKS, type OpenOrder, type Order, type OrderbookEntry, type OrderSide } from "../store/perps-store"

export class Orderbook {
    asks:Map<number,OrderbookEntry>;
    bids:Map<number,OrderbookEntry>;
    indexPrice:number | null;
    lastTradedPrice:number | null;
    market:string;

    // constructor(_asks:Map<number,OrderbookEntry>,_bids:Map<number,OrderbookEntry>,_indexPrice:number,_lastTradedPrice:number,_market:string) {
    //     this.asks = _asks; 
    //     this.bids = _bids;
    //     this.indexPrice = _indexPrice;
    //     this.lastTradedPrice = _lastTradedPrice;
    //     this.market = _market;
    // }
    constructor(_indexPrice:number | null,_lastTradedPrice:number | null,_market:string) {
        let orderbook = ORDERBOOKS.get(_market);
        if (!orderbook) {
            orderbook = {
                asks:new Map<number,OrderbookEntry>(),
                bids:new Map<number,OrderbookEntry>(),
                indexPrice: _indexPrice,
                lastTradedPrice:_lastTradedPrice
            }
            ORDERBOOKS.set(_market,orderbook);
        }
        this.asks = orderbook.asks; 
        this.bids = orderbook.bids;
        this.indexPrice = orderbook.indexPrice;
        this.lastTradedPrice = orderbook.lastTradedPrice;
        this.market = _market;
    }

    getOrderBookEntry(price:number,side:OrderSide) {
        if (side==="BUY") {
            return this.bids.get(price);
        } else {
            return this.asks.get(price);
        }
    }

    getMakerPrices(side:OrderSide) {
        let makerPrices;
        if (side==="SELL") {
            makerPrices = [...this.asks.keys()].sort((a,b)=>a-b);
        } else {
            makerPrices = [...this.bids.keys()].sort((a,b)=>b-a);
        }
        return makerPrices;
    }

    update() {
        ORDERBOOKS.set(this.market,{
            asks:this.asks,
            bids:this.bids,
            lastTradedPrice:this.lastTradedPrice,
            indexPrice:this.indexPrice,
        });
    }

    addOrderBookEntry(price:number,side:OrderSide,openOrder:OpenOrder,qty:number) {
        const orderbookEntry = this.getOrderBookEntry(price,side);

        const newOpenOrders = orderbookEntry ? [...orderbookEntry.openOrders] : [];
        newOpenOrders.push(openOrder);
        if (side==="BUY") {
            this.bids.set(price,{availableQty:qty,openOrders:newOpenOrders});
        } else {
            this.asks.set(price,{availableQty:qty,openOrders:newOpenOrders});
        }
        return openOrder;
    }

    updateLevelQty(price:number,value:number,side:OrderSide) {
        const level = this.getOrderBookEntry(price,side);
        if (!level) return;

        if (side==="BUY") {
            this.bids.set(price,{
                availableQty:value,
                openOrders:level.openOrders,
            })
        } else {
            this.asks.set(price,{
                availableQty:value,
                openOrders:level.openOrders,
            })
        }
    }

    deleteOrderBookEntry(price:number,side:OrderSide,orderId:string) {
        const orderbookEntry = this.getOrderBookEntry(price,side);
        const openOrders = orderbookEntry?.openOrders;
        if (!openOrders?.length) return;

        const newOpenOrders = openOrders.filter(order => order.orderId !== orderId);

        if (newOpenOrders.length===0) {
            if (side==="BUY") {
                this.bids.delete(price);
            } else {
                this.asks.delete(price);
            }
        } else {
            const newOrderbookEntry:OrderbookEntry = {
                availableQty:newOpenOrders.reduce((acc,curr)=>{
                    acc += (curr.qty - curr.filledQty);
                    return acc;
                },0),
                openOrders:newOpenOrders,
            }
            if (side==="SELL") {
                this.bids.set(price,newOrderbookEntry);
            } else {
                this.asks.set(price,newOrderbookEntry);
            }
        }
    }
}