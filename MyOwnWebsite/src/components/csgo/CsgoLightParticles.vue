<script setup lang="ts">
import { animate } from "animejs";
import { computed, onBeforeUnmount, onMounted, useTemplateRef } from "vue";

type ParticleSpec = {
  x: string;
  y: string;
  size: string;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
  hue: string;
  blur: string;
  opacity: number;
};

const props = withDefaults(
  defineProps<{
    particleCount?: number;
    orbCount?: number;
    palette?: string[];
    intensity?: "soft" | "medium" | "vivid";
  }>(),
  {
    particleCount: 22,
    orbCount: 4,
    palette: () => ["#6ea8ff", "#8c7bff", "#4be1c3", "#ffd166"],
    intensity: "medium",
  },
);

const rootRef = useTemplateRef<HTMLElement>("rootRef");
const activeAnimations: Array<{ revert: () => unknown }> = [];

const intensityConfig = computed(() => {
  if (props.intensity === "soft") {
    return {
      particleOpacity: 0.32,
      orbOpacity: 0.22,
      trailOpacity: 0.18,
    };
  }

  if (props.intensity === "vivid") {
    return {
      particleOpacity: 0.62,
      orbOpacity: 0.34,
      trailOpacity: 0.28,
    };
  }

  return {
    particleOpacity: 0.46,
    orbOpacity: 0.28,
    trailOpacity: 0.22,
  };
});

const createParticleSpecs = (count: number) =>
  Array.from({ length: count }, (_, index) => {
    const color = props.palette[index % props.palette.length];
    const column = (index * 37) % 100;
    const row = (index * 19) % 100;
    const size = 4 + ((index * 7) % 10);

    return {
      x: `${column}%`,
      y: `${row}%`,
      size: `${size}px`,
      duration: 3800 + ((index * 241) % 2600),
      delay: (index * 173) % 2400,
      driftX: -28 + ((index * 11) % 56),
      driftY: -90 - ((index * 13) % 120),
      hue: color,
      blur: `${8 + ((index * 3) % 18)}px`,
      opacity:
        intensityConfig.value.particleOpacity * (0.72 + ((index % 5) * 0.08)),
    } satisfies ParticleSpec;
  });

const createOrbSpecs = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    x: `${12 + index * 24}%`,
    y: `${8 + ((index * 21) % 52)}%`,
    size: `${180 + index * 52}px`,
    color: props.palette[index % props.palette.length],
    opacity: intensityConfig.value.orbOpacity * (1 - index * 0.1),
  }));

const particleSpecs = computed(() => createParticleSpecs(props.particleCount));
const orbSpecs = computed(() => createOrbSpecs(props.orbCount));

const trackAnimation = (animation: { revert: () => unknown } | null) => {
  if (animation) {
    activeAnimations.push(animation);
  }
};

const clearAnimations = () => {
  while (activeAnimations.length > 0) {
    activeAnimations.pop()?.revert();
  }
};

onMounted(() => {
  const root = rootRef.value;

  if (!root) {
    return;
  }

  const particles = root.querySelectorAll(".light-particles__particle");
  const orbs = root.querySelectorAll(".light-particles__orb");
  const trails = root.querySelectorAll(".light-particles__trail");

  particles.forEach((particle, index) => {
    const spec = particleSpecs.value[index];

    trackAnimation(
      animate(particle, {
        y: [{ from: 0, to: spec.driftY }],
        x: [{ from: 0, to: spec.driftX }],
        opacity: [
          { from: 0, to: spec.opacity, duration: spec.duration * 0.35 },
          { to: 0, duration: spec.duration * 0.65 },
        ],
        scale: [
          { from: 0.8, to: 1.1, duration: spec.duration * 0.4 },
          { to: 0.92, duration: spec.duration * 0.6 },
        ],
        duration: spec.duration,
        delay: spec.delay,
        ease: "outExpo",
        loop: true,
      }),
    );
  });

  orbs.forEach((orb, index) => {
    trackAnimation(
      animate(orb, {
        x: [{ from: 0, to: -24 + index * 10 }, { to: 18 - index * 8 }],
        y: [{ from: 0, to: 16 + index * 10 }, { to: -12 - index * 6 }],
        scale: [{ from: 0.96, to: 1.08 }, { to: 0.98 }],
        opacity: [{ from: 0.18, to: 0.34 }, { to: 0.2 }],
        duration: 6200 + index * 900,
        ease: "inOutSine",
        alternate: true,
        loop: true,
      }),
    );
  });

  trails.forEach((trail, index) => {
    trackAnimation(
      animate(trail, {
        x: [{ from: "-10%", to: "6%" }, { to: "-4%" }],
        opacity: [{ from: 0.08, to: intensityConfig.value.trailOpacity }, { to: 0.1 }],
        rotate: [{ from: -12 + index * 4, to: -8 + index * 6 }],
        duration: 7200 + index * 1200,
        ease: "inOutQuad",
        alternate: true,
        loop: true,
      }),
    );
  });
});

onBeforeUnmount(() => {
  clearAnimations();
});
</script>

<template>
  <div ref="rootRef" class="light-particles" aria-hidden="true">
    <div class="light-particles__mesh"></div>
    <div class="light-particles__trails">
      <span
        v-for="trailIndex in 3"
        :key="trailIndex"
        class="light-particles__trail"
        :style="{
          top: `${12 + trailIndex * 24}%`,
          opacity: intensityConfig.trailOpacity.toString(),
        }"
      ></span>
    </div>
    <span
      v-for="(orb, index) in orbSpecs"
      :key="`orb-${index}`"
      class="light-particles__orb"
      :style="{
        left: orb.x,
        top: orb.y,
        width: orb.size,
        height: orb.size,
        background: `radial-gradient(circle, ${orb.color} 0%, transparent 68%)`,
        opacity: orb.opacity.toString(),
      }"
    ></span>
    <span
      v-for="(particle, index) in particleSpecs"
      :key="`particle-${index}`"
      class="light-particles__particle"
      :style="{
        left: particle.x,
        top: particle.y,
        width: particle.size,
        height: particle.size,
        backgroundColor: particle.hue,
        boxShadow: `0 0 ${particle.blur} ${particle.hue}`,
      }"
    ></span>
  </div>
</template>

<style scoped>
.light-particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.light-particles__mesh {
  position: absolute;
  inset: -10%;
  background:
    radial-gradient(circle at 18% 18%, rgba(110, 168, 255, 0.2), transparent 28%),
    radial-gradient(circle at 82% 12%, rgba(140, 123, 255, 0.18), transparent 24%),
    radial-gradient(circle at 78% 68%, rgba(75, 225, 195, 0.14), transparent 28%),
    radial-gradient(circle at 22% 78%, rgba(255, 209, 102, 0.08), transparent 22%);
  filter: blur(30px);
  opacity: 0.9;
}

.light-particles__trails {
  position: absolute;
  inset: 0;
}

.light-particles__trail {
  position: absolute;
  left: -10%;
  width: 140%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.04) 12%,
    rgba(110, 168, 255, 0.28) 38%,
    rgba(75, 225, 195, 0.24) 62%,
    transparent 100%
  );
  filter: blur(0.4px);
  transform: rotate(-10deg);
}

.light-particles__orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(12px);
  mix-blend-mode: screen;
}

.light-particles__particle {
  position: absolute;
  border-radius: 999px;
  opacity: 0;
  mix-blend-mode: screen;
}
</style>
