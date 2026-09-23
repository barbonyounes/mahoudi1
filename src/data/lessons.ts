import { lesson } from "@/data/lesson";
import { lessonMilieu } from "@/data/lesson-milieu";
import { lessonDiversity } from "@/data/lesson-diversity";
import { lessonRelations } from "@/data/lesson-relations";
import { lessonFoodSource } from "@/data/lesson-food-source";
import { lessonFoodCompo1 } from "@/data/lesson-food-compo-1";
import { lessonFoodCompo2 } from "@/data/lesson-food-compo-2";
import { lessonFoodRoles } from "@/data/lesson-food-roles";
import { lessonRations } from "@/data/lesson-rations";
import { lessonFoodBalance } from "@/data/lesson-food-balance";
import { lessonPlantNeeds } from "@/data/lesson-plant-needs";
import { lessonKnopNpk } from "@/data/lesson-knop-npk";
import { lessonRootHairs } from "@/data/lesson-root-hairs";
import { lessonStomataCo2 } from "@/data/lesson-stomata-co2";
import { lessonStarchTest } from "@/data/lesson-starch-test";
import { lessonPhotosynthesis } from "@/data/lesson-photosynthesis";
import { lessonPlantProducer } from "@/data/lesson-plant-producer";
import { lessonSapFlow } from "@/data/lesson-sap-flow";
import { lessonTranspiration } from "@/data/lesson-transpiration";
import { lessonDigMouth } from "@/data/lesson-dig-mouth";
import { lessonDigStomach } from "@/data/lesson-dig-stomach";
import { lessonDigEnzymes } from "@/data/lesson-dig-enzymes";
import { lessonDigAnatomy } from "@/data/lesson-dig-anatomy";
import { lessonAbsVilli } from "@/data/lesson-abs-villi";
import { lessonAbsMechanism } from "@/data/lesson-abs-mechanism";
import { lessonAbsSummary } from "@/data/lesson-abs-summary";
import { lessonBloodCompo } from "@/data/lesson-blood-compo";
import { lessonAbsPathsLiver } from "@/data/lesson-abs-paths-liver";
import { lessonCirculation } from "@/data/lesson-circulation";
import { lessonInternalMilieu } from "@/data/lesson-internal-milieu";
import { lessonFoodChains } from "@/data/lesson-food-chains";
import { lessonEcosystemBalance } from "@/data/lesson-ecosystem-balance";
import { lessonHumanImpact } from "@/data/lesson-human-impact";
import type { LessonDef } from "@/data/lesson";

export const lessons: LessonDef[] = [
  lessonFoodSource,
  lessonFoodCompo1,
  lessonFoodCompo2,
  lessonFoodRoles,
  lessonRations,
  lessonFoodBalance,
  lessonPlantNeeds,
  lessonKnopNpk,
  lessonRootHairs,
  lessonStomataCo2,
  lessonStarchTest,
  lessonPhotosynthesis,
  lessonPlantProducer,
  lessonSapFlow,
  lessonTranspiration,
  lessonMilieu,
  lessonDiversity,
  lessonRelations,
  lessonFoodChains,
  lessonEcosystemBalance,
  lessonHumanImpact,
  lesson,
  lessonDigMouth,
  lessonDigStomach,
  lessonDigEnzymes,
  lessonDigAnatomy,
  lessonAbsVilli,
  lessonAbsMechanism,
  lessonAbsSummary,
  lessonBloodCompo,
  lessonAbsPathsLiver,
  lessonCirculation,
  lessonInternalMilieu,
];

export function getLessonById(id: string): LessonDef | undefined {
  return lessons.find((l) => l.id === id);
}
