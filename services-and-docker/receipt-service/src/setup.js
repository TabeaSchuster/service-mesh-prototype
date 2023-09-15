const rabbitmqUrl = new URL(
    `amqp://${process.env.RABBITMQ_HOST ?? "localhost"}:${
        process.env.RABBITMQ_PORT ?? 5672
    }`// -e RABBITMQ_HOST=192.168.65.2 //host.minikube.internal
);
rabbitmqUrl.username = process.env.RABBITMQ_USERNAME ?? "admin";
rabbitmqUrl.password = process.env.RABBITMQ_PASSWORD ?? "admin";

const queue = process.env.RABBITMQ_QUEUE ?? "myQueue";
const exchange = process.env.RABBITMQ_EXCHANGE ?? "myExchange";
const routingKey = process.env.RABBITMQ_ROUTING_KEY ?? "myRoutingKey";

module.exports = {
    rabbitmqUrl,
    queue,
    exchange,
    routingKey,
};
