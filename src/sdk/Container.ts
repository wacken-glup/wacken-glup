import { reactive, ref, type Ref } from "vue";

import type { WoaFestivalDay, WoaStage } from "./model/WoaModels";
import type WoaEventModelWrapper from "./model/WoaEventModelWrapper";
import type SpaceMember from "./model/SpaceMember";

export default class Container {

    sortedEvents = reactive<WoaEventModelWrapper[]>([])

    events = reactive<WoaEventModelWrapper[]>([])
    stages: Ref<WoaStage[]> = ref([])
    days: Ref<WoaFestivalDay[]> = ref([])

    eventsByDayUid: Ref<Map<Number, WoaEventModelWrapper[]>> = ref(new Map())
    eventsByStageUid: Ref<Map<Number, WoaEventModelWrapper[]>> = ref(new Map())

    eventByUid: Ref<Map<Number, WoaEventModelWrapper>> = ref(new Map())
    eventByUidNonRef: Map<Number, WoaEventModelWrapper> = new Map()
    
    spaceMemberById = reactive<Map<string, SpaceMember>>(new Map())

}