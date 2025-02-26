## Prisma

-Migration

```bash
prisma migrate dev --name <name_of_migration>
```

## Run In Container

```bash
export $(grep -v '^#' .env | xargs) && docker build --build-arg DATABASE_URL=$DATABASE_URL -t squadrn_api .
docker run --rm -d --env-file .env -p 8080:8080 --name squadrn_api squadrn_api
```
