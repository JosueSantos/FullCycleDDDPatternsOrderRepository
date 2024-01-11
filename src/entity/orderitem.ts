export default class OrderItem {

    private _id: string;
    private _productId: string;

    private _name: string;
    private _price: number;
    private _quantity: number;
    private _total: number;

    constructor(
        id: string,
        productId: string,

        name: string,
        price: number,
        quantity: number
    ) {
        this._id = id;
        this._productId = productId;

        this._name = name;
        this._price = price;
        this._quantity = quantity;
        this._total = this.total();
    }

    get id(): string {
        return this._id;
    }

    get productId(): string {
        return this._productId;
    }

    get name(): string {
        return this._name;
    }

    get price(): number {
        return this._price;
    }

    get quantity(): number {
        return this._quantity;
    }

    total(): number {
        return this._price * this._quantity
    }

}