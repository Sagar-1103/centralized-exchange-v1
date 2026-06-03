import { BALANCES, type Collateral } from "../store/perps-store";

export class Balance {
    userId:string;
    constructor(userId: string) {
        this.userId = userId;
    }

    get() {
        let balance = BALANCES.get(this.userId);
        if (!balance) {
            balance = this.init();
        }
        return balance;
    }

    set(newBalance: Collateral) {
        BALANCES.set(this.userId,newBalance);
        return this.get();
    }

    init() {
        const balance = BALANCES.get(this.userId);
        const newBalance = { available:balance?.available || 0, locked: balance?.locked || 0 };
        BALANCES.set(this.userId,newBalance);;
        return newBalance; 
    }

    onramp(amount:number) {
        let balance = this.get();
        const newBalance = {...balance};
        newBalance.available += amount;
        this.set(newBalance);
        return this.get();
    }

    hasEnoughBalance(equity: number) {
        const balance = this.get();
        return equity > balance.available;
    }

    lockBalance(amount: number) {
        let balance = this.get();

        const newBalance = {...balance};
        newBalance.available -= amount;
        newBalance.locked += amount;
        this.set(newBalance);
        return this.get();
    }

    releaseBalance(amount:number) {
        let balance = this.get();

        const newBalance = {...balance};
        newBalance.available += amount;
        newBalance.locked -= amount;
        this.set(newBalance);
        return this.get();
    }
}