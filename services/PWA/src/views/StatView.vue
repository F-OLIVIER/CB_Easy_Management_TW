<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { usePage } from "../api/usePage";
import type { UserInfo } from "../api/types";
import { lang, t, tr } from "../i18n";
import { showToast } from "../stores/toast";
import { toInt, weaponImg } from "../utils/units";

const { data, loading, busy, submit } = usePage("statGvG", "officier");

type SortKey = "name" | "class" | "influ" | "lvl" | "nbGvG" | "lastGvG";

const sort = ref<{ key: SortKey; asc: boolean }>({ key: "name", asc: true });
const search = ref("");
const comments = reactive<Record<number, string>>({});

const ts = computed(() => t.value.stat);
const users = computed<UserInfo[]>(() => data.value?.ListInscripted ?? []);

watch(users, (list) => {
  for (const key of Object.keys(comments)) delete comments[Number(key)];
  for (const user of list) comments[user.ID] = user.CommentGestionnaire ?? "";
});

/** "dd/mm/yyyy" → timestamp, sinon -1 (jamais participé) */
function dateValue(value: string): number {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value) ?? /^(\d{4})\/(\d{2})\/(\d{2})$/.exec(value);
  if (!match) return -1;
  return value.indexOf("/") === 2 ? Date.UTC(+match[3], +match[2] - 1, +match[1]) : Date.UTC(+match[1], +match[2] - 1, +match[3]);
}

const sortValue: Record<SortKey, (user: UserInfo) => string | number> = {
  name: (user) => user.Username.toLowerCase(),
  class: (user) => tr(user.GameCharacter).toLowerCase(),
  influ: (user) => toInt(user.Influence),
  lvl: (user) => toInt(user.Lvl),
  nbGvG: (user) => toInt(user.NbGvGParticiped),
  lastGvG: (user) => dateValue(tr(user.DateLastGvG)),
};

const rows = computed(() => {
  const query = search.value.trim().toLowerCase();
  const getter = sortValue[sort.value.key];
  const direction = sort.value.asc ? 1 : -1;
  return users.value
    .filter((user) => !query || user.Username.toLowerCase().includes(query))
    .sort((a, b) => {
      const [va, vb] = [getter(a), getter(b)];
      return (va < vb ? -1 : va > vb ? 1 : 0) * direction;
    });
});

const columns = computed<{ key: SortKey; label: string }[]>(() => [
  { key: "name", label: ts.value.title.name },
  { key: "class", label: ts.value.title.class },
  { key: "influ", label: ts.value.title.influ },
  { key: "lvl", label: ts.value.title.lvl },
  { key: "nbGvG", label: ts.value.title.nbGvG },
  { key: "lastGvG", label: ts.value.title.lastGvG },
]);

function sortBy(key: SortKey) {
  sort.value = { key, asc: sort.value.key === key ? !sort.value.asc : true };
}

const changed = computed(() =>
  users.value
    .filter((user) => (comments[user.ID] ?? "").trim() !== (user.CommentGestionnaire ?? ""))
    .map((user) => ({ ID: user.ID, CommentGestionnaire: (comments[user.ID] ?? "").trim() })),
);

function saveComments() {
  if (changed.value.length === 0) return showToast(t.value.commun.err_no_fields, "error");
  submit("updatestatGvG", { List: changed.value });
}
</script>

<template>
  <div v-if="loading && !data" class="spinner" role="status" />

  <div v-else-if="data" class="stack">
    <div class="row row--between">
      <h1>{{ t.home.stat }}</h1>
      <input v-model="search" class="search" type="search" :placeholder="t.pwa.search_player" :aria-label="t.pwa.search_player" />
    </div>

    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key" :aria-sort="sort.key === column.key ? (sort.asc ? 'ascending' : 'descending') : 'none'">
              <button type="button" class="sort" @click="sortBy(column.key)">
                {{ column.label }}
                <span v-if="sort.key === column.key">{{ sort.asc ? "▲" : "▼" }}</span>
              </button>
            </th>
            <th>{{ ts.title.comment }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in rows" :key="user.ID">
            <td class="name">{{ user.Username }}</td>
            <td>
              <span class="row nowrap">
                <img class="weapon" :src="weaponImg(user.GameCharacter.fr)" alt="" />
                {{ tr(user.GameCharacter) }}
              </span>
            </td>
            <td>{{ user.Influence }}</td>
            <td>{{ user.Lvl }}</td>
            <td>{{ user.NbGvGParticiped }} / {{ user.NbTotalGvG }}</td>
            <td class="nowrap">{{ user.DateLastGvG[lang] }}</td>
            <td class="comment">
              <input v-model="comments[user.ID]" type="text" maxlength="200" :placeholder="ts.placeholderComment" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="row row--end">
      <span v-if="changed.length" class="muted small">{{ t.pwa.unsaved }} : {{ changed.length }}</span>
      <button type="button" class="btn btn--primary" :disabled="busy" @click="saveComments">{{ ts.buttoncomment }}</button>
    </div>
  </div>
</template>

<style scoped>
.search {
  width: 240px;
}
.sort {
  background: none;
  border: none;
  color: inherit;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  white-space: nowrap;
}
.name {
  font-weight: 600;
}
.nowrap {
  white-space: nowrap;
  flex-wrap: nowrap;
}
.weapon {
  width: 28px;
  height: 28px;
  object-fit: contain;
}
.comment {
  min-width: 220px;
}
</style>
