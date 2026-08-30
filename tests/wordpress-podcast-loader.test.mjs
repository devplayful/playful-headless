import test from 'node:test';
import assert from 'node:assert/strict';

import {
  loadPodcastEpisodesState,
  resolvePodcastEpisodesView,
} from '../services/podcast-loader.mjs';
import { WordPressUnavailableError } from '../services/wordpress-request.mjs';

test('persistent WordPress failure maps to unavailable UI, never empty UI', async () => {
  const state = await loadPodcastEpisodesState(
    async () => {
      throw new WordPressUnavailableError('WordPress 500', {
        status: 500,
        attempts: 3,
      });
    },
    1,
    9,
  );

  assert.equal(state.status, 'unavailable');
  assert.equal(state.episodes, null);
  const view = resolvePodcastEpisodesView({
    loading: false,
    error: state.status,
    episodes: state.episodes ?? [],
  });
  assert.equal(view, 'error');
  assert.notEqual(view, 'empty');
});

test('successful empty WordPress collection maps to the empty UI', async () => {
  const state = await loadPodcastEpisodesState(
    async () => ({ episodes: [], totalPages: 0 }),
    1,
    9,
  );

  assert.equal(state.status, 'ready');
  const view = resolvePodcastEpisodesView({
    loading: false,
    error: null,
    episodes: state.episodes,
  });
  assert.equal(view, 'empty');
});
