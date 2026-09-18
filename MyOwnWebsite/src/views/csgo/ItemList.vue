<template>
  <div ref="pageRef" class="item-list-shell">
    <CsgoLightParticles
      class="page-particles"
      :particle-count="24"
      :orb-count="4"
      intensity="medium"
    />
    <n-layout class="item-list-page" content-style="min-height: 100vh">
    <n-layout-header class="header">
      <div class="header-content">
        <div class="logo" @click="goHome">
          <span class="logo-text">CS</span>
          <span class="logo-accent">饰品</span>
        </div>
        <div class="nav-menu">
          <div
            v-for="item in menuOptions"
            :key="item.key"
            class="nav-item"
            :class="{ active: activeNavItem === item.key }"
            @click="handleNavClick(item)"
          >
            <component :is="item.icon" class="nav-icon" />
            <span class="nav-label">{{ item.label }}</span>
          </div>
        </div>
        <div class="header-right">
          <div class="search-container">
            <div class="search-box">
              <n-icon class="search-icon">
                <SearchOutline />
              </n-icon>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索饰品名称..."
                class="search-input"
                @focus="showSearchDropdown = true"
                @blur="handleSearchBlur"
              />
              <n-icon
                v-if="searchQuery"
                class="clear-icon"
                @click="clearSearch"
              >
                <CloseOutline />
              </n-icon>
            </div>
          </div>
          <n-space>
            <n-button quaternary class="header-btn">登录</n-button>
            <n-button type="primary" class="header-btn register-btn">
              注册
            </n-button>
            <n-button class="back-btn" @click="goHome">
              <template #icon>
                <n-icon><ArrowBackOutline /></n-icon>
              </template>
              返回首页
            </n-button>
          </n-space>
        </div>
      </div>
    </n-layout-header>

    <n-layout-content class="content">
      <div class="main-container">
        <div class="tools-bar">
          <div class="tools-left">
            <div class="search-input-bar">
              <n-icon class="input-search-icon">
                <SearchOutline />
              </n-icon>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="请输入饰品名称搜索"
                class="main-search-input"
              />
            </div>
            <n-button class="filter-btn" @click="showFilterDrawer = true">
              <template #icon>
                <n-icon><FilterOutline /></n-icon>
              </template>
              筛选
            </n-button>
          </div>
          <div class="tools-right">
            <n-select
              v-model:value="sortOrder"
              :options="sortOptions"
              placeholder="排序"
              size="small"
              style="width: 120px"
            />
          </div>
        </div>

        <div class="category-tabs" data-motion-tabs>
          <div
            v-for="(tab, index) in categoryTabs"
            :key="tab.key"
            class="category-tab"
            data-motion-tab
            :class="{ active: activeCategoryTab === tab.key }"
            @click="activeCategoryTab = tab.key"
          >
            {{ tab.label }}
          </div>
        </div>

        <div class="items-grid">
          <div
            v-for="item in filteredItems"
            :key="item.id"
            class="item-card"
            @click="goToDetail(item)"
          >
            <div class="item-tag" :class="item.tagType">
              {{ item.tag }}
            </div>
            <div class="item-image-wrapper">
              <img :src="item.image" :alt="item.name" class="item-image" />
            </div>
            <div class="item-info">
              <h4 class="item-name">{{ item.name }}</h4>
              <div class="item-bottom">
                <div class="item-price">
                  <span class="price-symbol">¥</span>
                  <span class="price-value">{{
                    item.price.toLocaleString()
                  }}</span>
                </div>
                <div class="item-stock">{{ item.stock }}件在售</div>
              </div>
            </div>
          </div>
        </div>

        <div class="load-more" data-scroll-reveal>
          <n-button type="primary" ghost> 加载更多 </n-button>
        </div>
      </div>

      <CsgoFilterDrawer
        v-model:show="showFilterDrawer"
        v-model:selected-values="selectedFilters"
        :groups="filterGroups"
        @opened="animateFilterDrawer"
        @apply="applyFilters"
      />
    </n-layout-content>
    </n-layout>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, watch } from "vue";
import { useRouter } from "vue-router";
import {
  NButton,
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NSpace,
  NSelect,
} from "naive-ui";
import {
  HomeOutline,
  ListOutline,
  TrophyOutline,
  CartOutline,
  SwapHorizontalOutline,
  FlameOutline,
  SearchOutline,
  CloseOutline,
  FilterOutline,
  ArrowBackOutline,
} from "@vicons/ionicons5";
import CsgoLightParticles from "@/components/csgo/CsgoLightParticles.vue";
import CsgoFilterDrawer from "@/components/csgo/CsgoFilterDrawer.vue";
import type {
  CsgoFilterGroup,
  CsgoFilterValues,
} from "@/components/csgo/filterDrawerTypes";
import { useCsgoPageMotion } from "@/composables/csgo/useCsgoPageMotion";

const router = useRouter();
const pageRef = useTemplateRef<HTMLElement>("pageRef");
const { clearMotions, playStaggerIn, playTabTransition, playTimeline, pulse } =
  useCsgoPageMotion(pageRef);

const activeNavItem = ref("items");
const searchQuery = ref("");
const showSearchDropdown = ref(false);
const activeCategoryTab = ref("all");
const sortOrder = ref("price-asc");
const showFilterDrawer = ref(false);

const selectedFilters = ref<CsgoFilterValues>({
  类型: [],
  品质: [],
  类别: [],
  磨损: [],
});

const filterGroups = ref<CsgoFilterGroup[]>([
  {
    name: "类型",
    sections: [
      {
        title: "匕首",
        options: [
          { label: "不限", value: "knife-all" },
          { label: "蝴蝶刀", value: "butterfly" },
          { label: "M9 刺刀", value: "m9" },
          { label: "爪子刀", value: "karambit" },
          { label: "廓尔喀刀", value: "kukri" },
          { label: "骷髅匕首", value: "skeleton" },
          { label: "刺刀", value: "bayonet" },
          { label: "锯齿爪刀", value: "talon" },
          { label: "流浪者匕首", value: "nomad" },
          { label: "折叠刀", value: "flip" },
          { label: "短剑", value: "stiletto" },
          { label: "海豹短刀", value: "navaja" },
          { label: "熊刀", value: "ursus" },
          { label: "猎杀者匕首", value: "huntsman" },
          { label: "系绳匕首", value: "paracord" },
          { label: "求生匕首", value: "survival" },
          { label: "弯刀", value: "falchion" },
          { label: "暗影双匕", value: "shadow" },
          { label: "鲍伊猎刀", value: "bowie" },
          { label: "穿肠刀", value: "gut" },
          { label: "折刀", value: "classic" },
        ],
      },
      {
        title: "手套",
        options: [
          { label: "不限", value: "glove-all" },
          { label: "运动手套", value: "sport" },
          { label: "专业手套", value: "specialist" },
          { label: "摩托手套", value: "moto" },
          { label: "驾驶手套", value: "driver" },
          { label: "手部束带", value: "handwrap" },
          { label: "狂牙手套", value: "fang" },
          { label: "九头蛇手套", value: "hydra" },
          { label: "血猎手套", value: "bloodhound" },
        ],
      },
      {
        title: "步枪",
        options: [
          { label: "不限", value: "rifle-all" },
          { label: "AK-47", value: "ak47" },
          { label: "AWP", value: "awp" },
          { label: "M4A1消音版", value: "m4a1s" },
          { label: "M4A4", value: "m4a4" },
          { label: "AUG", value: "aug" },
          { label: "SG 553", value: "sg553" },
          { label: "法玛斯", value: "famas" },
          { label: "加利尔AR", value: "galil-ar" },
          { label: "SSG 08", value: "ssg08" },
          { label: "SCAR-20", value: "scar20" },
          { label: "G3SG1", value: "g3sg1" },
        ],
      },
      {
        title: "手枪",
        options: [
          { label: "不限", value: "pistol-all" },
          { label: "沙漠之鹰", value: "deagle" },
          { label: "USP消音版", value: "usp-s" },
          { label: "格洛克18型", value: "glock18" },
          { label: "P2000", value: "p2000" },
          { label: "P250", value: "p250" },
          { label: "FN57", value: "five-seven" },
          { label: "R8左轮手枪", value: "r8-revolver" },
          { label: "Tec-9", value: "tec9" },
          { label: "双持贝瑞塔", value: "dual-berettas" },
          { label: "CZ75自动手枪", value: "cz75-auto" },
          { label: "电击枪", value: "zeus" },
        ],
      },
      {
        title: "微型冲锋枪",
        options: [
          { label: "不限", value: "smg-all" },
          { label: "MP9", value: "mp9" },
          { label: "MAC-10", value: "mac10" },
          { label: "UMP-45", value: "ump45" },
          { label: "P90", value: "p90" },
          { label: "MP7", value: "mp7" },
          { label: "PP-野牛", value: "pp-bizon" },
          { label: "MP5-SD", value: "mp5-sd" },
        ],
      },
      {
        title: "霰弹枪",
        options: [
          { label: "XM1014", value: "xm1014" },
          { label: "MAG-7", value: "mag7" },
          { label: "截短霰弹枪", value: "sawed-off" },
          { label: "新星", value: "nova" },
        ],
      },
      {
        title: "机枪",
        options: [
          { label: "M249", value: "m249" },
          { label: "内格夫", value: "negev" },
        ],
      },
      {
        title: "其他",
        options: [
          { label: "武器箱", value: "weapon-case" },
          { label: "音乐盒", value: "music-kit" },
          { label: "印花", value: "sticker" },
          { label: "工具", value: "tool" },
          { label: "收藏品", value: "collectible" },
          { label: "布章", value: "patch" },
          { label: "通行证", value: "pass" },
          { label: "挂件", value: "charm" },
        ],
      },
      {
        title: "探员",
        options: [
          { label: "不限", value: "agent-all" },
          { label: "反恐精英", value: "ct-agent" },
          { label: "恐怖分子", value: "t-agent" },
        ],
      },
    ],
  },
  {
    name: "品质",
    sections: [
      {
        title: "品质",
        options: [
          { label: "违禁", value: "contraband" },
          { label: "隐秘", value: "covert" },
          { label: "保密", value: "classified" },
          { label: "受限", value: "restricted" },
          { label: "军规级", value: "mil-spec" },
          { label: "工业级", value: "industrial" },
          { label: "消费级", value: "consumer" },
          { label: "普通级", value: "base" },
        ],
      },
      {
        title: "贴纸品质",
        options: [
          { label: "非凡", value: "remarkable" },
          { label: "卓越", value: "exotic" },
          { label: "奇异", value: "extraordinary" },
          { label: "高级", value: "high-grade" },
        ],
      },
      {
        title: "探员品质",
        options: [
          { label: "高级", value: "agent-superior" },
          { label: "卓越", value: "agent-exceptional" },
          { label: "非凡", value: "agent-remarkable" },
          { label: "大师", value: "agent-master" },
        ],
      },
    ],
  },
  {
    name: "类别",
    sections: [
      {
        title: "类别",
        options: [
          { label: "普通", value: "normal" },
          { label: "纪念品", value: "souvenir" },
          { label: "StatTrak™", value: "stattrak" },
          { label: "★", value: "star" },
          { label: "★ StatTrak™", value: "star-stattrak" },
        ],
      },
    ],
  },
  {
    name: "磨损",
    sections: [
      {
        title: "磨损",
        options: [
          { label: "崭新出厂", value: "factory-new" },
          { label: "略有磨损", value: "minimal-wear" },
          { label: "久经沙场", value: "field-tested" },
          { label: "破损不堪", value: "well-worn" },
          { label: "战痕累累", value: "battle-scarred" },
          { label: "无涂装", value: "not-painted" },
        ],
      },
    ],
  },
]);
const qualityOptions = [
  { label: "不限", value: "" },
  { label: "普通", value: "normal" },
  { label: "StatTrak™", value: "stattrak" },
  { label: "纪念品", value: "souvenir" },
];

const categoryOptions = [
  { label: "不限", value: "" },
  { label: "手枪", value: "pistol" },
  { label: "步枪", value: "rifle" },
  { label: "冲锋枪", value: "smg" },
  { label: "机枪", value: "machinegun" },
  { label: "霰弹枪", value: "shotgun" },
  { label: "匕首", value: "knife" },
  { label: "手套", value: "gloves" },
];

const wearOptions = [
  { label: "不限", value: "" },
  { label: "崭新出厂", value: "factory-new" },
  { label: "久经沙场", value: "field-tested" },
  { label: "战痕累累", value: "battle-scarred" },
  { label: "破损不堪", value: "well-worn" },
  { label: "战痕累累", value: "scarred" },
];

const menuOptions = [
  { label: "首页", key: "home", icon: HomeOutline },
  { label: "饰品列表", key: "items", icon: ListOutline },
  { label: "饰品数据", key: "cs-items", icon: TrophyOutline },
  { label: "排行榜", key: "ranking", icon: TrophyOutline },
  { label: "库存监控", key: "inventory", icon: CartOutline },
  { label: "挂刀行情", key: "knife", icon: SwapHorizontalOutline },
  { label: "热门系列", key: "series", icon: FlameOutline },
];

const categoryTabs = [
  { label: "全部", key: "all" },
  { label: "崭新出厂", key: "factory-new" },
  { label: "久经沙场", key: "field-tested" },
  { label: "战痕累累", key: "battle-scarred" },
  { label: "破损不堪", key: "well-worn" },
  { label: "战痕累累", key: "scarred" },
];

const sortOptions = [
  { label: "价格从低到高", value: "price-asc" },
  { label: "价格从高到低", value: "price-desc" },
  { label: "热度最高", value: "hot-desc" },
];

const hotItems = ref([
  {
    id: 1,
    name: "运动手套 (★) | 树篱迷宫 (久经沙场)",
    price: 34600,
    stock: 636,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CS%20GO%20sport%20gloves%20hedge%20maze%20skin&image_size=square",
    tag: "久经沙场",
    tagType: "battle-scarred",
  },
  {
    id: 2,
    name: "印花 | paiN Gaming (全息) | 2020 RMR",
    price: 26,
    stock: 1559,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CS%20GO%20holographic%20sticker%20pain%20gaming&image_size=square",
    tag: "全息",
    tagType: "holo",
  },
  {
    id: 3,
    name: "AK-47 | 皇后 (崭新出厂)",
    price: 7657.5,
    stock: 695,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CS%20GO%20AK47%20empress%20skin%20factory%20new&image_size=square",
    tag: "崭新出厂",
    tagType: "factory-new",
  },
  {
    id: 4,
    name: "沙漠之鹰 | 印花集 (崭新出厂)",
    price: 53.1,
    stock: 417,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CS%20GO%20desert%20eagle%20print%20stream%20skin&image_size=square",
    tag: "崭新出厂",
    tagType: "factory-new",
  },
  {
    id: 5,
    name: "运动手套 (★) | 树篱迷宫 (崭新出厂)",
    price: 58999.99,
    stock: 234,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CS%20GO%20sport%20gloves%20hedge%20maze%20factory%20new&image_size=square",
    tag: "崭新出厂",
    tagType: "factory-new",
  },
  {
    id: 6,
    name: "M4A4 | 喧嚣杀戮 (崭新出厂)",
    price: 4479.5,
    stock: 1100,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CS%20GO%20M4A4%20desolate%20space%20skin&image_size=square",
    tag: "崭新出厂",
    tagType: "factory-new",
  },
  {
    id: 7,
    name: "M4A4 | 合纵 (崭新出厂)",
    price: 13200,
    stock: 374,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CS%20GO%20M4A4%20alliance%20skin&image_size=square",
    tag: "崭新出厂",
    tagType: "factory-new",
  },
  {
    id: 8,
    name: "印花 | G2 Esports (全息) | 2020 RMR",
    price: 261,
    stock: 1111,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CS%20GO%20holographic%20sticker%20G2%20esports&image_size=square",
    tag: "全息",
    tagType: "holo",
  },
  {
    id: 9,
    name: "M4A4 | 喧嚣杀戮 (久经沙场)",
    price: 2040,
    stock: 1558,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CS%20GO%20M4A4%20desolate%20space%20battle%20scarred&image_size=square",
    tag: "久经沙场",
    tagType: "battle-scarred",
  },
  {
    id: 10,
    name: "格洛克 18 型 | 铁之作 (崭新出厂)",
    price: 143,
    stock: 331,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CS%20GO%20glock%2018%20iron%20work%20skin&image_size=square",
    tag: "崭新出厂",
    tagType: "factory-new",
  },
  {
    id: 11,
    name: "沙漠之鹰 | 蟒蛇死神 (崭新出厂)",
    price: 415,
    stock: 224,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CS%20GO%20desert%20eagle%20python%20death%20skin&image_size=square",
    tag: "崭新出厂",
    tagType: "factory-new",
  },
  {
    id: 12,
    name: "海军上尉迈克尔 | 海军军官",
    price: 237,
    stock: 3145,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CS%20GO%20naval%20officer%20agent%20skin&image_size=square",
    tag: "大师",
    tagType: "master",
  },
]);

const filteredItems = computed(() => {
  let result = [...hotItems.value];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter((item) => item.name.toLowerCase().includes(query));
  }

  if (activeCategoryTab.value !== "all") {
    result = result.filter((item) => item.tagType === activeCategoryTab.value);
  }

  if (sortOrder.value === "price-asc") {
    result.sort((a, b) => a.price - b.price);
  } else if (sortOrder.value === "price-desc") {
    result.sort((a, b) => b.price - a.price);
  }

  return result;
});

const applyFilters = (filters: CsgoFilterValues) => {
  console.log("应用筛选条件", filters);
};

const toggleFilterDrawer = () => {
  showFilterDrawer.value = !showFilterDrawer.value;
};

const goHome = () => {
  router.push("/");
};

const handleNavClick = (item: any) => {
  activeNavItem.value = item.key;
  if (item.key === "home") {
    router.push("/cs-items");
  } else if (item.key === "items") {
    router.push("/item-list");
  } else if (item.key === "cs-items") {
    router.push("/cs-items");
  } else if (item.key === "ranking") {
    router.push("/item-ranking");
  } else if (item.key === "inventory") {
    router.push("/inventory-monitor");
  } else if (item.key === "knife") {
    router.push("/knife-market");
  } else if (item.key === "series") {
    router.push({
      path: "/cs-items",
      query: { section: "series" },
    });
  }
};

const clearSearch = () => {
  searchQuery.value = "";
  showSearchDropdown.value = false;
};

const handleSearchBlur = () => {
  setTimeout(() => {
    showSearchDropdown.value = false;
  }, 200);
};

const goToDetail = (item: any) => {
  router.push(`/CsItemDetail?id=${item.id}`);
};

const animatePageIntro = async () => {
  clearMotions();

  await playTimeline([
    {
      targets: ".header",
      params: {
        opacity: { from: 0 },
        y: { from: -18 },
      },
    },
    {
      targets: ".tools-bar",
      params: {
        opacity: { from: 0 },
        y: { from: 26 },
      },
      position: "-=480",
    },
    {
      targets: ".category-tabs",
      params: {
        opacity: { from: 0 },
        y: { from: 20 },
      },
      position: "-=520",
    },
  ]);

  await playStaggerIn({
    targets: ".item-card",
    fromY: 34,
    fromScale: 0.95,
    delay: 75,
    duration: 520,
    ease: "outExpo",
  });
};

const animateFilteredItems = async () => {
  await playStaggerIn({
    targets: ".item-card",
    fromY: 18,
    fromScale: 0.98,
    delay: 45,
    duration: 380,
    ease: "outCubic",
  });
};

const animateFilterDrawer = async (drawerElement: HTMLElement) => {
  await pulse(drawerElement, { scale: 1.01, duration: 220 });
  await playStaggerIn({
    targets: drawerElement.querySelectorAll(".filter-group"),
    fromX: 18,
    fromY: 0,
    fromScale: 1,
    delay: 60,
    duration: 340,
    ease: "outCubic",
  });
};

onMounted(() => {
  hotItems.value.forEach((item, index) => {
    if (!item.id) {
      item.id = index + 1;
    }
  });

  void animatePageIntro();
});

watch(
  () => filteredItems.value.map((item) => item.id).join(","),
  (value, previousValue) => {
    if (value && value !== previousValue) {
      void animateFilteredItems();
    }
  },
);

watch(activeCategoryTab, () => {
  void playTabTransition({
    key: "item-category",
    activeTarget: ".category-tabs .category-tab.active",
    panelTarget: ".items-grid",
  });
});
</script>

<style scoped lang="scss">
.item-list-shell {
  min-height: 100vh;
  position: relative;
  isolation: isolate;
  background:
    radial-gradient(circle at top, rgba(54, 122, 255, 0.12), transparent 34%),
    radial-gradient(circle at 82% 14%, rgba(136, 101, 255, 0.14), transparent 26%),
    linear-gradient(180deg, #060814 0%, #0b1020 52%, #090d18 100%);
}

.page-particles {
  opacity: 0.9;
}

.item-list-page {
  min-height: 100vh;
  width: 100%;
  background: transparent;
  color: #fff;
  position: relative;
  z-index: 1;
}

.header {
  background: rgba(26, 26, 46, 0.9);
  border-bottom: 1px solid #2a2a4e;
  height: 60px;
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;

  .logo-text {
    font-size: 1.5rem;
    font-weight: 800;
    color: #f59e0b;
  }

  .logo-accent {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
  }
}

.nav-menu {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 5px;
  background: transparent;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  color: #888;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.05);
  }

  &.active {
    color: #667eea;

    &::after {
      content: "";
      position: absolute;
      bottom: -8px;
      left: 0;
      right: 0;
      height: 3px;
      background: #667eea;
      border-radius: 2px;
    }
  }
}

.nav-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.nav-label {
  font-size: 1rem;
  font-weight: 500;
  white-space: nowrap;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-container {
  position: relative;
  z-index: 1000;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(42, 42, 78, 0.9);
  border: 1px solid #3a3a5e;
  border-radius: 12px;
  padding: 8px 16px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #4a4a6e;
  }

  &:focus-within {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  }
}

.search-icon {
  color: #888;
  font-size: 1.1rem;
  margin-right: 8px;
  flex-shrink: 0;
}

.search-input {
  width: 220px;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  flex: 1;

  &::placeholder {
    color: #666;
  }
}

.clear-icon {
  color: #888;
  font-size: 1.1rem;
  cursor: pointer;
  margin-left: 8px;
  flex-shrink: 0;
  transition: color 0.2s ease;

  &:hover {
    color: #fff;
  }
}

.header-btn {
  font-size: 0.9rem;
}

.register-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: #fff;
  font-weight: 600;
}

.back-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: #fff;
  font-weight: 500;
}

.content {
  padding: 80px 24px 40px;
}

.main-container {
  max-width: 1600px;
  margin: 0 auto;
}

.tools-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}

.tools-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: none;
}

.search-input-bar {
  width: 400px;
  display: flex;
  align-items: center;
  background: rgba(26, 26, 46, 0.9);
  border: 1px solid #2a2a4e;
  border-radius: 12px;
  padding: 10px 16px;
  gap: 10px;
  transition: all 0.3s ease;

  &:focus-within {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  }
}

.input-search-icon {
  color: #888;
  font-size: 1.2rem;
}

.main-search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  color: #fff;
  font-size: 0.95rem;

  &::placeholder {
    color: #666;
  }
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(26, 26, 46, 0.9);
  border: 1px solid #2a2a4e;
  border-radius: 12px;
  padding: 10px 20px;
  color: #fff;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    border-color: #667eea;
    color: #667eea;
    transform: translateY(-1px);
  }
}

.tools-right {
  display: none;
}

.category-tabs {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
  overflow-x: auto;
  padding-bottom: 8px;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #2a2a4e;
    border-radius: 2px;
  }
}

.category-tab {
  padding: 8px 24px;
  background: rgba(42, 42, 78, 0.9);
  border-radius: 8px;
  font-size: 0.9rem;
  color: #aaa;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    background: #3a3a5e;
    color: #fff;
  }

  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
  }
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
}

.item-card {
  background: rgba(26, 26, 46, 0.9);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #2a2a4e;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  will-change: transform, opacity;

  &:hover {
    transform: translateY(-4px);
    border-color: #667eea;
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  }
}

.item-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 10;
  color: #fff;

  &.factory-new {
    background: #22c55e;
  }

  &.field-tested {
    background: #3b82f6;
  }

  &.holo {
    background: #fff;
    color: #333;
  }

  &.battle-scarred {
    background: #f97316;
  }

  &.well-worn {
    background: #ef4444;
  }

  &.scarred {
    background: #a855f7;
  }

  &.master {
    background: #f59e0b;
  }
}

.item-image-wrapper {
  width: 100%;
  padding-top: 100%;
  position: relative;
  background: linear-gradient(135deg, #2a2a4e 0%, #1a1a2e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-image {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 85%;
  height: 85%;
  object-fit: contain;
}

.item-info {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.item-name {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 500;
  color: #fff;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-top: auto;
}

.item-price {
  display: flex;
  align-items: baseline;
  gap: 4px;

  .price-label {
    font-size: 0.9rem;
    color: #f59e0b;
    font-weight: 600;
  }

  .price-value {
    font-size: 1.1rem;
    font-weight: 700;
    color: #f59e0b;
  }
}

.item-stock {
  font-size: 0.8rem;
  color: #888;
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 48px;
  will-change: transform, opacity;
}

:deep(.n-layout) {
  background: transparent !important;
}
</style>



