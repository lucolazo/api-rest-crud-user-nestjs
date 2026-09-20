# Microservicio de Pagos (Stripe + NestJS)

Trabajo Práctico 4 - Programación Avanzada (Licenciatura en Sistemas de Información)

## Requisitos previos

- Node.js instalado.
- Dependencias: ejecutar `npm install`.

## Configuración

1. Copiar el archivo `.env.template` a `.env` y rellenar las variables (`STRIPE_SECRET`, URLs, etc.).

## Ejecución

```bash
# Desarrollo
npm run start:dev
```

## Rutas Principales

1. POST /payments/create-payment-session: Recibe los datos del cliente, crea la sesión de pago en Stripe y devuelve la URL de redirección.
2. POST /payments/webhook: Recibe el aviso de Stripe cuando se concreta el cobro, validando la firma de seguridad mediante el cuerpo crudo (rawBody)
