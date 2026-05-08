import { onMounted, type Ref, ref } from "vue";
import type { RouteLocationNormalizedLoaded } from "vue-router";
import { good } from "@/services/CSQaQ";

type MaybeId = string | number | undefined;

type WearTab = {
  id: MaybeId;
  name: string;
  switch?: boolean;
};

type ItemDetailData = {
  goods_info?: {
    id?: MaybeId;
  };
  button_list?: WearTab[];
};

export function useItemDetail(
  route: RouteLocationNormalizedLoaded,
  fetchChart: (id: MaybeId) => Promise<void>,
  currentId: Ref<MaybeId>,
) {
  const item = ref<ItemDetailData | null>(null);
  const isLoading = ref(false);
  const wearTabs = ref<WearTab[]>([]);
  const activeWearTab = ref<MaybeId>();
  const isStatTrak = ref(false);

  const syncItemState = (data: ItemDetailData) => {
    item.value = data;
    activeWearTab.value = data.goods_info?.id;
    wearTabs.value = data.button_list ?? [];
  };

  const loadItemDetail = async (id: MaybeId) => {
    if (!id) {
      return;
    }

    isLoading.value = true;
    currentId.value = id;

    try {
      const { data } = await good({ id });
      syncItemState(data);
      await fetchChart(currentId.value);
    } finally {
      isLoading.value = false;
    }
  };

  const chooseWearTab = async (tab: WearTab) => {
    activeWearTab.value = tab.id;
    await loadItemDetail(tab.id);
  };

  onMounted(async () => {
    await loadItemDetail(route.query.id as MaybeId);
  });

  return {
    item,
    isLoading,
    wearTabs,
    activeWearTab,
    isStatTrak,
    chooseWearTab,
    loadItemDetail,
  };
}
