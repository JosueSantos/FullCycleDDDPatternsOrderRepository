import Address from "../../entity/address";
import Customer from "../../entity/customer";
import CustomerChangeAddressEvent from "./customer/customer-change-address.event";
import CustomerCreatedEvent from "./customer/customer-created.event";
import SendConsoleLogWhenCustomerChangeAddressHandler from "./customer/handler/send-console-log-when-customer-change-address.handler";
import SendConsoleLogWhenCustomerIsCreated1Handler from "./customer/handler/send-console-log-when-customer-is-created-1.handler";
import SendConsoleLogWhenCustomerIsCreated2Handler from "./customer/handler/send-console-log-when-customer-is-created-2.handler";
import EventDispatcher from "./event-dispatcher";
import SendEmailWhenProductIsCreatedHandler from "./product/handler/send-email-when-product-is-created.handler";
import ProductCreatedEvent from "./product/product-created.event";

describe("Domain events tests", () => {
    it("should register an event handler", () => {
        const eventDispatcher = new EventDispatcher();
        const eventHandler = new SendEmailWhenProductIsCreatedHandler();

        eventDispatcher.register("ProductCreatedEvent", eventHandler);

        expect(
            eventDispatcher.getEventHandlers["ProductCreatedEvent"]
        ).toBeDefined();

        expect(
            eventDispatcher.getEventHandlers["ProductCreatedEvent"].length
        ).toBe(1);

        expect(
            eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
        ).toMatchObject(eventHandler);
    });

    it("should unregister an event handler", () => {
        const eventDispatcher = new EventDispatcher();
        const eventHandler = new SendEmailWhenProductIsCreatedHandler();

        eventDispatcher.register("ProductCreatedEvent", eventHandler);

        expect(
            eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
        ).toMatchObject(eventHandler);

        eventDispatcher.unregister("ProductCreatedEvent", eventHandler);

        expect(
            eventDispatcher.getEventHandlers["ProductCreatedEvent"]
        ).toBeDefined();

        expect(
            eventDispatcher.getEventHandlers["ProductCreatedEvent"].length
        ).toBe(0);
    });

    it("should unregister all event handlers", () => {
        const eventDispatcher = new EventDispatcher();
        const eventHandler = new SendEmailWhenProductIsCreatedHandler();

        eventDispatcher.register("ProductCreatedEvent", eventHandler);

        expect(
            eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
        ).toMatchObject(eventHandler);

        eventDispatcher.unregisterAll();

        expect(
            eventDispatcher.getEventHandlers["ProductCreatedEvent"]
        ).toBeUndefined();
    });

    it("should notify all event handlers", () => {
        const eventDispatcher = new EventDispatcher();
        const eventHandler = new SendEmailWhenProductIsCreatedHandler();
        const spyEventHandler = jest.spyOn(eventHandler, "handle");

        eventDispatcher.register("ProductCreatedEvent", eventHandler);

        expect(
            eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
        ).toMatchObject(eventHandler);

        const productCreatedEvent = new ProductCreatedEvent({
            name: "Product 1",
            description: "Product 1 description",
            price: 10.0,
        });

        // Quando o notify for executado o SendEmailWhenProductIsCreatedHandler.handle() deve ser chamado
        eventDispatcher.notify(productCreatedEvent);

        expect(spyEventHandler).toHaveBeenCalled();
    });
    
    it("should notify customer event handlers", () => {
        const eventDispatcher = new EventDispatcher();

        const eventCustomerIsCreated1Handler = new SendConsoleLogWhenCustomerIsCreated1Handler();
        const spyEventCustomerIsCreated1Handler = jest.spyOn(eventCustomerIsCreated1Handler, "handle");
        
        const eventCustomerIsCreated2Handler = new SendConsoleLogWhenCustomerIsCreated2Handler();
        const spyEventCustomerIsCreated2Handler = jest.spyOn(eventCustomerIsCreated2Handler, "handle");

        const eventCustomerChangeAddressHandler = new SendConsoleLogWhenCustomerChangeAddressHandler();
        const spyEventCustomerChangeAddressHandler = jest.spyOn(eventCustomerChangeAddressHandler, "handle");
        
        
        eventDispatcher.register("CustomerCreatedEvent", eventCustomerIsCreated1Handler);
        eventDispatcher.register("CustomerCreatedEvent", eventCustomerIsCreated2Handler);
        eventDispatcher.register("CustomerChangeAddressEvent", eventCustomerChangeAddressHandler);

        expect(
            eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]
        ).toMatchObject(eventCustomerIsCreated1Handler);

        expect(
            eventDispatcher.getEventHandlers["CustomerCreatedEvent"][1]
        ).toMatchObject(eventCustomerIsCreated2Handler);

        expect(
            eventDispatcher.getEventHandlers["CustomerChangeAddressEvent"][0]
        ).toMatchObject(eventCustomerChangeAddressHandler);

        const customer = new Customer("123", "Customer 1");
        const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
        customer.Address = address;

        const customerCreatedEvent = new CustomerCreatedEvent({
            id: customer.id,
            name: customer.name,
            address: customer.Address.toString(),
        });

        eventDispatcher.notify(customerCreatedEvent);

        expect(spyEventCustomerIsCreated1Handler).toHaveBeenCalled();
        expect(spyEventCustomerIsCreated2Handler).toHaveBeenCalled();

        const address2 = new Address("Street 2", 2, "Zipcode 1", "City 1");
        customer.changeAddress(address2);

        const customerChangeAddressEvent = new CustomerChangeAddressEvent({
            id: customer.id,
            name: customer.name,
            address: customer.Address.toString(),
        });

        eventDispatcher.notify(customerChangeAddressEvent);

        expect(spyEventCustomerChangeAddressHandler).toHaveBeenCalled();
    });
});