-- CreateIndex
CREATE INDEX "games_genre_idx" ON "games"("genre");

-- CreateIndex
CREATE INDEX "games_developer_idx" ON "games"("developer");

-- CreateIndex
CREATE INDEX "games_publisher_idx" ON "games"("publisher");

-- CreateIndex
CREATE INDEX "games_createdAt_idx" ON "games"("created_at");

-- CreateIndex (Composite)
CREATE INDEX "games_system_title_idx" ON "games"("system", "title");
