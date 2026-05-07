<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import gsap from 'gsap';

const JOIN_DEG = 0.55;

const props = defineProps<{
  alcoholProgress: number;
  cigarettesProgress: number;
  sugarProgress: number;

  size?: number;
  strokeWidth?: number;
  duration?: number;
}>();

const pathSugar = ref<SVGPathElement | null>(null);
const pathAlcohol = ref<SVGPathElement | null>(null);
const pathCigarettes = ref<SVGPathElement | null>(null);

const vb = computed(() => props.size ?? 76);
const cx = computed(() => vb.value / 2);
const cy = computed(() => vb.value / 2);
const sw = computed(() => props.strokeWidth ?? 6);
const r = computed(() => vb.value / 2 - sw.value / 2 - 1.5);

function pointCW(x: number, y: number, rad: number, degCW: number) {
  const ang = degCW * (Math.PI / 180);
  return [x + rad * Math.sin(ang), y - rad * Math.cos(ang)] as const;
}

function arcD(x: number, y: number, rad: number, startCW: number, endCW: number) {
  if (endCW <= startCW || rad <= 0) return '';
  const [sx, sy] = pointCW(x, y, rad, startCW);
  const [ex, ey] = pointCW(x, y, rad, endCW);
  const sweep = endCW - startCW;
  const largeArc = sweep > 180 ? 1 : 0;
  return `M ${sx} ${sy} A ${rad} ${rad} 0 ${largeArc} 1 ${ex} ${ey}`;
}

const sugarFrac1 = computed(() => Math.min(Math.max(props.sugarProgress, 0), 50) / 50);
const sugarFrac2 = computed(() => Math.max(0, Math.min(props.sugarProgress, 100) - 50) / 50);
const alcoholFrac = computed(() => Math.min(Math.max(props.alcoholProgress, 0), 100) / 100);
const cigFrac = computed(() => Math.min(Math.max(props.cigarettesProgress, 0), 100) / 100);

const dSugarCombined = computed(() => {
  const s1 = sugarFrac1.value;
  const s2 = sugarFrac2.value;
  if (s1 <= 0 && s2 <= 0) return '';
  const x = cx.value, y = cy.value, rr = r.value;

  let trEnd = 90 * s1;
  if (s1 > 0) trEnd = Math.max(trEnd, 0.55);
  if (s1 >= 0.999 && alcoholFrac.value > 0) trEnd += JOIN_DEG;

  let tlStart = 270;
  if (cigFrac.value >= 0.999 && s2 > 0) tlStart -= JOIN_DEG;

  const parts: string[] = [];
  if (s1 > 0) parts.push(arcD(x, y, rr, 0, trEnd));
  if (s2 > 0) {
    let tlEnd = 270 + 90 * s2;
    tlEnd = Math.max(tlEnd, tlStart + 0.55);
    parts.push(arcD(x, y, rr, tlStart, tlEnd));
  }
  return parts.filter(Boolean).join(' ');
});

const dAlcohol = computed(() => {
  const f = alcoholFrac.value;
  if (f <= 0) return '';
  let start = 90;
  if (sugarFrac1.value >= 0.999 && f > 0) start -= JOIN_DEG;

  let end = 90 + 90 * f;
  if (f >= 0.999 && cigFrac.value > 0) end += JOIN_DEG;
  end = Math.max(end, start + 0.55);

  return arcD(cx.value, cy.value, r.value, start, end);
});

const dCigarettes = computed(() => {
  const f = cigFrac.value;
  if (f <= 0) return '';
  let start = 180;
  if (alcoholFrac.value >= 0.999 && f > 0) start -= JOIN_DEG;

  let end = 180 + 90 * f;
  if (f >= 0.999 && sugarFrac2.value > 0) end += JOIN_DEG;
  end = Math.max(end, start + 0.55);

  return arcD(cx.value, cy.value, r.value, start, end);
});

const COLOR_SUGAR = '#EFFE7D';
const COLOR_ALCOHOL = '#EF4444';
const COLOR_CIGS = '#007AFF';

function resetInvisible(pathEl: SVGPathElement | null) {
  if (!pathEl) return;
  gsap.killTweensOf(pathEl);
  const len = pathEl.getTotalLength();
  if (len <= 0) return;
  gsap.set(pathEl, {strokeDasharray: `0 ${len}`, strokeDashoffset: 0});
}

function animateReveal(pathEl: SVGPathElement | null) {
  if (!pathEl) return;
  const len = pathEl.getTotalLength();
  if (len <= 0) return;
  gsap.fromTo(
      pathEl,
      {strokeDasharray: `0 ${len}`, strokeDashoffset: 0},
      {
        strokeDasharray: `${len} ${len}`,
        strokeDashoffset: 0,
        duration: props.duration ?? 0.52,
        ease: 'power2.out',
      }
  );
}

function runAnimations() {
  nextTick(async () => {
    await nextTick();
    resetInvisible(pathCigarettes.value);
    resetInvisible(pathAlcohol.value);
    resetInvisible(pathSugar.value);
    animateReveal(pathCigarettes.value);
    animateReveal(pathAlcohol.value);
    animateReveal(pathSugar.value);
  });
}

watch(
    () => [
      props.alcoholProgress,
      props.cigarettesProgress,
      props.sugarProgress,
      props.size ?? 76,
      props.strokeWidth ?? 6,
      props.duration ?? 0.52,
    ],
    () => runAnimations(),
    {immediate: true}
);
</script>

<template>
  <svg
      :width="vb"
      :height="vb"
      class="segmented-progress-ring"
      :viewBox="`0 0 ${vb} ${vb}`"
  >
    <path
        v-if="dCigarettes"
        ref="pathCigarettes"
        fill="none"
        :stroke="COLOR_CIGS"
        :stroke-width="sw"
        stroke-linejoin="round"
        :d="dCigarettes"
    />
    <path
        v-if="dAlcohol"
        ref="pathAlcohol"
        fill="none"
        :stroke="COLOR_ALCOHOL"
        :stroke-width="sw"
        stroke-linejoin="round"
        :d="dAlcohol"
    />
    <path
        v-if="dSugarCombined"
        ref="pathSugar"
        fill="none"
        :stroke="COLOR_SUGAR"
        :stroke-width="sw"
        stroke-linejoin="round"
        :d="dSugarCombined"
    />
  </svg>
</template>

<style scoped>
.segmented-progress-ring {
  display: block;
  pointer-events: none;
}
</style>
