<script setup lang="ts">
import { computed, ref } from "vue";
import RichEditor from "../components/RichEditor.vue";
import { usePage } from "../api/usePage";
import type { ApiResponse, Post } from "../api/types";
import { lang, t } from "../i18n";
import { isAdmin } from "../stores/session";
import { confirmDialog } from "../stores/confirm";
import { showToast } from "../stores/toast";
import { formatDate, isBlankHtml, sanitizeHtml } from "../utils/format";

const { data, loading, busy, submit } = usePage("forum");

const tf = computed(() => t.value.forum);
const posts = computed<Post[]>(() => data.value?.Forum ?? []);
const activePosts = computed(() => posts.value.filter((post) => post.Valid && !post.Archive));
const pendingPosts = computed(() => posts.value.filter((post) => !post.Valid && !post.Archive));
const archivedPosts = computed(() => posts.value.filter((post) => post.Valid && post.Archive));

const newTitle = ref("");
const newContent = ref("");
const newEditor = ref<InstanceType<typeof RichEditor> | null>(null);

const openedId = ref<string | null>(null);
const opened = computed(() => posts.value.find((post) => post.ID === openedId.value) ?? null);
const commentContent = ref("");
const commentEditor = ref<InstanceType<typeof RichEditor> | null>(null);

/** Règles : un titre suivi d'éléments "<li>" */
const rules = computed(() => {
  const sections: { title: string; items: string[] }[] = [];
  for (const line of tf.value.regle.description) {
    if (line.includes("<li>")) sections.at(-1)?.items.push(line.replace(/<\/?li>/g, ""));
    else sections.push({ title: line, items: [] });
  }
  return sections;
});

const isSuccess = (response: ApiResponse | null) => response && response.Gestion.Notification.Type !== "error";
const hasScript = (html: string) => /<\/?script/i.test(html);

async function publishPost() {
  if (!newTitle.value.trim() || isBlankHtml(newContent.value)) return showToast(tf.value.error.notext, "error");
  if (hasScript(newContent.value) || hasScript(newTitle.value)) return showToast(tf.value.error.prohibe, "error");
  const response = await submit("newpostforum", { Title: newTitle.value.trim(), Content: newContent.value });
  if (isSuccess(response)) {
    newTitle.value = "";
    newEditor.value?.clear();
  }
}

async function publishComment() {
  if (!opened.value) return;
  if (isBlankHtml(commentContent.value)) return showToast(tf.value.error.notext, "error");
  if (hasScript(commentContent.value)) return showToast(tf.value.error.prohibe, "error");
  const response = await submit("newcommentforum", { ID: opened.value.ID, Content: commentContent.value });
  if (isSuccess(response)) commentEditor.value?.clear();
}

async function moderate(action: "valid" | "archivage" | "delete" | "report") {
  if (!opened.value) return;
  const confirmations: Partial<Record<typeof action, string>> = {
    delete: t.value.pwa.confirm_delete_post,
    report: t.value.pwa.confirm_report_post,
  };
  const message = confirmations[action];
  if (message && !(await confirmDialog(message))) return;
  await submit("modifpostforum", { ID: opened.value.ID, Content: action });
}

function postDate(post: Post) {
  return formatDate(post.Date, lang.value);
}
</script>

<template>
  <div v-if="loading && !data" class="spinner" role="status" />

  <div v-else-if="data" class="stack">
    <section class="card">
      <h1>{{ tf.title }}</h1>
      <!-- Contenu statique des traductions -->
      <p v-html="tf.description" />
      <details class="collapse">
        <summary>{{ tf.regle.display }}</summary>
        <div class="collapse__body">
          <template v-for="section in rules" :key="section.title">
            <h3>{{ section.title }}</h3>
            <ul>
              <li v-for="item in section.items" :key="item">{{ item }}</li>
            </ul>
          </template>
        </div>
      </details>
    </section>

    <details class="collapse">
      <summary>{{ tf.create.display }}</summary>
      <form class="collapse__body stack" @submit.prevent="publishPost">
        <label class="field">
          <span>{{ tf.create.title }}</span>
          <input v-model="newTitle" type="text" maxlength="120" />
        </label>
        <RichEditor ref="newEditor" v-model="newContent" :placeholder="tf.create.placeholder" />
        <div class="row row--end">
          <button type="submit" class="btn btn--primary" :disabled="busy">{{ tf.create.button }}</button>
        </div>
      </form>
    </details>

    <section class="stack">
      <h2>{{ tf.actif }}</h2>
      <p v-if="!activePosts.length" class="muted">—</p>
      <button v-for="post in activePosts" :key="post.ID" type="button" class="post" @click="openedId = post.ID">
        <strong class="post__title">{{ post.Title }}</strong>
        <span class="muted small">{{ tf.post.date }} : {{ postDate(post) }} · {{ tf.post.author }} : {{ post.Author }}</span>
        <span class="badge">💬 {{ post.Comments?.length ?? 0 }}</span>
      </button>
    </section>

    <section v-if="isAdmin" class="stack">
      <h2>{{ tf.valid.title }}</h2>
      <p v-if="!pendingPosts.length" class="muted">—</p>
      <button v-for="post in pendingPosts" :key="post.ID" type="button" class="post post--pending" @click="openedId = post.ID">
        <strong class="post__title">{{ post.Title }}</strong>
        <span class="muted small">{{ tf.post.date }} : {{ postDate(post) }} · {{ tf.post.author }} : {{ post.Author }}</span>
      </button>
    </section>

    <details class="collapse">
      <summary>{{ tf.archive.display }}</summary>
      <div class="collapse__body stack">
        <p v-if="!archivedPosts.length" class="muted">—</p>
        <button v-for="post in archivedPosts" :key="post.ID" type="button" class="post post--archived" @click="openedId = post.ID">
          <strong class="post__title">{{ post.Title }}</strong>
          <span class="muted small">{{ tf.post.date }} : {{ postDate(post) }} · {{ tf.post.author }} : {{ post.Author }}</span>
        </button>
      </div>
    </details>

    <!-- Fenêtre de lecture d'un post -->
    <div v-if="opened" class="modal-backdrop" @click.self="openedId = null">
      <article class="modal stack" role="dialog" aria-modal="true" :aria-label="opened.Title">
        <button type="button" class="modal__close" aria-label="Fermer" @click="openedId = null">×</button>
        <h2>{{ opened.Title }}</h2>
        <div class="rich-content" v-html="sanitizeHtml(opened.Content)" />
        <p class="muted small">{{ tf.post.on }} {{ postDate(opened) }} {{ tf.post.by }} {{ opened.Author }}</p>

        <div class="row">
          <template v-if="isAdmin">
            <button v-if="!opened.Valid" type="button" class="btn btn--success btn--sm" :disabled="busy" @click="moderate('valid')">
              {{ tf.valid.button }}
            </button>
            <button v-else-if="!opened.Archive" type="button" class="btn btn--ghost btn--sm" :disabled="busy" @click="moderate('archivage')">
              {{ tf.archive.button }}
            </button>
            <button type="button" class="btn btn--danger btn--sm" :disabled="busy" @click="moderate('delete')">{{ tf.post.delete }}</button>
          </template>
          <button v-if="opened.Valid && !opened.Archive" type="button" class="btn btn--warning btn--sm" :disabled="busy" @click="moderate('report')">
            {{ tf.report }}
          </button>
        </div>

        <div v-if="opened.Comments?.length" class="comments">
          <div v-for="comment in opened.Comments" :key="comment.ID" class="comment">
            <div class="rich-content" v-html="sanitizeHtml(comment.Content)" />
            <p class="muted small">{{ tf.post.on }} {{ postDate(comment) }} {{ tf.post.by }} {{ comment.Author }}</p>
          </div>
        </div>

        <details v-if="opened.Valid && !opened.Archive" class="collapse">
          <summary>{{ tf.comment.display }}</summary>
          <form class="collapse__body stack" @submit.prevent="publishComment">
            <RichEditor :key="opened.ID" ref="commentEditor" v-model="commentContent" :placeholder="tf.create.placeholder" />
            <div class="row row--end">
              <button type="submit" class="btn btn--primary" :disabled="busy">{{ tf.comment.button }}</button>
            </div>
          </form>
        </details>
      </article>
    </div>
  </div>
</template>

<style scoped>
.post {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 14px;
  width: 100%;
  padding: 14px 18px;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 4px solid var(--gold);
  color: var(--text);
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.post:hover {
  border-color: var(--accent);
}
.post--pending {
  border-left-color: var(--warning);
}
.post--archived {
  border-left-color: var(--muted);
  opacity: 0.85;
}
.post__title {
  flex: 1 1 260px;
  font-size: 1.05rem;
}
.comments {
  display: grid;
  gap: 10px;
}
.comment {
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  border: 1px solid var(--border);
}
.comment p {
  margin: 4px 0 0;
}
</style>
