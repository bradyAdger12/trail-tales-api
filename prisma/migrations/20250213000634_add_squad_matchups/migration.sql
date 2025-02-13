-- CreateTable
CREATE TABLE "squad_matchups" (
    "id" TEXT NOT NULL,
    "squad_1_id" TEXT NOT NULL,
    "squad_2_id" TEXT NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "squad_matchups_pkey" PRIMARY KEY ("squad_1_id","squad_2_id")
);
