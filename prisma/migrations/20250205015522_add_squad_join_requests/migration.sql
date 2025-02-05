-- CreateTable
CREATE TABLE "squad_join_requests" (
    "user_id" TEXT NOT NULL,
    "squad_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "squad_join_requests_pkey" PRIMARY KEY ("user_id","squad_id")
);

-- AddForeignKey
ALTER TABLE "squad_join_requests" ADD CONSTRAINT "squad_join_requests_squad_id_fkey" FOREIGN KEY ("squad_id") REFERENCES "squads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "squad_join_requests" ADD CONSTRAINT "squad_join_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
