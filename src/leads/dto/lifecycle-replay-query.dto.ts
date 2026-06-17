import { Type } from "class-transformer";
import { IsIn, IsInt, IsISO8601, IsOptional, Max, Min } from "class-validator";
import { MAX_LIFECYCLE_REPLAY_EVENTS, LifecycleReplayPurpose } from "../integrations/lifecycle-replay-contract";

const lifecycleReplayPurposes: LifecycleReplayPurpose[] = [
  "consumer_reconciliation",
  "incident_replay",
  "consent_audit",
  "conversion_linkage_replay",
];

export class LifecycleReplayQueryDto {
  @IsIn(["flipflop-service"])
  consumer!: "flipflop-service";

  @IsOptional()
  @IsIn(lifecycleReplayPurposes)
  purpose?: LifecycleReplayPurpose;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_LIFECYCLE_REPLAY_EVENTS)
  limit?: number;

  @IsOptional()
  @IsISO8601()
  fromOccurredAt?: string;

  @IsOptional()
  @IsISO8601()
  toOccurredAt?: string;
}
