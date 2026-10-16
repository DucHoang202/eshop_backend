# Food & Home Backend

An Express and Prisma backend for the Food & Home food and household goods store. The default port is `5002`.

## API documentation

Swagger UI: [https://webcuatoi.io.vn/api-docs](https://webcuatoi.io.vn/api-docs) or [http://localhost:5002/api-docs](http://localhost:5002/api-docs) when running locally.

## Health check

Check the API on the server or from another machine:

```bash
curl http://localhost:5002/api/health
```

A successful response is `{"status":"ok"}`.

## Products API

Product endpoints are available under `/api/products`. Supported categories are `FOOD_FRESH`, `FOOD_PACKAGED`, `FOOD_BEVERAGE`, `HOME_KITCHEN`, `HOME_CLEANING`, and `HOME_APPLIANCE`.

The API supports listing and filtering products, search, category listing, product details, single and bulk creation, updates, stock updates, activation and deactivation, and deletion. See Swagger UI for complete request and response details.

## Authentication API

Authentication currently provides `POST /api/auth/register` and `POST /api/auth/login`.
