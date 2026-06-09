import { nextTick, onBeforeUnmount, type Ref } from "vue";
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
  const motions: RevertibleMotion[] = [];

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
  };

  const playTimeline = async (steps: TimelineStep[]) => {
    await nextTick();

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

  onBeforeUnmount(() => {
    clearMotions();
  });

  return {
    clearMotions,
    playTimeline,
    playStaggerIn,
    pulse,
  };
};
