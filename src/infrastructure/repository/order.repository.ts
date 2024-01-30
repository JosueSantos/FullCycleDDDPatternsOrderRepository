import Order from "../../domain/entity/order";
import OrderItem from "../../domain/entity/orderitem";
import OrderRepositoryInterface from "../../domain/repository/order-repository.interface";
import OrderItemModel from "../db/sequelize/model/order-item.model";
import OrderModel from "../db/sequelize/model/order.model";

export default class OrderRepository implements OrderRepositoryInterface {
    async create(entity: Order): Promise<void> {
        await OrderModel.create(
            {
                id: entity.id,
                customer_id: entity.customerId,
                total: entity.total(),
                items: entity.items.map((item) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    product_id: item.productId,
                    quantity: item.quantity,
                })),
            },
            {
                include: [{ model: OrderItemModel }],
            }
        );
    }

    async update(entity: Order): Promise<void> {
        const sequelize = OrderModel.sequelize;
        await sequelize.transaction(async (t) => {
            await OrderItemModel.destroy({
                where: { order_id: entity.id },
                transaction: t,
            });

            const items = entity.items.map((item) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,

                product_id: item.productId,
                order_id: entity.id,
            }));

            await OrderItemModel.bulkCreate(items, { transaction: t });

            await OrderModel.update(
                {
                    customer_id: entity.customerId,
                    total: entity.total(),
                },
                {
                    where: { id: entity.id },
                    transaction: t
                }
            );
        });
    }

    async find(id: string): Promise<Order> {
        try {
            const orderModel = await OrderModel.findOne({
                where: { id },
                include: ["items"],
                rejectOnEmpty: true,
            });

            const order = new Order(
                orderModel.id,
                orderModel.customer_id,
                orderModel.items.map((item) => new OrderItem(
                    item.id,
                    item.product_id,

                    item.name,
                    item.price,
                    item.quantity,
                ))
            );

            return order;
        } catch (error) {
            throw new Error("Order not found");
        }
    }

    async findAll(): Promise<Order[]> {
        const orderModels = await OrderModel.findAll({
            include: ["items"],
        });

        const orders = orderModels.map((orderModel) => {
            return new Order(
                orderModel.id,
                orderModel.customer_id,
                orderModel.items.map((item) => new OrderItem(
                    item.id,
                    item.product_id,

                    item.name,
                    item.price,
                    item.quantity,
                ))
            );
        });

        return orders;
    }

}
