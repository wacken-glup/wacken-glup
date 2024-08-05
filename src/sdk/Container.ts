import { reactive, ref, type Ref } from "vue";

import type BaseCardDataModel from "./model/BaseCardDataModel";
import type WoaEventModelWrapper from "./model/WoaEventModelWrapper";
import type WoaBandModelWrapper from "./model/WoaBandModelWrapper";

import type { WoaFestival, WoaFestivalDay, WoaStage } from "./model/WoaModels";

import type SpaceMember from "./model/SpaceMember";

export default class Container {

    sortedEvents = reactive<WoaEventModelWrapper[]>([])

    combinedActs = reactive<BaseCardDataModel[]>([])
    actByUid: Ref<Map<string, BaseCardDataModel>> = ref(new Map())
    actByUidNonRef: Map<string, BaseCardDataModel> = new Map()

    bands = reactive<WoaBandModelWrapper[]>([])

    events = reactive<WoaEventModelWrapper[]>([])
    stages: Ref<WoaStage[]> = ref([])
    days: Ref<WoaFestivalDay[]> = ref([])

    festival: Ref<WoaFestival | undefined> = ref(undefined)

    eventsByDayUid: Ref<Map<Number, WoaEventModelWrapper[]>> = ref(new Map())
    eventsByStageUid: Ref<Map<Number, WoaEventModelWrapper[]>> = ref(new Map())

    eventByUid: Ref<Map<string, WoaEventModelWrapper>> = ref(new Map())
    eventByUidNonRef: Map<string, WoaEventModelWrapper> = new Map()
    
    spaceMemberById = reactive<Map<string, SpaceMember>>(new Map())

}