<script setup lang="ts">
import { computed } from "vue";
import { usePage } from "../api/usePage";
import { t } from "../i18n";
import { houseId, isAdmin, isOfficer, setHouse } from "../stores/session";

const { data, loading, load } = usePage("home");

const houses = computed(() => data.value?.House ?? []);

interface Tile {
  to: string;
  icon: string;
  label: string;
}

const userTiles = computed<Tile[]>(() => [
  { to: "/characterCard", icon: "🛡️", label: t.value.home.characterChard },
  { to: "/caserne", icon: "🏰", label: t.value.home.caserne },
]);
const officerTiles = computed<Tile[]>(() => [
  { to: "/creategroup", icon: "⚔️", label: t.value.home.groupGvG },
  { to: "/stat", icon: "📊", label: t.value.home.stat },
  { to: "/consulcaserne", icon: "🔍", label: t.value.home.caserne_other },
  { to: "/settingbot", icon: "🤖", label: t.value.home.settingbot },
]);

async function selectHouse(id: string) {
  setHouse(id);
  await load();
}
</script>

<template>
  <div v-if="loading && !data" class="spinner" role="status" />

  <div v-else-if="data" class="stack">
    <section class="card">
      <h1>{{ houses.length > 1 ? t.home.houses.two : t.home.houses.one }}</h1>
      <div class="grid houses" style="--min: 240px">
        <article v-for="house in houses" :key="house.Discord" class="house" :class="{ 'house--active': house.Discord === houseId }">
          <img v-if="house.House_logo" :src="house.House_logo" :alt="house.House_name" class="house__logo" />
          <div class="house__body">
            <h2>{{ house.House_name }}</h2>
            <button
              v-if="houses.length > 1 && house.Discord !== houseId"
              type="button"
              class="btn btn--primary btn--sm"
              @click="selectHouse(house.Discord)"
            >
              {{ t.home.houses.button }}
            </button>
            <span v-else-if="houses.length > 1" class="badge badge--success">✓</span>
          </div>
        </article>
      </div>
    </section>

    <template v-if="houseId">
      <nav class="grid tiles" style="--min: 220px" aria-label="Dashboard">
        <RouterLink v-for="tile in userTiles" :key="tile.to" :to="tile.to" class="tile">
          <span class="tile__icon" aria-hidden="true">{{ tile.icon }}</span>
          <span>{{ tile.label }}</span>
        </RouterLink>
      </nav>

      <section v-if="isOfficer">
        <h2>{{ t.home.zone_gestion }}</h2>
        <nav class="grid tiles" style="--min: 220px">
          <RouterLink v-for="tile in officerTiles" :key="tile.to" :to="tile.to" class="tile tile--officer">
            <span class="tile__icon" aria-hidden="true">{{ tile.icon }}</span>
            <span>{{ tile.label }}</span>
          </RouterLink>
        </nav>
      </section>

      <section>
        <h2>{{ t.home.commun_zone }}</h2>
        <nav class="grid tiles" style="--min: 220px">
          <RouterLink to="/Appforum" class="tile">
            <span class="tile__icon" aria-hidden="true">💬</span>
            <span>{{ t.home.forum }}</span>
          </RouterLink>
          <RouterLink v-if="isAdmin" to="/AppAdmin" class="tile tile--admin">
            <span class="tile__icon" aria-hidden="true">⚙️</span>
            <span>{{ t.home.admin }}</span>
          </RouterLink>
        </nav>
      </section>
    </template>
  </div>
</template>

<style scoped>
.house {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--surface-2);
}
.house--active {
  border-color: var(--gold);
}
.house__logo {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.house__body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  min-width: 0;
}
.house__body h2 {
  margin: 0;
  font-size: 1.3rem;
  overflow-wrap: anywhere;
}
.tile {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 92px;
  padding: 18px 20px;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
  text-decoration: none;
  font-weight: 600;
  font-size: 1.05rem;
  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    background 0.15s;
}
.tile:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
  background: var(--surface-2);
}
.tile--officer {
  border-left: 4px solid var(--gold);
}
.tile--admin {
  border-left: 4px solid var(--danger);
}
.tile__icon {
  font-size: 2rem;
}
</style>
