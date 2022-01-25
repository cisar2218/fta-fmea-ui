import VocabularyUtils from "@utils/VocabularyUtils";
import {FailureMode, CONTEXT as FAILURE_MODE_CONTEXT, BehaviorType} from "@models/failureModeModel";
import {AbstractModel, CONTEXT as ABSTRACT_CONTEXT} from "@models/abstractModel";

const ctx = {
    "name": VocabularyUtils.PREFIX + "hasName",
    "failureModes": VocabularyUtils.PREFIX + "impairedBy",
    "requiredFunctions": VocabularyUtils.PREFIX + "requires",
    "functionParts": VocabularyUtils.PREFIX + "hasChildBehavior",
    "behaviorType": VocabularyUtils.PREFIX + "hasBehaviorType"
};

export const CONTEXT = Object.assign({}, ABSTRACT_CONTEXT, FAILURE_MODE_CONTEXT, ctx);

export interface CreateFunction extends AbstractModel {
    name: string,
}

export interface Function extends CreateFunction {
    failureModes: FailureMode[],
    requiredFunctions: Function[],
    functionParts: Function[],
    behaviorType: BehaviorType
}