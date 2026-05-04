<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import gsap from 'gsap';

const props = defineProps<{
  alcoholProgress: number;
  cigarettesProgress: number;
  sugarProgress: number;

  size?: number;
  strokeWidth?: number;
  duration?: number;
}>();

const alcoholCircle = ref<SVGCircleElement | null>(null);
const cigarettesCircle = ref<SVGCircleElement | null>(null);
const sugarCircle = ref<SVGCircleElement | null>(null);

const radius = (props.size || 40) / 2 - (props.strokeWidth || 3);
const circumference = 2 * Math.PI * radius;

const animateSegment = (
    circle: SVGCircleElement | null,
    segmentLength: number,
    segmentOffset: number
) => {
  if (!circle) return;

  gsap.set(circle, {
    strokeDasharray: `${segmentLength} ${circumference}`,
    strokeDashoffset: circumference - segmentOffset,
  });

  gsap.fromTo(circle,
      { strokeDashoffset: circumference - segmentOffset + segmentLength },
      {
        strokeDashoffset: circumference - segmentOffset,
        duration: props.duration || 0.6,
        ease: 'power2.out',
      }
  );
};

const updateSegments = () => {
  const a = Math.min(Math.max(props.alcoholProgress, 0), 100);
  const c = Math.min(Math.max(props.cigarettesProgress, 0), 100);
  const s = Math.min(Math.max(props.sugarProgress, 0), 100);

  const aLength = (a / 100) * circumference;
  const cLength = (c / 100) * circumference;
  const sLength = (s / 100) * circumference;

  const aOffset = 0;
  const cOffset = aLength;
  const sOffset = aLength + cLength;

  animateSegment(alcoholCircle.value, aLength, aOffset);
  animateSegment(cigarettesCircle.value, cLength, cOffset);
  animateSegment(sugarCircle.value, sLength, sOffset);
};

onMounted(() => {
  [alcoholCircle.value, cigarettesCircle.value, sugarCircle.value].forEach(circle => {
    if (circle) {
      gsap.set(circle, {
        strokeDasharray: circumference,
        transformOrigin: 'center',
      });
    }
  });

  updateSegments();
});

watch(
    () => [props.alcoholProgress, props.cigarettesProgress, props.sugarProgress],
    updateSegments,
    { deep: true }
);
</script>

<template>
  <svg
      :width="props.size || 40"
      :height="props.size || 40"
      class="segmented-progress-ring"
      viewBox="0 0 40 40"
  >
    <circle
        cx="20"
        cy="20"
        :r="radius"
        fill="none"
        stroke="#f3f4f6"
        :stroke-width="props.strokeWidth || 3"
    />

    <circle
        ref="alcoholCircle"
        cx="20"
        cy="20"
        :r="radius"
        fill="none"
        stroke="#ef4444"
        :stroke-width="props.strokeWidth || 3"
        stroke-linecap="round"
        transform="rotate(-90 20 20)"
    />

    <circle
        ref="cigarettesCircle"
        cx="20"
        cy="20"
        :r="radius"
        fill="none"
        stroke="#3b82f6"
        :stroke-width="props.strokeWidth || 3"
        stroke-linecap="round"
        transform="rotate(-90 20 20)"
    />

    <circle
        ref="sugarCircle"
        cx="20"
        cy="20"
        :r="radius"
        fill="none"
        stroke="#eab308"
        :stroke-width="props.strokeWidth || 3"
        stroke-linecap="round"
        transform="rotate(-90 20 20)"
    />
  </svg>
</template>

<style scoped>
.segmented-progress-ring {
  display: block;
  pointer-events: none;
}
</style>