import VocabularyUtils from "@utils/VocabularyUtils";
import {AbstractModel, CONTEXT as ABSTRACT_CONTEXT} from "@models/abstractModel";
import {CONTEXT as RPN_CONTEXT, RiskPriorityNumber} from "@models/rpnModel";

const ctx = {
    "name": VocabularyUtils.PREFIX + "hasName",
    "description": VocabularyUtils.PREFIX + "hasDescription",
    "takenAction": VocabularyUtils.PREFIX + "isPreventedBy",
    "gateType": VocabularyUtils.PREFIX + "hasGateType",
    "eventType": VocabularyUtils.PREFIX + "hasFaultEventType",
    "rpn": VocabularyUtils.PREFIX + "hasRPN",
    "probability": VocabularyUtils.PREFIX + "hasProbability",
    "parent": VocabularyUtils.PREFIX + "hasParent",
    "children": VocabularyUtils.PREFIX + "hasChildren",
};

export const CONTEXT = Object.assign({}, ctx, ABSTRACT_CONTEXT, RPN_CONTEXT);

export enum EventType {
    BASIC = "BASIC",
    EXTERNAL = "EXTERNAL",
    UNDEVELOPED = "UNDEVELOPED",
    CONDITIONING = "CONDITIONING",
    INTERMEDIATE = "INTERMEDIATE"
}

export interface FaultEvent extends AbstractModel {
    eventType: EventType,
    name: string,
    description?: string,
    rpn: RiskPriorityNumber,
    gateType?: GateType,
    probability?: number,
    parent?: string,
    children?: FaultEvent[],
}

export enum GateType {
    AND = "AND",
    OR = "OR",
    XOR = "XOR",
    PRIORITY_AND = "PRIORITY_AND",
    INHIBIT = "INHIBIT",
    UNUSED = "UNUSED",
}

// returns true as first argument of array if option should be enabled in select
export const gateTypeValues = (): [boolean, GateType][] =>
    Object.values(GateType).map(value => {
        if (value === GateType.UNUSED) {
            return [false, GateType.UNUSED]
        } else {
            return [true, value]
        }
    })
