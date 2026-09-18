import { nextTick, onBeforeUnmount, onMounted, shallowRef, watch, type Ref } from "vue";
import { useIntersectionObserver, usePreferredReducedMotion } from "@vueuse/core";
import { animate, createTimeline, stagger } from "animejs";

type MotionTarget =
  | string
  | Element
  | null
  | undefined
  | NodeListOf<Element>
  | Element[];

type RevertibleMotion = {
  revert: () => unknown;
};

type TimelineStep = {
  targets: MotionTarget;
  params: Record<string, unknown>;
  position?: string | number;
};

type StaggerInOptions = {
  targets: MotionTarget;
  fromY?: number;
  fromX?: number;
  fromScale?: number;
  delay?: number;
  duration?: number;
  ease?: string;
};

type TabTransitionOptions = {
  key: string;
  activeTarget: MotionTarget;
  panelTarget?: MotionTarget;
  itemTargets?: MotionTarget;
  direction?: -1 | 1;
  duration?: number;
};

const toArray = (targets: MotionTarget, scope?: HTMLElement | null) => {
  if (!targets) {
    return [];
  }

  if (typeof targets === "string") {
    return scope ? Array.from(scope.querySelectorAll(targets)) : [];
  }

  if (targets instanceof Element) {
    return [targets];
  }

  return Array.from(targets);
};

export const useCsgoPageMotion = (scopeRef: Readonly<Ref<HTMLElement | null>>) => {
  const preferredMotion = usePreferredReducedMotion();
  const revealTargets = shallowRef<HTMLElement[]>([]);
  const motions: RevertibleMotion[] = [];
  const tabMotions = new Map<string, RevertibleMotion[]>();
  const tabPositions = new Map<string, number>();
  const tabIndicatorCleanups: Array<() => void> = [];
  const tabIndicatorUpdates: Array<() => void> = [];
  let revealMutationObserver: MutationObserver | null = null;
  let revealFrame: number | null = null;

  const prefersReducedMotion = () => preferredMotion.value === "reduce";

  const track = <T extends RevertibleMotion | null>(motion: T) => {
    if (motion) {
      motions.push(motion);
    }

    return motion;
  };

  const clearMotions = () => {
    while (motions.length > 0) {
      motions.pop()?.revert();
    }

    tabMotions.forEach((activeMotions) => {
      activeMotions.forEach((motion) => motion.revert());
    });
    tabMotions.clear();
  };

  const revealAll = () => {
    revealTargets.value.forEach((target) => target.classList.add("is-revealed"));
  };

  const refreshScrollReveal = async () => {
    await nextTick();

    const scope = scopeRef.value;
    if (!scope) {
      return;
    }

    const targets = Array.from(
      scope.querySelectorAll<HTMLElement>("[data-scroll-reveal]"),
    );
    revealTargets.value = targets.filter((target) => !target.classList.contains("is-revealed"));

    if (prefersReducedMotion()) {
      targets.forEach((target) => target.classList.add("is-revealed"));
    }

    if (revealFrame !== null) {
      window.cancelAnimationFrame(revealFrame);
    }

    revealFrame = window.requestAnimationFrame(() => {
      scope.classList.add("page-motion-ready");
      revealFrame = null;
    });
  };

  const { stop: stopRevealObserver } = useIntersectionObserver(
    revealTargets,
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -12% 0px",
    },
  );

  const updateTabIndicators = () => {
    tabIndicatorUpdates.forEach((update) => update());
  };

  const setupTabIndicators = () => {
    const scope = scopeRef.value;
    if (!scope) {
      return;
    }

    scope.querySelectorAll<HTMLElement>("[data-motion-tabs]").forEach((group) => {
      const indicator = document.createElement("span");
      indicator.className = "motion-tab-indicator";
      indicator.setAttribute("aria-hidden", "true");
      group.appendChild(indicator);

      const update = () => {
        const activeTab = group.querySelector<HTMLElement>(
          "[data-motion-tab].active, [data-motion-tab][aria-selected='true']",
        );
        if (!activeTab) {
          group.removeAttribute("data-motion-tabs-ready");
          return;
        }

        const groupRect = group.getBoundingClientRect();
        const activeRect = activeTab.getBoundingClientRect();
        const offsetX = activeRect.left - groupRect.left + group.scrollLeft;

        indicator.style.width = `${activeRect.width}px`;
        indicator.style.transform = `translate3d(${offsetX}px, 0, 0)`;
        group.setAttribute("data-motion-tabs-ready", "true");
      };

      const mutationObserver = new MutationObserver(update);
      mutationObserver.observe(group, {
        attributes: true,
        attributeFilter: ["class", "aria-selected"],
        childList: true,
        subtree: true,
      });

      const resizeObserver = new ResizeObserver(update);
      resizeObserver.observe(group);
      group.querySelectorAll<HTMLElement>("[data-motion-tab]").forEach((tab) => {
        resizeObserver.observe(tab);
      });

      group.addEventListener("scroll", update, { passive: true });
      tabIndicatorUpdates.push(update);
      tabIndicatorCleanups.push(() => {
        mutationObserver.disconnect();
        resizeObserver.disconnect();
        group.removeEventListener("scroll", update);
        indicator.remove();
      });

      update();
    });
  };

  const playTimeline = async (steps: TimelineStep[]) => {
    await nextTick();

    if (prefersReducedMotion()) {
      return null;
    }

    const timeline = createTimeline({
      defaults: {
        duration: 720,
        ease: "outExpo",
      },
    });

    let hasStep = false;

    for (const step of steps) {
      const resolvedTargets = toArray(step.targets, scopeRef.value);

      if (resolvedTargets.length === 0) {
        continue;
      }

      hasStep = true;
      timeline.add(resolvedTargets, step.params, step.position);
    }

    if (!hasStep) {
      timeline.revert();
      return null;
    }

    return track(timeline);
  };

  const playStaggerIn = async ({
    targets,
    fromY = 28,
    fromX = 0,
    fromScale = 0.96,
    delay = 90,
    duration = 520,
    ease = "outCubic",
  }: StaggerInOptions) => {
    await nextTick();

    if (prefersReducedMotion()) {
      return null;
    }

    const resolvedTargets = toArray(targets, scopeRef.value);

    if (resolvedTargets.length === 0) {
      return null;
    }

    return track(
      animate(resolvedTargets, {
        opacity: { from: 0 },
        x: fromX === 0 ? undefined : { from: fromX },
        y: fromY === 0 ? undefined : { from: fromY },
        scale: fromScale === 1 ? undefined : { from: fromScale },
        delay: stagger(delay),
        duration,
        ease,
      }),
    );
  };

  const pulse = async (
    targets: MotionTarget,
    options: {
      scale?: number;
      duration?: number;
      ease?: string;
    } = {},
  ) => {
    await nextTick();

    if (prefersReducedMotion()) {
      return null;
    }

    const resolvedTargets = toArray(targets, scopeRef.value);

    if (resolvedTargets.length === 0) {
      return null;
    }

    return track(
      animate(resolvedTargets, {
        scale: [
          { to: options.scale ?? 1.02, duration: Math.floor((options.duration ?? 260) / 2) },
          { to: 1, duration: Math.ceil((options.duration ?? 260) / 2) },
        ],
        ease: options.ease ?? "inOutQuad",
      }),
    );
  };

  const playTabTransition = async ({
    key,
    activeTarget,
    panelTarget,
    itemTargets,
    direction,
    duration = 620,
  }: TabTransitionOptions) => {
    await nextTick();
    updateTabIndicators();

    const activeTabs = toArray(activeTarget, scopeRef.value);
    const activeTab = activeTabs[0] as HTMLElement | undefined;
    let resolvedDirection = direction;

    if (activeTab && resolvedDirection === undefined) {
      const group = activeTab.closest<HTMLElement>("[data-motion-tabs]");
      const tabs = group
        ? Array.from(group.querySelectorAll<HTMLElement>("[data-motion-tab]"))
        : [];
      const currentIndex = tabs.indexOf(activeTab);
      const previousIndex = tabPositions.get(key) ?? currentIndex;
      resolvedDirection = currentIndex >= previousIndex ? 1 : -1;
      tabPositions.set(key, currentIndex);
    }

    if (prefersReducedMotion()) {
      return null;
    }

    tabMotions.get(key)?.forEach((motion) => motion.revert());
    const nextMotions: RevertibleMotion[] = [];
    const travel = (resolvedDirection ?? 1) * 28;

    if (activeTabs.length > 0) {
      nextMotions.push(
        animate(activeTabs, {
          scale: [
            { from: 0.96, to: 1.035, duration: 220 },
            { to: 1, duration: 280 },
          ],
          ease: "outCubic",
        }),
      );
    }

    const panels = toArray(panelTarget, scopeRef.value);
    if (panels.length > 0) {
      nextMotions.push(
        animate(panels, {
          opacity: { from: 0.24 },
          x: { from: travel },
          filter: { from: "blur(7px)" },
          duration,
          ease: "outExpo",
        }),
      );
    }

    const items = toArray(itemTargets, scopeRef.value);
    if (items.length > 0) {
      nextMotions.push(
        animate(items, {
          opacity: { from: 0.32 },
          y: { from: 14 },
          delay: stagger(42),
          duration: Math.min(duration, 460),
          ease: "outCubic",
        }),
      );
    }

    tabMotions.set(key, nextMotions);
    return nextMotions;
  };

  onMounted(async () => {
    await nextTick();
    setupTabIndicators();
    await refreshScrollReveal();

    if (scopeRef.value) {
      revealMutationObserver = new MutationObserver((records) => {
        const hasRevealTarget = records.some((record) =>
          Array.from(record.addedNodes).some(
            (node) =>
              node instanceof HTMLElement &&
              (node.matches("[data-scroll-reveal]") ||
                Boolean(node.querySelector("[data-scroll-reveal]"))),
          ),
        );

        if (hasRevealTarget) {
          void refreshScrollReveal();
        }
      });
      revealMutationObserver.observe(scopeRef.value, { childList: true, subtree: true });
    }
  });

  watch(preferredMotion, (motion) => {
    if (motion === "reduce") {
      revealAll();
    }
  });

  onBeforeUnmount(() => {
    clearMotions();
    stopRevealObserver();
    revealMutationObserver?.disconnect();
    tabIndicatorCleanups.forEach((cleanup) => cleanup());

    if (revealFrame !== null) {
      window.cancelAnimationFrame(revealFrame);
    }
  });

  return {
    clearMotions,
    playTabTransition,
    playTimeline,
    playStaggerIn,
    pulse,
    refreshScrollReveal,
  };
};
