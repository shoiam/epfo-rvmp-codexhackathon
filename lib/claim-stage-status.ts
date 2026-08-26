const ESCALATION_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export function canEscalateClaimStage(
  stage: { enteredAt: Date; exitedAt: Date | null },
  now = new Date(),
) {
  return stage.exitedAt === null && now.getTime() - stage.enteredAt.getTime() >= ESCALATION_WINDOW_MS;
}
