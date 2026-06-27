import type {
  MeetingLoad,
  WorkCapacity,
  WorkScheduleType,
} from "./enterprise";
import type { TranslateParams } from "./i18n";

type Translator = (key: string, params?: TranslateParams) => string;

const scheduleLabelKeys: Record<WorkScheduleType, string> = {
  full: "workCapacity.fullCapacity",
  standard: "workCapacity.standardDay",
  reduced: "workCapacity.reducedLoad",
  flexible: "workCapacity.flexible",
  rest: "workCapacity.restDay",
};

const guidanceKeys: Record<WorkScheduleType, string> = {
  full: "enterprise.guidanceFull",
  standard: "enterprise.guidanceStandard",
  reduced: "enterprise.guidanceReduced",
  flexible: "enterprise.guidanceFlexible",
  rest: "enterprise.guidanceRest",
};

const meetingLoadKeys: Record<MeetingLoad, string> = {
  full: "workCapacity.full",
  light: "workCapacity.light",
  minimal: "workCapacity.minimal",
  none: "workCapacity.none",
};

function translateFlag(flag: string, t: Translator): string {
  if (flag === "Reduced capacity recommended") return t("enterprise.flagReducedCapacity");
  if (flag === "Flexible schedule") return t("enterprise.flagFlexible");
  if (flag === "Rest recommended") return t("enterprise.flagRest");
  if (flag === "High stress logged") return t("enterprise.flagHighStress");
  if (flag === "Flagged at-risk by HR") return t("enterprise.flagAtRisk");

  const sleepDebt = flag.match(/^Sleep debt: ([\d.]+)h$/);
  if (sleepDebt) return t("enterprise.flagSleepDebt", { hours: sleepDebt[1] });

  const lowRecovery = flag.match(/^(\d+) days low recovery — burnout risk$/);
  if (lowRecovery) return t("enterprise.flagLowRecovery", { days: lowRecovery[1] });

  return flag;
}

export function translateCapacity(
  capacity: WorkCapacity,
  t: Translator
): WorkCapacity {
  return {
    ...capacity,
    label: t(scheduleLabelKeys[capacity.scheduleType]),
    guidance: t(guidanceKeys[capacity.scheduleType]),
    meetingLoad: capacity.meetingLoad,
    flags: capacity.flags.map((flag) => translateFlag(flag, t)),
  };
}

export function translateMeetingLoad(meetingLoad: MeetingLoad, t: Translator): string {
  return t(meetingLoadKeys[meetingLoad]);
}
