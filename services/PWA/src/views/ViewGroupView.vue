<script setup lang="ts">
import { computed, ref } from "vue";
import { usePage } from "../api/usePage";
import { OFFICER_UNIT_VALUES } from "../config";
import { lang, t, tr } from "../i18n";
import { showToast } from "../stores/toast";
import { buildGroups } from "../utils/groups";
import { onWeaponError, weaponImg } from "../utils/units";

const { data, loading } = usePage("creategroup", "officier");

const tv = computed(() => t.value.view_group);
const capture = ref<HTMLElement | null>(null);
const exporting = ref(false);

const players = computed(() => new Map((data.value?.ListInscripted ?? []).map((user) => [user.Username, user])));

const groups = computed(() => {
  if (!data.value?.GroupGvG?.length) return [];
  return buildGroups(data.value, lang.value).map((group, index) => ({
    title: group.name ? `${tv.value.group} ${group.name}` : `${tv.value.group} n°${index + 1}`,
    members: group.slots
      .filter((slot) => slot.username)
      .map((slot) => ({ ...slot, player: players.value.get(slot.username) })),
  }));
});

const isOfficer = (unit: string) => OFFICER_UNIT_VALUES.includes(unit);

async function download() {
  if (!capture.value || exporting.value) return;
  exporting.value = true;
  try {
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(capture.value, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#14110d",
      windowWidth: Math.max(capture.value.scrollWidth, 1000),
    });
    const link = document.createElement("a");
    link.download = `${new Date().toISOString().slice(0, 10)}_groupGvG.jpg`;
    link.href = canvas.toDataURL("image/jpeg", 0.95);
    link.click();
  } catch (error) {
    console.error(error);
    showToast(String(error), "error");
  } finally {
    exporting.value = false;
  }
}
</script>

<template>
  <div v-if="loading && !data" class="spinner" role="status" />

  <div v-else-if="data" class="stack">
    <h1>{{ t.create_group.preview }}</h1>
    <div class="row row--between">
      <RouterLink to="/creategroup" class="btn btn--ghost">← {{ tv.back }}</RouterLink>
      <button type="button" class="btn btn--primary" :disabled="exporting || !groups.length" @click="download">⬇ {{ tv.download }}</button>
    </div>

    <div ref="capture" class="capture">
      <section v-for="group in groups" :key="group.title" class="vgroup">
        <h2>{{ group.title }}</h2>
        <table class="vtable">
          <thead>
            <tr>
              <th>{{ tv.player }}</th>
              <th />
              <th>{{ tv.unit1 }}</th>
              <th>{{ tv.unit2 }}</th>
              <th>{{ tv.unit3 }}</th>
              <th>{{ tv.unit4 }}</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="member in group.members" :key="member.username">
              <tr>
                <td class="vtable__name">{{ member.player?.EtatInscription === 2 ? "🕐 " : "" }}{{ member.username }}</td>
                <td>
                  <img class="weapon" :src="weaponImg(member.player?.GameCharacter.fr)" :alt="tr(member.player?.GameCharacter)" @error="onWeaponError" />
                </td>
                <td v-for="(unit, index) in member.units" :key="index" :class="{ officer: isOfficer(unit) }">
                  {{ isOfficer(unit) ? tv.off : unit }}
                </td>
              </tr>
              <tr v-if="member.comment" class="vtable__comment">
                <td colspan="6">ℹ️ {{ member.comment }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </section>
      <p v-if="!groups.length" class="muted center">—</p>
    </div>
  </div>
</template>

<style scoped>
.capture {
  display: grid;
  gap: 16px;
  padding: 16px;
  border-radius: var(--radius);
  background: var(--bg);
}
.vgroup {
  padding: 14px;
  border-radius: var(--radius);
  background: var(--surface-2);
  border: 1px solid var(--border);
  overflow-x: auto;
}
.vgroup h2 {
  margin-bottom: 8px;
}
.vtable {
  width: 100%;
  border-collapse: collapse;
}
.vtable th,
.vtable td {
  padding: 6px 10px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}
.vtable th {
  color: var(--muted);
  font-weight: 500;
  font-size: 0.85rem;
}
.vtable__name {
  font-weight: 700;
  white-space: nowrap;
}
.vtable__comment td {
  color: var(--muted);
  font-style: italic;
}
.weapon {
  width: 32px;
  height: 32px;
  object-fit: contain;
}
.officer {
  color: var(--danger);
  font-weight: 600;
}
</style>
